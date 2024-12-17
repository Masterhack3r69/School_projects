const computers = {
    items: [],
    labs: new Set(),

    init() {
        if (auth.token) {
            this.loadComputers();
        }

        // Add event listener for the add computer form
        const addComputerForm = document.getElementById('addComputerForm');
        if (addComputerForm) {
            addComputerForm.addEventListener('submit', (e) => this.addComputer(e));
        }

        // Add event listener for lab filter
        const labFilter = document.getElementById('labFilter');
        if (labFilter) {
            labFilter.addEventListener('change', () => this.displayComputers());
        }
    },

    async loadComputers() {
        try {
            const response = await fetch('/api/computers', {
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            this.items = data;
            this.updateLabsList();
            this.displayComputers();
        } catch (error) {
            showAlert(error.message, 'danger');
        }
    },

    updateLabsList() {
        this.labs.clear();
        this.items.forEach(computer => this.labs.add(computer.lab_name));

        const labFilter = document.getElementById('labFilter');
        if (labFilter) {
            const currentValue = labFilter.value;
            labFilter.innerHTML = '<option value="">All Laboratories</option>' +
                Array.from(this.labs)
                    .sort()
                    .map(lab => `<option value="${this.escapeHtml(lab)}">${this.escapeHtml(lab)}</option>`)
                    .join('');
            labFilter.value = currentValue;
        }
    },

    async addComputer(e) {
        e.preventDefault();
        const computerData = {
            computer_name: document.getElementById('computerName').value,
            lab_name: document.getElementById('labName').value,
            status: document.getElementById('computerStatus').value
        };

        try {
            const response = await fetch('/api/computers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.token}`
                },
                body: JSON.stringify(computerData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            showAlert('Computer added successfully!', 'success');
            e.target.reset();
            await this.loadComputers();
        } catch (error) {
            showAlert(error.message, 'danger');
        }
    },

    async updateStatus(id, status) {
        try {
            const response = await fetch(`/api/computers/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.token}`
                },
                body: JSON.stringify({ status })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            showAlert('Status updated successfully!', 'success');
            await this.loadComputers();
        } catch (error) {
            showAlert(error.message, 'danger');
        }
    },

    async deleteComputer(id) {
        if (!confirm('Are you sure you want to delete this computer?')) return;

        try {
            const response = await fetch(`/api/computers/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error);
            }

            showAlert('Computer deleted successfully!', 'success');
            await this.loadComputers();
        } catch (error) {
            showAlert(error.message, 'danger');
        }
    },

    async requestComputer(id) {
        try {
            const response = await fetch('/api/requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.token}`
                },
                body: JSON.stringify({ computerId: id })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            showAlert('Request submitted successfully!', 'success');
            await this.loadComputers();
            // Reload requests if the module exists
            if (typeof requests !== 'undefined') {
                requests.loadRequests();
            }
        } catch (error) {
            showAlert(error.message, 'danger');
        }
    },

    displayComputers() {
        const isTeacherAdmin = ['teacher', 'admin'].includes(auth.user?.role);
        const selectedLab = document.getElementById('labFilter')?.value;
        
        // Filter computers by selected lab
        let filteredComputers = this.items;
        if (selectedLab) {
            filteredComputers = this.items.filter(computer => computer.lab_name === selectedLab);
        }

        if (isTeacherAdmin) {
            // Display in table format for teachers/admins
            const list = document.getElementById('manageComputersList');
            if (!list) return;

            list.innerHTML = filteredComputers.map(computer => `
                <tr>
                    <td>${this.escapeHtml(computer.computer_name)}</td>
                    <td>${this.escapeHtml(computer.lab_name)}</td>
                    <td>
                        <select class="form-control form-control-sm" onchange="computers.updateStatus(${computer.id}, this.value)">
                            <option value="available" ${computer.status === 'available' ? 'selected' : ''}>Available</option>
                            <option value="in-use" ${computer.status === 'in-use' ? 'selected' : ''}>In Use</option>
                            <option value="under-maintenance" ${computer.status === 'under-maintenance' ? 'selected' : ''}>Under Maintenance</option>
                        </select>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="computers.deleteComputer(${computer.id})">Delete</button>
                    </td>
                </tr>
            `).join('');
        } else {
            // Display as cards for students
            const list = document.getElementById('computersList');
            if (!list) return;

            list.innerHTML = filteredComputers.map(computer => `
                <div class="col-md-4 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${this.escapeHtml(computer.computer_name)}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">${this.escapeHtml(computer.lab_name)}</h6>
                            <p class="card-text">Status: ${computer.status}</p>
                            ${computer.status === 'available' ?
                                `<button class="btn btn-primary" onclick="computers.requestComputer(${computer.id})">Request Use</button>` :
                                `<button class="btn btn-secondary" disabled>Not Available</button>`
                            }
                        </div>
                    </div>
                </div>
            `).join('');
        }
    },

    // Helper function to escape HTML and prevent XSS
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}; 