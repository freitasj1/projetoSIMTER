const int L = 5;
const int C = 37;

char caracteristicas[L][C];
int atualL = 0;

String teste = "";

void setup() {
  Serial.begin(115200);
}

void loop() {
  if (Serial.available() > 0) {
    teste = Serial.readStringUntil(';');

    if (teste.length() < C) {
      teste.toCharArray(caracteristicas[atualL], C);
      atualL++;

      for (int i = 0; i < L; i++) {
        Serial.println(caracteristicas[i]);
      }
    }
  }
}