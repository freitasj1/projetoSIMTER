//EC:64:C9:5E:60:20 mac do meu master

//documentação do ESP-NOW
//https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/network/esp_now.html

#include <esp_now.h>
#include <WiFi.h>

//lista de endereços mac dos escravos
uint8_t macslaves[][6] = {{0xC4, 0xD8, 0xD5, 0x95, 0x33, 0x6C}}; //poderiam ter até 20 indereços mac aqui ou 17 se for criptografado

#define CHANNEL 1//configura o canal de 0 a 13 e deve ser configurado o mesmo canal no código do escravo
#define ENCRYPT 1//configura se vai usar criptografia 0 para não usar e 1 para usar e deve ser configurado o mesmo no código do escravo

//constantes exclusiva para comunicação do projeto SIMTER então deve ser declarado no master também

//#define ASK_ID 10 // perguntar o id do slave "não vou usar mais porque não precisa e isso poupa tempo e energia"

#define ID_RECEIVED 20 // confirmar que o id foi recebido e que o slave pode dormir

//   vvv   ainda não consigui pensar como vou fazer isso na versão atual pois os slaves ficam acordados por aulgumas dezenas milisegundos"
//#define NEARBY_DEVICES 30 // perguntar ao slave os dispositivos proximos a ele para aumentar o alcançe do master



// Init ESP Now with fallback----------------------------------------------------------------
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

  for (int i = 0; i < 6; ++i ) {
    //mostra para qual endereço mac está mandando esses dados
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
           mac_addr[0], mac_addr[1], mac_addr[2],
           mac_addr[3], mac_addr[4], mac_addr[5]);
  Serial.print("Last Packet Sent to: "); Serial.println(macStr);
  Serial.print("Last Packet Send Status: "); Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Delivery Success" : "Delivery Fail");
  Serial.println();
}


//essa função é chamada automaticamente quando alguma informação é recebida
//pode registrar uma função para isso chamando esp_now_register_recv_cb('função a ser chamada')
void OnDataRecv(const uint8_t *mac, const uint8_t *data, int len) {
  digitalWrite(2, 1);//liga o led
  Serial.print("Dados recebidos: ");
  for (int i = 0; i < len; i++) {
    Serial.print(data[i]);
  }
  Serial.println();
  if (esp_now_is_peer_exist (mac)) {
    sendData(ID_RECEIVED, mac);
  } else {
    Serial.print("o seguinte par não está na lista macslaves:");
    for (int i = 0; i < 6; ++i ) {
      Serial.print((uint8_t) mac[i], HEX);
      if (i != 5) Serial.print(":");
    }
  }
  Serial.println();
  delay(50);//espere para que o led fique aceso por um tempo
  digitalWrite(2, 0);//desliga o led
}

//gera uma chave aleatória PMK(primary master key) usado para encriptar a LMK(local master key) para ser usado na criptografia
void randomize_key() {
  uint8_t key[16];
  Serial.print("\nUsando a chave: ");
  for (int i = 0; i < 16; i++) {
    key[i] = random(0, 255);
    Serial.print(key[i]); Serial.print(" ");
  }
  Serial.println();
  esp_now_set_pmk(key);
}


void setup() {
  Serial.begin(115200);
  //Set device in STA mode to begin with
  WiFi.mode(WIFI_STA);
  // This is the mac address of the master in STA Mode
  Serial.print("STA MAC: "); Serial.println(WiFi.macAddress());


  //inicializa o pino do led da placa do ESP32 com objetivo de ser um indicador de quando ele se comunica com sucesso
  pinMode(2, OUTPUT);


  //inicializa o pino do led da placa do ESP32 com objetivo de ser um indicador de quando ele se comunica com sucesso
  InitESPNow();

  //configura os pres dos escravos
  int slavescont = sizeof(macslaves) / 6 / sizeof(uint8_t);
  esp_now_peer_info_t slave[slavescont] = {};
  for (int i = 0; i < slavescont; i++) {
    slave[i].channel = CHANNEL;
    slave[i].encrypt = ENCRYPT;
    //randomizar e guardar uma chave pkm aqui
    memcpy(slave[i].peer_addr, macslaves[i], sizeof(macslaves[i]));
    esp_now_add_peer(&slave[i]);
  }

  //se estiver usando criptografia gera uma chave aleatória
  if (ENCRYPT) {
    randomize_key();
  }

  esp_now_register_send_cb(OnDataSent);
  esp_now_register_recv_cb(OnDataRecv);
}

void loop() {
  //espera
}
