let currentProfileId = null;
const activityTypes = [
    'Running', 'Walking', 'Cycling', 'Swimming',
    'Weight Training', 'Yoga', 'Other'
];

document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    await checkAuth();

    // Get user profile
    const user = JSON.parse(localStorage.getItem('user'));
    const profileResponse = await fetch(`/api/healthprofile/${user.userId}`, {
        credentials: 'include'
    });

    if (!profileResponse.ok) {
        alert('Failed to load profile data');
        return;
    }

    const profile = await profileResponse.json();
    currentProfileId = profile.profileId;

    // Load activity entries
    await loadActivityEntries();

    // Setup form handlers
    document.getElementById('saveActivityBtn').addEventListener('click', addActivityEntry);
});

async function loadActivityEntries() {
    try {
        const response = await fetch(`/api/healthprofiles/${currentProfileId}/activities`, {
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to load activity entries');

        const entries = await response.json();
        renderActivityEntries(entries);
    } catch (error) {
        console.error('Error loading activity entries:', error);
        document.getElementById('activityEntriesTable').innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger">Failed to load data</td>
            </tr>
        `;
    }
}

function renderActivityEntries(entries) {
    const tableBody = document.getElementById('activityEntriesTable');
    tableBody.innerHTML = '';

    if (entries.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">No activity entries found</td>
            </tr>
        `;
        return;
    }

    entries.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(entry.recordedDate).toLocaleDateString()}</td>
            <td>${entry.activityType}</td>
            <td>${entry.duration} min</td>
            <td>${entry.caloriesBurned || '-'}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${entry.activityId}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteActivityEntry(btn.dataset.id));
    });
}

async function addActivityEntry() {
    const activityType = document.getElementById('activityType').value;
    const duration = parseFloat(document.getElementById('activityDuration').value);
    const calories = document.getElementById('activityCalories').value;
    const date = document.getElementById('activityDate').value;
    const notes = document.getElementById('activityNotes').value;

    if (!activityType || !duration || !date) {
        alert('Please fill in all required fields');
        return;
    }

    try {
        const response = await fetch(`/api/healthprofiles/${currentProfileId}/activities`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                profileId: currentProfileId,
                activityType: activityType,
                duration: duration,
                caloriesBurned: calories ? parseFloat(calories) : null,
                recordedDate: date,
                notes: notes
            })
        });

        if (!response.ok) throw new Error('Failed to add activity entry');

        // Close modal and refresh data
        bootstrap.Modal.getInstance(document.getElementById('addActivityModal')).hide();
        document.getElementById('addActivityForm').reset();
        await loadActivityEntries();
    } catch (error) {
        console.error('Error adding activity entry:', error);
        alert('Failed to add activity entry');
    }
}

async function deleteActivityEntry(entryId) {
    if (!confirm('Are you sure you want to delete this activity entry?')) return;

    try {
        const response = await fetch(`/api/healthprofiles/${currentProfileId}/activities/${entryId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to delete activity entry');

        await loadActivityEntries();
    } catch (error) {
        console.error('Error deleting activity entry:', error);
        alert('Failed to delete activity entry');
    }
}