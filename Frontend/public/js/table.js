// Seleciona os elementos
const openModalBtn = document.getElementById('openModalBtn');
const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('closeModalBtn');


let isFetching = false;

async function fetchEquipamentos() {
    if (isFetching) return;  // Se já está buscando, não faz nova requisição

    isFetching = true;
    try {
        // Código de fetch aqui
        console.log('try fetchEquip')
        const response = await fetch('/api/equipamentos');
        console.log('Resposta do fetch:', response);
        if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.status);
        }
        const equipamentos = await response.json();
        console.log('Dados recebidos do servidor:', equipamentos);


        // Seleciona o elemento do tbody onde a tabela será preenchida
        const tableBody = document.getElementById('equipamentosTable');
        if (!tableBody) {
            console.error('Elemento #equipamentosTable não encontrado!');
            return;
        }
        tableBody.innerHTML = '';  // Limpa o conteúdo anterior

        equipamentos.forEach((equip) => {
            // Cria uma nova linha <tr>
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="d-flex px-2 py-1">
                        <div class="d-flex flex-column justify-content-center">
                            <h6 class="mb-0 text-sm">${equip.nome}</h6>
                        </div>
                    </div>
                </td>
                <td>
                    <p class="text-xs font-weight-bold mb-0">${equip.ID}</p>
                </td>
                <td class="align-middle text-center text-sm">
                    <span class="badge badge-sm bg-gradient-${equip.status === 'Online' ? 'success' : 'danger'}">${equip.status}</span>
                </td>
                <td class="align-middle text-center">
                    <span class="text-secondary text-xs font-weight-bold">${equip.SALA}</span>
                </td>
                <td class="align-middle text-center">
                    <h6 class="mb-0 text-sm">${equip.responsavel}</h6>
                </td>
                <td class="align-middle">
                    <button class="openModalBtn font-weight-bold text-xs">Editar</button>
                </td>
            `;
        
            // Adiciona a linha à tabela
            tableBody.appendChild(row);
        
            // Adiciona o event listener ao botão dentro da linha
            row.querySelector('#openModalBtn').addEventListener('click', () => {
                modal.style.display = 'flex';
            });
        });    
    } catch (error) {
        console.error('Erro ao buscar os equipamentos:', error);
    } finally {
        isFetching = false;
        console.log('fetch = false');
    }
}
console.log('saiu do fetch');
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página carregada, iniciando fetch de equipamentos');
    fetchEquipamentos();  // Faz o primeiro carregamento dos dados
    setInterval(fetchEquipamentos, 100000);  // Atualiza a cada 10 segundos
});

// const modal = document.getElementById('modal');
console.log(modal);  // Verifica se o modal está sendo referenciado corretamente



// Abre o modal ao clicar no botão "Abrir Modal"
document.getElementById('equipamentosTable').addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains("openModalBtn")) {
        console.log('Botão Editar foi clicado');
        document.getElementById('modal').style.display = 'flex';  // Abre o modal
    }
});



// Event listener para fechar o modal
document.getElementById('closeModalBtn').addEventListener('click', function() {
    document.getElementById('modal').style.display = 'none';
});

// Fecha o modal ao clicar fora da área de conteúdo
window.addEventListener('click', function(e) {
    const modal = document.getElementById('modal');
    if (e.target === modal) {
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




