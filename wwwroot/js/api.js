const API_BASE_URL = 'http://localhost:5000/api';

async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('healthtracker_token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Something went wrong');
    }

    return response.json();
}

export const HealthTrackerAPI = {
    // Profile endpoints
    getProfile: () => fetchWithAuth('/healthprofiles/me'),
    createProfile: (data) => fetchWithAuth('/healthprofiles', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    updateProfile: (id, data) => fetchWithAuth(`/healthprofiles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    // Weight endpoints
    getWeightEntries: (profileId) => fetchWithAuth(`/healthprofiles/${profileId}/weightentries`),
    addWeightEntry: (profileId, data) => fetchWithAuth(`/healthprofiles/${profileId}/weightentries`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    deleteWeightEntry: (profileId, entryId) => fetchWithAuth(`/healthprofiles/${profileId}/weightentries/${entryId}`, {
        method: 'DELETE'
    }),

    // Blood Pressure endpoints
    getBloodPressureEntries: (profileId) => fetchWithAuth(`/healthprofiles/${profileId}/bloodpressureentries`),
    addBloodPressureEntry: (profileId, data) => fetchWithAuth(`/healthprofiles/${profileId}/bloodpressureentries`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    deleteBloodPressureEntry: (profileId, entryId) => fetchWithAuth(`/healthprofiles/${profileId}/bloodpressureentries/${entryId}`, {
        method: 'DELETE'
    }),

    // Activity endpoints
    getActivityEntries: (profileId) => fetchWithAuth(`/healthprofiles/${profileId}/activityentries`),
    addActivityEntry: (profileId, data) => fetchWithAuth(`/healthprofiles/${profileId}/activityentries`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    deleteActivityEntry: (profileId, entryId) => fetchWithAuth(`/healthprofiles/${profileId}/activityentries/${entryId}`, {
        method: 'DELETE'
    }),

    // Auth endpoints
    login: (credentials) => fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    }),
    register: (userData) => fetchWithAuth('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    })
};