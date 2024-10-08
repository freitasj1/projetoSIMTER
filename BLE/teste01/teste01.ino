#include <Arduino.h>
#include <mbedtls/aes.h>
#include <string.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <esp_sleep.h>

#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

const char *DEVICE_ID = "Esp32_Beacon_01";

char Key[16] = {1, 0, 0, 0, 0, 2, 1, 6, 7, 1, 7, 6, 0, 6, 1, 3};
char IV[16] =  {1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1};


void setup() {
  Serial.begin(115200);
  pinMode(2,OUTPUT);

  char encrypted[16];
  char decrypted[16];

  mbedtls_aes_context aes;
  mbedtls_aes_init(&aes);

  mbedtls_aes_setkey_enc(&aes, (uint8_t *)Key, 256);
  mbedtls_aes_crypt_cbc(&aes, MBEDTLS_AES_ENCRYPT, strlen(DEVICE_ID), (uint8_t *)IV, (unsigned char *)DEVICE_ID, (unsigned char *)encrypted);
  ESP_LOG_BUFFER_HEX("cbc_encrypt", encrypted, strlen(DEVICE_ID));

  uint8_t payload[32];
  memcpy(payload, IV, 16);
  memcpy(payload + 16, encrypted, 16);


  Serial.println("Starting BLE work!");

  BLEDevice::init("Trem");
  BLEServer *pServer = BLEDevice::createServer();
  BLEService *pService = pServer->createService(SERVICE_UUID);
  BLECharacteristic *pCharacteristic = pService->createCharacteristic(
                                         CHARACTERISTIC_UUID,
                                         BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
                                         );


  pCharacteristic->setValue(payload, sizeof(payload));
  pService->start();
  
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);

  //BLEAdvertising *pAdvertising = pServer->getAdvertising();  // this still is working for backward compatibility
  //pAdvertising->setScanResponse(true);
  //pAdvertising->setMinPreferred(0x06);  // functions that help with iPhone connections issue
  //pAdvertising->setMinPreferred(0x12);

  BLEDevice::startAdvertising();
  Serial.println("Characteristic defined! Now you can read it in your phone!");
  
}

void loop() {
  // put your main code here, to run repeatedly:
  /*digitalWrite(2,1);
  delay(1000);
  digitalWrite(2,0);
  delay(1000);

  esp_sleep_pd_config(ESP_PD_DOMAIN_RTC_PERIPH, ESP_PD_OPTION_AUTO);
  esp_sleep_enable_timer_wakeup(5000000);
  Serial.println("Going to sleep now");
  delay(1000);
  esp_deep_sleep_start();

  delay(2000);
*/
}
