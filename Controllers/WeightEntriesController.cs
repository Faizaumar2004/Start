using HealthSync.API.Data;
using HealthSync.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthSync.API.Controllers
{
    [Route("api/healthprofiles/{profileId}/[controller]")]
    [ApiController]
    public class WeightController : ControllerBase
    {
        private readonly HealthSyncDbContext _context;

        public WeightController(HealthSyncDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<WeightEntry>>> GetWeightEntries(int profileId)
        {
            return await _context.WeightEntries
                .Where(w => w.ProfileId == profileId)
                .OrderByDescending(w => w.RecordedDate)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<WeightEntry>> AddWeightEntry(int profileId, WeightEntry entry)
        {
            if (profileId != entry.ProfileId)
            {
                return BadRequest("Profile ID mismatch");
            }

            _context.WeightEntries.Add(entry);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetWeightEntries", new { profileId = entry.ProfileId }, entry);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWeightEntry(int profileId, int id)
        {
            var entry = await _context.WeightEntries
                .FirstOrDefaultAsync(w => w.EntryId == id && w.ProfileId == profileId);

            if (entry == null)
            {
                return NotFound();
            }

            _context.WeightEntries.Remove(entry);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}