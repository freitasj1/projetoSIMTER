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

// Função para buscar os dados do servidor
async function fetchEquipamentos() {
    try {
        const response = await fetch('/api/equipamentos');  // Faz o GET dos dados
        const equipamentos = await response.json();  // Converte os dados para JSON

        const tbody = document.querySelector('#equipamentosTable');

        // Limpa o conteúdo atual da tabela
        tbody.innerHTML = '';

        // Adiciona uma linha para cada equipamento recebido
        equipamentos.forEach(equip => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>
                    <div class="d-flex px-2 py-1">
                        <div class="d-flex flex-column justify-content-center">
                            <h6 class="mb-0 text-sm">${equip.equipamento}</h6>
                        </div>
                    </div>
                </td>
                <td>
                    <p class="text-xs font-weight-bold mb-0">${equip.id}</p>
                </td>
                <td class="align-middle text-center text-sm">
                    <span class="badge badge-sm bg-gradient-${equip.status === 'Online' ? 'success' : 'danger'}">
                        ${equip.status}
                    </span>
                </td>
                <td class="align-middle text-center">
                    <span class="text-secondary text-xs font-weight-bold">${equip.sala}</span>
                </td>
                <td class="align-middle text-center">
                    <h6 class="mb-0 text-sm">${equip.responsavel}</h6>
                </td>
            `;

            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao buscar os equipamentos:', error);
    }
}

// Chama a função para buscar e preencher os dados assim que a página carrega
window.onload = fetchEquipamentos;
