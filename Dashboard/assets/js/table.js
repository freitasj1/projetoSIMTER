// Seleciona os elementos
const openModalBtn = document.getElementById('openModalBtn');
const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('closeModalBtn');

// Abre o modal ao clicar no botão "Abrir Modal"
openModalBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
});

// Fecha o modal ao clicar no botão "X"
closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Fecha o modal ao clicar fora da área de conteúdo
window.addEventListener('click', (e) => {
    if (e.target == modal) {
        modal.style.display = 'none';
    }
});

document.getElementById('open_btn').addEventListener('click', function () {
    document.getElementById('sidebar').classList.toggle('open-sidebar');
});



document.getElementById('toggleSidebar').addEventListener('click', function () {
    var sidebar = document.getElementById('sidebar');
    var mainContent = document.getElementById('mainContent');

    // Alterna a classe de 'closed' e ajusta o conteúdo principal
    if (sidebar.classList.contains('closed')) {
        sidebar.classList.remove('closed');
        mainContent.classList.remove('expanded');
        mainContent.classList.add('collapsed');
    } else {
        sidebar.classList.add('closed');
        mainContent.classList.remove('collapsed');
        mainContent.classList.add('expanded');
    }
});
