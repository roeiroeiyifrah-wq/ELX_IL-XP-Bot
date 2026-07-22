require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers
  ]
});

const TOKEN = process.env.TOKEN;

let database = {};

if (fs.existsSync("database.json")) {
  database = JSON.parse(
    fs.readFileSync("database.json")
  );
}

function saveDatabase() {
  fs.writeFileSync(
    "database.json",
    JSON.stringify(database, null, 2)
  );
}

client.once("ready", () => {
  console.log(`✅ ELX_IL XP Bot מחובר בתור ${client.user.tag}`);
});

client.login(TOKEN);
