#include <BLEDevice.h>
#include <esp_sleep.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>

// Substitua pelos UUIDs do serviço e da característica que você quer ler
#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
//#define CHARACTERISTIC_UUID "ceb5483e-46e1-4688-b7f5-ea07361b26a8"

const int L = 5;
const int C = 37;
char CHARACTERISTIC_UUID[L][C]{
  "ceb5483e-46e1-4688-b7f5-ea07361b26a8",
  "ceb5483e-46e1-4688-b7f5-ea07361b26a9"
};

int atualL = 0;

std::vector<BLEAdvertisedDevice*> achados;
std::vector<BLERemoteService*> ptrachados;
std::vector<BLEClient*> conectados;

String teste = "";

unsigned long currentM;
unsigned long startM;

BLEScan* pBLEScan;

class MyAdvertisedDeviceCallbacks : public BLEAdvertisedDeviceCallbacks {
  void onResult(BLEAdvertisedDevice advertisedDevice) {
    Serial.print("Dispositivo detectado: ");
    Serial.println(advertisedDevice.toString().c_str());

    // Verifica se o dispositivo tem o serviço desejado
    if (advertisedDevice.haveServiceUUID() && advertisedDevice.isAdvertisingService(BLEUUID(SERVICE_UUID))) {
      Serial.println("Dispositivo com serviço desejado encontrado:");
      Serial.println(advertisedDevice.toString().c_str());

      achados.push_back(new BLEAdvertisedDevice(advertisedDevice));
    }
  }
};

bool conexao(BLEAdvertisedDevice* myDevice) {
  Serial.println("Conectando ao dispositivo...");
  Serial.println(myDevice->toString().c_str());

  BLEClient* pClient = BLEDevice::createClient();  // Cria um cliente BLE
  conectados.push_back(pClient);                   // Armazena o cliente

  if (pClient->connect(myDevice)) {  // Conecta ao dispositivo
    Serial.println("Conectado com sucesso.");
    BLERemoteService* pRemoteService = pClient->getService(SERVICE_UUID);  // Obtém o serviço remoto

    if (pRemoteService != nullptr) {
      Serial.println("Serviço encontrado!");
      //*myService = pRemoteService;  // Armazena o serviço remoto
      return true;
    } else {
      Serial.println("Serviço não encontrado.");
    }
  } else {
    Serial.println("Falha na conexão!");
  }
  return false;
}

void setup() {
  currentM = millis();

  Serial.begin(115200);
  Serial.println("Inicializando o scanner BLE...");

  // Inicializa o dispositivo BLE
  BLEDevice::init("");

  // Cria o objeto scanner
  pBLEScan = BLEDevice::getScan();

  // Define as callbacks
  pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());

  // Define o tempo de varredura (em segundos)
  pBLEScan->setActiveScan(true);  // True para scan ativa
  //pBLEScan->setInterval(100);
  //pBLEScan->setWindow(99);

  // Inicia a varredura
  pBLEScan->start(10);

  for (int i = 0; i < achados.size(); i++) {
    Serial.println("pareando");
    BLERemoteService* pService = conexao(achados[i]);
    if(pService != nullptr) {
      ptrachados.push_back(pService);
    }
  }
}

void loop() {
  currentM = millis();

  for (int i = 0; i < conectados.size(); i++) {
    Serial.println("conectando...");
    BLERemoteCharacteristic* pRemoteCharacteristic = ptrachados[i]->getCharacteristic(BLEUUID(CHARACTERISTIC_UUID[i]));
    // Lê o valor da característica
    String value = pRemoteCharacteristic->readValue();

    if (value.length() > 0) {
      Serial.println("*********");
      Serial.print("New value: ");
      for (int i = 0; i < value.length(); i++) {
        Serial.print(value[i]);
      }
      Serial.println();
      Serial.println("*********");
    }


    //Serial.println(value.c_str());
    //Serial.println();
    // Desconecta do dispositivo
    //pClient->disconnect();
    Serial.println("Desconectado do dispositivo.");

    if (!conectados[i]->isConnected()) {
      Serial.print("Cliente desconectado: ");
      Serial.println(i);
      conectados.erase(conectados.begin() + i);  // Remove cliente desconectado
    }
  }
  delay(1000);
  // Reinicia a varredura
  pBLEScan->start(30, false);

  delay(1000);
}
