// Global state
let stockData = [];
let currentSortField = 'id';
let currentSortDir = 'asc';
let editingProductId = null;

// ─── INIT ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadStock();
});

// ─── SIDEBAR ──────────────────────────────────────
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

// ─── NAVIGATION ───────────────────────────────────
function navigateTo(page) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });
    document.querySelectorAll('.page').forEach(p => {
        p.classList.toggle('active', p.id === 'page-' + page);
    });

    if (page === 'pesquisar') {
        renderTable('table-pesquisar', stockData);
        const input = document.getElementById('input-pesquisa');
        if (input) { input.value = ''; }
    }
}

// ─── LOAD STOCK ────────────────────────────────────
async function loadStock() {
    try {
        const res = await fetch('/api/estoque');
        stockData = await res.json();
        renderAllTables();
        updateEsvaziarStats();
    } catch {
        showToast('Erro ao carregar estoque', 'error');
    }
}

// ─── FORMAT HELPERS ─────────────────────────────────
function formatName(name) {
    return String(name)
        .replace(/_/g, ' ')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

function formatPrice(price) {
    return 'R$ ' + parseFloat(price).toFixed(2).replace('.', ',');
}

function getBadgeClass(qty) {
    if (qty >= 100) return 'badge-green';
    if (qty >= 30) return 'badge-yellow';
    return 'badge-red';
}

// ─── RENDER TABLE ───────────────────────────────────
function renderTable(containerId, data, showActions = false) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!data || data.length === 0) {
        container.innerHTML = '<div class="empty-state">Nenhum produto encontrado</div>';
        return;
    }

    const actionsHeader = showActions ? '<th>Ações</th>' : '';

    const rows = data.map(item => {
        const actions = showActions ? `<td>
            <button class="btn-icon edit" onclick="openEditModal(${item.id})" title="Editar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-icon delete" onclick="deleteProduct(${item.id}, '${item.produto}')" title="Excluir">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
        </td>` : '';

        return `<tr>
            <td class="td-id">${item.id}</td>
            <td class="td-name">${formatName(item.produto)}</td>
            <td class="td-price">${formatPrice(item.preco_unitario)}</td>
            <td><span class="badge ${getBadgeClass(item.quantidade)}">${item.quantidade}</span></td>
            ${actions}
        </tr>`;
    }).join('');

    container.innerHTML = `<table>
        <thead><tr>
            <th>ID</th><th>Produto</th><th>Preço</th><th>Quantidade</th>${actionsHeader}
        </tr></thead>
        <tbody>${rows}</tbody>
    </table>`;
}

// ─── RENDER ALL TABLES ──────────────────────────────
function renderAllTables() {
    renderTable('table-adicionar', stockData);
    renderTable('table-ver', stockData);
    renderTable('table-excluir', stockData, true);
    renderTable('table-ordenar', stockData);

    const total = stockData.reduce((sum, item) => sum + Number(item.quantidade), 0);
    const summaryHTML = `
        <div class="summary-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        </div>
        <div class="summary-item">
            <span class="summary-label">Total de Produtos</span>
            <span class="summary-value">${stockData.length}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Total em Estoque</span>
            <span class="summary-value">${total}</span>
        </div>`;

    const sa = document.getElementById('summary-adicionar');
    const sv = document.getElementById('summary-ver');
    if (sa) sa.innerHTML = summaryHTML;
    if (sv) sv.innerHTML = summaryHTML;
}

// ─── ESVAZIAR STATS ─────────────────────────────────
function updateEsvaziarStats() {
    const total = stockData.reduce((sum, item) => sum + Number(item.quantidade), 0);
    const countEl = document.getElementById('esvaziar-count');
    const totalEl = document.getElementById('esvaziar-total');
    const descEl = document.getElementById('esvaziar-desc');

    if (countEl) countEl.textContent = stockData.length;
    if (totalEl) totalEl.textContent = total;
    if (descEl) {
        descEl.innerHTML = `Ao esvaziar o estoque, todos os <strong>${stockData.length} produtos</strong> e <strong>${total} unidades</strong> serão permanentemente removidos. Esta ação não pode ser desfeita.`;
    }
}

// ─── SEARCH ─────────────────────────────────────────
function filterSearch(query) {
    const q = query.trim().toLowerCase();
    if (!q) { renderTable('table-pesquisar', stockData); return; }

    const filtered = stockData.filter(item =>
        String(item.id) === q ||
        item.produto.toLowerCase().includes(q.replace(/ /g, '_')) ||
        item.produto.toLowerCase().replace(/_/g, ' ').includes(q)
    );
    renderTable('table-pesquisar', filtered);
}

// ─── ADD PRODUCT ─────────────────────────────────────
async function addProduct(e) {
    e.preventDefault();

    const nome = document.getElementById('input-nome').value.trim();
    const preco = parseFloat(document.getElementById('input-preco').value);
    const quantidade = parseInt(document.getElementById('input-quantidade').value);

    if (!nome || isNaN(preco) || isNaN(quantidade)) return;

    try {
        const res = await fetch('/api/adicionar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ produto: nome, quantidade, preco })
        });
        const data = await res.json();

        if (res.ok) {
            showToast(data.mensagem, 'success');
            document.getElementById('form-adicionar').reset();
            await loadStock();
        } else {
            showToast(data.erro, 'error');
        }
    } catch {
        showToast('Erro ao adicionar produto', 'error');
    }
}

// ─── EDIT MODAL ──────────────────────────────────────
function openEditModal(id) {
    const product = stockData.find(p => Number(p.id) === id);
    if (!product) return;

    editingProductId = id;
    document.getElementById('edit-nome').value = formatName(product.produto);
    document.getElementById('edit-preco').value = parseFloat(product.preco_unitario).toFixed(2);
    document.getElementById('edit-quantidade').value = product.quantidade;
    document.getElementById('editModal').classList.add('active');
}

function closeEditModal(e) {
    if (e && e.target !== document.getElementById('editModal')) return;
    editingProductId = null;
    document.getElementById('editModal').classList.remove('active');
}

async function saveEdit() {
    const nome = document.getElementById('edit-nome').value.trim();
    const preco = parseFloat(document.getElementById('edit-preco').value);
    const quantidade = parseInt(document.getElementById('edit-quantidade').value);

    if (!nome || isNaN(preco) || preco <= 0 || isNaN(quantidade) || quantidade <= 0) {
        showToast('Preencha todos os campos corretamente', 'error');
        return;
    }

    try {
        const res = await fetch('/api/editar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editingProductId, produto: nome, quantidade, preco_unitario: preco })
        });
        const data = await res.json();

        if (res.ok) {
            showToast(data.mensagem, 'success');
            editingProductId = null;
            document.getElementById('editModal').classList.remove('active');
            await loadStock();
        } else {
            showToast(data.erro, 'error');
        }
    } catch {
        showToast('Erro ao editar produto', 'error');
    }
}

// ─── DELETE PRODUCT ──────────────────────────────────
async function deleteProduct(id, nome) {
    if (!confirm(`Deseja excluir "${formatName(nome)}"? Esta ação não pode ser desfeita.`)) return;

    try {
        const res = await fetch('/api/deletar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ produto: nome, modo: 1 })
        });
        const data = await res.json();

        if (res.ok) {
            showToast(data.mensagem, 'success');
            await loadStock();
        } else {
            showToast(data.erro, 'error');
        }
    } catch {
        showToast('Erro ao excluir produto', 'error');
    }
}

// ─── SORT ────────────────────────────────────────────
function setSortField(field) {
    currentSortField = field;
    document.querySelectorAll('.sort-btn[data-field]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.field === field);
    });
    applySortToAPI();
}

function setSortDir(dir) {
    currentSortDir = dir;
    document.querySelectorAll('.sort-btn[data-dir]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.dir === dir);
    });
    applySortToAPI();
}

async function applySortToAPI() {
    try {
        const res = await fetch('/api/ordenar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campo: currentSortField, ordem: currentSortDir })
        });
        const data = await res.json();
        if (res.ok) {
            await loadStock();
        } else {
            showToast(data.erro, 'error');
        }
    } catch {
        showToast('Erro ao ordenar estoque', 'error');
    }
}

// ─── CLEAR STOCK ─────────────────────────────────────
async function clearStock() {
    if (!confirm('Deseja esvaziar todo o estoque? Esta ação não pode ser desfeita.')) return;

    try {
        const res = await fetch('/api/limpar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();

        if (res.ok) {
            showToast(data.mensagem, 'success');
            await loadStock();
        } else {
            showToast(data.erro, 'error');
        }
    } catch {
        showToast('Erro ao esvaziar estoque', 'error');
    }
}

// ─── TOAST ───────────────────────────────────────────
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(110%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
