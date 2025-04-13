using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace HealthSync.API.Data
{
    public class HealthSyncDbContextFactory : IDesignTimeDbContextFactory<HealthSyncDbContext>
    {
        public HealthSyncDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<HealthSyncDbContext>();
            optionsBuilder.UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=HealthSyncDb;Trusted_Connection=True");

            return new HealthSyncDbContext(optionsBuilder.Options);
        }
    }
}