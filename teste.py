import requests
import json

url = 'C:\\xampp\\htdocs\\projeto'

# Exemplo de dados JSON a serem enviados
dados = {
    'sensor': 'temperatura',
    'valor': 25.6
}

# Envia os dados como POST para o servidor XAMPP
response = requests.post(url, json=dados)

# Exibe a resposta do servidor
print(response.text)
