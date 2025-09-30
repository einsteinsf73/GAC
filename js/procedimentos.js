document.addEventListener('DOMContentLoaded', function () {
    const procedimentoForm = document.getElementById('procedimento-form');
    const procedimentosTableBody = document.querySelector('#procedimentos-table tbody');

    // Carrega procedimentos do localStorage ou inicializa um array vazio
    let procedimentos = JSON.parse(localStorage.getItem('procedimentos')) || [];

    // Função para formatar valor como moeda (BRL)
    function formatCurrency(value) {
        return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // Função para renderizar a tabela de procedimentos
    function renderTable() {
        procedimentosTableBody.innerHTML = ''; // Limpa a tabela

        procedimentos.forEach((procedimento, index) => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${procedimento.nome}</td>
                <td>${formatCurrency(procedimento.valor)}</td>
                <td class="action-buttons">
                    <button onclick="editProcedimento(${index})" title="Editar">✏️</button>
                    <button onclick="deleteProcedimento(${index})" title="Excluir">❌</button>
                </td>
            `;

            procedimentosTableBody.appendChild(row);
        });
    }

    // Função para salvar procedimentos no localStorage
    function saveProcedimentos() {
        localStorage.setItem('procedimentos', JSON.stringify(procedimentos));
    }

    // Adicionar novo procedimento
    procedimentoForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const nome = document.getElementById('nome').value;
        const valor = document.getElementById('valor').value;

        // Adiciona o novo procedimento ao array
        procedimentos.push({ nome, valor });

        // Salva e renderiza a tabela
        saveProcedimentos();
        renderTable();

        // Limpa o formulário
        procedimentoForm.reset();
    });

    // Funções de ação (editar/excluir)
    window.editProcedimento = function(index) {
        const procedimento = procedimentos[index];
        
        // Preenche o formulário com os dados do procedimento
        document.getElementById('nome').value = procedimento.nome;
        document.getElementById('valor').value = procedimento.valor;

        // Remove o procedimento da lista para evitar duplicados ao salvar
        deleteProcedimento(index);
    }

    window.deleteProcedimento = function(index) {
        // Remove o procedimento do array pelo índice
        procedimentos.splice(index, 1);
        
        // Salva a lista atualizada e renderiza a tabela novamente
        saveProcedimentos();
        renderTable();
    }

    // Renderiza a tabela inicial ao carregar a página
    renderTable();
});
