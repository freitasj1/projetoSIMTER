/*
    Video: https://www.youtube.com/watch?v=oCMOYS71NIU
    Based on Neil Kolban example for IDF: https://github.com/nkolban/esp32-snippets/blob/master/cpp_utils/tests/BLE%20Tests/SampleNotify.cpp
    Ported to Arduino ESP32 by Evandro Copercini
    updated by chegewara

   Create a BLE server that, once we receive a connection, will send periodic notifications.
   The service advertises itself as: 4fafc201-1fb5-459e-8fcc-c5c9c331914b
   And has a characteristic of: beb5483e-36e1-4688-b7f5-ea07361b26a8

   The design of creating the BLE server is:
   1. Create a BLE Server
   2. Create a BLE Service
   3. Create a BLE Characteristic on the Service
   4. Create a BLE Descriptor on the characteristic
   5. Start the service.
   6. Start advertising.

   A connect handler associated with the server starts a background task that performs notification
   every couple of seconds.
*/
#include <BLEDevice.h>

auto name = "preto";
auto id = "esp_preto_01";

BLEServer *pServer = NULL;
BLEDescriptor *pDescrp;
BLECharacteristic *pCharacteristic = NULL;

bool deviceConnected = false;
bool oldDeviceConnected = false;

int startM, currentM;

// See the following for generating UUIDs:
// https://www.uuidgenerator.net/

#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "ceb5483e-46e1-4688-b7f5-ea07361b26a6"

class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer *pServer) {
    deviceConnected = true;
  };

  void onDisconnect(BLEServer *pServer) {
    deviceConnected = false;
  }
};

void setup() {
  Serial.begin(115200);

  BLEDevice::init(name);  // Create the BLE Device

  pServer = BLEDevice::createServer();  // Create the BLE Server
  pServer->setCallbacks(new MyServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);  // Create the BLE Service
  pCharacteristic = pService->createCharacteristic(             // Create a BLE Characteristic
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY | BLECharacteristic::PROPERTY_INDICATE);


  pService->start();  // Start the service

  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();  // Start advertising
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x0);

  BLEDevice::startAdvertising();

  Serial.println("Waiting a client connection to notify...");
  Serial.println(CHARACTERISTIC_UUID);
  startM = millis();
}

void loop() {
  currentM = millis();
  auto randomNumber = random(10);

  if (deviceConnected)  // notify changed value
  {
    String value = id;
    pCharacteristic->setValue(value);
    pCharacteristic->notify();
    delay(1000);
  }

  if (!deviceConnected && oldDeviceConnected)  //disconnecting
  {
    delay(500);  // give the bluetooth stack the chance to get things read

   /* Serial.println("enter deep sleep");
    Serial.flush();
    startM = currentM;
    Serial.println(randomNumber);
    esp_deep_sleep(100000ULL * 1);
    Serial.println("in deep sleep");
    ESP.restart(); */

    pServer->startAdvertising();  // restart advertising
    Serial.println("start advertising");
    oldDeviceConnected = deviceConnected;
  }

  if (deviceConnected && !oldDeviceConnected)  // connecting
  {
    oldDeviceConnected = deviceConnected;  // do stuff here on connecting
  }
}
