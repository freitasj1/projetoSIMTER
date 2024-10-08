#include <BLEDevice.h>
#include <esp_sleep.h>
#include <ArduinoJson.h>
#include <WiFi.h>
#include <WiFiClient.h>

// Substitua pelos UUIDs do serviço e da característica que você quer ler
#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
//#define CHARACTERISTIC_UUID ""

std::vector<BLERemoteService*> ptrScanned;
std::vector<BLERemoteCharacteristic*> pCharacteristic;
std::vector<BLEClient*> Connected;
std::vector<BLEAdvertisedDevice*> Scanned;

BLEScan* pBLEScan;

unsigned long currentM;
unsigned long startM;

const char* ssid = "SIMTER";
const char* password = "12244896";
const char* host = "192.168.0.199";

const long Interval = 6000;

const int Port = 8000;
int size = 0;

String* ids = nullptr;
String Json;

void AddValue(String id);
bool Verify(String id);

//BLOCO DINAMICO@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//(os valores aqui podem ser mudados, mas deven ser os mesmos em ambos dispositivos)                           DIVIRTA-SE!                           @
//CONSTANTES**************************************************************************************************************************************** @
#define PASSWORD "trem1234" //-defina aqui a senha\tamanho maximo -> S_LENGTH - NONCE_LENGTH                                                         @
#define NONCE_LENGTH 12 //-----comprimento do nonce/quanto maior, menos chance de repetir o nonce/faixa de tamanho -> 12 ~ 21                        @
#define S_LENGTH 256 //--------comprimento do vetor de estado S/quanto maior, mais complexo sera a cifra/faixa de tamanho -> 256 ~ 4096              @
#define LASTS_NONCES 48 //-----lista dos ultimos nonces usados pelos beacons/para um beacon local o valor deve ser 0                                 @
//para um beacon central/faixa -> (48 por beacon com intervalo de meia hora para 1 dia) ~ (1440 por beacon com intervalo de meia hora para 30 dias)  @
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

//BLOCO ESTATICO######################################################################################################################################
//(nao mude esse bloco a menos que seja MUITO necessario)                                  CHISPA O CURSOR DAQUI!!!                                  #
//PROTOTIPAGEM************************************************************************************************************************************** #
void swap(unsigned char* a, unsigned char* b);//-----------------------Troca dois valores                                                            #
void key_init(unsigned char* key, unsigned char* S, int key_length);//-Inicializa a chave (Key-Scheduling Algorithm - KSA)                           #
String cifrar(String data);//------------------------------------------Gera o fluxo de chave e cifra os dados                                        #
String decifrar(String data);//----------------------------------------Gera o fluxo de chave e decifra os dados                                      #
bool verify_nonce(unsigned char* nonce, unsigned char* mark);//--------Verifica se o nonce nao esta na lista de nonces                               #
//VARIAVEIS***************************************************************************************************************************************** #
unsigned char base_key[] = PASSWORD; //--------------------------------Chave base secreta que ambos dispisitivos devem ter                           #
unsigned char nonce_key[NONCE_LENGTH]; //------------------------------Chave aleatória publica de uso único                                          #
int base_key_length = strlen((const char*)base_key); //----------------Tamanho da chave base                                                         #
int key_length = base_key_length + NONCE_LENGTH; //--------------------Tamanho da chave composta                                                     #
unsigned char S[S_LENGTH]; //------------------------------------------Vetor de estado S                                                             #
unsigned char key[S_LENGTH]; //----------------------------------------Chave composta pela cahve base e o nonce                                      #
String last_nonces[LASTS_NONCES];//------------------------------------Lista dos ultimos nonces usados/util para aumentar a segurança                #
//####################################################################################################################################################

class MyAdvertisedDeviceCallbacks : public BLEAdvertisedDeviceCallbacks {
  void onResult(BLEAdvertisedDevice advertisedDevice) {
    Serial.print("Dispositivo detectado: ");
    Serial.println(advertisedDevice.toString().c_str());

    // Verifica se o dispositivo tem o serviço desejado
    if (advertisedDevice.haveServiceUUID() && advertisedDevice.isAdvertisingService(BLEUUID(SERVICE_UUID))) {
      Serial.println("Dispositivo com serviço deseiado encontrado:");
      Serial.println(advertisedDevice.toString().c_str());

      Scanned.push_back(new BLEAdvertisedDevice(advertisedDevice));
    }
  }
};

void addValue(String value) {
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

  if (currentM - startM >= 5000) {

    Serial.print("Scanneados: ");
    Serial.println(Scanned.size());
    delay(500);

    Serial.print("tamanho da fila: ");
    Serial.println(Connected.size());

    for (int i = 0; i < Scanned.size(); i++) {
      BLEAdvertisedDevice* myDevice = Scanned[i];

      Serial.println("Conectando ao dispositivo...");
      Serial.println(myDevice->toString().c_str());
      delay(500);

      BLEClient* pClient = BLEDevice::createClient();  // Cria um cliente BLE

      Connected.push_back(pClient);  // Armazena o cliente

      Serial.print("tamanho da fila: ");
      Serial.println(Connected.size());

      if (pClient->connect(myDevice)) {  // Conecta ao dispositivo
        Serial.println("Conectado com sucesso.");
        BLERemoteService* pRemoteService = pClient->getService(SERVICE_UUID);  // Obtém o serviço remoto
        delay(500);

        if (pRemoteService != nullptr) {
          Serial.println("Serviço encontrado!");
          ptrScanned.push_back(pRemoteService);
          delay(500);

          Serial.print("Os ponteiros scanneados: ");
          Serial.println(ptrScanned.size());

          for (int i = 0; i < ptrScanned.size(); i++) {
            std::map<std::string, BLERemoteCharacteristic*>* Characteristics = ptrScanned[i]->getCharacteristics();
            Serial.println("mapeando");
            delay(500);

            for (auto it = Characteristics->begin(); it != Characteristics->end(); ++it) {
              std::string uuid = it->first;
              BLERemoteCharacteristic* pCharacteristic = it->second;

              Serial.println("itmalia");
              String read = pCharacteristic->readValue();
              String value = decifrar(read);

              if (value.length() > 0) {
                Serial.print("valor lido: ");

                for (int i = 0; i < value.length(); i++) {
                  Serial.print(value[i]);
                }
                Serial.println("");
                delay(500);

                DynamicJsonDocument doc2(1024);
                DeserializationError error = deserializeJson(doc2, Json);

                if (Verify(value) == 0) {
                  addValue(value);
                  Serial.println("adicionado");
                  delay(500);

                  JsonArray array = doc.createNestedArray("ids");
                  Serial.println("json array");
                  delay(500);

                  for (int i = 0; i < size; i++) {
                    array.add(ids[i]);
                    serializeJson(doc, Json);
                  }
                }
              }
            }
            ptrScanned.clear();
          }
        } else {
          Serial.println("Serviço não encontrado.");
          break;
        }
        pClient->disconnect();
      }
    }
    Scanned.clear();
    Connected.clear();
    //ptrScanned.clear();

    Serial.println("Desconectado do dispositivo.");
    delay(100);
  }

  delay(1000);

  //ESP.restart();// Reinicia a varredura
  //std::vector<BLEAdvertisedDevice*> Scanned;
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

    if (!client.connect(host, Port)) {
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

void swap(unsigned char* a, unsigned char* b) {
  unsigned char temp = *a;
  *a = *b;
  *b = temp;
}

bool verify_nonce(unsigned char* nonce, unsigned char* mark) {
  //converte o nonce e o mark para string
  String snonce = String(reinterpret_cast<char*>(nonce), NONCE_LENGTH), smark = String(reinterpret_cast<char*>(mark), NONCE_LENGTH);

  //variavel que guarda se o nonce nao esta listado
  bool unico = true;

  //verifica se o marcador e valido (o nonce e valido se for igual ao marcador no inicio da mensagem)
  if (snonce == smark) {

    //verifica se o nonce e unico e nao esta listado
    for (int i = 0; i < LASTS_NONCES; i++) {
      if (snonce == last_nonces[i]) {
        unico = false;
        Serial.println("AVISO: o nonce da mensagem ja esta listado");
        break;
      }
    }

    if (unico) {
      //desloca todos os valores da lista e coloca novo nonce na frente
      for (int i = LASTS_NONCES - 1; i > 0; i--) {
        //deloca os ultimos nonces
        last_nonces[i] = last_nonces[i - 1];
      }
      //adiciona o novo nonce a lista
      last_nonces[0] = snonce;
      
      //retorna true se o nonce for valido e nao estiver listado
      return true;
    } else {
      
      //retorna false se o nonce for valido, mas ja estiver listado
      return false;
    }
  } else {
    //se o marcador e diferente do nonce
    Serial.println("AVISO: o marcador da mensagem e invalido");
    
    //retorna false se o nonce nao for valido
    return false;
  }
}

//inicialisa a chave
void key_init(unsigned char* key, unsigned char* S, int key_length) {
  int i, j = 0;
  for (i = 0; i < S_LENGTH; i++) {
    S[i] = i;
  }

  for (i = 0; i < S_LENGTH; i++) {
    j = (j + S[i] + key[i % key_length]) % S_LENGTH;
    swap(&S[i], &S[j]);
  }
}

String decifrar(String data) {
  // Prepara a chave composta (chave base + nonce)
  // Copia a chave base para o começo da chave composta
  memcpy(key, base_key, base_key_length);

  // Copia o nonce para a chave composta na frente da chave base
  memcpy(key + base_key_length, data.c_str(), NONCE_LENGTH);

  // Inicializa o estado da chave
  key_init(key, S, key_length);

  // Define o tamanho dos dados (removendo os bytes do nonce)
  int data_length = data.length() - NONCE_LENGTH;

  //define os vetores que recebem a cifra marcada, o nonce, a marca e a mensagem
  unsigned char marked_cifra[data_length], nonce[NONCE_LENGTH], mark[NONCE_LENGTH], msg[data_length - NONCE_LENGTH];

  //Copia o nonce do inicio dos dados para nonce
  memcpy(nonce, data.c_str(), NONCE_LENGTH);

  // Copia a parte da cifra (sem o nonce) da string data para o array cifra
  memcpy(marked_cifra, data.c_str() + NONCE_LENGTH, data_length);

  // Variáveis de controle para o algoritmo
  int i = 0, j = 0, k, t;
  // Loop de decifragem (idêntico ao de cifragem)
  for (k = 0; k < data_length; k++) {
    i = (i + 1) % S_LENGTH;
    j = (j + S[i]) % S_LENGTH;
    swap(&S[i], &S[j]);
    t = (S[i] + S[j]) % S_LENGTH;
    marked_cifra[k] ^= S[t]; // XOR entre a cifra e o valor gerado pelo estado S
  }

  //copia o marcador do inicio da marked_cifra para mark
  memcpy(mark, marked_cifra, NONCE_LENGTH);

  //redimensiona o tamanho dos dados sem o marador
  data_length -= NONCE_LENGTH;

  //verifica se o marcador é válido e se o nonce ja esta na lista
  if (verify_nonce(nonce, mark)) {
    //se for valido
    //retita a mensagem de marked_cifra e copia para msg
    memcpy(msg, marked_cifra + NONCE_LENGTH, data_length);

    //retorna a mensagem decifrada
    return String(reinterpret_cast<char*>(msg), data_length);

  } else {
    //se for invalido retorna uma string vazia
    return "";
  }
}
