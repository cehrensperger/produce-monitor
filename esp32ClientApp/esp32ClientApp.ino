// Example from https://techtutorialsx.com/2017/05/20/esp32-http-post-requests/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "EnvironmentValues.h"

const char* ssid = SSID;
const char* password = PASSWORD;

void setup() {
  Serial.begin(9600);
  delay(4000); // Delay needed before calling the WiFi.begin

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }

  Serial.println("Connected to the WiFi network");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) { // Check WiFi connection status
    HTTPClient http;

    // Specify the full URL including the path (if applicable)
    http.begin(IP_ADDRESS); // Trailing slash added here
    http.addHeader("Content-Type", "text/plain");

    const int capacity = JSON_OBJECT_SIZE(3);
    StaticJsonDocument<capacity> doc;

    doc["Bananas"] = 5;

    // Send the actual POST request with an empty body
    String output;
    serializeJson(doc, output);
    
    int httpResponseCode = http.POST(output);

    // Print the response code for debugging
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);

    if (httpResponseCode == 200) {
      Serial.println("POST request successful");
    } else {
      Serial.print("Error on sending POST: ");
      Serial.println(httpResponseCode);
    }

    http.end(); // Free resources
  } else {
    Serial.println("Error in WiFi connection");
  }

  delay(10000); // Send a request every 10 seconds
}
