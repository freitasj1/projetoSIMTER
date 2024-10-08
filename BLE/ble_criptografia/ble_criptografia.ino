#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <AESLib.h>//essa biblioteca eu precisei instalar
#include <esp_sleep.h>

// Defina o intervalo de tempo entre transmissões em microsegundos
#define TRANSMISSION_INTERVAL 20000000

// Defina a ID do dispositivo
#define DEVICE_ID "ESP32-DEVICE-001"//esse ID será criptografado e transmitido

// UUIDs para o serviço e característica BLE
#define SERVICE_UUID "0000180f-0000-1000-8000-00805f9b34fb"
#define CHARACTERISTIC_UUID "00002a19-0000-1000-8000-00805f9b34fb"

// Chave de encriptação AES (16 bytes) em uma atualização do código essa chave deve ser trocada entre os ESPs
const byte encryptionKey[16] = {0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F};

//Instância da Classe AESLib declara uma variável chamada aesLib do tipo AESLib e é usado para criptografar a informação
AESLib aesLib;

//*pServer é um ponteiro que será usado para referenciar o objeto do servidor BLE
BLEServer *pServer = nullptr;
//pCharacteristic é um ponteiro que será usado para referenciar o objeto da característica BLE
BLECharacteristic *pCharacteristic = nullptr;

// Função para encriptar dados usando AES
void encryptData(const char *data, uint8_t *encryptedData, uint8_t *iv) {
  // Gerar um IV aleatório
  for (int i = 0; i < 16; i++) {
    iv[i] = random(0, 256);
  }

  // Encriptar os dados
  aesLib.encrypt((byte *)data, strlen(data), encryptedData, encryptionKey, 128, iv);
}

//prototipagem da função piscaled
void piscaled(int vezes, int tempo);


void setup() {
  Serial.begin(115200);

  //inicializa o pino 2 que está ligado ao led interno do ESP como saida
  pinMode(2,OUTPUT);

  // Inicialize o dispositivo BLE
  BLEDevice::init("Trem");

  // Crie o servidor BLE
  pServer = BLEDevice::createServer();

  // Crie o serviço BLE
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Crie a característica BLE
  pCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
  );

  // Adicione uma descrição à característica
  pCharacteristic->addDescriptor(new BLE2902());

  // Inicie o serviço BLE
  pService->start();
}

void loop() {
  // Comece a anunciar o serviço BLE isso faz ele ser visivel para outros dispositivos
  pServer->getAdvertising()->start();
  // led do ESP pisca três vezes rápido para indicar que acordou
  piscaled(3,200);
  
  // Dados a serem encriptados (DEVICE_ID)
  uint8_t encryptedData[16]; // AES-128 gera 16 bytes de saída
  uint8_t iv[16];

  encryptData(DEVICE_ID, encryptedData, iv);

  // Combine IV e dados encriptados para enviar
  uint8_t payload[32]; // Tamanho final da carga útil é 16 (IV) + 16 (dados encriptados)
  memcpy(payload, iv, 16);
  memcpy(payload + 16, encryptedData, 16);

  // Atualize a característica BLE com os dados encriptados
  pCharacteristic->setValue(payload, sizeof(payload));
  pCharacteristic->notify();

  //delay para possibilitar teste de conexão com o celular
  delay(20000);

  //led do ESP pisca duas vezes lentas para indicar que foi dormir
  piscaled(2,300);
  
  // Coloca o ESP32 em modo de hibernação para economizar energia
  esp_sleep_pd_config(ESP_PD_DOMAIN_RTC_PERIPH, ESP_PD_OPTION_AUTO); // Configura para desligar todos os domínios, exceto o RTC
  esp_sleep_enable_timer_wakeup(TRANSMISSION_INTERVAL); // Configura o timer de wakeup para um intervalo específico recebe valor em microsegundos
  esp_deep_sleep_start(); // Coloca o ESP32 em hibernação (ULP)ultra low power

}

void piscaled(int vezes, int tempo){
  for(int i = 0; i < vezes; i++){
    digitalWrite(2,1);
    delay(tempo);
    digitalWrite(2,0);
    delay(tempo);
  }
}
