// public/login/login.js
document.getElementById('login-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await axios.post('/auth', {
            email: email,
            password: password
        });

        if (response.data.success) {
            // Redireciona para a página inicial após login bem-sucedido
            window.location.href = '/home/index.html';
        } else {
            alert('Login falhou: ' + response.data.message);
        }
    } catch (error) {
        console.error('Erro ao autenticar:', error);
    }
});
