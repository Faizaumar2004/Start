let currentProfileId = null;

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

    // Load weight entries
    await loadWeightEntries();

    // Setup form handlers
    document.getElementById('saveWeightBtn').addEventListener('click', addWeightEntry);
    document.getElementById('updateWeightBtn').addEventListener('click', updateWeightEntry);
});

async function loadWeightEntries() {
    try {
        const response = await fetch(`/api/healthprofiles/${currentProfileId}/weight`, {
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to load weight entries');

        const entries = await response.json();
        renderWeightEntries(entries);
    } catch (error) {
        console.error('Error loading weight entries:', error);
        document.getElementById('weightEntriesTable').innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-danger">Failed to load data</td>
            </tr>
        `;
    }
}

function renderWeightEntries(entries) {
    const tableBody = document.getElementById('weightEntriesTable');
    tableBody.innerHTML = '';

    if (entries.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">No weight entries found</td>
            </tr>
        `;
        return;
    }

    entries.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(entry.recordedDate).toLocaleDateString()}</td>
            <td>${entry.weight} kg</td>
            <td>${entry.notes || '-'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${entry.entryId}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${entry.entryId}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Add event listeners to buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.dataset.id));
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteWeightEntry(btn.dataset.id));
    });
}

async function addWeightEntry() {
    const weight = parseFloat(document.getElementById('weightValue').value);
    const date = document.getElementById('weightDate').value;
    const notes = document.getElementById('weightNotes').value;

    if (!weight || !date) {
        alert('Please fill in all required fields');
        return;
    }

    try {
        const response = await fetch(`/api/healthprofiles/${currentProfileId}/weight`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                profileId: currentProfileId,
                weight: weight,
                recordedDate: date,
                notes: notes
            })
        });

        if (!response.ok) throw new Error('Failed to add weight entry');

        // Close modal and refresh data
        bootstrap.Modal.getInstance(document.getElementById('addWeightModal')).hide();
        document.getElementById('addWeightForm').reset();
        await loadWeightEntries();
    } catch (error) {
        console.error('Error adding weight entry:', error);
        alert('Failed to add weight entry');
    }
}

async function openEditModal(entryId) {
    try {
        const response = await fetch(`/api/healthprofiles/${currentProfileId}/weight/${entryId}`, {
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to load entry data');

        const entry = await response.json();

        // Fill the edit form
        document.getElementById('editWeightId').value = entry.entryId;
        document.getElementById('editWeightValue').value = entry.weight;

        // Convert date to local datetime format
        const date = new Date(entry.recordedDate);
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        document.getElementById('editWeightDate').value = localDate;

        document.getElementById('editWeightNotes').value = entry.notes || '';

        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('editWeightModal'));
        modal.show();
    } catch (error) {
        console.error('Error opening edit modal:', error);
        alert('Failed to load entry data');
    }
}

async function updateWeightEntry() {
    const entryId = document.getElementById('editWeightId').value;
    const weight = parseFloat(document.getElementById('editWeightValue').value);
    const date = document.getElementById('editWeightDate').value;
    const notes = document.getElementById('editWeightNotes').value;

    if (!entryId || !weight || !date) {
        alert('Please fill in all required fields');
        return;
    }

    try {
        const response = await fetch(`/api/healthprofiles/${currentProfileId}/weight/${entryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                entryId: parseInt(entryId),
                profileId: currentProfileId,
                weight: weight,
                recordedDate: date,
                notes: notes
            })
        });

        if (!response.ok) throw new Error('Failed to update weight entry');

        // Close modal and refresh data
        bootstrap.Modal.getInstance(document.getElementById('editWeightModal')).hide();
        await loadWeightEntries();
    } catch (error) {
        console.error('Error updating weight entry:', error);
        alert('Failed to update weight entry');
    }
}

async function deleteWeightEntry(entryId) {
    if (!confirm('Are you sure you want to delete this weight entry?')) return;

    try {
        const response = await fetch(`/api/healthprofiles/${currentProfileId}/weight/${entryId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to delete weight entry');

        await loadWeightEntries();
    } catch (error) {
        console.error('Error deleting weight entry:', error);
        alert('Failed to delete weight entry');
    }
}