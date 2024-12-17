const requests = {
    items: [],

    init() {
        if (auth.token) {
            this.loadRequests();
        }
    },

    async loadRequests() {
        try {
            const endpoint = ['teacher', 'admin'].includes(auth.user?.role) 
                ? '/api/requests'
                : '/api/requests/my-requests';

            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            this.items = data;
            this.displayRequests();
        } catch (error) {
            showAlert(error.message, 'danger');
        }
    },

    async approveRequest(id) {
        try {
            const response = await fetch(`/api/requests/${id}/approve`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            showAlert('Request approved successfully!', 'success');
            await this.loadRequests();
            // Reload computers if the module exists
            if (typeof computers !== 'undefined') {
                computers.loadComputers();
            }
        } catch (error) {
            showAlert(error.message, 'danger');
        }
    },

    async rejectRequest(id) {
        const reason = prompt('Please enter a reason for rejection:');
        if (reason === null) return; // User cancelled

        try {
            const response = await fetch(`/api/requests/${id}/reject`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.token}`
                },
                body: JSON.stringify({ reason })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            showAlert('Request rejected successfully!', 'success');
            await this.loadRequests();
        } catch (error) {
            showAlert(error.message, 'danger');
        }
    },

    async completeRequest(id) {
        try {
            const response = await fetch(`/api/requests/${id}/complete`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            showAlert('Session completed successfully!', 'success');
            await this.loadRequests();
            // Reload computers if the module exists
            if (typeof computers !== 'undefined') {
                computers.loadComputers();
            }
        } catch (error) {
            showAlert(error.message, 'danger');
        }
    },

    displayRequests() {
        const isTeacherAdmin = ['teacher', 'admin'].includes(auth.user?.role);
        const list = document.getElementById(isTeacherAdmin ? 'requestsList' : 'myRequestsList');
        if (!list) return;

        if (this.items.length === 0) {
            list.innerHTML = `<tr><td colspan="${isTeacherAdmin ? 6 : 5}" class="text-center">No requests found</td></tr>`;
            return;
        }

        list.innerHTML = this.items.map(request => `
            <tr>
                ${isTeacherAdmin ? `<td>${this.escapeHtml(request.Student?.username || 'Unknown')}</td>` : ''}
                <td>${this.escapeHtml(request.Computer?.computer_name || 'Unknown')}</td>
                <td>${this.escapeHtml(request.Computer?.lab_name || 'Unknown')}</td>
                <td>
                    <span class="badge ${this.getStatusBadgeClass(request.status)}">
                        ${request.status}
                    </span>
                </td>
                <td>${new Date(request.requestedAt).toLocaleString()}</td>
                <td>
                    ${this.getActionButtons(request)}
                </td>
            </tr>
        `).join('');
    },

    getStatusBadgeClass(status) {
        switch (status) {
            case 'pending': return 'bg-warning';
            case 'approved': return 'bg-success';
            case 'rejected': return 'bg-danger';
            case 'completed': return 'bg-info';
            default: return 'bg-secondary';
        }
    },

    getActionButtons(request) {
        const isTeacherAdmin = ['teacher', 'admin'].includes(auth.user?.role);

        if (isTeacherAdmin) {
            if (request.status === 'pending') {
                return `
                    <button class="btn btn-sm btn-success" onclick="requests.approveRequest(${request.id})">Approve</button>
                    <button class="btn btn-sm btn-danger" onclick="requests.rejectRequest(${request.id})">Reject</button>
                `;
            }
            return '';
        } else {
            if (request.status === 'approved') {
                return `<button class="btn btn-sm btn-primary" onclick="requests.completeRequest(${request.id})">Complete Session</button>`;
            }
            return request.rejectionReason ? 
                `<span class="text-danger">Rejected: ${this.escapeHtml(request.rejectionReason)}</span>` : 
                '';
        }
    },

    // Helper function to escape HTML and prevent XSS
    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}; 