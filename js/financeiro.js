document.addEventListener('DOMContentLoaded', function () {
    // --- FUNÇÕES UTILITÁRIAS ---
    function formatCurrency(value) {
        const val = parseFloat(value);
        if (isNaN(val)) return 'R$ 0,00';
        return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function formatDesconto(valor, tipo) {
        if (tipo === 'percent') {
            return `${parseFloat(valor)}%`;
        } else {
            return formatCurrency(valor);
        }
    }

    function loadFromStorage(key) {
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch (e) {
            console.error(`Erro ao carregar ${key} do localStorage:`, e);
            return []; // Retorna um array vazio em caso de erro
        }
    }

    // --- ELEMENTOS DO DOM ---
    const form = document.getElementById('financeiro-form');
    const clienteSelect = document.getElementById('cliente-select');
    const dataInput = document.getElementById('data');
    const servicosCheckboxesContainer = document.getElementById('servicos-checkboxes');
    const promocaoSelect = document.getElementById('promocao-select');
    const descontoInput = document.getElementById('desconto');
    const descontoTipoSelect = document.getElementById('desconto-tipo');
    const statusPagamentoSelect = document.getElementById('status-pagamento');
    const valorTotalSpan = document.getElementById('valor-total');
    const lancamentosTableBody = document.querySelector('#financeiro-table tbody');
    const addManualServiceBtn = document.getElementById('add-manual-service-btn');
    const manualDescricaoInput = document.getElementById('manual-descricao');
    const manualValorInput = document.getElementById('manual-valor');
    const manualServiceList = document.getElementById('manual-service-list');

    // --- BANCO DE DADOS (LOCALSTORAGE & TEMPORÁRIO) ---
    let clientes = loadFromStorage('clientes');
    let procedimentos = loadFromStorage('procedimentos');
    let combos = loadFromStorage('combos');
    let promocoes = loadFromStorage('promocoes');
    let lancamentos = loadFromStorage('lancamentos');
    let manualItems = [];

    // --- FUNÇÕES DE INICIALIZAÇÃO ---
    function populateClientesSelect() {
        clienteSelect.innerHTML = '<option value="">Selecione um cliente</option>';
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.nome;
            option.textContent = cliente.nome;
            clienteSelect.appendChild(option);
        });
    }

    function populateServicosCheckboxes() {
        servicosCheckboxesContainer.innerHTML = '';
        const allServices = [
            ...procedimentos.map(p => ({ ...p, tipo: 'Procedimento' })),
            ...combos.map(c => ({ ...c, nome: `[COMBO] ${c.nome}`, tipo: 'Combo' }))
        ];
        if (allServices.length === 0) {
            servicosCheckboxesContainer.innerHTML = '<p>Nenhum serviço cadastrado.</p>';
            return;
        }
        allServices.forEach((service, index) => {
            const div = document.createElement('div');
            div.classList.add('checkbox-item');
            const input = document.createElement('input');
            const safeId = `servico-${index}`;
            input.type = 'checkbox';
            input.id = safeId;
            input.value = service.nome;
            input.dataset.valor = service.valor;
            input.name = 'servico';
            const label = document.createElement('label');
            label.htmlFor = safeId;
            label.textContent = `${service.nome} (${formatCurrency(service.valor)})`;
            div.appendChild(input);
            div.appendChild(label);
            servicosCheckboxesContainer.appendChild(div);
        });
    }

    function populatePromocoesSelect() {
        promocaoSelect.innerHTML = '<option value="">Nenhuma</option>';
        promocoes.forEach((promo, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${promo.nome} (${formatDesconto(promo.desconto, promo.tipo)})`;
            promocaoSelect.appendChild(option);
        });
    }

    // --- LÓGICA DE SERVIÇO MANUAL ---
    function renderManualItems() {
        manualServiceList.innerHTML = '';
        manualItems.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="item-name">${item.descricao} - ${formatCurrency(item.valor)}</span>
                <button type="button" class="item-remove-btn" data-index="${index}">❌</button>
            `;
            manualServiceList.appendChild(li);
        });
        updateTotal();
    }

    addManualServiceBtn.addEventListener('click', () => {
        const descricao = manualDescricaoInput.value.trim();
        const valor = parseFloat(manualValorInput.value);
        if (descricao && !isNaN(valor) && valor > 0) {
            manualItems.push({ descricao, valor });
            renderManualItems();
            manualDescricaoInput.value = '';
            manualValorInput.value = '';
        } else {
            alert('Por favor, preencha a descrição e um valor válido para o serviço manual.');
        }
    });

    manualServiceList.addEventListener('click', (e) => {
        if (e.target.classList.contains('item-remove-btn')) {
            const index = parseInt(e.target.dataset.index, 10);
            manualItems.splice(index, 1);
            renderManualItems();
        }
    });

    // --- FUNÇÃO DE CÁLCULO ---
    function updateTotal() {
        let subtotal = 0;
        document.querySelectorAll('input[name="servico"]:checked').forEach(checkbox => {
            subtotal += parseFloat(checkbox.dataset.valor || 0);
        });
        manualItems.forEach(item => {
            subtotal += item.valor;
        });

        const desconto = parseFloat(descontoInput.value || 0);
        const tipoDesconto = descontoTipoSelect.value;
        let valorFinal = subtotal;

        if (!isNaN(desconto) && desconto > 0) {
            if (tipoDesconto === 'valor') {
                valorFinal -= desconto;
            } else { // percent
                valorFinal -= (subtotal * (desconto / 100));
            }
        }
        
        valorTotalSpan.textContent = formatCurrency(valorFinal > 0 ? valorFinal : 0);
    }

    // --- FUNÇÕES DE RENDERIZAÇÃO E PERSISTÊNCIA ---
    function renderLancamentosTable() {
        lancamentosTableBody.innerHTML = '';
        lancamentos.forEach((lanc, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(lanc.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                <td>${lanc.cliente}</td>
                <td>${lanc.servicos.join(', ')}</td>
                <td>${formatCurrency(lanc.valorFinal)}</td>
                <td><div class="status-${lanc.status.toLowerCase()}">${lanc.status}</div></td>
                <td class="action-buttons">
                    <button onclick="deleteLancamento(${index})" title="Excluir">❌</button>
                </td>
            `;
            lancamentosTableBody.appendChild(row);
        });
    }

    function saveLancamentos() {
        localStorage.setItem('lancamentos', JSON.stringify(lancamentos));
    }

    // --- EVENT LISTENERS PRINCIPAIS ---
    servicosCheckboxesContainer.addEventListener('change', updateTotal);
    descontoInput.addEventListener('input', updateTotal);
    descontoTipoSelect.addEventListener('change', updateTotal);

    promocaoSelect.addEventListener('change', function() {
        const selectedPromoIndex = this.value;
        if (selectedPromoIndex !== '') {
            const promo = promocoes[selectedPromoIndex];
            descontoInput.value = promo.desconto;
            descontoTipoSelect.value = promo.tipo;
            descontoInput.readOnly = true;
            descontoTipoSelect.disabled = true;
        } else {
            descontoInput.value = 0;
            descontoInput.readOnly = false;
            descontoTipoSelect.disabled = false;
        }
        updateTotal();
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const servicosCadastrados = Array.from(document.querySelectorAll('input[name="servico"]:checked')).map(cb => cb.value);
        const servicosManuais = manualItems.map(item => `${item.descricao} (Manual)`);
        const todosServicos = [...servicosCadastrados, ...servicosManuais];

        if (todosServicos.length === 0) {
            alert('Selecione ou adicione pelo menos um serviço.');
            return;
        }

        let subtotal = 0;
        document.querySelectorAll('input[name="servico"]:checked').forEach(checkbox => { subtotal += parseFloat(checkbox.dataset.valor || 0); });
        manualItems.forEach(item => { subtotal += item.valor; });
        const desconto = parseFloat(descontoInput.value || 0);
        const tipoDesconto = descontoTipoSelect.value;
        let valorFinal = subtotal;
        if (!isNaN(desconto) && desconto > 0) { tipoDesconto === 'valor' ? valorFinal -= desconto : valorFinal -= (subtotal * (desconto / 100)); }

        const novoLancamento = {
            cliente: clienteSelect.value,
            data: dataInput.value,
            servicos: todosServicos,
            valorFinal: valorFinal > 0 ? valorFinal : 0,
            status: statusPagamentoSelect.value
        };

        lancamentos.push(novoLancamento);
        saveLancamentos();
        renderLancamentosTable();
        
        // Limpeza completa do formulário
        form.reset();
        manualItems = [];
        renderManualItems();
        promocaoSelect.value = '';
        descontoInput.readOnly = false;
        descontoTipoSelect.disabled = false;
        document.querySelectorAll('input[name="servico"]:checked').forEach(cb => cb.checked = false);
        updateTotal();
    });

    // --- AÇÕES GLOBAIS ---
    window.deleteLancamento = function(index) {
        if (confirm('Tem certeza que deseja excluir este lançamento?')) {
            lancamentos.splice(index, 1);
            saveLancamentos();
            renderLancamentosTable();
        }
    }

    // --- INICIALIZAÇÃO ---
    populateClientesSelect();
    populateServicosCheckboxes();
    populatePromocoesSelect();
    renderLancamentosTable();
    updateTotal();
});
