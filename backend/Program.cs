using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.FileProviders;
using System.Collections.Concurrent;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System;

var builder = WebApplication.CreateBuilder(args);

// Add services for API and CORS
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors();

// Setup Static Files to serve the parent directory (where index.html is located)
var clientPath = Path.GetFullPath(Path.Combine(app.Environment.ContentRootPath, ".."));
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(clientPath),
    RequestPath = ""
});

// Seed some initial high scores
ConcurrentBag<ScoreEntry> scores = new ConcurrentBag<ScoreEntry>
{
    new ScoreEntry { Name = "NEO", Score = 1500 },
    new ScoreEntry { Name = "FLY", Score = 1100 },
    new ScoreEntry { Name = "AAA", Score = 850 },
    new ScoreEntry { Name = "BOB", Score = 600 },
    new ScoreEntry { Name = "CMD", Score = 400 }
};

// API: Get Top 10 Scores
app.MapGet("/api/scores", () =>
{
    var topScores = scores.OrderByDescending(s => s.Score).Take(10);
    return Results.Ok(topScores);
});

// API: Add New Score
app.MapPost("/api/scores", (ScoreEntry n) =>
{
    // Sanitize and limit name to 3 characters uppercase
    string name = "NON";
    if (!string.IsNullOrWhiteSpace(n.Name))
    {
        name = n.Name.Trim().ToUpper();
        if (name.Length > 3) name = name.Substring(0, 3);
    }
    
    scores.Add(new ScoreEntry { Name = name, Score = n.Score });
    
    // Return updated leaderboard
    return Results.Ok(scores.OrderByDescending(s => s.Score).Take(10));
});

// Root path redirect
app.MapGet("/", (HttpContext context) =>
{
    context.Response.Redirect("/index.html");
    return Task.CompletedTask;
});

app.Run();

public class ScoreEntry
{
    public string Name { get; set; } = string.Empty;
    public int Score { get; set; }
}
