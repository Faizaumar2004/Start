namespace HealthSync.API.Models
{
    public class WeightEntry
    {
        public int EntryId { get; set; }
        public int ProfileId { get; set; }
        public HealthProfile HealthProfile { get; set; }
        public decimal Weight { get; set; } // in kg
        public DateTime RecordedDate { get; set; } = DateTime.UtcNow;
        public string Notes { get; set; }
    }
}