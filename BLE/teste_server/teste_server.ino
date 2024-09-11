#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

BLECharacteristic *pCharacteristic;
bool deviceConnected =  false; //saber se esta conectado ou nao
int txValue = 0; //

#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID_TX "beb5483e-36e1-4688-b7f5-ea07361b26a8"

class MyServerCallbacks: public BLEServerCallbacks {
  void onConnect (BLEServer* pServer) {
    deviceConnected = true;
  };

  void onDisconnect (BLEServer* pServer){
    deviceConnected = false;
  };
};

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);

  BLEDevice::init("Trem");//iniciar o ble com esse nome
  
  BLEServer *pServer = BLEDevice::createServer();//iniciamos o servidor, respeitando a ordem servidor>servico>caracteristicas
  pServer->setCallbacks(new MyServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);//iniciamos o servico

  pCharacteristic = pService->createCharacteristic(
                      CHARACTERISTIC_UUID_TX,
                      BLECharacteristic::PROPERTY_NOTIFY
                    );

  pCharacteristic->addDescriptor(new BLE2902());//para o ble notificar

  pService->start();//iniciando tanto o serviço quanto o servidor, ativando o advertising dele
  pServer->getAdvertising()->start();

  Serial.println("Esperando...");
}

void loop() {
  // put your main code here, to run repeatedly:
  if (deviceConnected) {
   
    Serial.println("conectado");
    txValue = random(-10, 20);//colocar random(10, 20);
    
    char txString[8];
    dtostrf(txValue, 1, 2, txString);
    
    Serial.println("teste:" + String(txValue));
    Serial.println("enviando o valor:" + String(txString));

    pCharacteristic->setValue(txString);

    
    delay(500);
  }
}
