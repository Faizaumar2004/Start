async function loadProfileData() {
    try {
        // Show loading state
        document.getElementById('loading-spinner').classList.remove('d-none');
        document.getElementById('profile-content').classList.add('d-none');

        const response = await fetch('/api/auth/profile', {
            credentials: 'include' // Important for cookies
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const profileData = await response.json();

        // Update UI with profile data
        document.getElementById('user-name').textContent = profileData.Name;
        document.getElementById('user-email').textContent = profileData.Email;
        document.getElementById('user-height').textContent = `${profileData.Height} cm`;

        // Render weight chart
        renderWeightChart(profileData.WeightEntries);

        // Render activities
        renderActivities(profileData.ActivityEntries);

        // Hide loading state
        document.getElementById('loading-spinner').classList.add('d-none');
        document.getElementById('profile-content').classList.remove('d-none');

    } catch (error) {
        console.error('Failed to load profile:', error);
        document.getElementById('error-message').textContent = error.message;
        document.getElementById('error-message').classList.remove('d-none');

        // If unauthorized, redirect to login
        if (error.message.includes('401')) {
            window.location.href = '/login.html';
        }
    }
}

// Call this when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadProfileData();
});