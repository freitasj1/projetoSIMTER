//C4:D8:D5:95:33:6C mac do meu slave

//documentação do ESP-NOW
//https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/network/esp_now.html

#include <esp_now.h>
#include <WiFi.h>

#define CHANNEL 1//configura o canal de 0 a 13 e deve ser configurado o mesmo canal no código do mestre
#define ENCRYPT 1//configura se vai usar criptografia 0 para não usar e 1 para usar e deve ser configurado o mesmo no código do mestre

//estrutura que armazena as informações do par mestre
esp_now_peer_info_t master = {};

//endereço mac do mestre
//uint8_t é um tipo de dado inteiro de 8bits/1byte sem sinal que vai de 0 a 255 ou 0x00 a 0xFF em exadecimal
uint8_t macmaster[6] = {0xEC, 0x64, 0xC9, 0x5E, 0x60, 0x20};

//ID do dispositivo
//deve estar de 0 a 255 pois na função esp_now_send() o tipo de dade tem que ser uint8_t
#define ID 12

//tempo do deep sleep em segundos
#define TIME_SLEEP 10

//constantes exclusiva para comunicação do projeto SIMTER então deve ser declarado no master também

//#define ASK_ID 10 // perguntar o id do slave "não vou usar mais porque não precisa e isso poupa tempo e energia"

#define ID_RECEIVED 20 // confirmar que o id foi recebido e que o slave pode dormir

//   vvv   ainda não consigui pensar como vou fazer isso na versão atual pois os slaves ficam acordados por aulgumas dezenas milisegundos"
//#define NEARBY_DEVICES 30 // perguntar ao slave os dispositivos proximos a ele para aumentar o alcançe do master


// Init ESP Now with fallback
void InitESPNow() {
  WiFi.disconnect();
  if (esp_now_init() == ESP_OK) {
    Serial.println("ESPNow Init Success");
  }
  else {
    Serial.println("ESPNow Init Failed");
    ESP.restart();
  }
}


// send data
void sendData(uint8_t data, const uint8_t *peer_addr) {
  
  Serial.print("Sending to: ");
  //mostra para qual endereço mac está mandando esses dados
  for (int i = 0; i < 6; ++i ) {
    Serial.print((uint8_t) peer_addr[i], HEX);
    if (i != 5) Serial.print(":");
  }
  Serial.println();
  //manda 'data' de tamanho em bytes 'sizeof(data)' para o mac 'peer_addr'
  esp_err_t result = esp_now_send(peer_addr, &data, sizeof(data));//<<<<<<<<mainline
  Serial.print("Send Status: ");
  //mostra se houve sucesso ou alguma falha
  if (result == ESP_OK) {
    Serial.println("Success");
  } else if (result == ESP_ERR_ESPNOW_NOT_INIT) {
    // How did we get so far!!
    Serial.println("ESPNOW not Init.");
  } else if (result == ESP_ERR_ESPNOW_ARG) {
    Serial.println("Invalid Argument");
  } else if (result == ESP_ERR_ESPNOW_INTERNAL) {
    Serial.println("Internal Error");
  } else if (result == ESP_ERR_ESPNOW_NO_MEM) {
    Serial.println("ESP_ERR_ESPNOW_NO_MEM");
  } else if (result == ESP_ERR_ESPNOW_NOT_FOUND) {
    Serial.println("Peer not found.");
  } else {
    Serial.println("Not sure what happened");
  }
}

//essa função é chamada automaticamente quando alguma informação é enviada
//pode registrar uma função para isso chamando esp_now_register_send_cb('função a ser chamada')
void OnDataSent(const uint8_t *mac_addr, esp_now_send_status_t status) {
  char macStr[18];
  snprintf(macStr, sizeof(macStr), "%02x:%02x:%02x:%02x:%02x:%02x",
           mac_addr[0], mac_addr[1], mac_addr[2], mac_addr[3], mac_addr[4], mac_addr[5]);
  Serial.print("Last Packet Sent to: "); Serial.println(macStr);
  Serial.print("Last Packet Send Status: "); Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Delivery Success" : "Delivery Fail");
}

//essa função é chamada automaticamente quando alguma informação é recebida
//pode registrar uma função para isso chamando esp_now_register_recv_cb('função a ser chamada')
void OnDataRecv(const uint8_t *mac, const uint8_t *data, int len) {
  digitalWrite(2, 1);//liga o led da placa do ESP32
  Serial.print("Dados recebidos: ");
  for (int i = 0; i < len; i++) {
    Serial.print(data[i]);
    Serial.print(" ");
  }
  Serial.println();
  //se a informação recebida for a confimação o escravo vai dormir
  if (data[0] == ID_RECEIVED) {
    Serial.println("Entrando em deep sleep...");
    delay(50);//para manter o lede ligado por um tempo
    digitalWrite(2, 0);//desliga o led da placa do ESP32
    esp_sleep_enable_timer_wakeup(TIME_SLEEP * 1000000);
    esp_deep_sleep_start();
  }
}




void setup() {
  Serial.begin(115200);
  //Set device in STA mode to begin with
  WiFi.mode(WIFI_STA);
  // This is the mac address of the Slave in STA Mode
  Serial.print("STA MAC: "); Serial.println(WiFi.macAddress());

  //inicializa o pino do led da placa do ESP32 com objetivo de ser um indicador de quando ele se comunica com sucesso
  pinMode(2, OUTPUT);

  //inicializa o ESP-NOW
  InitESPNow();

  //configura o par do mestre
  master.channel = CHANNEL;
  master.encrypt = ENCRYPT;
  memcpy(master.peer_addr, macmaster, sizeof(macmaster));
  esp_now_add_peer(&master);

  esp_now_register_recv_cb(OnDataRecv);
  esp_now_register_send_cb(OnDataSent);
}



void loop() {
  Serial.println();
  sendData(ID, master.peer_addr);
  delay(1000);
}
