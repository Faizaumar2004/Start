namespace HealthSync.API.Models
{
    public class ActivityEntry
    {
        public int ActivityId { get; set; }
        public int ProfileId { get; set; }
        public HealthProfile HealthProfile { get; set; }
        public string ActivityType { get; set; }
        public decimal Duration { get; set; } // in minutes
        public decimal? CaloriesBurned { get; set; }
        public DateTime RecordedDate { get; set; } = DateTime.UtcNow;
    }
}