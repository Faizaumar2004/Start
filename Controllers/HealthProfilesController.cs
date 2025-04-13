using HealthSync.API.Data;
using HealthSync.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthSync.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HealthProfileController : ControllerBase
    {
        private readonly HealthSyncDbContext _context;

        public HealthProfileController(HealthSyncDbContext context)
        {
            _context = context;
        }

        [HttpGet("{userId}")]
        public async Task<ActionResult<HealthProfile>> GetProfile(int userId)
        {
            var profile = await _context.HealthProfiles
                .FirstOrDefaultAsync(h => h.UserId == userId);

            if (profile == null)
            {
                return NotFound();
            }

            return profile;
        }

        [HttpPost]
        public async Task<ActionResult<HealthProfile>> CreateProfile(HealthProfile profile)
        {
            _context.HealthProfiles.Add(profile);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetProfile", new { userId = profile.UserId }, profile);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProfile(int id, HealthProfile profile)
        {
            if (id != profile.ProfileId)
            {
                return BadRequest();
            }

            _context.Entry(profile).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProfileExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        private bool ProfileExists(int id)
        {
            return _context.HealthProfiles.Any(e => e.ProfileId == id);
        }
    }
}