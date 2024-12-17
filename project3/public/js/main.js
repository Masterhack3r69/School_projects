// Page navigation
function navigateTo(pageId) {
    // Check access permissions
    if (pageId === 'logs' && auth.user?.role === 'student') {
        showAlert('Access denied', 'danger');
        return;
    }

    // Handle special cases for page IDs
    const actualPageId = {
        'manage-computers': 'manageComputers',
        'my-requests': 'myRequests'
    }[pageId] || pageId;
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });

    // Show selected page
    const selectedPage = document.getElementById(`${actualPageId}Page`);
    if (selectedPage) {
        selectedPage.style.display = 'block';
    }

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Load page-specific content
    if (pageId === 'computers' || pageId === 'manage-computers') {
        computers.loadComputers();
    } else if (pageId === 'requests' || pageId === 'my-requests') {
        requests.loadRequests();
    } else if (pageId === 'logs' && ['teacher', 'admin'].includes(auth.user?.role)) {
        logs.loadLogs();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize modules
    auth.init();
    computers.init();
    requests.init();
    if (['teacher', 'admin'].includes(auth.user?.role)) {
        logs.init();
    }

    // Setup navigation
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = e.target.getAttribute('data-page');
            if (pageId && (!auth.token && pageId !== 'login')) {
                navigateTo('login');
                showAlert('Please login first', 'warning');
            } else if (pageId) {
                navigateTo(pageId);
            }
        });
    });

    // Update UI based on user role
    const updateRoleBasedUI = () => {
        const isTeacherAdmin = ['teacher', 'admin'].includes(auth.user?.role);
        const isStudent = auth.user?.role === 'student';

        document.querySelectorAll('.teacher-admin-only').forEach(el => {
            el.style.display = isTeacherAdmin ? 'block' : 'none';
        });

        document.querySelectorAll('.student-only').forEach(el => {
            el.style.display = isStudent ? 'block' : 'none';
        });
    };

    // Add role-based UI update to auth module
    const originalUpdateUI = auth.updateUI;
    auth.updateUI = function(isLoggedIn) {
        originalUpdateUI.call(auth, isLoggedIn);
        if (isLoggedIn) {
            updateRoleBasedUI();
        }
    };

    // Show initial page based on user role
    const getInitialPage = () => {
        if (!auth.token) return 'login';
        if (['teacher', 'admin'].includes(auth.user?.role)) {
            return 'manage-computers';
        }
        return 'computers';
    };

    navigateTo(getInitialPage());
}); 