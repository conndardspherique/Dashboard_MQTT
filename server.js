const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mqtt = require('mqtt');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// === CONFIGURATION MQTT ===
const mqttOptions = {
  username: 'jeremy',        // Identifiant MQTT
  password: 'dotmetheass',   // Mot de passe MQTT
};

const mqttClient = mqtt.connect('mqtt://192.168.1.155:1883', mqttOptions);

// === CONNEXION AU BROKER ===
mqttClient.on('connect', () => {
  console.log('✅ Connecté au broker MQTT');

  // Liste des topics à écouter
  const topics = ['dotchat', 'temp', 'opr', 'ph', 'cond', 'oxy'];

  mqttClient.subscribe(topics, (err) => {
    if (!err) {
      console.log(`📡 Abonné aux topics : ${topics.join(', ')}`);
    } else {
      console.error("❌ Erreur lors de l'abonnement :", err);
    }
  });
});

// === RÉCEPTION MQTT → ENVOI AUX CLIENTS WEBSOCKET ===
mqttClient.on('message', (topic, message) => {
  const messageStr = message.toString();

  console.log(`📥 MQTT -> Reçu sur '${topic}': ${messageStr}`);

  let parsedMessage;
  try {
    // Parse le JSON venant du capteur
    parsedMessage = JSON.parse(messageStr);
  } catch (err) {
    console.error("❌ Erreur parsing MQTT :", err);
    return;
  }

  // Diffusion du vrai objet JSON au navigateur
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(parsedMessage));
    }
  });
});

  // Diffusion à tous les clients connectés
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ topic, message: messageStr }));
    }
  });
;

// === WEBSOCKET : CLIENT WEB → MQTT ===
wss.on('connection', (ws) => {
  console.log('🌍 Un client web s\'est connecté');

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.topic && data.message) {
        mqttClient.publish(data.topic, data.message);
        console.log(`📤 WS -> MQTT publié sur '${data.topic}': ${data.message}`);
      }
    } catch (err) {
      console.error('❌ Erreur WebSocket reçu :', err);
    }
  });
});

// === SERVIR LES FICHIERS STATIQUES ===
app.use(express.static(__dirname));

// === LANCER LE SERVEUR ===
server.listen(3000, () => {
  console.log('🚀 Serveur lancé sur http://192.168.1.155:3000');
});
