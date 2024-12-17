const logs = {
    logEntries: [],

    init() {
        if (auth.token) {
            this.loadLogs();
        }
    },

    async loadLogs() {
        try {
            const response = await fetch('/api/logs', {
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            this.logEntries = data;
            this.displayLogs();
        } catch (error) {
            showAlert(error.message, 'danger');
        }
    },

    displayLogs() {
        const logsList = document.getElementById('logsList');
        if (!logsList) return;

        if (this.logEntries.length === 0) {
            logsList.innerHTML = '<tr><td colspan="5" class="text-center">No logs found</td></tr>';
            return;
        }

        logsList.innerHTML = this.logEntries.map(log => `
            <tr>
                <td>${new Date(log.timestamp).toLocaleString()}</td>
                <td>${this.escapeHtml(log.User?.username || 'Unknown')}</td>
                <td>${this.getItemInfo(log)}</td>
                <td>${this.getOperationBadge(log.operation)}</td>
                <td>${this.escapeHtml(log.details || '')}</td>
            </tr>
        `).join('');
    },

    getItemInfo(log) {
        if (log.Computer) {
            return `Computer: ${this.escapeHtml(log.Computer.computer_name)}`;
        } else if (log.Inventory) {
            return `Item: ${this.escapeHtml(log.Inventory.item_name)}`;
        }
        return 'Unknown';
    },

    getOperationBadge(operation) {
        const badges = {
            'create': 'bg-success',
            'delete': 'bg-danger',
            'check-in': 'bg-info',
            'check-out': 'bg-warning',
            'computer-login': 'bg-primary',
            'computer-logout': 'bg-secondary',
            'maintenance-start': 'bg-danger',
            'maintenance-end': 'bg-success'
        };

        const badge = badges[operation] || 'bg-secondary';
        return `<span class="badge ${badge}">${operation}</span>`;
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