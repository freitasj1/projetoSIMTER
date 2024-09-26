document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData();
    const photo = document.getElementById('photo').files[0]; // Pegando o arquivo de foto
    formData.append('photo', photo); // Adicionando a foto ao FormData

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        if (result.success) {
            alert('Imagem enviada com sucesso!');
        } else {
            alert('Erro ao enviar imagem.');
        }
    } catch (error) {
        console.error('Erro:', error);
    }
});
