#include <BLEDevice.h>
#include <esp_sleep.h>

// Substitua pelos UUIDs do serviço e da característica que você quer ler
#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID ""

std::vector<BLEAdvertisedDevice*> achados;
std::vector<BLERemoteService*> ptrachados;
std::vector<BLEClient*> conectados;
std::vector<BLERemoteCharacteristic*> pCharacteristic;

const int L = 2;
const int C = 37;

char pRemoteCharacteristic_UUID[L][C]{
  "ceb5483e-46e1-4688-b7f5-ea07361b26a8",
  "ceb5483e-46e1-4688-b7f5-ea07361b26a9"
};

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

      achados.push_back(new BLEAdvertisedDevice(advertisedDevice));
    }
  }
};

BLERemoteService* conexao(BLEAdvertisedDevice* myDevice) {
  Serial.println("Conectando ao dispositivo...");
  Serial.println(myDevice->toString().c_str());

  BLEClient* pClient = BLEDevice::createClient();  // Cria um cliente BLE
  conectados.push_back(pClient);                   // Armazena o cliente

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
  for (int i = 0; i < achados.size(); i++) {
    BLERemoteService* pService = conexao(achados[i]);

    if (pService != nullptr) {
      ptrachados.push_back(pService);
    }
  }

  if (currentM - startM >= 5000) {
    for (int i = 0; i < ptrachados.size(); i++) {
      std::map<std::string, BLERemoteCharacteristic*>* caracteristicas = ptrachados[i]->getCharacteristics();
      Serial.println("conectando...");

      std::string uuidStr = pRemoteCharacteristic_UUID[i];
      Serial.print("o Char 2D: ");
      //Serial.println(uuidStr);
      delay(100);

      for (auto it = caracteristicas->begin(); it != caracteristicas->end(); ++it) {
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
      /*
      if (strcmp(uuidStr.c_str(), CuuidStr.c_str()) == 0) {  //função strncmp compara suas strings de tamanhos iguais
        Serial.print("sao iguais ");
        Serial.println(pRemoteCharacteristic_UUID[i]);
        BLERemoteCharacteristic* pCharacteristic = ptrachados[i]->getCharacteristic(BLEUUID(pRemoteCharacteristic_UUID[i]));
      } else {
        Serial.println("diferentes, vou pra proxima: ");
        Serial.println(pRemoteCharacteristic_UUID[i + 1]);
        BLERemoteCharacteristic* pCharacteristic = ptrachados[i]->getCharacteristic(BLEUUID(pRemoteCharacteristic_UUID[i + 1]));
      }
      */

      //String value = pCharacteristic[i]->readValue();  // Lê o valor da característica

      Serial.println("Desconectado do dispositivo.");

      for (int c = conectados.size() - 1; c >= 0; c--) {
        if (!conectados[c]->isConnected()) {
          Serial.print("Cliente desconectado removido: ");
          Serial.println(c);
          conectados.erase(conectados.begin() + c);  // Remove cliente desconectado
        }
      }
    }
  }
  delay(1000);
  startM = millis();
  
  //ESP.restart();// Reinicia a varredura
  pBLEScan->start(10, false);
  
}
