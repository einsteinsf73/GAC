document.addEventListener('DOMContentLoaded', function () {
    const clienteForm = document.getElementById('cliente-form');
    const clientesTableBody = document.querySelector('#clientes-table tbody');

    // Carrega clientes do localStorage ou inicializa um array vazio
    let clientes = JSON.parse(localStorage.getItem('clientes')) || [];

    // Função para renderizar a tabela de clientes
    function renderTable() {
        clientesTableBody.innerHTML = ''; // Limpa a tabela

        clientes.forEach((cliente, index) => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${cliente.nome}</td>
                <td>${cliente.telefone}</td>
                <td>${cliente.email}</td>
                <td class="action-buttons">
                    <button onclick="editCliente(${index})" title="Editar">✏️</button>
                    <button onclick="deleteCliente(${index})" title="Excluir">❌</button>
                </td>
            `;

            clientesTableBody.appendChild(row);
        });
    }

    // Função para salvar clientes no localStorage
    function saveClientes() {
        localStorage.setItem('clientes', JSON.stringify(clientes));
    }

    // Adicionar novo cliente
    clienteForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const nome = document.getElementById('nome').value;
        const telefone = document.getElementById('telefone').value;
        const email = document.getElementById('email').value;

        // Adiciona o novo cliente ao array
        clientes.push({ nome, telefone, email });

        // Salva e renderiza a tabela
        saveClientes();
        renderTable();

        // Limpa o formulário
        clienteForm.reset();
    });

    // Funções de ação (editar/excluir) - expostas globalmente para o onclick
    window.editCliente = function(index) {
        const cliente = clientes[index];
        
        // Preenche o formulário com os dados do cliente
        document.getElementById('nome').value = cliente.nome;
        document.getElementById('telefone').value = cliente.telefone;
        document.getElementById('email').value = cliente.email;

        // Remove o cliente da lista para evitar duplicados ao salvar
        deleteCliente(index);
    }

    window.deleteCliente = function(index) {
        // Remove o cliente do array pelo índice
        clientes.splice(index, 1);
        
        // Salva a lista atualizada e renderiza a tabela novamente
        saveClientes();
        renderTable();
    }

    // Renderiza a tabela inicial ao carregar a página
    renderTable();
});
