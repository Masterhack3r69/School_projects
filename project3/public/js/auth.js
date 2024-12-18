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

        // Add school ID validation on input
        const schoolIdInput = document.getElementById('regSchoolId');
        schoolIdInput.addEventListener('input', (e) => this.validateSchoolId(e.target));
    },

    validateSchoolId(input) {
        const schoolIdPattern = /^C-20[2-9][0-9]-\d{4}$/;
        const value = input.value;
        
        if (value && !schoolIdPattern.test(value)) {
            input.setCustomValidity('School ID must follow the format C-20XX-XXXX (e.g., C-2023-1234) where year must be 2022 or later');
        } else {
            // Additional year validation
            if (value) {
                const year = parseInt(value.substring(2, 6));
                const currentYear = new Date().getFullYear();
                
                if (year < 2022) {
                    input.setCustomValidity('School ID year must be 2022 or later');
                } else if (year > currentYear + 1) {
                    input.setCustomValidity('School ID year cannot be more than one year in the future');
                } else {
                    input.setCustomValidity('');
                }
            } else {
                input.setCustomValidity('');
            }
        }
        
        input.reportValidity();
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
        
        // Get form values
        const form = e.target;
        const formData = {
            username: form.querySelector('#regUsername').value,
            password: form.querySelector('#regPassword').value,
            firstName: form.querySelector('#regFirstName').value,
            lastName: form.querySelector('#regLastName').value,
            middleInitial: form.querySelector('#regMiddleInitial').value,
            course: form.querySelector('#regCourse').value,
            schoolId: form.querySelector('#regSchoolId').value,
            role: 'student' // Always set role to student
        };

        // Validate school ID format
        const schoolIdPattern = /^C-20[2-9][0-9]-\d{4}$/;
        if (!schoolIdPattern.test(formData.schoolId)) {
            showAlert('Invalid School ID format. Must be C-20XX-XXXX where XX is 22 or later', 'danger');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            showAlert('Registration successful! Please login.', 'success');
            this.toggleForms('login');
            form.reset();
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
            const userInfo = document.getElementById('userInfo');
            userInfo.textContent = `${this.user.firstName} ${this.user.lastName} (${this.user.role})`;
            
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
    document.querySelector('.container').insertBefore(alertDiv, document.querySelector('.container').firstChild);
    setTimeout(() => alertDiv.remove(), 5000);
} 