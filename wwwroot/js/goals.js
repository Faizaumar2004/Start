let currentUserId = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    await checkAuth();

    // Get current user
    const user = JSON.parse(localStorage.getItem('user'));
    currentUserId = user.userId;

    // Load goals
    await loadGoals();

    // Setup form handlers
    document.getElementById('saveGoalBtn').addEventListener('click', addGoal);

    // Setup filter buttons
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.addEventListener('click', () => filterGoals(btn.dataset.filter));
    });
});

async function loadGoals() {
    try {
        const response = await fetch(`/api/users/${currentUserId}/goals`, {
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to load goals');

        const goals = await response.json();
        renderGoals(goals);
    } catch (error) {
        console.error('Error loading goals:', error);
        document.getElementById('goalsList').innerHTML = `
            <div class="text-center text-danger">Failed to load goals</div>
        `;
    }
}

function renderGoals(goals) {
    const container = document.getElementById('goalsList');
    container.innerHTML = '';

    if (goals.length === 0) {
        container.innerHTML = `
            <div class="text-center">No goals found. Add your first goal!</div>
        `;
        return;
    }

    goals.forEach(goal => {
        const dueDate = new Date(goal.endDate);
        const today = new Date();
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const goalCard = document.createElement('div');
        goalCard.className = `card mb-3 ${getGoalStatusClass(goal.status)}`;
        goalCard.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h5 class="card-title">${goal.target}</h5>
                        <div class="d-flex mb-3">
                            <span class="badge ${getStatusBadgeClass(goal.status)} me-2">${goal.status}</span>
                            <small class="text-muted">Due: ${dueDate.toLocaleDateString()}</small>
                        </div>
                    </div>
                    <div class="dropdown">
                        <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" 
                                data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item edit-goal" href="#" data-id="${goal.goalId}">Edit</a></li>
                            <li><a class="dropdown-item delete-goal" href="#" data-id="${goal.goalId}">Delete</a></li>
                        </ul>
                    </div>
                </div>
                
                <div class="progress mb-2">
                    <div class="progress-bar" role="progressbar" 
                         style="width: ${calculateGoalProgress(goal)}%"></div>
                </div>
                
                <div class="d-flex justify-content-between small text-muted">
                    <span>${getProgressText(goal)}</span>
                    <span>${diffDays > 0 ? `${diffDays} days left` : 'Past due'}</span>
                </div>
            </div>
        `;
        container.appendChild(goalCard);
    });

    // Add event listeners to action buttons
    document.querySelectorAll('.edit-goal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // Implement edit functionality
            alert('Edit functionality will be implemented later');
        });
    });

    document.querySelectorAll('.delete-goal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            deleteGoal(btn.dataset.id);
        });
    });
}

function filterGoals(filter) {
    // Update active button
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    // Implement filtering (will need to reload or filter existing data)
    alert('Filter functionality will be implemented later');
}

function getGoalStatusClass(status) {
    switch (status) {
        case 'Completed': return 'border-success';
        case 'In Progress': return 'border-primary';
        default: return '';
    }
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'Completed': return 'bg-success';
        case 'In Progress': return 'bg-primary';
        default: return 'bg-secondary';
    }
}

function calculateGoalProgress(goal) {
    const start = new Date(goal.startDate);
    const end = new Date(goal.endDate);
    const today = new Date();

    if (goal.status === 'Completed') return 100;
    if (today <= start) return 0;
    if (today >= end) return 100;

    const total = end - start;
    const elapsed = today - start;
    return Math.min(100, Math.round((elapsed / total) * 100));
}

function getProgressText(goal) {
    if (goal.status === 'Completed') return 'Completed!';

    const progress = calculateGoalProgress(goal);
    return `${progress}% complete`;
}

async function addGoal() {
    const target = document.getElementById('goalTarget').value;
    const startDate = document.getElementById('goalStartDate').value;
    const endDate = document.getElementById('goalEndDate').value;
    const status = document.getElementById('goalStatus').value;

    if (!target || !startDate || !endDate || !status) {
        alert('Please fill in all required fields');
        return;
    }

    try {
        const response = await fetch(`/api/users/${currentUserId}/goals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                userId: currentUserId,
                target: target,
                startDate: startDate,
                endDate: endDate,
                status: status
            })
        });

        if (!response.ok) throw new Error('Failed to add goal');

        // Close modal and refresh data
        bootstrap.Modal.getInstance(document.getElementById('addGoalModal')).hide();
        document.getElementById('addGoalForm').reset();
        await loadGoals();
    } catch (error) {
        console.error('Error adding goal:', error);
        alert('Failed to add goal');
    }
}

async function deleteGoal(goalId) {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
        const response = await fetch(`/api/goals/${goalId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to delete goal');

        await loadGoals();
    } catch (error) {
        console.error('Error deleting goal:', error);
        alert('Failed to delete goal');
    }
}