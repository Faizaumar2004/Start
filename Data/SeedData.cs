using HealthSync.API.Models;

namespace HealthSync.API.Data
{
    public static class SeedData
    {
        public static async Task Initialize(IServiceProvider serviceProvider)
        {
            using var context = serviceProvider.GetRequiredService<HealthSyncDbContext>();

            // Ensure database is created and migrated
            await context.Database.EnsureCreatedAsync();

            if (!context.Users.Any())
            {
                context.Users.Add(new User
                {
                    Name = "Test User",
                    Email = "test@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("test123"),
                    HealthProfile = new HealthProfile
                    {
                        Height = 175,
                        BirthDate = new DateTime(1990, 1, 1),
                        Gender = "Male",
                        WeightEntries = new List<WeightEntry>
                        {
                            new WeightEntry { Weight = 80.5m, RecordedDate = DateTime.UtcNow.AddDays(-7) },
                            new WeightEntry { Weight = 79.8m, RecordedDate = DateTime.UtcNow.AddDays(-3) },
                            new WeightEntry { Weight = 79.2m, RecordedDate = DateTime.UtcNow }
                        },
                        ActivityEntries = new List<ActivityEntry>
                        {
                            new ActivityEntry { ActivityType = "Running", Duration = 30, CaloriesBurned = 300, RecordedDate = DateTime.UtcNow.AddDays(-1) },
                            new ActivityEntry { ActivityType = "Cycling", Duration = 45, CaloriesBurned = 400, RecordedDate = DateTime.UtcNow }
                        }
                    },
                    Goals = new List<Goal>
                    {
                        new Goal { Target = "Lose 5kg", StartDate = DateTime.UtcNow.AddDays(-14), EndDate = DateTime.UtcNow.AddDays(30), Status = "In Progress" },
                        new Goal { Target = "Run 5km", StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow.AddDays(60), Status = "Not Started" }
                    }
                });

                await context.SaveChangesAsync();
            }
        }
    }
}