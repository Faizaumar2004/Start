document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const errorElement = document.getElementById('error-message');

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, rememberMe }),
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
        errorElement.textContent = 'Network error during login';
        errorElement.classList.remove('d-none');
    }
});