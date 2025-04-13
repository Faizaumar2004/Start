let currentUserId = null;
let currentProfileId = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    await checkAuth();

    // Get current user
    const user = JSON.parse(localStorage.getItem('user'));
    currentUserId = user.userId;

    // Load user and profile data
    await loadUserData();

    // Setup form handler
    document.getElementById('profileForm').addEventListener('submit', updateProfile);
});

async function loadUserData() {
    try {
        // Get user data
        const userResponse = await fetch(`/api/users/${currentUserId}`, {
            credentials: 'include'
        });

        if (!userResponse.ok) throw new Error('Failed to load user data');
        const user = await userResponse.json();

        // Update profile info
        document.getElementById('profileName').textContent = user.name;
        document.getElementById('profileEmail').textContent = user.email;
        document.getElementById('name').value = user.name;
        document.getElementById('email').value = user.email;

        // Get health profile
        const profileResponse = await fetch(`/api/healthprofile/${currentUserId}`, {
            credentials: 'include'
        });

        if (profileResponse.ok) {
            const profile = await profileResponse.json();
            currentProfileId = profile.profileId;

            // Update profile fields
            if (profile.height > 0) {
                document.getElementById('height').value = profile.height;
            }
            if (profile.birthDate) {
                const birthDate = new Date(profile.birthDate);
                document.getElementById('birthDate').value = birthDate.toISOString().split('T')[0];
            }
            if (profile.gender) {
                document.getElementById('gender').value = profile.gender;
            }
        }
    } catch (error) {
        console.error('Error loading profile data:', error);
        alert('Failed to load profile data');
    }
}

async function updateProfile(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const height = document.getElementById('height').value;
    const birthDate = document.getElementById('birthDate').value;
    const gender = document.getElementById('gender').value;

    // Validate password if changed
    if (password && password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    try {
        // Update user data
        const userUpdate = {
            name: name,
            email: email
        };

        if (password) {
            userUpdate.password = password;
        }

        const userResponse = await fetch(`/api/users/${currentUserId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(userUpdate)
        });

        if (!userResponse.ok) throw new Error('Failed to update user data');

        // Update health profile
        const profileUpdate = {
            height: height ? parseFloat(height) : 0,
            birthDate: birthDate,
            gender: gender
        };

        let profileResponse;
        if (currentProfileId) {
            // Update existing profile
            profileResponse = await fetch(`/api/healthprofile/${currentProfileId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    profileId: currentProfileId,
                    userId: currentUserId,
                    ...profileUpdate
                })
            });
        } else {
            // Create new profile
            profileResponse = await fetch('/api/healthprofile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    userId: currentUserId,
                    ...profileUpdate
                })
            });
        }

        if (!profileResponse.ok) throw new Error('Failed to update health profile');

        // Update UI
        document.getElementById('profileName').textContent = name;
        document.getElementById('profileEmail').textContent = email;

        alert('Profile updated successfully!');
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile');
    }
}