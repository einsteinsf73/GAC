const logo = document.querySelector('.logo');
const clientes = document.querySelector('.clientes');
const massagem = document.querySelector('.massagem');
const promo = document.querySelector('.promo');
const financeiro = document.querySelector('.finan');

logo.addEventListener('click', function () {
    // Recarregar página inicial
    window.location.reload();
});

massagem.addEventListener('click', function () {
    // Abrir página de procedimentos
    window.location.href = 'procedimentos.html';
});

clientes.addEventListener('click', function () {
    // Abrir página Cadastro de Clientes
    window.location.href = 'clientes.html';
});

promo.addEventListener('click', function () {
    // Abrir página de promoções
    window.location.href = 'promocoes.html';
});

financeiro.addEventListener('click', function () {
    // Abrir página financeiro
    window.location.href = 'financeiro.html';
});