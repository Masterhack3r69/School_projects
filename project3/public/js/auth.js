const auth = {
    token: null,
    user: null,

    init() {
        // Check for stored token
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user'));
        
        if (this.token && this.user) {
            this.updateUI(true);
        }

        // Event listeners
        document.getElementById('loginForm').addEventListener('submit', (e) => this.login(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.register(e));
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('loginTab').addEventListener('click', () => this.toggleForms('login'));
        document.getElementById('registerTab').addEventListener('click', () => this.toggleForms('register'));
    },

    async login(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            this.token = data.token;
            this.user = data.user;
            localStorage.setItem('token', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));
            
            this.updateUI(true);
            showAlert('Login successful!', 'success');
            
            // Navigate based on user role
            const initialPage = ['teacher', 'admin'].includes(this.user.role) ? 'manage-computers' : 'computers';
            navigateTo(initialPage);
        } catch (error) {
            showAlert(error.message, 'danger');
        }
    },

    async register(e) {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const role = document.getElementById('role').value;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            showAlert('Registration successful! Please login.', 'success');
            this.toggleForms('login');
        } catch (error) {
            showAlert(error.message, 'danger');
        }
    },

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.updateUI(false);
        navigateTo('login');
        showAlert('Logged out successfully!', 'success');
    },

    updateUI(isLoggedIn) {
        document.getElementById('loginNav').style.display = isLoggedIn ? 'none' : 'block';
        document.getElementById('profileNav').style.display = isLoggedIn ? 'block' : 'none';
        document.getElementById('logoutNav').style.display = isLoggedIn ? 'block' : 'none';
        
        if (isLoggedIn && this.user) {
            document.getElementById('userInfo').textContent = `${this.user.username} (${this.user.role})`;
            const isTeacherAdmin = ['teacher', 'admin'].includes(this.user.role);
            const isStudent = this.user.role === 'student';

            document.querySelectorAll('.teacher-admin-only').forEach(el => {
                el.style.display = isTeacherAdmin ? 'block' : 'none';
            });

            document.querySelectorAll('.student-only').forEach(el => {
                el.style.display = isStudent ? 'block' : 'none';
            });
        }
    },

    toggleForms(form) {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const loginTab = document.getElementById('loginTab');
        const registerTab = document.getElementById('registerTab');

        if (form === 'login') {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
        } else {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            loginTab.classList.remove('active');
            registerTab.classList.add('active');
        }
    }
};

// Helper function to show alerts
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
} 