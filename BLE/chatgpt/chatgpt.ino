#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>
#include <BLEClient.h>
#include <BLEAddress.h>

// Substitua pelos UUIDs do serviço e da característica que você quer ler
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

BLEScan* pBLEScan;
BLEAdvertisedDevice* myDevice;

class MyAdvertisedDeviceCallbacks: public BLEAdvertisedDeviceCallbacks {
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

void setup() {
    Serial.begin(115200);
    Serial.println("Inicializando o scanner BLE...");

    // Inicializa o dispositivo BLE
    BLEDevice::init("gfghjhgf");

    // Cria o objeto scanner
    pBLEScan = BLEDevice::getScan();

    // Define as callbacks
    pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());

    // Define o tempo de varredura (em segundos)
    pBLEScan->setActiveScan(true); // True para scan ativa
    pBLEScan->setInterval(100);
    pBLEScan->setWindow(99);
    
    // Inicia a varredura
    pBLEScan->start(30, false);
}

void loop() {
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
            if (pRemoteService == nullptr) {
                Serial.print("Falha ao encontrar o serviço UUID: ");
                Serial.println(SERVICE_UUID);
                pClient->disconnect();
                return;
            }

            // Obtém a característica desejada
            BLERemoteCharacteristic* pRemoteCharacteristic = pRemoteService->getCharacteristic(BLEUUID(CHARACTERISTIC_UUID));
            if (pRemoteCharacteristic == nullptr) {
                Serial.print("Falha ao encontrar a característica UUID: ");
                Serial.println(CHARACTERISTIC_UUID);
                pClient->disconnect();
                return;
            }

            // Lê o valor da característica
            String value = pRemoteCharacteristic->readValue();
            Serial.print("Valor da característica lida: ");
            Serial.println(value.c_str());

            // Alternativa caso a conversão para std::string falhe
             //const uint8_t* data = pRemoteCharacteristic->readValue().data();
             //int length = pRemoteCharacteristic->readValue().length();
             //Serial.print("Valor da característica lida: ");
             //for (int i = 0; i < length; i++) {
                 //Serial.print((char)data[i]);
             }
             Serial.println();

            // Desconecta do dispositivo
            pClient->disconnect();
            Serial.println("Desconectado do dispositivo.");
        } else {
            Serial.println("Falha na conexão com o dispositivo.");
        }

        // Libera o dispositivo após a leitura
        delete myDevice;
        myDevice = nullptr;

        // Reinicia a varredura
        pBLEScan->start(30, false);
    

    delay(1000);
}
