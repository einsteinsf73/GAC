document.addEventListener('DOMContentLoaded', function () {
    const comboForm = document.getElementById('combo-form');
    const combosTableBody = document.querySelector('#combos-table tbody');
    const checkboxesContainer = document.getElementById('procedimentos-checkboxes');

    // Carrega dados do localStorage
    let procedimentos = JSON.parse(localStorage.getItem('procedimentos')) || [];
    let combos = JSON.parse(localStorage.getItem('combos')) || [];

    // Função para popular os checkboxes de procedimentos
    function populateProcedimentosCheckboxes() {
        checkboxesContainer.innerHTML = ''; // Limpa a lista
        if (procedimentos.length === 0) {
            checkboxesContainer.innerHTML = '<p>Nenhum procedimento cadastrado. Cadastre procedimentos primeiro.</p>';
            return;
        }

        procedimentos.forEach(proc => {
            const div = document.createElement('div');
            div.classList.add('checkbox-item');

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = `proc-${proc.nome}`;
            input.value = proc.nome;
            input.name = 'procedimento';

            const label = document.createElement('label');
            label.htmlFor = `proc-${proc.nome}`;
            label.textContent = `${proc.nome} (${formatCurrency(proc.valor)})`;

            div.appendChild(input);
            div.appendChild(label);
            checkboxesContainer.appendChild(div);
        });
    }

    // Função para formatar valor como moeda (BRL)
    function formatCurrency(value) {
        return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // Função para renderizar a tabela de combos
    function renderTable() {
        combosTableBody.innerHTML = '';

        combos.forEach((combo, index) => {
            const row = document.createElement('tr');
            const procedimentosHtml = combo.procedimentos.join(', ');

            row.innerHTML = `
                <td>${combo.nome}</td>
                <td>${procedimentosHtml}</td>
                <td>${formatCurrency(combo.valor)}</td>
                <td class="action-buttons">
                    <button onclick="editCombo(${index})" title="Editar">✏️</button>
                    <button onclick="deleteCombo(${index})" title="Excluir">❌</button>
                </td>
            `;
            combosTableBody.appendChild(row);
        });
    }

    // Função para salvar combos no localStorage
    function saveCombos() {
        localStorage.setItem('combos', JSON.stringify(combos));
    }

    // Adicionar ou editar combo
    comboForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const nome = document.getElementById('combo-nome').value;
        const valor = document.getElementById('combo-valor').value;
        const selectedProcedimentos = [];
        document.querySelectorAll('input[name="procedimento"]:checked').forEach(checkbox => {
            selectedProcedimentos.push(checkbox.value);
        });

        if (selectedProcedimentos.length === 0) {
            alert('Selecione pelo menos um procedimento para o combo.');
            return;
        }

        // Se estiver editando (verificado por um ID oculto no formulário)
        const editIndex = document.getElementById('edit-index');
        if (editIndex) {
            combos[editIndex.value] = { nome, valor, procedimentos: selectedProcedimentos };
            comboForm.removeChild(editIndex);
        } else {
            combos.push({ nome, valor, procedimentos: selectedProcedimentos });
        }

        saveCombos();
        renderTable();
        comboForm.reset();
        // Desmarcar todos os checkboxes
        document.querySelectorAll('input[name="procedimento"]:checked').forEach(checkbox => checkbox.checked = false);
    });

    // Funções de ação
    window.editCombo = function(index) {
        const combo = combos[index];

        document.getElementById('combo-nome').value = combo.nome;
        document.getElementById('combo-valor').value = combo.valor;

        // Limpa checkboxes antigos
        document.querySelectorAll('input[name="procedimento"]:checked').forEach(checkbox => checkbox.checked = false);

        // Marca os checkboxes do combo a ser editado
        combo.procedimentos.forEach(procNome => {
            const checkbox = document.querySelector(`input[value="${procNome}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });

        // Adiciona um campo oculto para saber que estamos editando
        let editIndexInput = document.getElementById('edit-index');
        if (!editIndexInput) {
            editIndexInput = document.createElement('input');
            editIndexInput.type = 'hidden';
            editIndexInput.id = 'edit-index';
            comboForm.appendChild(editIndexInput);
        }
        editIndexInput.value = index;
    }

    window.deleteCombo = function(index) {
        combos.splice(index, 1);
        saveCombos();
        renderTable();
    }

    // Inicialização
    populateProcedimentosCheckboxes();
    renderTable();
});
