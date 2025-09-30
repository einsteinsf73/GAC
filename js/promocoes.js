document.addEventListener('DOMContentLoaded', function () {
    const promocaoForm = document.getElementById('promocao-form');
    const promocoesTableBody = document.querySelector('#promocoes-table tbody');

    // Carrega promoções do localStorage ou inicializa um array vazio
    let promocoes = JSON.parse(localStorage.getItem('promocoes')) || [];

    // Função para formatar o valor do desconto para exibição
    function formatDesconto(valor, tipo) {
        if (tipo === 'percent') {
            return `${parseFloat(valor)}%`;
        } else { // valor
            return parseFloat(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }
    }

    // Função para renderizar a tabela de promoções
    function renderTable() {
        promocoesTableBody.innerHTML = ''; // Limpa a tabela

        promocoes.forEach((promocao, index) => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${promocao.nome}</td>
                <td>${formatDesconto(promocao.desconto, promocao.tipo)}</td>
                <td class="action-buttons">
                    <button onclick="editPromocao(${index})" title="Editar">✏️</button>
                    <button onclick="deletePromocao(${index})" title="Excluir">❌</button>
                </td>
            `;

            promocoesTableBody.appendChild(row);
        });
    }

    // Função para salvar promoções no localStorage
    function savePromocoes() {
        localStorage.setItem('promocoes', JSON.stringify(promocoes));
    }

    // Adicionar nova promoção
    promocaoForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const nome = document.getElementById('nome').value;
        const desconto = document.getElementById('desconto').value;
        const tipo = document.getElementById('desconto-tipo').value;

        // Adiciona a nova promoção ao array
        promocoes.push({ nome, desconto, tipo });

        // Salva e renderiza a tabela
        savePromocoes();
        renderTable();

        // Limpa o formulário
        promocaoForm.reset();
    });

    // Funções de ação (editar/excluir)
    window.editPromocao = function(index) {
        const promocao = promocoes[index];
        
        // Preenche o formulário com os dados da promoção
        document.getElementById('nome').value = promocao.nome;
        document.getElementById('desconto').value = promocao.desconto;
        document.getElementById('desconto-tipo').value = promocao.tipo;

        // Remove a promoção da lista para evitar duplicados ao salvar
        deletePromocao(index);
    }

    window.deletePromocao = function(index) {
        // Remove a promoção do array pelo índice
        promocoes.splice(index, 1);
        
        // Salva a lista atualizada e renderiza a tabela novamente
        savePromocoes();
        renderTable();
    }

    // Renderiza a tabela inicial ao carregar a página
    renderTable();
});
