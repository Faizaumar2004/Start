using Microsoft.EntityFrameworkCore;
using HealthSync.API.Models;

namespace HealthSync.API.Data
{
    public class HealthSyncDbContext : DbContext
    {
        public HealthSyncDbContext(DbContextOptions<HealthSyncDbContext> options)
            : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<HealthProfile> HealthProfiles { get; set; }
        public DbSet<WeightEntry> WeightEntries { get; set; }
        public DbSet<ActivityEntry> ActivityEntries { get; set; }
        public DbSet<Goal> Goals { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure primary keys
            modelBuilder.Entity<User>().HasKey(u => u.UserId);
            modelBuilder.Entity<HealthProfile>().HasKey(h => h.ProfileId);
            modelBuilder.Entity<WeightEntry>().HasKey(w => w.EntryId);
            modelBuilder.Entity<ActivityEntry>().HasKey(a => a.ActivityId);
            modelBuilder.Entity<Goal>().HasKey(g => g.GoalId);

            // Configure relationships
            modelBuilder.Entity<User>()
                .HasOne(u => u.HealthProfile)
                .WithOne(h => h.User)
                .HasForeignKey<HealthProfile>(h => h.UserId);
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            // Only configure if not already configured (for migrations)
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=HealthSyncDb;Trusted_Connection=True");
            }
        }
    }
}