const ws = new WebSocket("ws://192.168.1.155:3000");

const sensorHistory = {
  temp: [],
  opr: [],
  ph: [],
  cond: [],
  oxy: []
};

ws.onopen = () => {
  console.log("✅ Connecté au serveur WebSocket");
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  // Chat classique
  appendMessage(`[${data.topic}] ${data.message}`);

  // Gestion des données capteurs
  handleSensorData(data.topic, data.message);
};

ws.onerror = (error) => {
  console.error("❌ WebSocket erreur :", error);
};

function sendMessage() {
  const topic = document.getElementById("topic").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!topic || !message) return alert("Remplis le topic et le message !");
  
  ws.send(JSON.stringify({ topic, message }));
  appendMessage(`Vous -> [${topic}] ${message}`);
  document.getElementById("message").value = "";
}

// === Chat ===
function appendMessage(text) {
  const messagesDiv = document.getElementById("messages");
  const msgElem = document.createElement("div");
  msgElem.className = "message";
  msgElem.innerHTML = text;
  messagesDiv.appendChild(msgElem);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// === Dashboard ===
function handleSensorData(topic, value) {
  value = parseFloat(value);

  if (isNaN(value)) return;

  switch(topic) {
    case "temp":
      updateSensor("temp", "temp-value", "temp-history", value, "°C");
      break;
    case "opr":
      updateSensor("opr", "opr-value", "opr-history", value, "mV");
      break;
    case "ph":
      updateSensor("ph", "ph-value", "ph-history", value, "");
      break;
    case "cond":
      updateSensor("cond", "cond-value", "cond-history", value, "µS");
      break;
    case "oxy":
      updateSensor("oxy", "oxy-value", "oxy-history", value, "mg/L");
      break;
  }
}

function updateSensor(key, valueId, historyId, value, unit) {
  // Mise à jour de la valeur actuelle
  document.getElementById(valueId).textContent = `${value} ${unit}`;

  // Stockage historique (max 10 valeurs)
  sensorHistory[key].unshift(value);
  if (sensorHistory[key].length > 10) sensorHistory[key].pop();

  // Affichage historique
  const historyDiv = document.getElementById(historyId);
  historyDiv.innerHTML = sensorHistory[key]
    .map(val => `<div>${val} ${unit}</div>`)
    .join("");
}
