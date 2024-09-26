document.addEventListener('DOMContentLoaded', function () {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const captureButton = document.getElementById('capture');
    const takePhotoButton = document.createElement('button'); // Botão para tirar a foto
    const capturedPhoto = document.getElementById('capturedPhoto');
    const registerForm = document.querySelector('.login100-form');
    let stream = null;

    // Configuração do botão "Tirar Foto"
    takePhotoButton.textContent = 'Tirar Foto';
    takePhotoButton.id = 'take-photo';
    takePhotoButton.style.display = 'none';
    takePhotoButton.classList.add('login100-form-btn'); // Aplicando a mesma classe de estilo
    captureButton.insertAdjacentElement('afterend', takePhotoButton); // Inserir o botão após o "Acessar Câmera"

    // Função para iniciar a câmera
    function startCamera() {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((mediaStream) => {
                stream = mediaStream;
                video.srcObject = stream;
                video.style.display = 'block'; // Mostrar o vídeo
                takePhotoButton.style.display = 'inline-block'; // Mostrar o botão de "Tirar Foto"
                captureButton.style.display = 'none'; // Esconder o botão "Acessar Câmera"
            })
            .catch((err) => console.error('Erro ao acessar a câmera:', err));
    }

    // Função para capturar a foto
    function capturePhoto() {
        // Desenhar o vídeo no canvas
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Converter a imagem capturada para base64
        const imageData = canvas.toDataURL('image/png');
        capturedPhoto.src = imageData; // Mostrar a imagem capturada

        // Parar a câmera
        stream.getTracks().forEach(track => track.stop());
        video.style.display = 'none'; // Ocultar o vídeo
        takePhotoButton.style.display = 'none'; // Esconder o botão "Tirar Foto"
        captureButton.style.display = 'inline-block'; // Mostrar o botão "Acessar Câmera"
    }

    // Evento para abrir a câmera
    captureButton.addEventListener('click', function (e) {
        e.preventDefault();
        startCamera();
    });

    // Evento para capturar a foto
    takePhotoButton.addEventListener('click', function (e) {
        e.preventDefault();
        capturePhoto();
    });

    // Submeter o formulário
    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();
    
        const formData = new FormData(registerForm); // Pega todos os inputs do formulário automaticamente
        const imageData = capturedPhoto.src; // Imagem capturada em base64
    
        // Verifique se a imagem foi capturada
        if (imageData && imageData.startsWith('data:image/png;base64,')) {
            // Anexar a imagem capturada ao formData
            formData.append('photo', imageData); // Anexa a imagem como string base64
    
            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    body: formData,
                });
    
                if (response.redirected) {
                    // Redireciona para a página de sucesso se o redirecionamento ocorrer
                    window.location.href = response.url; // Redireciona para a URL da resposta
                } else {
                    alert('Erro ao cadastrar.');
                    console.error('Erro:', await response.json());
                }
            } catch (error) {
                console.error('Erro:', error);
            }
        } else {
            alert('Por favor, tire uma foto antes de enviar.');
        }
    });
});
