// Configuration & Globals
const API_BASE = '/api';
const CITIES = {
    "São Luís": ["Base Porto", "Base Ferrovia", "Base Núcleo"],
    "Bacabeira": ["Base Bacabeira"],
    "Açailândia": ["Base Açailândia"],
    "Santa Inês": ["Base Santa Inês"],
    "Alto Alegre": ["Base Alto Alegre"],
    "Vitória do Mearim": ["Base Vitória do Mearim"]
};

const TYPE_INFO = {
    "Compras": { icon: "📦", title: "Solicitação de Compras" },
    "MID": { icon: "♻️", title: "Solicitação de MID (Descarte)" },
    "Chamados": { icon: "🎧", title: "Solicitação de Chamados" }
};

let currentType = null;
let adminAuthenticated = false;
const ADMIN_PASS = "admin123";
let allTickets = [];
let filteredTickets = [];
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupTypeSelection();
    setupFormHandlers();
    setupTrackingHandlers();
    setupAdminHandlers();
    setupCityBaseSync();
    setupModalHandlers();
});

// Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            switchPage(page);
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function switchPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById(pageId + '-page').classList.add('active');

    if (pageId === 'submit') {
        document.getElementById('typeSelection').classList.remove('hidden');
        document.getElementById('formContainer').classList.add('hidden');
        currentType = null;
    }
}

// Type Selection
function setupTypeSelection() {
    const typeCards = document.querySelectorAll('.type-card');
    typeCards.forEach(card => {
        card.addEventListener('click', () => {
            currentType = card.dataset.type;
            selectType(currentType);
        });
    });
}

function selectType(type) {
    document.getElementById('typeSelection').classList.add('hidden');
    document.getElementById('formContainer').classList.remove('hidden');
    
    const info = TYPE_INFO[type];
    document.getElementById('formIcon').textContent = info.icon;
    document.getElementById('formTitle').textContent = info.title;
    
    document.getElementById('midFields').classList.add('hidden');
    document.getElementById('comprasFields').classList.add('hidden');
    
    if (type === 'MID') {
        document.getElementById('midFields').classList.remove('hidden');
    } else if (type === 'Compras') {
        document.getElementById('comprasFields').classList.remove('hidden');
    }

    document.getElementById('ticketForm').reset();
    document.getElementById('itemsContainer').innerHTML = '<input type="text" class="item-input" placeholder="Item 1">';
    document.getElementById('midItemsContainer').innerHTML = '<input type="text" class="mid-item-input" placeholder="Item 1">';
}

function setupFormHandlers() {
    document.getElementById('backBtn').addEventListener('click', () => {
        document.getElementById('typeSelection').classList.remove('hidden');
        document.getElementById('formContainer').classList.add('hidden');
    });

    document.getElementById('addItemBtn').addEventListener('click', (e) => {
        e.preventDefault();
        const container = document.getElementById('itemsContainer');
        const count = container.querySelectorAll('.item-input').length;
        if (count < 6) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'item-input';
            input.placeholder = `Item ${count + 1}`;
            container.appendChild(input);
        }
    });

    document.getElementById('addMidItemBtn').addEventListener('click', (e) => {
        e.preventDefault();
        const container = document.getElementById('midItemsContainer');
        const count = container.querySelectorAll('.mid-item-input').length;
        if (count < 10) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'mid-item-input';
            input.placeholder = `Item ${count + 1}`;
            container.appendChild(input);
        }
    });

    document.getElementById('ticketForm').addEventListener('submit', submitTicket);
}

function setupCityBaseSync() {
    const citySelect = document.getElementById('city');
    const baseSelect = document.getElementById('base');

    citySelect.addEventListener('change', () => {
        const city = citySelect.value;
        baseSelect.innerHTML = '<option value="">Selecione...</option>';
        if (city && CITIES[city]) {
            CITIES[city].forEach(base => {
                const option = document.createElement('option');
                option.value = base;
                option.textContent = base;
                baseSelect.appendChild(option);
            });
            baseSelect.disabled = false;
        } else {
            baseSelect.disabled = true;
        }
    });
}

async function submitTicket(e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        if (!data.city || !data.contactName || !data.contactEmail) {
            throw new Error('Preencha os campos obrigatórios (*)');
        }

        data.title = `${TYPE_INFO[currentType].title} - CN - ${data.contactName}`;
        data.type = currentType;
        data.status = 'open';

        if (currentType === 'MID') {
            const items = Array.from(document.querySelectorAll('.mid-item-input')).map(i => i.value.trim()).filter(v => v);
            data.items = JSON.stringify(items);
        } else if (currentType === 'Compras') {
            const items = Array.from(document.querySelectorAll('.item-input')).map(i => i.value.trim()).filter(v => v);
            data.items = JSON.stringify(items);
        }

        const response = await fetch(`${API_BASE}/tickets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('Falha ao registrar chamado');

        showToast('Chamado registrado com sucesso!', 'success');
        e.target.reset();
        switchPage('submit');
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Enviar Solicitação';
    }
}

// Tracking
function setupTrackingHandlers() {
    document.getElementById('trackForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('trackEmail').value;
        const btn = document.getElementById('trackBtn');
        btn.disabled = true;
        
        try {
            const res = await fetch(`${API_BASE}/tickets`);
            const tickets = await res.json();
            const filtered = tickets.filter(t => t.contactEmail.toLowerCase() === email.toLowerCase());
            renderTrackingResults(filtered);
        } catch (err) {
            showToast('Erro ao buscar chamados', 'error');
        } finally {
            btn.disabled = false;
        }
    });
}

function renderTrackingResults(tickets) {
    const container = document.getElementById('ticketsResult');
    container.innerHTML = '';
    
    if (tickets.length === 0) {
        container.innerHTML = `<div class="glass-card" style="padding: 3rem; text-align: center;"><h3>Nenhum chamado encontrado</h3></div>`;
        return;
    }

    tickets.reverse().forEach(t => {
        const card = document.createElement('div');
        card.className = 'glass-card ticket-card-track';
        card.style.padding = '2rem';
        card.style.marginBottom = '1.5rem';
        
        const statusMap = { 'open': 'Pendente', 'in_progress': 'Em Tratativa', 'resolved': 'Resolvido', 'closed': 'Fechado' };
        const statusLabel = statusMap[t.status] || t.status;

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                <span class="badge badge-${t.status}">${statusLabel}</span>
                <span style="color: var(--text-muted); font-size: 0.8rem;">#${String(t.id).padStart(6, '0')}</span>
            </div>
            <h4 style="margin-bottom: 0.5rem; color: var(--primary);">${t.title}</h4>
            <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem;">${t.description}</p>
            <div style="background: var(--bg-main); padding: 1rem; border-radius: 8px; font-size: 0.85rem;">
                <strong>Última atualização:</strong><br>
                ${t.adminObservations || 'Aguardando primeira análise técnica.'}
            </div>
        `;
        container.appendChild(card);
    });
}

// ADMIN DASHBOARD
function setupAdminHandlers() {
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        if (document.getElementById('adminPassword').value === ADMIN_PASS) {
            adminAuthenticated = true;
            document.getElementById('adminLogin').classList.add('hidden');
            document.getElementById('adminPanel').classList.remove('hidden');
            loadAdminData();
        } else {
            showToast('Acesso negado', 'error');
        }
    });

    document.getElementById('adminLogout').addEventListener('click', () => {
        adminAuthenticated = false;
        document.getElementById('adminLogin').classList.remove('hidden');
        document.getElementById('adminPanel').classList.add('hidden');
    });

    document.getElementById('adminSearch').addEventListener('input', (e) => {
        filterAdminTickets(e.target.value);
    });

    // Stat card filtering
    document.querySelectorAll('.stat-card').forEach(card => {
        card.addEventListener('click', () => {
            currentFilter = card.dataset.filter;
            filterAdminTickets(document.getElementById('adminSearch').value);
            
            document.querySelectorAll('.stat-card').forEach(c => c.style.borderColor = 'var(--border)');
            card.style.borderColor = 'var(--primary)';
        });
    });

    document.getElementById('syncSheetsBtn').addEventListener('click', syncSheets);
}

async function loadAdminData() {
    try {
        const res = await fetch(`${API_BASE}/tickets`);
        allTickets = await res.json();
        updateAdminView();
    } catch (err) {
        showToast('Erro ao carregar dados', 'error');
    }
}

function updateAdminView() {
    const tickets = allTickets.sort((a,b) => b.id - a.id);
    
    // Update Stats
    document.getElementById('stat-total').textContent = tickets.length;
    document.getElementById('stat-open').textContent = tickets.filter(t => t.status === 'open').length;
    document.getElementById('stat-progress').textContent = tickets.filter(t => t.status === 'in_progress').length;
    document.getElementById('stat-resolved').textContent = tickets.filter(t => t.status === 'resolved').length;

    filterAdminTickets(document.getElementById('adminSearch').value);
}

function filterAdminTickets(query) {
    let filtered = allTickets;
    
    // Status Filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(t => t.status === (currentFilter === 'progress' ? 'in_progress' : (currentFilter === 'resolved' ? 'resolved' : 'open')));
    }

    // Search Query
    if (query) {
        const q = query.toLowerCase();
        filtered = filtered.filter(t => 
            t.contactName.toLowerCase().includes(q) || 
            t.contactEmail.toLowerCase().includes(q) || 
            String(t.id).includes(q)
        );
    }

    renderAdminTable(filtered);
}

function renderAdminTable(tickets) {
    const tbody = document.getElementById('ticketsTableBody');
    const noRes = document.getElementById('noResults');
    tbody.innerHTML = '';

    if (tickets.length === 0) {
        noRes.classList.remove('hidden');
        return;
    }
    noRes.classList.add('hidden');

    tickets.forEach(t => {
        const row = document.createElement('tr');
        const statusMap = { 'open': 'Pendente', 'in_progress': 'Tratando', 'resolved': 'Resolvido', 'closed': 'Fechado' };
        const priorityLabels = { 'low': 'Baixa', 'medium': 'Média', 'high': 'Alta' };
        
        row.innerHTML = `
            <td>#${String(t.id).padStart(5, '0')}</td>
            <td><strong>${t.type}</strong></td>
            <td>
                <div style="font-weight: 600;">${t.contactName}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${t.contactEmail}</div>
            </td>
            <td>${t.city} / ${t.base}</td>
            <td><span class="badge badge-${t.status}">${statusMap[t.status]}</span></td>
            <td><span class="priority-dot ${t.priority}"></span> ${priorityLabels[t.priority]}</td>
            <td>${new Date(t.created_at || t.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn-secondary-sm" onclick="openTratativa(${t.id})">⚙️ Tratar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// TRATATIVA MODAL
let activeTicketId = null;

function setupModalHandlers() {
    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('tratativaModal').classList.add('hidden');
    });

    document.getElementById('tratativaForm').addEventListener('submit', saveTratativa);
}

window.openTratativa = function(id) {
    const t = allTickets.find(ticket => ticket.id === id);
    if (!t) return;

    activeTicketId = id;
    document.getElementById('modalTicketId').textContent = `#${String(id).padStart(6, '0')}`;
    document.getElementById('modalType').textContent = t.type;
    document.getElementById('modalName').textContent = t.contactName;
    document.getElementById('modalEmail').textContent = t.contactEmail;
    document.getElementById('modalLoc').textContent = `${t.city} - ${t.base}`;
    document.getElementById('modalObs').value = t.adminObservations || '';
    document.getElementById('modalPhoto').value = t.adminPhotoUrl || '';

    // Set Radio Status
    const radio = document.querySelector(`input[name="modalStatus"][value="${t.status}"]`);
    if (radio) radio.checked = true;

    // Render Deadlines based on type
    renderModalDeadlines(t);

    document.getElementById('tratativaModal').classList.remove('hidden');
};

function renderModalDeadlines(t) {
    const container = document.getElementById('modalDeadlines');
    container.innerHTML = '';

    if (t.type === 'MID') {
        container.innerHTML = `
            <div class="form-group">
                <label>Prazo p/ Coleta (Busca)</label>
                <input type="datetime-local" id="modalPickup" value="${formatForInput(t.deadlinePickup)}">
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="form-group">
                <label>Prazo Visita</label>
                <input type="datetime-local" id="modalVisit" value="${formatForInput(t.deadlineVisit)}">
            </div>
            <div class="form-group">
                <label>Prazo Orçamento</label>
                <input type="datetime-local" id="modalQuote" value="${formatForInput(t.deadlineQuote)}">
            </div>
            <div class="form-group" style="grid-column: span 2;">
                <label>Prazo Final Entrega</label>
                <input type="datetime-local" id="modalDelivery" value="${formatForInput(t.deadlineDelivery)}">
            </div>
        `;
    }
}

function formatForInput(date) {
    if (!date) return '';
    return new Date(date).toISOString().slice(0, 16);
}

async function saveTratativa(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Salvando...';

    try {
        const t = allTickets.find(x => x.id === activeTicketId);
        const data = {
            status: document.querySelector('input[name="modalStatus"]:checked').value,
            adminObservations: document.getElementById('modalObs').value,
            adminPhotoUrl: document.getElementById('modalPhoto').value || null
        };

        if (t.type === 'MID') {
            data.deadlinePickup = document.getElementById('modalPickup').value || null;
        } else {
            data.deadlineVisit = document.getElementById('modalVisit').value || null;
            data.deadlineQuote = document.getElementById('modalQuote').value || null;
            data.deadlineDelivery = document.getElementById('modalDelivery').value || null;
        }

        const res = await fetch(`${API_BASE}/tickets/${activeTicketId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error('Falha ao atualizar chamado');

        showToast('Atualização salva e e-mail enviado!', 'success');
        document.getElementById('tratativaModal').classList.add('hidden');
        loadAdminData();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Salvar e Notificar Usuário';
    }
}

async function syncSheets() {
    const btn = document.getElementById('syncSheetsBtn');
    btn.disabled = true;
    try {
        const res = await fetch(`${API_BASE}/sync-sheets`, { method: 'POST' });
        const data = await res.json();
        showToast(data.message);
    } catch (err) {
        showToast('Erro na sincronização', 'error');
    } finally {
        btn.disabled = false;
    }
}

// TOAST UTILITY
function showToast(msg, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-msg">${msg}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
