namespace HealthSync.API.Models
{
    public class HealthProfile
    {
        public int ProfileId { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }
        public decimal Height { get; set; } // in cm
        public DateTime BirthDate { get; set; }
        public string Gender { get; set; }
        public ICollection<WeightEntry> WeightEntries { get; set; }
        public ICollection<ActivityEntry> ActivityEntries { get; set; }
    }
}