#include <BLEDevice.h>
#include <esp_sleep.h>
#include <ArduinoJson.h>
#include <WiFi.h>
#include <WiFiClient.h>

// Substitua pelos UUIDs do serviço e da característica que você quer ler
#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID ""

std::vector<BLEAdvertisedDevice*> Scanned;
std::vector<BLERemoteService*> ptrScanned;

BLEScan* pBLEScan;

unsigned long currentM;
unsigned long startM;

const char* ssid = "SaberKennel";
const char* password = "@Mallu2017";
const char* host = " 192.168.15.13";

const long Interval = 20000;

const int port2 = 8000;
int size = 0;

String* ids = nullptr;
String value = "";
String Json;

void AddValue(String id);
bool Verify(String id);

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

void AddValue(String value) {
  String* novoVetor = new String[size + 1];
  for (int i = 0; i < size; i++) {
    novoVetor[i] = ids[i];
  }
  novoVetor[size] = value;
  delete[] ids;
  ids = novoVetor;
  size++;
}

bool Verify(String value) {
  // Percorre o vetor verificando se a string já está presente
  for (int i = 0; i < size; i++) {
    if (ids[i] == value) {
      return true;
    }
  }
  return false;
}

void setup() {
  startM = millis();
  Serial.begin(115200);

  Serial.println();
  Serial.print("Conectando-se a ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);  // Conecta ao Wi-Fi

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi conectado.");
  Serial.println("Endereço IP: ");
  Serial.println(WiFi.localIP());

  Serial.println("Inicializando o scanner BLE...");

  BLEDevice::init("");              // Inicializa o dispositivo BLE
  pBLEScan = BLEDevice::getScan();  // Cria o obieto scanner

  pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());  //Define as callbacks
  pBLEScan->setActiveScan(true);                                              //True para scan ativa
  pBLEScan->start(10, false);                                                 //Inicia a varredura

  delay(1000);
}

void loop() {
  currentM = millis();
  DynamicJsonDocument doc(1024);

  std::vector<BLEClient*> Connected;
  std::vector<BLERemoteCharacteristic*> pCharacteristic;

  if (currentM - startM >= 5000) {
    startM = millis();

    for (int i = 0; i < Scanned.size(); i++) {
      BLEAdvertisedDevice* myDevice = Scanned[i];

      Serial.println("Conectando ao dispositivo...");
      Serial.println(myDevice->toString().c_str());

      BLEClient* pClient = BLEDevice::createClient();  // Cria um cliente BLE
      Connected.push_back(pClient);                    // Armazena o cliente
      Serial.print("tamanho da fila: ");
      Serial.println(Connected.size());

      if (pClient->connect(myDevice)) {  // Conecta ao dispositivo
        Serial.println("Conectado com sucesso.");
        BLERemoteService* pRemoteService = pClient->getService(SERVICE_UUID);  // Obtém o serviço remoto

        if (pRemoteService != nullptr) {
          Serial.println("Serviço encontrado!");
          ptrScanned.push_back(pRemoteService);

          for (int i = 0; i < ptrScanned.size(); i++) {
            std::map<std::string, BLERemoteCharacteristic*>* Characteristics = ptrScanned[i]->getCharacteristics();
            Serial.println("mapeando");
            delay(100);

            for (auto it = Characteristics->begin(); it != Characteristics->end(); ++it) {
              std::string uuid = it->first;
              BLERemoteCharacteristic* pCharacteristic = it->second;
              value = pCharacteristic->readValue();

              if (value.length() > 0) {
                Serial.print("valor lido: ");

                for (int i = 0; i < value.length(); i++) {
                  Serial.print(value[i]);
                }
                Serial.println();

                pClient->disconnect();
                Serial.println("Desconectado do dispositivo.");

                // Remove cliente desconectado}
                //desconectando os clientes
              }

              DynamicJsonDocument doc2(1024);
              DeserializationError error = deserializeJson(doc2, Json);

              if (Verify(value)) {
                for (int c = 0; c < size; c++) {
                  AddValue(value);
                  Serial.println(ids[c]);
                }

                JsonArray array = doc.createNestedArray("ids");
                for (int i = 0; i < size; i++) {
                  array.add(ids[i]);
                  serializeJson(doc, Json);
                }
              }
            }
          }
        } else {
          Serial.println("Serviço não encontrado.");
          break;
        }
      }
    }
  }

  delay(1000);

  //ESP.restart();// Reinicia a varredura
  pBLEScan->start(10, false);

  //tempo para trabalho

  if (currentM - startM >= Interval) {
    startM = millis();

    DynamicJsonDocument doc2(1024);
    DeserializationError error = deserializeJson(doc2, Json);

    if (error) {
      Serial.print("Erro na deserialização: ");
      Serial.println(error.c_str());
    }

    doc2["lab"] = 1;
    serializeJson(doc2, Json);

    Serial.println(Json);
    WiFiClient client;

    if (!client.connect(host, port2)) {
      Serial.println("Conexão ao servidor falhou");

    } else {
      client.print(String("POST ") + "/api" + " HTTP/1.1\r\n" + "Host: " + host + "\r\n" + "Content-Type: application/json\r\n" + "Content-Length: " + Json.length() + "\r\n" + "Connection: close\r\n\r\n" + Json);
      Serial.println("Requisição Http Post enviada");
      client.stop();
    }

    delete[] ids;
    ids = nullptr;
    size = 0;
    Json = "";
    doc.clear();
    doc2.clear();
  }
}