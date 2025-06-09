class ReentryApp {
    constructor() {
        this.personalData = {};
        this.cases = [];
        this.editingCaseId = null;
        this.init();
    }

    init() {
        this.loadDataFromStorage();
        this.bindEvents();
        this.updateClientName();
        this.renderCases();
    }

    bindEvents() {
        document.querySelectorAll('.nav-btn[data-section]').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchSection(e.target.dataset.section));
        });

        document.getElementById('print-btn').addEventListener('click', () => this.printForm());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearForms());

        document.getElementById('personal-form').addEventListener('input', (e) => this.savePersonalData(e));
        document.getElementById('add-conviction').addEventListener('click', () => this.addCase('conviction'));
        document.getElementById('add-discharged').addEventListener('click', () => this.addCase('discharged'));
        document.getElementById('update-case').addEventListener('click', () => this.updateCase());
        document.getElementById('cancel-edit').addEventListener('click', () => this.cancelEdit());
    }

    switchSection(section) {
        document.querySelectorAll('.nav-btn[data-section]').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
        
        document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(`${section}-section`).classList.add('active');
    }

    savePersonalData(e) {
        const form = e.target.form;
        const formData = new FormData(form);
        
        for (let [key, value] of formData.entries()) {
            if (e.target.type === 'checkbox') {
                this.personalData[key] = e.target.checked;
            } else {
                this.personalData[key] = value;
            }
        }

        document.querySelectorAll('#personal-form input[type="checkbox"]').forEach(checkbox => {
            this.personalData[checkbox.name] = checkbox.checked;
        });

        this.saveToStorage();
        this.updateClientName();
    }

    updateClientName() {
        const firstName = this.personalData.firstName || '';
        const lastName = this.personalData.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        document.getElementById('client-name').textContent = `Client: ${fullName || ''}`;
    }

    addCase(type) {
        const form = document.getElementById('case-form');
        const formData = new FormData(form);
        
        const caseData = {
            id: Date.now(),
            type: type,
            highestCharge: formData.get('highestCharge'),
            court: formData.get('court'),
            caseNumber: formData.get('caseNumber'),
            dispositionDate: formData.get('dispositionDate'),
            muniCharge: formData.get('muniCharge'),
            code: formData.get('code'),
            notes: formData.get('notes')
        };

        if (!caseData.highestCharge || !caseData.court || !caseData.caseNumber) {
            alert('Please fill in at least the Highest Charge, Court, and Case Number fields.');
            return;
        }

        this.cases.push(caseData);
        this.saveToStorage();
        this.renderCases();
        form.reset();
    }

    updateCase() {
        const form = document.getElementById('case-form');
        const formData = new FormData(form);
        
        const caseIndex = this.cases.findIndex(c => c.id === this.editingCaseId);
        if (caseIndex !== -1) {
            this.cases[caseIndex] = {
                ...this.cases[caseIndex],
                highestCharge: formData.get('highestCharge'),
                court: formData.get('court'),
                caseNumber: formData.get('caseNumber'),
                dispositionDate: formData.get('dispositionDate'),
                muniCharge: formData.get('muniCharge'),
                code: formData.get('code'),
                notes: formData.get('notes')
            };
            
            this.saveToStorage();
            this.renderCases();
            this.cancelEdit();
        }
    }

    editCase(caseId) {
        const caseData = this.cases.find(c => c.id === caseId);
        if (!caseData) return;

        this.editingCaseId = caseId;
        
        document.getElementById('highest-charge').value = caseData.highestCharge || '';
        document.getElementById('court').value = caseData.court || '';
        document.getElementById('case-number').value = caseData.caseNumber || '';
        document.getElementById('disposition-date').value = caseData.dispositionDate || '';
        document.getElementById('muni-charge').value = caseData.muniCharge || '';
        document.getElementById('code').value = caseData.code || '';
        document.getElementById('notes').value = caseData.notes || '';

        document.getElementById('add-conviction').style.display = 'none';
        document.getElementById('add-discharged').style.display = 'none';
        document.getElementById('update-case').style.display = 'inline-block';
        document.getElementById('cancel-edit').style.display = 'inline-block';
    }

    cancelEdit() {
        this.editingCaseId = null;
        document.getElementById('case-form').reset();
        
        document.getElementById('add-conviction').style.display = 'inline-block';
        document.getElementById('add-discharged').style.display = 'inline-block';
        document.getElementById('update-case').style.display = 'none';
        document.getElementById('cancel-edit').style.display = 'none';
    }

    deleteCase(caseId) {
        if (confirm('Are you sure you want to delete this case?')) {
            this.cases = this.cases.filter(c => c.id !== caseId);
            this.saveToStorage();
            this.renderCases();
        }
    }

    renderCases() {
        const container = document.getElementById('cases-container');
        container.innerHTML = '';

        if (this.cases.length === 0) {
            container.innerHTML = '<p style="color: #666; text-align: center; padding: 2rem;">No cases entered yet.</p>';
            return;
        }

        this.cases.forEach(caseData => {
            const caseDiv = document.createElement('div');
            caseDiv.className = `case-item ${caseData.type}`;
            
            caseDiv.innerHTML = `
                <div class="case-header">
                    <span class="case-type ${caseData.type}">${caseData.type.toUpperCase()}</span>
                    <div class="case-actions">
                        <button class="btn btn-secondary btn-small" onclick="app.editCase(${caseData.id})">Edit</button>
                        <button class="btn btn-primary btn-small" onclick="app.deleteCase(${caseData.id})">Delete</button>
                    </div>
                </div>
                <div class="case-details">
                    <div class="case-detail">
                        <strong>Highest Charge:</strong>
                        <span>${caseData.highestCharge || 'N/A'}</span>
                    </div>
                    <div class="case-detail">
                        <strong>Court:</strong>
                        <span>${caseData.court || 'N/A'}</span>
                    </div>
                    <div class="case-detail">
                        <strong>Case Number:</strong>
                        <span>${caseData.caseNumber || 'N/A'}</span>
                    </div>
                    <div class="case-detail">
                        <strong>Disposition Date:</strong>
                        <span>${caseData.dispositionDate || 'N/A'}</span>
                    </div>
                    <div class="case-detail">
                        <strong>Muni Charge #:</strong>
                        <span>${caseData.muniCharge || 'N/A'}</span>
                    </div>
                    <div class="case-detail">
                        <strong>Code:</strong>
                        <span>${caseData.code || 'N/A'}</span>
                    </div>
                    ${caseData.notes ? `
                        <div class="case-detail" style="grid-column: 1 / -1;">
                            <strong>Notes:</strong>
                            <span>${caseData.notes}</span>
                        </div>
                    ` : ''}
                </div>
            `;
            
            container.appendChild(caseDiv);
        });
    }

    printForm() {
        const convictions = this.cases.filter(c => c.type === 'conviction');
        const discharged = this.cases.filter(c => c.type === 'discharged');

        const printContent = `
            <div class="print-content">
                <div class="print-section">
                    <h2>Personal Information</h2>
                    <div class="print-personal">
                        <div><strong>Name:</strong> ${this.personalData.firstName || ''} ${this.personalData.lastName || ''}</div>
                        <div><strong>SSN:</strong> ${this.personalData.ssn || ''}</div>
                        <div><strong>Birthdate:</strong> ${this.personalData.birthdate || ''}</div>
                        <div><strong>Address:</strong> ${this.personalData.address || ''}</div>
                        <div><strong>City:</strong> ${this.personalData.city || ''}</div>
                        <div><strong>State:</strong> ${this.personalData.state || ''}</div>
                        <div><strong>ZIP:</strong> ${this.personalData.zip || ''}</div>
                        <div><strong>Monthly Income:</strong> $${this.personalData.monthlyIncome || '0'}</div>
                        <div><strong>Minor Children:</strong> ${this.personalData.minorChildren ? 'Yes' : 'No'}</div>
                    </div>
                </div>
                
                ${convictions.length > 0 ? `
                    <div class="print-section">
                        <h2>Convictions</h2>
                        ${convictions.map(c => `
                            <div class="print-case">
                                <div class="print-case-header">${c.highestCharge} - ${c.court}</div>
                                <div>Case #: ${c.caseNumber} | Disposition: ${c.dispositionDate || 'N/A'} | Muni: ${c.muniCharge || 'N/A'} | Code: ${c.code || 'N/A'}</div>
                                ${c.notes ? `<div>Notes: ${c.notes}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${discharged.length > 0 ? `
                    <div class="print-section">
                        <h2>Discharged Cases</h2>
                        ${discharged.map(c => `
                            <div class="print-case">
                                <div class="print-case-header">${c.highestCharge} - ${c.court}</div>
                                <div>Case #: ${c.caseNumber} | Disposition: ${c.dispositionDate || 'N/A'} | Muni: ${c.muniCharge || 'N/A'} | Code: ${c.code || 'N/A'}</div>
                                ${c.notes ? `<div>Notes: ${c.notes}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Reentry Form</title>
                    <link rel="stylesheet" href="styles.css">
                </head>
                <body>
                    ${printContent}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    clearForms() {
        if (confirm('Are you sure you want to clear all personal information and cases? This action cannot be undone.')) {
            this.personalData = {};
            this.cases = [];
            this.saveToStorage();
            
            document.getElementById('personal-form').reset();
            document.getElementById('case-form').reset();
            this.updateClientName();
            this.renderCases();
            this.cancelEdit();
            
            alert('All forms have been cleared.');
        }
    }

    saveToStorage() {
        localStorage.setItem('reentryPersonalData', JSON.stringify(this.personalData));
        localStorage.setItem('reentryCases', JSON.stringify(this.cases));
    }

    loadDataFromStorage() {
        const personalData = localStorage.getItem('reentryPersonalData');
        const cases = localStorage.getItem('reentryCases');
        
        if (personalData) {
            this.personalData = JSON.parse(personalData);
            this.populatePersonalForm();
        }
        
        if (cases) {
            this.cases = JSON.parse(cases);
        }
    }

    populatePersonalForm() {
        Object.keys(this.personalData).forEach(key => {
            const element = document.getElementById(key.replace(/([A-Z])/g, '-$1').toLowerCase());
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = this.personalData[key];
                } else {
                    element.value = this.personalData[key];
                }
            }
        });
    }
}

const app = new ReentryApp();