const logs = {
    logEntries: [],
    pagination: null,
    currentPage: 1,
    itemsPerPage: 10,

    init() {
        if (auth.token) {
            this.loadLogs(1);
        }
    },

    async loadLogs(page = 1) {
        try {
            const response = await fetch(`/api/logs?page=${page}&limit=${this.itemsPerPage}`, {
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            this.logEntries = data.logs;
            this.pagination = data.pagination;
            this.currentPage = page;
            this.displayLogs();
            this.displayPagination();
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

    displayPagination() {
        const paginationContainer = document.getElementById('logsPagination');
        if (!paginationContainer || !this.pagination) return;

        const { currentPage, totalPages, hasNextPage, hasPrevPage } = this.pagination;

        let paginationHtml = '<nav aria-label="Logs pagination"><ul class="pagination justify-content-center mb-0">';

        // Previous button
        paginationHtml += `
            <li class="page-item ${!hasPrevPage ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}" ${!hasPrevPage ? 'tabindex="-1" aria-disabled="true"' : ''}>
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 || // First page
                i === totalPages || // Last page
                (i >= currentPage - 1 && i <= currentPage + 1) // Pages around current page
            ) {
                paginationHtml += `
                    <li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            } else if (
                i === currentPage - 2 ||
                i === currentPage + 2
            ) {
                paginationHtml += `
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>
                `;
            }
        }

        // Next button
        paginationHtml += `
            <li class="page-item ${!hasNextPage ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}" ${!hasNextPage ? 'tabindex="-1" aria-disabled="true"' : ''}>
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;

        paginationHtml += '</ul></nav>';

        // Add pagination info
        paginationHtml += `
            <div class="text-center mt-2 text-muted">
                <small>Showing page ${currentPage} of ${totalPages} (${this.pagination.totalItems} total entries)</small>
            </div>
        `;

        paginationContainer.innerHTML = paginationHtml;

        // Add event listeners to pagination buttons
        const paginationLinks = paginationContainer.querySelectorAll('.page-link');
        paginationLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(e.target.closest('.page-link').dataset.page);
                if (page && page !== this.currentPage) {
                    this.loadLogs(page);
                }
            });
        });
    },

    getItemInfo(log) {
        if (log.Computer) {
            return `${this.escapeHtml(log.Computer.computer_name)} (${this.escapeHtml(log.Computer.lab_name)})`;
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