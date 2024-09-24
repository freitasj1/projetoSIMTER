#include <BLEDevice.h>
#include <esp_sleep.h>

// Substitua pelos UUIDs do serviço e da característica que você quer ler
#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID ""

std::vector<BLEAdvertisedDevice*> Scanned;
std::vector<BLERemoteService*> ptrScanned;
std::vector<BLEClient*> Connected;
std::vector<BLERemoteCharacteristic*> pCharacteristic;

unsigned long currentM;
unsigned long startM;

BLEScan* pBLEScan;

class MyAdvertisedDeviceCallbacks : public BLEAdvertisedDeviceCallbacks {
  void onResult(BLEAdvertisedDevice advertisedDevice) {
    Serial.print("Dispositivo detectado: ");
    Serial.println(advertisedDevice.toString().c_str());

    // Verifica se o dispositivo tem o serviço deseiado
    if (advertisedDevice.haveServiceUUID() && advertisedDevice.isAdvertisingService(BLEUUID(SERVICE_UUID))) {
      Serial.println("Dispositivo com serviço deseiado encontrado:");
      Serial.println(advertisedDevice.toString().c_str());

      Scanned.push_back(new BLEAdvertisedDevice(advertisedDevice));
    }
  }
};

BLERemoteService* ServiceConnection(BLEAdvertisedDevice* myDevice) {
  Serial.println("Conectando ao dispositivo...");
  Serial.println(myDevice->toString().c_str());

  BLEClient* pClient = BLEDevice::createClient();  // Cria um cliente BLE
  Connected.push_back(pClient);                   // Armazena o cliente

  if (pClient->connect(myDevice)) {  // Conecta ao dispositivo
    Serial.println("Conectado com sucesso.");
    BLERemoteService* pRemoteService = pClient->getService(SERVICE_UUID);  // Obtém o serviço remoto

    if (pRemoteService != nullptr) {
      Serial.println("Serviço encontrado!");
      return pRemoteService;  // Retorna o serviço remoto

    } else {
      Serial.println("Serviço não encontrado.");
      return nullptr;  //Retorna nulo se o serviço não for encontrado
    }
  } else {
    Serial.println("Falha na conexão!");
    return nullptr;  //Retorna nulo se a conexão falhar
  }
}

void setup() {
  startM = millis();

  Serial.begin(115200);
  Serial.println("Inicializando o scanner BLE...");

  BLEDevice::init("");              // Inicializa o dispositivo BLE
  pBLEScan = BLEDevice::getScan();  // Cria o obieto scanner

  pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());  //Define as callbacks
  pBLEScan->setActiveScan(true);                                              //True para scan ativa
  pBLEScan->start(10, false);                                                 //Inicia a varredura
}

void loop() {
  currentM = millis();

  if (currentM - startM >= 5000) {
    
    for (int i = 0; i < Scanned.size(); i++) {
      BLERemoteService* pService = ServiceConnection(Scanned[i]);
      delay(100); 

      if (pService != nullptr) {
        ptrScanned.push_back(pService);
      }
    }

    for (int i = 0; i < ptrScanned.size(); i++) {
      std::map<std::string, BLERemoteCharacteristic*>* Characteristics = ptrScanned[i]->getCharacteristics();
      Serial.println("mapeando");
      delay(100);

      for (auto it = Characteristics->begin(); it != Characteristics->end(); ++it) {
        std::string uuid = it->first;
        BLERemoteCharacteristic* pCharacteristic = it->second;
        String value = pCharacteristic->readValue();

        if (value.length() > 0) {
          Serial.print("valor lido: ");

          for (int i = 0; i < value.length(); i++) {
            Serial.print(value[i]);
          }
          Serial.println();
        }
      }

      Serial.println("Desconectado do dispositivo.");

      for (int c = Connected.size() - 1; c >= 0; c--) {
        if (!Connected[c]->isConnected()) {
          Serial.print("Cliente desconectado removido: ");
          Serial.println(c);
          Connected.erase(Connected.begin() + c);  // Remove cliente desconectado
        }
      }
    }
  }
  delay(1000);
  startM = millis();

  //ESP.restart();// Reinicia a varredura
  pBLEScan->start(10, false);
}
