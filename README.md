# SIMTER  
## Sistema de Monitoramento de Equipamentos em Tempo Real

> Repositório destinado ao projeto da **Equipe 3105** para a feira **PROJETE 2024**.

O **SIMTER** é um sistema completo (hardware + software) de **rastreamento e controle de patrimônios** para empresas com grande volume de equipamentos e ativos físicos.  
Ele utiliza a tecnologia **Bluetooth Low Energy (BLE)** para monitorar em tempo real a presença de patrimônios, auxiliando em **segurança**, **gestão logística** e **inventário automatizado**.

---

## 🚀 Funcionalidades

- Rastreio em tempo real de patrimônios importantes (máquinas, ferramentas, etc.)  
- Identificação da presença de equipamentos dentro da empresa em até **5 segundos**  
- Comunicação segura com **criptografia própria**  
- Autonomia de **meses** graças ao uso otimizado do **deep sleep** nos beacons  
- Integração com uma **plataforma web** para relatórios, inventário e acompanhamento  
- Pacote completo: **hardware + software** pronto para uso  

---

## 🏗️ Arquitetura

- **Beacons**: desenvolvidos em ESP32, transmitem sinais BLE com payload criptografado  
- **Gateways**: coletam sinais BLE e enviam para o servidor via **requisições HTTP (Wi-Fi)**  
- **Servidor**: realiza o armazenamento central dos dados recebidos  
- **Aplicação Web**: interface para gestão de patrimônios, relatórios e acompanhamento  

> Obs.: no momento não há triangulação de posição — o sistema identifica presença em determinada área.  

---

## 📸 Screenshots

<div style="display: flex; justify-content: space-between;">
    <img src="em testes" alt="Imagem 1" width="33%">
    <img src="em testes" alt="Imagem 2" width="33%">
    <img src="em testes" alt="Imagem 3" width="33%">
</div>

---

## 💡 Vantagens

- 🔒 **Segurança**: evita perdas e furtos de patrimônio  
- 📦 **Inventário automático**: elimina processos manuais demorados  
- ⚡ **Baixo consumo de energia**: autonomia de até **6 meses** por beacon  
- 🌐 **Simplicidade**: não requer internet, apenas um roteador local para comunicação  
- 📈 **Escalabilidade**: possibilidade de expansão futura para triangulação indoor  

---

## 📊 Despesas (Protótipo)

- 5 × ESP32  
- 5 × Baterias 18650 (4000 mAh)  
- 1 × Módulo RFID RC522  
- Tags RFID para testes  

---

## 📘 Documentação

> Confira nosso diário de desenvolvimento:  
<p align='center'>Em testes...</p>

---

## ❓ FAQ

**Como funciona a autonomia da bateria?**  
Cada beacon usa uma bateria **18650 de 4000 mAh**.  
- Consumo em transmissão: ~8 mA por **0,18 s**  
- Deep sleep: ~80 µA por **4 s**  
Com esse ciclo, a autonomia média chega a **6 meses** sem necessidade de recarga.

**O sistema precisa de internet?**  
Não. Basta um **roteador local** para permitir as requisições HTTP entre beacons, gateways e servidor.

**Dá para rastrear pessoas também?**  
Atualmente não. O sistema foi projetado exclusivamente para patrimônios.

**Qual a diferença para um rastreamento por GPS?**  
- ⚡ Consumo de energia muito menor  
- 🏭 Funciona em ambientes indoor, onde GPS não opera bem  
- 🔧 Possibilidade de evoluir para triangulação BLE no futuro  

---

## 🧑‍💻 Autores

| Nome        | Função                        |
|-------------|-------------------------------|
|Enzo   | Gateway e Backend    |
| João Pedro | Backend, Frontend e banco de dados |
| Mateus  | Beacon e Gateway        |
| Murilo      | Criptografia, RFID            |

---

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).  
