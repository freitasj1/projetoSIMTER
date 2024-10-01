// Seleciona os elementos
const openModalBtn = document.getElementById('openModalBtn');
const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('closeModalBtn');


let isFetching = false;
let isFetching2 = false;
let isFetching3 = false;


document.getElementById('addDeviceForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Evita o recarregamento da página

    const nome = document.getElementById('nomeEquipamento').value;
    const ID = document.getElementById('IDEquipamento').value;
    const sala = document.getElementById('salaEquipamento').value;

    // Enviar os dados ao backend via AJAX usando fetch
    fetch('/addDevice', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nome, ID, sala })  // Responsável e status serão null conforme definido no backend
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Exibe um alerta de sucesso
            alert('Equipamento cadastrado com sucesso!');
        } else {
            // Exibe uma mensagem de erro
            alert('Erro ao cadastrar o equipamento.');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao enviar os dados.');
    });
});







async function fetchEquipamentos() {
    if (isFetching) return;  

    isFetching = true;
    try {
        // Código de fetch aqui
        // console.log('try fetchEquip')
        const response = await fetch('/api/equipamentos');
        // console.log('Resposta do fetch:', response);
        if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.status);
        }
        const equipamentos = await response.json();
        // console.log('Dados recebidos do servidor:', equipamentos);


        // Seleciona o elemento do tbody onde a tabela será preenchida
        const tableBody = document.getElementById('equipamentosTable');
        if (!tableBody) {
            console.error('Elemento #equipamentosTable não encontrado!');
            return;
        }
        tableBody.innerHTML = '';  // Limpa o conteúdo anterior

        equipamentos.forEach((equip, index) => {
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
                <td class="align-middle text-center">
                    <span class="text-secondary text-xs font-weight-bold">${equip.STATUS}</span>
                </td>
                <td class="align-middle text-center">
                    <span class="text-secondary text-xs font-weight-bold">${equip.ORIGEM}</span>
                </td>
                <td class="align-middle text-center">
                    <span class="text-secondary text-xs font-weight-bold">${equip.ATUAL}</span>
                </td>
                <td class="align-middle text-center">
                    <h6 class="mb-0 text-sm">${equip.responsavel}</h6>
                </td>
                <td class="align-middle">
                    <button class="openModalBtn font-weight-bold text-xs" data-modal="modal-${index}">Editar</button>
                    <div id="modal-${index}" class="modal">
                        <div class="modal-content">
                            <span class="close" data-modal="modal-${index}">&times;</span>
                            <h2>Editar Equipamento</h2>
                            <form id="modalForm-${index}">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="equipamento-${index}">Equipamento</label>
                                        <input type="text" id="equipamento-${index}" class="input-modal" name="equipamento" value="${equip.nome}" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="id-${index}">ID</label>
                                        <input type="text" id="id-${index}" name="id" value="${equip.ID}" class="input-modal" required>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="status-${index}">Status</label>
                                        <input type="text" id="status-${index}" name="status" value="${equip.STATUS}" class="input-modal" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="sala-${index}">Sala</label>
                                        <input type="text" id="sala-${index}" name="sala" value="${equip.ORIGEM}" class="input-modal" required>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="responsavel-${index}">Último Responsável</label>
                                        <input type="text" id="responsavel-${index}" name="responsavel" class="input-modal" value="${equip.responsavel}" required>
                                    </div>
                                </div>
                                <button type="submit">Salvar</button>
                            </form>
                        </div>
                    </div>
                </td>
            `;
            
            // Adiciona a linha à tabela
            tableBody.appendChild(row);
        
            // Event listeners para abrir/fechar o modal
            row.querySelector(`button[data-modal="modal-${index}"]`).addEventListener('click', () => {
                document.getElementById(`modal-${index}`).style.display = 'flex';
            });
            row.querySelector(`span[data-modal="modal-${index}"]`).addEventListener('click', () => {
                document.getElementById(`modal-${index}`).style.display = 'none';
            });
        });
            
    } catch (error) {
        console.error('Erro ao buscar os equipamentos:', error);
    } finally {
        isFetching = false;
        // console.log('fetch = false');
    }



}

async function fetchEquipamentos3() {
    if (isFetching) return;  

    isFetching = true;
    try {
        // Código de fetch aqui
        console.log('try fetchEquip')
        const response = await fetch('/api/equipamentos3');
        console.log('Resposta do fetch:', response);
        if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.status);
        }
        const equipamentos = await response.json();
        console.log('Dados recebidos do servidor:', equipamentos);


        // Seleciona o elemento do tbody onde a tabela será preenchida
        const tableBody = document.getElementById('equipamentosTable3');
        if (!tableBody) {
            console.error('Elemento #equipamentosTable não encontrado!');
            return;
        }
        tableBody.innerHTML = '';  // Limpa o conteúdo anterior
        
        equipamentos.forEach((equip, index) => {
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
                <td class="align-middle text-center">
                    <span class="text-secondary text-xs font-weight-bold">${equip.STATUS}</span>
                </td>
                <td class="align-middle text-center">
                    <span class="text-secondary text-xs font-weight-bold">${equip.ORIGEM}</span>
                </td>
                <td class="align-middle text-center">
                    <span class="text-secondary text-xs font-weight-bold">${equip.ATUAL}</span>
                </td>
                <td class="align-middle text-center">
                    <h6 class="mb-0 text-sm">${equip.responsavel}</h6>
                </td>
                <td class="align-middle">
                    <button class="openModalBtn font-weight-bold text-xs" data-modal="modal-${index}">Editar</button>
                    <div id="modal-${index}" class="modal">
                        <div class="modal-content">
                            <span class="close" data-modal="modal-${index}">&times;</span>
                            <h2>Editar Equipamento</h2>
                            <form id="modalForm-${index}">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="equipamento-${index}">Equipamento</label>
                                        <input type="text" id="equipamento-${index}" class="input-modal" name="equipamento" value="${equip.nome}" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="id-${index}">ID</label>
                                        <input type="text" id="id-${index}" name="id" value="${equip.ID}" class="input-modal" required>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="status-${index}">Status</label>
                                        <input type="text" id="status-${index}" name="status" value="${equip.STATUS}" class="input-modal" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="sala-${index}">Sala</label>
                                        <input type="text" id="sala-${index}" name="sala" value="${equip.ORIGEM}" class="input-modal" required>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="responsavel-${index}">Último Responsável</label>
                                        <input type="text" id="responsavel-${index}" name="responsavel" class="input-modal" value="${equip.responsavel}" required>
                                    </div>
                                </div>
                                <button type="submit">Salvar</button>
                            </form>
                        </div>
                    </div>
                </td>
            `;
            
            // Adiciona a linha à tabela
            tableBody.appendChild(row);
        
            // Event listeners para abrir/fechar o modal
            row.querySelector(`button[data-modal="modal-${index}"]`).addEventListener('click', () => {
                document.getElementById(`modal-${index}`).style.display = 'flex';
            });
            row.querySelector(`span[data-modal="modal-${index}"]`).addEventListener('click', () => {
                document.getElementById(`modal-${index}`).style.display = 'none';
            });
        });
            
    } catch (error) {
        console.error('Erro ao buscar os equipamentos:', error);
    } finally {
        isFetching = false;
        console.log('fetch = false');
    }



}




async function fetchEquipamentos2() {
    if (isFetching2) return;  

    isFetching2 = true;
    try {
        // Código de fetch aqui

        // console.log('Tentando FETCH 2 ')
        const response = await fetch('/api/equipamentos2');
        // console.log('Resposta do fetch:', response);
        if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.status);
        }
        const equipamentos = await response.json();
        console.log('Dados recebidos do servidor:', equipamentos);


        // Seleciona o elemento do tbody onde a tabela será preenchida
        const tableBody = document.getElementById('equipamentosTable2');
        if (!tableBody) {
            console.error('Elemento #equipamentosTable2 não encontrado!');
            return;
        }
        tableBody.innerHTML = '';  // Limpa o conteúdo anterior
        
        equipamentos.forEach((equip, index) => {
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
                <td class="align-middle text-center">
                    <span class="text-secondary text-xs font-weight-bold">${equip.STATUS}</span>
                </td>
                <td class="align-middle text-center">
                    <span class="text-secondary text-xs font-weight-bold">${equip.ORIGEM}</span>
                </td>
                <td class="align-middle text-center">
                    <span class="text-secondary text-xs font-weight-bold">${equip.ATUAL}</span>
                </td>
                <td class="align-middle text-center">
                    <h6 class="mb-0 text-sm">${equip.responsavel}</h6>
                </td>
                <td class="align-middle">
                    <button class="openModalBtn font-weight-bold text-xs" data-modal="modal-${index}">Editar</button>
                    <div id="modal-${index}" class="modal">
                        <div class="modal-content">
                            <span class="close" data-modal="modal-${index}">&times;</span>
                            <h2>Editar Equipamento</h2>
                            <form id="modalForm-${index}">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="equipamento-${index}">Equipamento</label>
                                        <input type="text" id="equipamento-${index}" class="input-modal" name="equipamento" value="${equip.nome}" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="id-${index}">ID</label>
                                        <input type="text" id="id-${index}" name="id" value="${equip.ID}" class="input-modal" required>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="status-${index}">Status</label>
                                        <input type="text" id="status-${index}" name="status" value="${equip.STATUS}" class="input-modal" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="sala-${index}">Sala</label>
                                        <input type="text" id="sala-${index}" name="sala" value="${equip.ORIGEM}" class="input-modal" required>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="responsavel-${index}">Último Responsável</label>
                                        <input type="text" id="responsavel-${index}" name="responsavel" class="input-modal" value="${equip.responsavel}" required>
                                    </div>
                                </div>
                                <button type="submit">Salvar</button>
                            </form>
                        </div>
                    </div>
                </td>
            `;
            
            // Adiciona a linha à tabela
            tableBody.appendChild(row);
        
            // Event listeners para abrir/fechar o modal
            row.querySelector(`button[data-modal="modal-${index}"]`).addEventListener('click', () => {
                document.getElementById(`modal-${index}`).style.display = 'flex';
            });
            row.querySelector(`span[data-modal="modal-${index}"]`).addEventListener('click', () => {
                document.getElementById(`modal-${index}`).style.display = 'none';
            });
        });
            
    } catch (error) {
        console.error('Erro ao buscar os equipamentos:', error);
    } finally {
        isFetching2 = false;
        // console.log('fetch = false');
    }
}

async function fetchUserData() {
    try {
        const response = await fetch('/api/users');
        if (!response.ok) {
            throw new Error('Erro ao buscar dados do usuário');
        }

        const userData = await response.json();

        // Seleciona os elementos do HTML
        const userName = document.getElementById('user_name');
        const userFunction = document.getElementById('user_function');
        const userAvatar = document.getElementById('user_avatar');

        // Define os valores da tabela
        userName.textContent = userData.nome;  // Nome do usuário
        userFunction.textContent = userData.funcao;  // Função do usuário
        userAvatar.src = userData.foto;  // Caminho da imagem do usuário
    } catch (error) {
        console.error('Erro ao carregar os dados do usuário:', error);
    }
}
// Chama a função ao carregar a página

// console.log('saiu do fetch');
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página carregada, iniciando fetch de equipamentos');
    fetchEquipamentos3();
    fetchEquipamentos2();
    fetchEquipamentos();
    fetchUserData();

    const modalAdd = document.getElementById('myModal');  // Corrigido o ID
const openModalBtnAdd = document.getElementById('addDevice');  // Corrigido o ID
const closeModalAdd = document.querySelector('.closeAdd');

// Quando o usuário clica no botão "Cadastrar Equipamento", o modal é exibido
openModalBtnAdd.addEventListener('click', function() {
    modalAdd.style.display = 'block';
    console.log('Modal add exibido');
});

// Quando o usuário clica no 'X', o modal é fechado
closeModalAdd.addEventListener('click', function() {
    modalAdd.style.display = 'none';
    console.log('Modal add desexibido');
});

// Quando o usuário clica fora do modal, ele também é fechado
window.addEventListener('click', function(event) {
    if (event.target == modalAdd) {  // Corrigido o nome do modal
        modalAdd.style.display = 'none';
        console.log('Modal add desexibido2');
    }
});
    
document.getElementById('export').addEventListener('click', async function() {
    // Lógica para exportar os dados em CSV
    console.log('Exportar CSV');

    // Cabeçalhos da tabela
    const headers = ['Nome', 'ID', 'STATUS', 'Sala de Origem', 'Sala Atual', 'Responsável'];
    let csvContent = headers.join(',') + '\n'; // Adiciona os cabeçalhos ao CSV

    try {
        // Faz a requisição para obter os dados da tabela equipamentos3
        const response = await fetch('/api/equipamentos3');
        console.log('Resposta do fetch:', response);
        if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.status);
        }

        const equipamentos = await response.json(); // Aguarda a resposta em JSON
        console.log('Dados recebidos do servidor:', equipamentos);

        // Loop pelos dados dos equipamentos
        equipamentos.forEach((equip) => {
            const rowData = [
                equip.nome,
                equip.ID,
                equip.STATUS,
                equip.ORIGEM,
                equip.ATUAL,
                equip.responsavel
            ];
            csvContent += rowData.join(',') + '\n'; // Adiciona a linha de dados ao CSV
        });

        // Cria um Blob para o conteúdo CSV
        let blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        let url = URL.createObjectURL(blob);

        // Cria um link invisível para fazer o download
        let a = document.createElement('a');
        a.href = url;
        a.download = 'equipamentos_tabela.csv';  // Define o nome do arquivo CSV
        a.click();  // Aciona o download
    } catch (error) {
        console.error('Erro ao exportar CSV:', error);
    }
});

document.getElementById('exportEmail').addEventListener('click', async function() {
    // Lógica para exportar CSV e enviar por email
    console.log('Exportar CSV e Enviar por Email');

    // Cabeçalhos da tabela
    const headers = ['Nome', 'ID', 'STATUS', 'Sala de Origem', 'Sala Atual', 'Responsável'];
    let csvContent = headers.join(',') + '\n'; // Adiciona os cabeçalhos ao CSV

    try {
        // Faz a requisição para obter os dados da tabela equipamentos3
        const response = await fetch('/api/equipamentos3');
        if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.status);
        }

        const equipamentos = await response.json(); // Aguarda a resposta em JSON

        // Loop pelos dados dos equipamentos
        equipamentos.forEach((equip) => {
            const rowData = [
                equip.nome,
                equip.ID,
                equip.STATUS,
                equip.ORIGEM,
                equip.ATUAL,
                equip.responsavel
            ];
            csvContent += rowData.join(',') + '\n'; // Adiciona a linha de dados ao CSV
        });

        // Envia o CSV ao backend para ser enviado por email
        const emailResponse = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ csvContent })
        });

        if (!emailResponse.ok) {
            throw new Error('Erro ao enviar o email: ' + emailResponse.status);
        }

        console.log('Email enviado com sucesso.');
        alert('Email enviado com sucesso.');
    } catch (error) {
        console.error('Erro ao exportar e enviar por email:', error);
        alert('Erro ao enviar o email.');
    }
});




    
      // Faz o primeiro carregamento dos dados
    setInterval(fetchEquipamentos, 7000); 
    setInterval(fetchEquipamentos2, 6000); 
    setInterval(fetchEquipamentos3, 5000); 
     // Atualiza a cada 10 segundos
});

// const modal = document.getElementById('modal');
// console.log(modal);  // Verifica se o modal está sendo referenciado corretamente



// Abre o modal ao clicar no botão "Abrir Modal"
document.getElementById('equipamentosTable').addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains("openModalBtn")) {
        // console.log('Botão Editar foi clicado');
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



