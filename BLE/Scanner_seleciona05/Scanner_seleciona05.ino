#include <BLEDevice.h>
#include <esp_sleep.h>

// Substitua pelos UUIDs do serviço e da característica que você quer ler
#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
//#define CHARACTERISTIC_UUID "ceb5483e-46e1-4688-b7f5-ea07361b26a8"

const int L = 2;
const int C = 37;

char CHARACTERISTIC_UUID[L][C]
{
  "ceb5483e-46e1-4688-b7f5-ea07361b26a8",
  "ceb5483e-46e1-4688-b7f5-ea07361b26a9"
};
int atualL = 0;

String teste = "";

unsigned long currentM;
unsigned long startM;

BLEScan* pBLEScan;
BLEAdvertisedDevice* myDevice;

class MyAdvertisedDeviceCallbacks : public BLEAdvertisedDeviceCallbacks {
  void onResult(BLEAdvertisedDevice advertisedDevice) {
    Serial.print("Dispositivo detectado: ");
    Serial.println(advertisedDevice.toString().c_str());

    // Verifica se o dispositivo tem o serviço desejado
    if (advertisedDevice.haveServiceUUID() && advertisedDevice.isAdvertisingService(BLEUUID(SERVICE_UUID))) {
      Serial.println("Dispositivo com serviço desejado encontrado:");
      Serial.println(advertisedDevice.toString().c_str());
      myDevice = new BLEAdvertisedDevice(advertisedDevice);
      pBLEScan->stop();
    }
  }
};

void get() {
  if (Serial.available() > 0) {
    teste = Serial.readStringUntil(';');

    if (teste.length() < C) {
      teste.toCharArray(CHARACTERISTIC_UUID[atualL], C);
      atualL++;

      for (int i = 0; i < L; i++) {
        Serial.println(CHARACTERISTIC_UUID[i]);
      }
    }
  }
}

void timer() {
  if (currentM - startM >= 5000) {
    delay(100);
    Serial.println("recomeçando a scannear");
    ESP.restart();
  }
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
  pBLEScan->setInterval(100);
  pBLEScan->setWindow(99);

  // Inicia a varredura
  pBLEScan->start(30, false);
}

void loop() {
  currentM = millis();
  //void timer();
  get();
  delay(5000);

  if (myDevice) {
    // Conecta ao dispositivo detectado
    BLEClient* pClient = BLEDevice::createClient();
    Serial.println("Conectando ao dispositivo...");
    pClient->connect(myDevice);

    // Verifica se a conexão foi estabelecida
    if (pClient->isConnected()) {
      Serial.println("Conectado ao dispositivo.");

      // Obtém o serviço desejado
      BLERemoteService* pRemoteService = pClient->getService(BLEUUID(SERVICE_UUID));
      // Obtém a característica desejada
      //BLERemoteCharacteristic* pRemoteCharacteristic = pRemoteService->getCharacteristic(BLEUUID(CHARACTERISTIC_UUID));

      if (pRemoteService == nullptr) {
        Serial.print("Falha ao encontrar o serviço UUID: ");
        Serial.println(SERVICE_UUID);
        pClient->disconnect();
        return;
      }

      /*
      if (pRemoteCharacteristic == nullptr) {
        Serial.print("Falha ao encontrar a característica UUID: ");
        Serial.println(CHARACTERISTIC_UUID);
        pClient->disconnect();
        return;
      } */


      Serial.println("começando o for");
      delay(200);
      for (int i = 0; i < L; i++){
        BLERemoteCharacteristic* pRemoteCharacteristic = pRemoteService->getCharacteristic(BLEUUID(CHARACTERISTIC_UUID[i]));
        // Lê o valor da característica
        String value = pRemoteCharacteristic->readValue();
        //Serial.print("Valor da característica lida: ");

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
      pClient->disconnect();
      Serial.println("Desconectado do dispositivo.");

    } } else {
      Serial.println("Falha na conexão com o dispositivo.");
    }

    // Libera o dispositivo após a leitura
    delete myDevice;
    myDevice = nullptr;

    delay(1000);

    // Reinicia a varredura
    pBLEScan->start(30, false);

    delay(1000);
  }
}
