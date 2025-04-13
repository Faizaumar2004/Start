using HealthSync.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[HttpGet("profile")]
[Authorize] // Requires authentication
public async Task<IActionResult> GetProfile()
{
    try
    {
        // Get current user ID from claims
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

        // Load profile with related data
        var profile = await _context.HealthProfiles
            .Include(h => h.User)
            .Include(h => h.WeightEntries)
            .Include(h => h.ActivityEntries)
            .FirstOrDefaultAsync(h => h.UserId == userId);

        if (profile == null)
            return NotFound("Profile not found");

        // Return simplified DTO
        return Ok(new ProfileDto
        {
            UserId = profile.UserId,
            Name = profile.User.Name,
            Email = profile.User.Email,
            Height = profile.Height,
            BirthDate = profile.BirthDate,
            WeightEntries = profile.WeightEntries.Select(w => new WeightEntryDto
            {
                Weight = w.Weight,
                RecordedDate = w.RecordedDate
            }).ToList(),
            ActivityEntries = profile.ActivityEntries.Select(a => new ActivityEntryDto
            {
                ActivityType = a.ActivityType,
                Duration = a.Duration,
                RecordedDate = a.RecordedDate
            }).ToList()
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error loading profile data");
        return StatusCode(500, "Failed to load profile data");
    }
}

// Add these DTO classes to your project
public class ProfileDto
{
    public int UserId { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public decimal Height { get; set; }
    public DateTime BirthDate { get; set; }
    public List<WeightEntryDto> WeightEntries { get; set; }
    public List<ActivityEntryDto> ActivityEntries { get; set; }
}

public class WeightEntryDto
{
    public decimal Weight { get; set; }
    public DateTime RecordedDate { get; set; }
}

public class ActivityEntryDto
{
    public string ActivityType { get; set; }
    public decimal Duration { get; set; }
    public DateTime RecordedDate { get; set; }
}