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
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <BLE2901.h>

BLEServer *pServer = NULL;
BLECharacteristic *pCharacteristic_1 = NULL;
BLECharacteristic *pCharacteristic_2 = NULL;
BLEDescriptor *pDescrp1;
BLE2902 *pBLE2902_1 = NULL;
BLE2902 *pBLE2902_2 = NULL;

bool deviceConnected = false;
bool oldDeviceConnected = false;
uint32_t value = 0;

// See the following for generating UUIDs:
// https://www.uuidgenerator.net/

#define SERVICE_UUID         "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID_1 "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define CHARACTERISTIC_UUID_2 "64b09842-3e30-4bca-b881-f4d2a7a6db6c"


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

  // Create the BLE Device
  BLEDevice::init("trem");

  // Create the BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create the BLE Service
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Create a BLE Characteristic
  pCharacteristic_1 = pService->createCharacteristic(
    CHARACTERISTIC_UUID_1,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_NOTIFY | BLECharacteristic::PROPERTY_INDICATE
  );

  pCharacteristic_2 = pService->createCharacteristic(
    CHARACTERISTIC_UUID_2,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_NOTIFY | BLECharacteristic::PROPERTY_INDICATE
  );

  // Creates BLE Descriptor 0x2902: Client Characteristic Configuration Descriptor (CCCD)
  
  pDescrp1 = new BLEDescriptor((uint16_t)0x2901);
  pDescrp1->setValue("que sono");
  
  // Adds also the Characteristic User Description - 0x2901 descriptor
  pBLE2902_1 = new BLE2902();
  pBLE2902_1->setNotifications(true);

  pBLE2902_2 = new BLE2902();
  pBLE2902_2->setNotifications(true);

  pCharacteristic_1->addDescriptor(pDescrp1);
  pCharacteristic_1->addDescriptor(pBLE2902_1);
  pCharacteristic_2->addDescriptor(pBLE2902_2);

  //pDescrp1->setDescription("My own description for this characteristic.");
 // pDescrp1->setAccessPermissions(ESP_GATT_PERM_READ);  // enforce read only - default is Read|Write
 
  // Start the service
  pService->start();

  // Start advertising
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(false);
  pAdvertising->setMinPreferred(0x0);  // set value to 0x00 to not advertise this parameter
  BLEDevice::startAdvertising();
  Serial.println("Waiting a client connection to notify...");
}

void loop() {
  // notify changed value
  if (deviceConnected) {
    //String message = "Hello";
    pCharacteristic_1->setValue(value);
    pCharacteristic_1->notify();
    value++;
    pCharacteristic_2->setValue("PINTO ERETO AMO PAU ERGUIDO");
    pCharacteristic_2->notify();
    delay(1000);
  }
  // disconnecting
  if (!deviceConnected && oldDeviceConnected) {
    delay(500);                   // give the bluetooth stack the chance to get things ready
    pServer->startAdvertising();  // restart advertising
    Serial.println("start advertising");
    oldDeviceConnected = deviceConnected;
  }
  // connecting
  if (deviceConnected && !oldDeviceConnected) {
    // do stuff here on connecting
    oldDeviceConnected = deviceConnected;
  }
}
