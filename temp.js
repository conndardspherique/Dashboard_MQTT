const mqtt = require('mqtt');

// === CONFIGURATION ===
const brokerUrl = 'mqtt://192.168.1.155:1883';
const options = {
  username: 'jeremy',       // Identifiant MQTT
  password: 'dotmetheass',  // Mot de passe MQTT
};

console.log(`🔌 Connexion au broker MQTT ${brokerUrl} ...`);
const client = mqtt.connect(brokerUrl, options);

// Quand connecté au broker
client.on('connect', () => {
  console.log('✅ Connecté au broker MQTT');

  // Simulation toutes les 2 secondes
  setInterval(() => {
    const simulatedData = {
      temp: (20 + Math.random() * 5).toFixed(2),        // 20°C à 25°C
      opr: (100 + Math.random() * 50).toFixed(2),       // 100mV à 150mV
      ph: (6 + Math.random() * 2).toFixed(2),           // pH entre 6 et 8
      cond: (200 + Math.random() * 50).toFixed(2),      // 200µS à 250µS
      oxy: (5 + Math.random() * 2).toFixed(2)           // 5mg/L à 7mg/L
    };

    // Envoi des valeurs une par une via MQTT
    for (const [key, value] of Object.entries(simulatedData)) {
      const message = JSON.stringify({ topic: key, message: value });

      // Ici on publie sur le topic correspondant (ex: "temp", "opr", etc.)
      client.publish(key, message, { qos: 0 }, (err) => {
        if (err) {
          console.error(`❌ Erreur lors de l'envoi sur ${key}:`, err);
        } else {
          console.log(`📡 Envoyé -> [${key}] ${value}`);
        }
      });
    }
  }, 5000);
});

// Gestion des erreurs MQTT
client.on('error', (err) => {
  console.error('❌ Erreur de connexion MQTT :', err.message);
});
