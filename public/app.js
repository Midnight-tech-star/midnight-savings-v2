// ============================================================================
// MIDNIGHT SAVINGS 💯 - FRONTEND APPLICATION CONTROLLER
// Complete State Management, API Integration, and UI Logic
// ============================================================================

/**
 * AppState - Frontend State Management with localStorage Persistence
 */
class AppState {
    constructor() {
        this.state = {
            user: null,
            group: {
                name: 'Midnight Savings 💯',
                contributionAmount: 740,
                members: [],
                pendingRequests: [],
            },
            ui: {
                isAdmin: false,
                isMember: false,
                currentPage: 'dashboard',
                roundActive: false,
            },
            payment: {
                status: 'pending',
                deadline: this.calculateNextSaturday9PM(),
            },
        };
        this.load();
    }

    /**
     * Calculate next Saturday at 9:00 PM
     */
    calculateNextSaturday9PM() {
        const now = new Date();
        const day = now.getDay();
        const daysUntilSaturday = day === 6 ? 7 : (6 - day + 7) % 7;
        const saturday = new Date(now);
        saturday.setDate(saturday.getDate() + daysUntilSaturday);
        saturday.setHours(21, 0, 0, 0);
        return saturday;
    }

    /**
     * Save state to localStorage
     */
    save() {
        try {
            localStorage.setItem('midnight_savings_state', JSON.stringify(this.state));
        } catch (error) {
            console.error('Failed to save state:', error);
        }
    }

    /**
     * Load state from localStorage
     */
    load() {
        try {
            const saved = localStorage.getItem('midnight_savings_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.state = { ...this.state, ...parsed };
            }
        } catch (error) {
            console.error('Failed to load state:', error);
        }
    }

    /**
     * Update state and persist
     */
    update(path, value) {
        const keys = path.split('.');
        let current = this.state;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        this.save();
    }

    /**
     * Get state value
     */
    get(path) {
        const keys = path.split('.');
        let current = this.state;
        for (const key of keys) {
            current = current[key];
        }
        return current;
    }
}

/**
 * APIService - Centralized API Client
 */
class APIService {
    constructor(baseURL = '/api') {
        this.baseURL = baseURL;
    }

    /**
     * Make API request
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options,
        };

        try {
            const response = await fetch(url, defaultOptions);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `API Error: ${response.status}`);
            }

            return { success: true, data };
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, error: error.message };
        }
    }

    // ---- Authentication Endpoints ----
    async login(phone, passcode) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ phone, passcode }),
        });
    }

    async register(phone, passcode) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ phone, passcode }),
        });
    }

    async verifyOTP(phone, otp) {
        return this.request('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ phone, otp }),
        });
    }

    async logout() {
        return this.request('/auth/logout', { method: 'POST' });
    }

    // ---- Group Endpoints ----
    async getGroup() {
        return this.request('/groups/current');
    }

    async updateGroup(data) {
        return this.request('/groups/current', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async joinGroup() {
        return this.request('/groups/current/join', { method: 'POST' });
    }

    async exitGroup() {
        return this.request('/groups/current/exit', { method: 'POST' });
    }

    // ---- Member Endpoints ----
    async getMembers() {
        return this.request('/groups/current/members');
    }

    async getPendingRequests() {
        return this.request('/groups/current/pending-requests');
    }

    async handleMembershipRequest(requestId, action) {
        return this.request(`/groups/current/requests/${requestId}`, {
            method: 'POST',
            body: JSON.stringify({ action }),
        });
    }

    async dismissMember(memberId) {
        return this.request(`/groups/current/members/${memberId}/dismiss`, {
            method: 'POST',
        });
    }

    // ---- Payment Endpoints ----
    async initiatePayment(amount) {
        return this.request('/payments/initiate', {
            method: 'POST',
            body: JSON.stringify({ amount }),
        });
    }

    async verifyPayment(transactionId) {
        return this.request(`/payments/verify/${transactionId}`);
    }

    async getPaidMembers() {
        return this.request('/payments/paid-members');
    }

    async getPaymentStatus() {
        return this.request('/payments/status');
    }

    // ---- Transaction Endpoints ----
    async getTransactionHistory() {
        return this.request('/transactions/history');
    }

    async getSavingsReport(startDate, endDate) {
        return this.request(`/reports/savings?start=${startDate}&end=${endDate}`);
    }

    // ---- Payout Endpoints ----
    async recordPayoutReceived(memberId) {
        return this.request(`/payouts/${memberId}/received`, {
            method: 'POST',
            body: JSON.stringify({ timestamp: new Date().toISOString() }),
        });
    }
}

/**
 * DOMUtils - Utility Functions for DOM Manipulation
 */
class DOMUtils {
    static getId(id) {
        return document.getElementById(id);
    }

    static qs(selector) {
        return document.querySelector(selector);
    }

    static qsa(selector) {
        return document.querySelectorAll(selector);
    }

    static show(element) {
        element.style.display = '';
        return element;
    }

    static hide(element) {
        element.style.display = 'none';
        return element;
    }

    static addClass(element, className) {
        element.classList.add(className);
        return element;
    }

    static removeClass(element, className) {
        element.classList.remove(className);
        return element;
    }

    static toggleClass(element, className) {
        element.classList.toggle(className);
        return element;
    }

    static setText(element, text) {
        element.textContent = text;
        return element;
    }

    static setHTML(element, html) {
        element.innerHTML = html;
        return element;
    }

    static on(element, event, handler) {
        element.addEventListener(event, handler);
        return element;
    }

    static off(element, event, handler) {
        element.removeEventListener(event, handler);
        return element;
    }

    static trigger(element, eventType) {
        element.dispatchEvent(new Event(eventType, { bubbles: true }));
        return element;
    }
}

/**
 * GroupCreationController - Manages Group Setup UI
 */
class GroupCreationController {
    constructor(appState, apiService) {
        this.appState = appState;
        this.apiService = apiService;
        this.init();
    }

    init() {
        const groupNameInput = DOMUtils.getId('groupNameInput');
        const currentGroupName = DOMUtils.qs('.current-group-name');
        const updateBtn = DOMUtils.getId('updateContributionBtn');
        const contributionInput = DOMUtils.getId('contributionAmountInput');

        // Real-time update of current group name
        DOMUtils.on(groupNameInput, 'input', (e) => {
            DOMUtils.setText(currentGroupName, e.target.value || 'Midnight Savings 💯');
            this.appState.update('group.name', e.target.value);
        });

        // Update contribution amount
        DOMUtils.on(updateBtn, 'click', async () => {
            const amount = parseInt(contributionInput.value, 10);
            if (amount <= 0) {
                this.showNotification('Invalid amount', 'error');
                return;
            }

            const result = await this.apiService.updateGroup({ contributionAmount: amount });
            if (result.success) {
                this.appState.update('group.contributionAmount', amount);
                this.showNotification('Contribution amount updated successfully', 'success');
            } else {
                this.showNotification(result.error, 'error');
            }
        });

        // Conditional Join Group Button
        this.renderJoinButton();
    }

    renderJoinButton() {
        const container = DOMUtils.getId('joinGroupContainer');
        const isMember = this.appState.get('ui.isMember');
        const isAdmin = this.appState.get('ui.isAdmin');

        if (!isMember && !isAdmin) {
            DOMUtils.show(container);
            const joinBtn = DOMUtils.getId('joinGroupBtn');
            DOMUtils.on(joinBtn, 'click', () => this.handleJoinGroup());
        } else {
            DOMUtils.hide(container);
        }
    }

    async handleJoinGroup() {
        const result = await this.apiService.joinGroup();
        if (result.success) {
            this.appState.update('ui.isMember', true);
            this.showNotification('Successfully joined the group!', 'success');
            this.renderJoinButton();
            // Show initial payment section if needed
            this.renderInitialPaymentSection();
        } else {
            this.showNotification(result.error, 'error');
        }
    }

    renderInitialPaymentSection() {
        const initialPaymentSection = DOMUtils.getId('initialPaymentSection');
        DOMUtils.show(initialPaymentSection);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

/**
 * CountdownTimer - Real-time Countdown to Saturday 9 PM
 */
class CountdownTimer {
    constructor(timerElement, appState) {
        this.timerElement = timerElement;
        this.appState = appState;
        this.init();
    }

    init() {
        this.update();
        setInterval(() => this.update(), 1000);
    }

    update() {
        const deadline = this.appState.get('payment.deadline');
        const now = new Date();
        const timeRemaining = new Date(deadline) - now;

        if (timeRemaining <= 0) {
            DOMUtils.setText(this.timerElement, '00:00:00');
            return;
        }

        const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeRemaining / (1000 * 60)) % 60);
        const seconds = Math.floor((timeRemaining / 1000) % 60);

        const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        DOMUtils.setText(this.timerElement, timeString);
    }
}

/**
 * RulesController - Manages Rules Tab and Exit Logic
 */
class RulesController {
    constructor(appState, apiService) {
        this.appState = appState;
        this.apiService = apiService;
        this.init();
    }

    init() {
        const exitBtn = DOMUtils.getId('exitGroupBtn');
        DOMUtils.on(exitBtn, 'click', () => this.handleExitClick());
        this.updateExitButtonState();
    }

    handleExitClick() {
        const roundActive = this.appState.get('ui.roundActive');
        const modal = DOMUtils.getId('exitConfirmationModal');
        const message = DOMUtils.getId('exitWarningMessage');

        if (roundActive) {
            DOMUtils.setText(message, 'Cannot exit during an active round. Please wait until the current round is complete.');
            this.openModal(modal);
        } else {
            DOMUtils.setText(message, 'Are you sure you want to exit the group? This action cannot be undone.');
            this.openModal(modal);
        }
    }

    updateExitButtonState() {
        const exitBtn = DOMUtils.getId('exitGroupBtn');
        const roundActive = this.appState.get('ui.roundActive');

        if (roundActive) {
            exitBtn.disabled = true;
            DOMUtils.setText(DOMUtils.getId('exitGroupStatus'), 'Cannot exit during active round');
            DOMUtils.addClass(DOMUtils.getId('exitGroupStatus'), 'status-message warning');
        } else {
            exitBtn.disabled = false;
            DOMUtils.setText(DOMUtils.getId('exitGroupStatus'), '');
        }
    }

    openModal(modal) {
        DOMUtils.show(modal);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') DOMUtils.hide(modal);
        });
    }
}

/**
 * AdminDashboardController - Admin Features
 */
class AdminDashboardController {
    constructor(appState, apiService) {
        this.appState = appState;
        this.apiService = apiService;
        this.init();
    }

    async init() {
        if (this.appState.get('ui.isAdmin')) {
            DOMUtils.show(DOMUtils.getId('adminDashboard'));
            await this.loadPendingRequests();
            await this.loadMembers();
            await this.loadPaidMembersLedger();
            await this.initPayoutChecklist();
            this.initReportGenerator();
        }
    }

    async loadPendingRequests() {
        const result = await this.apiService.getPendingRequests();
        const tbody = DOMUtils.getId('pendingRequestsBody');

        if (result.success) {
            const requests = result.data;
            DOMUtils.setHTML(tbody, requests.map(req => `
                <tr>
                    <td>${req.memberName}</td>
                    <td>${req.phone}</td>
                    <td>${new Date(req.createdAt).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-success btn-sm" onclick="handleRequestAction('${req.id}', 'accept')">Accept</button>
                        <button class="btn btn-danger btn-sm" onclick="handleRequestAction('${req.id}', 'reject')">Reject</button>
                    </td>
                </tr>
            `).join(''));
        }
    }

    async loadMembers() {
        const result = await this.apiService.getMembers();
        const container = DOMUtils.getId('membersList');

        if (result.success) {
            const members = result.data;
            DOMUtils.setHTML(container, members.map(member => `
                <div class="member-item">
                    <div class="member-info">
                        <div class="member-name">${member.name}</div>
                        <div class="member-phone">${member.phone}</div>
                    </div>
                    <div class="member-status">
                        <span class="status-badge ${member.paid ? 'status-paid' : 'status-pending'}">
                            ${member.paid ? 'Paid' : 'Pending'}
                        </span>
                    </div>
                    <div class="member-actions">
                        <button class="btn btn-secondary btn-sm" onclick="dismissMember('${member.id}', '${member.name}')">Dismiss</button>
                    </div>
                </div>
            `).join(''));
        }
    }

    async loadPaidMembersLedger() {
        const result = await this.apiService.getPaidMembers();
        const tbody = DOMUtils.getId('paidMembersBody');

        if (result.success) {
            const members = result.data;
            DOMUtils.setHTML(tbody, members.map(member => `
                <tr>
                    <td>${member.name}</td>
                    <td>KSh ${member.amount}</td>
                    <td>${new Date(member.timestamp).toLocaleString()}</td>
                    <td><span class="status-badge status-paid">Paid</span></td>
                </tr>
            `).join(''));
        }
    }

    async initPayoutChecklist() {
        const result = await this.apiService.getMembers();
        const container = DOMUtils.getId('payoutChecklistContainer');

        if (result.success) {
            const members = result.data;
            DOMUtils.setHTML(container, members.map(member => `
                <div class="payout-item" id="payout-${member.id}">
                    <input type="checkbox" data-member-id="${member.id}" onchange="recordPayoutReceived('${member.id}')">
                    <div class="payout-member-info">
                        <div class="payout-member-name">${member.name}</div>
                        <div class="payout-timestamp">Payout received: <span id="timestamp-${member.id}">-</span></div>
                    </div>
                </div>
            `).join(''));
        }
    }

    initReportGenerator() {
        const generateBtn = DOMUtils.getId('generateReportBtn');
        const startDate = DOMUtils.getId('reportStartDate');
        const endDate = DOMUtils.getId('reportEndDate');

        DOMUtils.on(generateBtn, 'click', async () => {
            const start = startDate.value;
            const end = endDate.value;

            if (!start || !end) {
                alert('Please select both start and end dates');
                return;
            }

            const result = await this.apiService.getSavingsReport(start, end);
            if (result.success) {
                this.renderReportSummary(result.data);
            }
        });
    }

    renderReportSummary(data) {
        const container = DOMUtils.getId('reportSummary');
        const total = data.reduce((sum, item) => sum + item.amount, 0);
        const inflow = data.filter(item => item.type === 'payment').reduce((sum, item) => sum + item.amount, 0);
        const outflow = data.filter(item => item.type === 'payout').reduce((sum, item) => sum + item.amount, 0);

        DOMUtils.setHTML(container, `
            <div class="report-row">
                <span class="report-label">Total Inflow (KSh)</span>
                <span class="report-value in">+${inflow}</span>
            </div>
            <div class="report-row">
                <span class="report-label">Total Outflow (KSh)</span>
                <span class="report-value out">-${outflow}</span>
            </div>
            <div class="report-row">
                <span class="report-label" style="font-weight: 700; font-size: 1.1rem;">Net Balance (KSh)</span>
                <span class="report-value" style="font-size: 1.5rem; color: ${inflow - outflow >= 0 ? '#27ae60' : '#e74c3c'};">${inflow - outflow}</span>
            </div>
        `);
    }
}

/**
 * MemberDashboardController - Member Dashboard UI
 */
class MemberDashboardController {
    constructor(appState, apiService) {
        this.appState = appState;
        this.apiService = apiService;
        this.init();
    }

    async init() {
        await this.loadPaymentStatus();
        await this.loadTransactionHistory();
        this.updateDisburseInfo();
    }

    async loadPaymentStatus() {
        const result = await this.apiService.getPaymentStatus();
        const indicator = DOMUtils.getId('paymentStatusIndicator');

        if (result.success) {
            const status = result.data;
            DOMUtils.setHTML(indicator, `
                <div class="status-badge status-${status.paid ? 'paid' : 'pending'}">
                    ${status.paid ? 'Payment Received' : 'Awaiting Payment'}
                </div>
                <p style="margin-top: 1rem; color: var(--text-light);">
                    ${status.paid ? '✓ Thank you for your payment!' : 'Your payment is pending. Please pay by Saturday 9 PM.'}
                </p>
            `);
        }
    }

    async loadTransactionHistory() {
        const result = await this.apiService.getTransactionHistory();
        const container = DOMUtils.getId('transactionHistoryList');

        if (result.success) {
            const transactions = result.data;
            const sorted = transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

            DOMUtils.setHTML(container, sorted.map(tx => `
                <div class="transaction-item">
                    <div>
                        <div class="transaction-type">${tx.type}</div>
                        <div class="transaction-date">${new Date(tx.date).toLocaleString()}</div>
                    </div>
                    <span class="transaction-amount ${tx.type === 'payment' ? 'in' : 'out'}">
                        ${tx.type === 'payment' ? '+' : '-'} KSh ${tx.amount}
                    </span>
                </div>
            `).join(''));
        }
    }

    updateDisburseInfo() {
        const shares = this.appState.get('user.shares') || 1;
        const weeklyContribution = this.appState.get('group.contributionAmount') || 740;
        const expectedPayout = shares * weeklyContribution;

        DOMUtils.setText(DOMUtils.getId('userShares'), shares);
        DOMUtils.setText(DOMUtils.getId('expectedPayout'), `KSh ${expectedPayout}`);
    }
}

/**
 * InitialPaymentController - Handles Initial 100 KSh Payment
 */
class InitialPaymentController {
    constructor(appState, apiService) {
        this.appState = appState;
        this.apiService = apiService;
        this.init();
    }

    init() {
        const submitBtn = DOMUtils.getId('submitInitialPaymentBtn');
        const uploadBtn = DOMUtils.getId('uploadProofBtn');

        DOMUtils.on(submitBtn, 'click', () => this.handlePaymentSubmit());
        DOMUtils.on(uploadBtn, 'click', () => this.handleProofUpload());
    }

    async handlePaymentSubmit() {
        const result = await this.apiService.initiatePayment(100);
        if (result.success) {
            alert('Payment initiated. Please complete the M-Pesa transaction.');
        } else {
            alert('Error: ' + result.error);
        }
    }

    async handleProofUpload() {
        const fileInput = DOMUtils.getId('paymentProofFile');
        const file = fileInput.files[0];

        if (!file) {
            alert('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('proof', file);

        try {
            const response = await fetch('/api/payments/upload-proof', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();

            if (result.success) {
                alert('Payment proof uploaded successfully');
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            alert('Upload failed: ' + error.message);
        }
    }
}

/**
 * ModalManager - Centralized Modal Handling
 */
class ModalManager {
    constructor() {
        this.init();
    }

    init() {
        // Close modal buttons
        DOMUtils.qsa('.modal-close').forEach(btn => {
            DOMUtils.on(btn, 'click', (e) => {
                const modalId = btn.dataset.modal;
                const modal = DOMUtils.getId(modalId);
                DOMUtils.hide(modal);
            });
        });

        // Close modal on Escape
        DOMUtils.on(document, 'keydown', (e) => {
            if (e.key === 'Escape') {
                DOMUtils.qsa('.modal').forEach(modal => DOMUtils.hide(modal));
            }
        });

        // Initialize specific modal handlers
        this.initExitConfirmation();
        this.initDismissalConfirmation();
        this.initAccountClosure();
    }

    initExitConfirmation() {
        const confirmBtn = DOMUtils.getId('confirmExitBtn');
        if (confirmBtn) {
            DOMUtils.on(confirmBtn, 'click', async () => {
                // Handle exit logic
                DOMUtils.hide(DOMUtils.getId('exitConfirmationModal'));
            });
        }
    }

    initDismissalConfirmation() {
        const confirmBtn = DOMUtils.getId('confirmDismissalBtn');
        if (confirmBtn) {
            DOMUtils.on(confirmBtn, 'click', async () => {
                // Handle dismissal logic
                DOMUtils.hide(DOMUtils.getId('dismissalConfirmationModal'));
            });
        }
    }

    initAccountClosure() {
        const input = DOMUtils.getId('closureConfirmationInput');
        const confirmBtn = DOMUtils.getId('confirmClosureBtn');

        if (input && confirmBtn) {
            DOMUtils.on(input, 'input', (e) => {
                confirmBtn.disabled = e.target.value !== 'CONFIRM';
            });
        }
    }

    openModal(modalId) {
        DOMUtils.show(DOMUtils.getId(modalId));
    }

    closeModal(modalId) {
        DOMUtils.hide(DOMUtils.getId(modalId));
    }
}

/**
 * Global Function - Handle Request Action
 */
async function handleRequestAction(requestId, action) {
    const apiService = window.appServices.apiService;
    const result = await apiService.handleMembershipRequest(requestId, action);
    if (result.success) {
        alert(`Request ${action}ed successfully`);
        // Reload pending requests
        window.appControllers.admin.loadPendingRequests();
    } else {
        alert('Error: ' + result.error);
    }
}

/**
 * Global Function - Dismiss Member
 */
async function dismissMember(memberId, memberName) {
    const modal = DOMUtils.getId('dismissalConfirmationModal');
    const nameElement = DOMUtils.getId('dismissalMemberName');
    DOMUtils.setText(nameElement, memberName);

    const confirmBtn = DOMUtils.getId('confirmDismissalBtn');
    DOMUtils.off(confirmBtn, 'click', null); // Clear previous handlers
    DOMUtils.on(confirmBtn, 'click', async () => {
        const result = await window.appServices.apiService.dismissMember(memberId);
        if (result.success) {
            DOMUtils.hide(modal);
            alert('Member dismissed successfully');
            window.appControllers.admin.loadMembers();
        } else {
            alert('Error: ' + result.error);
        }
    });

    DOMUtils.show(modal);
}

/**
 * Global Function - Record Payout Received
 */
async function recordPayoutReceived(memberId) {
    const result = await window.appServices.apiService.recordPayoutReceived(memberId);
    if (result.success) {
        const item = DOMUtils.getId(`payout-${memberId}`);
        DOMUtils.addClass(item, 'checked');
        DOMUtils.setText(
            DOMUtils.getId(`timestamp-${memberId}`),
            new Date().toLocaleString()
        );
    }
}

/**
 * App Initialization
 */
class App {
    constructor() {
        this.appState = new AppState();
        this.apiService = new APIService();

        // Initialize controllers
        this.groupController = new GroupCreationController(this.appState, this.apiService);
        this.adminController = new AdminDashboardController(this.appState, this.apiService);
        this.memberController = new MemberDashboardController(this.appState, this.apiService);
        this.paymentController = new InitialPaymentController(this.appState, this.apiService);
        this.modalManager = new ModalManager();

        // Initialize UI components
        const countdownTimer = DOMUtils.getId('countdownTimer');
        if (countdownTimer) {
            new CountdownTimer(countdownTimer, this.appState);
        }

        const rulesController = new RulesController(this.appState, this.apiService);

        // Set up logout
        const logoutBtn = DOMUtils.getId('logoutBtn');
        if (logoutBtn) {
            DOMUtils.on(logoutBtn, 'click', () => this.handleLogout());
        }

        // Make controllers available globally
        window.appControllers = {
            group: this.groupController,
            admin: this.adminController,
            member: this.memberController,
            payment: this.paymentController,
        };

        window.appServices = {
            appState: this.appState,
            apiService: this.apiService,
        };

        console.log('🌙 Midnight Savings 💯 - Application initialized');
    }

    async handleLogout() {
        const result = await this.apiService.logout();
        if (result.success) {
            localStorage.clear();
            window.location.href = '/login';
        }
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new App();
    });
} else {
    new App();
}
