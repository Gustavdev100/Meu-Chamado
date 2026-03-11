// Configuration
const API_BASE = '/api';
const GOOGLE_SHEETS_ID = '1Rf-1Se4wTUry4Nu7cZJKSyw6j8rU21FysafSiwWVNYA';
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
const adminPassword = "admin123";

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupTypeSelection();
    setupFormHandlers();
    setupTrackingHandlers();
    setupAdminHandlers();
    setupCityBaseSync();
});

// Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            switchPage(page);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function switchPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById(pageId + '-page').classList.add('active');

    // Reset form when switching pages
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
    
    // Show/hide conditional fields
    document.getElementById('midFields').classList.add('hidden');
    document.getElementById('comprasFields').classList.add('hidden');
    
    // Reset buttons visibility
    const addItemBtn = document.getElementById('addItemBtn');
    const addMidItemBtn = document.getElementById('addMidItemBtn');
    addItemBtn.style.display = 'block';
    addMidItemBtn.style.display = 'block';
    
    if (type === 'MID') {
        document.getElementById('midFields').classList.remove('hidden');
    } else if (type === 'Compras') {
        document.getElementById('comprasFields').classList.remove('hidden');
    }

    // Reset form
    document.getElementById('ticketForm').reset();
    
    // Reset items containers
    document.getElementById('itemsContainer').innerHTML = '<input type="text" class="item-input" placeholder="Descreva o item 1">';
    document.getElementById('midItemsContainer').innerHTML = '<input type="text" class="mid-item-input" placeholder="Descreva o item 1">';
}

function setupFormHandlers() {
    const backBtn = document.getElementById('backBtn');
    backBtn.addEventListener('click', () => {
        document.getElementById('typeSelection').classList.remove('hidden');
        document.getElementById('formContainer').classList.add('hidden');
    });

    // Compras items
    const addItemBtn = document.getElementById('addItemBtn');
    addItemBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const container = document.getElementById('itemsContainer');
        const count = container.querySelectorAll('.item-input').length;
        
        if (count < 6) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'item-input';
            input.placeholder = `Descreva o item ${count + 1}`;
            container.appendChild(input);
            if (count === 5) addItemBtn.style.display = 'none';
        }
    });

    // MID items
    const addMidItemBtn = document.getElementById('addMidItemBtn');
    addMidItemBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const container = document.getElementById('midItemsContainer');
        const count = container.querySelectorAll('.mid-item-input').length;
        
        if (count < 10) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'mid-item-input';
            input.placeholder = `Descreva o item ${count + 1}`;
            container.appendChild(input);
            if (count === 9) addMidItemBtn.style.display = 'none';
        }
    });

    const form = document.getElementById('ticketForm');
    form.addEventListener('submit', submitTicket);
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
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
        const formData = new FormData(document.getElementById('ticketForm'));
        const data = Object.fromEntries(formData);

        // Validação de campos obrigatórios gerais
        if (!data.city || !data.city.trim()) {
            showToast('Selecione a Cidade', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar Agora';
            return;
        }
        if (!data.base || !data.base.trim()) {
            showToast('Selecione a Base', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar Agora';
            return;
        }
        if (!data.contactName || !data.contactName.trim()) {
            showToast('Preencha o Nome do Solicitante', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar Agora';
            return;
        }
        if (!data.contactEmail || !data.contactEmail.trim()) {
            showToast('Preencha o E-mail de Contato', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar Agora';
            return;
        }

        // Gerar título automaticamente
        const typeInfo = TYPE_INFO[currentType];
        data.title = `${typeInfo.title} - ${data.contactName}`;
        
        // Usar descrição do form ou gerar uma default
        if (!data.description || !data.description.trim()) {
            data.description = `Solicitação de ${currentType} enviada pelo sistema`;
        }

        // Validação específica por tipo
        if (currentType === 'MID') {
            if (!data.midLocation || !data.midLocation.trim()) {
                showToast('Preencha: Onde estão os materiais?', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar Agora';
                return;
            }
            if (!data.midMaterialType || !data.midMaterialType.trim()) {
                showToast('Preencha: Tipo Principal de Resíduo', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar Agora';
                return;
            }
            const items = Array.from(document.querySelectorAll('.mid-item-input'))
                .map(input => input.value.trim())
                .filter(val => val);
            data.items = JSON.stringify(items);
        } else if (currentType === 'Compras') {
            if (!data.itemCategory || !data.itemCategory.trim()) {
                showToast('Preencha: Categoria da Compra', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar Agora';
                return;
            }
            const items = Array.from(document.querySelectorAll('.item-input'))
                .map(input => input.value.trim())
                .filter(val => val);
            if (items.length === 0) {
                showToast('Adicione pelo menos 1 item à lista de compra', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar Agora';
                return;
            }
            data.items = JSON.stringify(items);
        }

        // Add type
        data.type = currentType;
        data.status = 'open';

        const response = await fetch(`${API_BASE}/tickets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao enviar solicitação');
        }

        const ticket = await response.json();
        showToast('Solicitação enviada com sucesso!', 'success');
        
        // Reset and show type selection
        document.getElementById('ticketForm').reset();
        document.getElementById('typeSelection').classList.remove('hidden');
        document.getElementById('formContainer').classList.add('hidden');
        currentType = null;

    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Agora';
    }
}

// Tracking
function setupTrackingHandlers() {
    const trackForm = document.getElementById('trackForm');
    trackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('trackEmail').value;
        await searchTickets(email);
    });
}

async function searchTickets(email) {
    const trackBtn = document.getElementById('trackBtn');
    trackBtn.disabled = true;
    trackBtn.textContent = 'Carregando...';
    
    const resultDiv = document.getElementById('ticketsResult');
    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE}/tickets`);
        if (!response.ok) throw new Error('Erro ao buscar solicitações');

        const allTickets = await response.json();
        const userTickets = allTickets.filter(t => 
            t.contactEmail.toLowerCase() === email.toLowerCase()
        );

        if (userTickets.length === 0) {
            resultDiv.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <h3>Nenhuma solicitação encontrada</h3>
                    <p>Verifique se o e-mail <strong>${email}</strong> está correto.</p>
                </div>
            `;
        } else {
            resultDiv.classList.add('tickets-result');
            userTickets.forEach(ticket => {
                resultDiv.appendChild(createTicketCard(ticket, false));
            });
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        trackBtn.disabled = false;
        trackBtn.textContent = 'Consultar Chamados';
    }
}

function createTicketCard(ticket, isAdmin = false) {
    const card = document.createElement('div');
    card.className = 'ticket-card';
    
    const statusClass = `status-${ticket.status}`;
    const createdAt = ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('pt-BR') : '-';
    
    let itemsHtml = '';
    if (ticket.items) {
        try {
            const items = JSON.parse(ticket.items);
            itemsHtml = `
                <div class="ticket-section">
                    <h4>Itens Solicitados</h4>
                    <div class="items-list">
                        ${items.map((item, i) => `<div class="item-badge">${i + 1}. ${item}</div>`).join('')}
                    </div>
                </div>
            `;
        } catch (e) {}
    }

    card.innerHTML = `
        <div class="ticket-header">
            <div class="ticket-info">
                <div>
                    <span class="ticket-type">${ticket.type}</span>
                    <span class="ticket-id">#${String(ticket.id).padStart(6, '0')}</span>
                </div>
                <div class="ticket-title">${ticket.title}</div>
            </div>
            <div>
                <span class="ticket-status ${statusClass}">${ticket.status.replace('_', ' ')}</span>
                <div style="font-size: 0.85rem; color: #999; margin-top: 0.5rem;">Criado: ${createdAt}</div>
            </div>
        </div>

        <div class="ticket-content">
            <div class="ticket-section">
                <h4>📍 Localização</h4>
                <div class="ticket-details">
                    <div class="detail-row">
                        <span class="detail-label">Cidade:</span>
                        <span class="detail-value">${ticket.city}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Base:</span>
                        <span class="detail-value">${ticket.base}</span>
                    </div>
                </div>
            </div>

            <div class="ticket-section">
                <h4>📋 Prazos</h4>
                <div class="ticket-details">
                    ${ticket.type !== 'MID' ? `
                        <div class="detail-row">
                            <span class="detail-label">Visita:</span>
                            <span class="detail-value">${ticket.deadlineVisit ? new Date(ticket.deadlineVisit).toLocaleDateString('pt-BR') : 'Aguardando'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Orçamento:</span>
                            <span class="detail-value">${ticket.deadlineQuote ? new Date(ticket.deadlineQuote).toLocaleDateString('pt-BR') : 'Aguardando'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Entrega:</span>
                            <span class="detail-value">${ticket.deadlineDelivery ? new Date(ticket.deadlineDelivery).toLocaleDateString('pt-BR') : 'Aguardando'}</span>
                        </div>
                    ` : `
                        <div class="detail-row">
                            <span class="detail-label">Busca:</span>
                            <span class="detail-value">${ticket.deadlinePickup ? new Date(ticket.deadlinePickup).toLocaleDateString('pt-BR') : 'Aguardando'}</span>
                        </div>
                    `}
                </div>
            </div>
        </div>

        ${itemsHtml}

        <div class="ticket-section">
            <h4>📝 Tratativa Interna</h4>
            <div class="observations">
                ${ticket.adminObservations || 'Sua solicitação está sendo analisada pela nossa equipe. Em breve você receberá atualizações aqui.'}
            </div>
            ${ticket.adminPhotoUrl ? `<div style="margin-top: 1rem;"><a href="${ticket.adminPhotoUrl}" target="_blank" rel="noreferrer" class="btn-primary">📷 Ver anexo</a></div>` : ''}
        </div>

        ${isAdmin ? `
            <div id="edit-form-${ticket.id}" class="hidden">
                <!-- Admin edit form will be added here -->
            </div>
        ` : ''}
    `;

    return card;
}

// Admin
function setupAdminHandlers() {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('adminPassword').value;
        
        if (password === adminPassword) {
            adminAuthenticated = true;
            document.getElementById('adminLogin').classList.add('hidden');
            document.getElementById('adminPanel').classList.remove('hidden');
            loadAdminTickets();
        } else {
            showToast('Senha incorreta', 'error');
        }
    });

    const logoutBtn = document.getElementById('adminLogout');
    logoutBtn.addEventListener('click', () => {
        adminAuthenticated = false;
        document.getElementById('adminLogin').classList.remove('hidden');
        document.getElementById('adminPanel').classList.add('hidden');
        document.getElementById('loginForm').reset();
    });
}

async function loadAdminTickets() {
    try {
        const response = await fetch(`${API_BASE}/tickets`);
        if (!response.ok) throw new Error('Erro ao buscar solicitações');

        const tickets = await response.json();
        const container = document.getElementById('ticketsList');
        container.innerHTML = '';

        tickets.forEach(ticket => {
            const card = createTicketCard(ticket, true);
            
            // Add edit form
            const editForm = document.createElement('div');
            editForm.className = 'edit-form';
            editForm.innerHTML = `
                <h3>Editar #${String(ticket.id).padStart(6, '0')}</h3>
                <div class="edit-section">
                    <label>Observações:</label>
                    <textarea id="obs-${ticket.id}">${ticket.adminObservations || ''}</textarea>
                </div>
                <div class="edit-section">
                    <label>URL da Foto:</label>
                    <input type="url" id="photo-${ticket.id}" value="${ticket.adminPhotoUrl || ''}">
                </div>
                ${ticket.type !== 'MID' ? `
                    <div class="edit-section">
                        <label>Prazo Visita Técnica:</label>
                        <input type="datetime-local" id="visit-${ticket.id}" value="${formatDateTimeLocal(ticket.deadlineVisit)}">
                    </div>
                    <div class="edit-section">
                        <label>Prazo Orçamento:</label>
                        <input type="datetime-local" id="quote-${ticket.id}" value="${formatDateTimeLocal(ticket.deadlineQuote)}">
                    </div>
                    <div class="edit-section">
                        <label>Prazo Entrega:</label>
                        <input type="datetime-local" id="delivery-${ticket.id}" value="${formatDateTimeLocal(ticket.deadlineDelivery)}">
                    </div>
                ` : `
                    <div class="edit-section">
                        <label>Prazo Busca:</label>
                        <input type="datetime-local" id="pickup-${ticket.id}" value="${formatDateTimeLocal(ticket.deadlinePickup)}">
                    </div>
                `}
                <button type="button" class="btn-save" onclick="saveTicket(${ticket.id})">Salvar Alterações</button>
            `;
            
            container.appendChild(card);
            container.appendChild(editForm);
        });
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function formatDateTimeLocal(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
}

async function saveTicket(id) {
    try {
        const data = {
            adminObservations: document.getElementById(`obs-${id}`).value,
            adminPhotoUrl: document.getElementById(`photo-${id}`).value || null
        };

        // Get ticket type to determine which deadlines to save
        const response = await fetch(`${API_BASE}/tickets/${id}`);
        const ticket = await response.json();

        if (ticket.type !== 'MID') {
            data.deadlineVisit = document.getElementById(`visit-${id}`).value || null;
            data.deadlineQuote = document.getElementById(`quote-${id}`).value || null;
            data.deadlineDelivery = document.getElementById(`delivery-${id}`).value || null;
        } else {
            data.deadlinePickup = document.getElementById(`pickup-${id}`).value || null;
        }

        const updateResponse = await fetch(`${API_BASE}/tickets/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!updateResponse.ok) throw new Error('Erro ao salvar');
        
        showToast('Alterações salvas com sucesso!', 'success');
        loadAdminTickets();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}
