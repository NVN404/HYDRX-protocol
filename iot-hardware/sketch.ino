/**
 * HydrX Protocol - ESP32 Smart Water Meter Hardware Firmware
 * Target Platform: ESP32 Dev Module (Wokwi & Physical Hardware)
 * Network: Solana DePIN on MagicBlock Ephemeral Rollups
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

const char* ssid = "Wokwi-GUEST";
const char* password = "";

// Dynamic candidates to reach the local Relayer from Wokwi simulation
const char* RELAYER_ENDPOINTS[] = {
  "http://host.wokwi.internal:3005/api/telemetry",
  "http://10.113.66.157:3005/api/telemetry",
  "http://10.0.2.2:3005/api/telemetry",
  "http://localhost:3005/api/telemetry"
};
const int NUM_ENDPOINTS = 4;
int activeEndpointIndex = 0;

const char* DEVICE_ID = "HYDRX-NODE-101";
const int POT_PIN = 34; // Linear slide potentiometer simulating water valve flow

LiquidCrystal_I2C lcd(0x27, 20, 4);

float totalLiters = 0.0;
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL_MS = 1200;

void sendTelemetry(float currentFlow, float litersIncrement);

void setup() {
  Serial.begin(115200);
  pinMode(POT_PIN, INPUT);

  Wire.begin(21, 22);
  lcd.init();
  lcd.backlight();

  lcd.setCursor(0, 0);
  lcd.print("HydrX Solana DePIN ");
  lcd.setCursor(0, 1);
  lcd.print("Connecting WiFi... ");

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(250);
    Serial.print(".");
  }

  Serial.println("\n[WiFi] Connected to Wokwi-GUEST");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("HydrX Node: 101    ");
  lcd.setCursor(0, 1);
  lcd.print("MagicBlock: SYNC   ");

  // Send initial boot registration telemetry pulse
  Serial.println("[Boot] Transmitting initial telemetry registration pulse...");
  sendTelemetry(0.15, 0.05);
}

void loop() {
  int potValue = analogRead(POT_PIN);
  // Map 0-4095 ADC to 0.00 - 2.50 L/s flow rate
  float flowRate = (potValue / 4095.0) * 2.50;

  if (millis() - lastSendTime >= SEND_INTERVAL_MS) {
    lastSendTime = millis();

    float litersThisInterval = flowRate * (SEND_INTERVAL_MS / 1000.0);
    totalLiters += litersThisInterval;

    lcd.setCursor(0, 2);
    lcd.print("Flow: ");
    lcd.print(flowRate, 2);
    lcd.print(" L/s   ");

    lcd.setCursor(0, 3);
    lcd.print("Total: ");
    lcd.print(totalLiters, 2);
    lcd.print(" L   ");

    // Send telemetry ONLY when water is actively flowing (flowRate > 0.05 L/s)
    if (flowRate > 0.05) {
      sendTelemetry(flowRate, litersThisInterval);
    }
  }

  delay(50);
}

void sendTelemetry(float currentFlow, float litersIncrement) {
  if (WiFi.status() != WL_CONNECTED) return;

  String status = "NORMAL";
  if (currentFlow < 0.35) status = "CONSERVING";
  else if (currentFlow > 1.20) status = "HIGH_SURGE";

  String jsonPayload = "{";
  jsonPayload += "\"deviceId\":\"" + String(DEVICE_ID) + "\",";
  jsonPayload += "\"litersUsed\":" + String(litersIncrement, 3) + ",";
  jsonPayload += "\"timestamp\":" + String(millis() / 1000) + ",";
  jsonPayload += "\"signature\":\"0x" + String(DEVICE_ID) + "-SOLANA-SIG-" + String(millis()) + "\",";
  jsonPayload += "\"status\":\"" + status + "\"";
  jsonPayload += "}";

  int httpResponseCode = -1;

  // Try current active endpoint first; cycle through fallbacks if unreachable
  for (int attempt = 0; attempt < NUM_ENDPOINTS; attempt++) {
    int epIdx = (activeEndpointIndex + attempt) % NUM_ENDPOINTS;
    const char* targetUrl = RELAYER_ENDPOINTS[epIdx];

    HTTPClient http;
    http.setTimeout(1800);
    http.begin(targetUrl);
    http.addHeader("Content-Type", "application/json");

    httpResponseCode = http.POST(jsonPayload);
    http.end();

    if (httpResponseCode == 200 || httpResponseCode == 201) {
      activeEndpointIndex = epIdx;
      Serial.print("[ER OK] Sent to: ");
      Serial.print(targetUrl);
      Serial.print(" -> HTTP ");
      Serial.println(httpResponseCode);
      break;
    } else {
      Serial.print("[Retry] Failed on ");
      Serial.print(targetUrl);
      Serial.print(" (code: ");
      Serial.print(httpResponseCode);
      Serial.println(")");
    }
  }

  lcd.setCursor(0, 1);
  if (httpResponseCode == 200 || httpResponseCode == 201) {
    lcd.print("ER: ONLINE 200 OK  ");
  } else {
    lcd.print("ER: RETRYING...    ");
  }
}
