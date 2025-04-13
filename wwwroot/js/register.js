document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('error-message');

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
            credentials: 'include'
        });

        if (!response.ok) {
            const error = await response.text();
            errorElement.textContent = error;
            errorElement.classList.remove('d-none');
            return;
        }

        const user = await response.json();
        localStorage.setItem('user', JSON.stringify(user));
        window.location.href = '/dashboard.html';

    } catch (error) {
        errorElement.textContent = 'Network error during registration';
        errorElement.classList.remove('d-none');
    }
});