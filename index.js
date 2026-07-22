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


const cooldowns = {};


client.once("ready", () => {
  console.log(`✅ ELX_IL XP Bot מחובר בתור ${client.user.tag}`);
});


client.on("messageCreate", message => {

  // לא נותן XP לבוטים
  if (message.author.bot) return;


  const userId = message.author.id;


  // פחות משתי מילים לא נותן XP
  if (message.content.trim().split(/\s+/).length < 2) {
    return;
  }


  // מניעת ספאם 20 שניות
  const now = Date.now();

  if (
    cooldowns[userId] &&
    now - cooldowns[userId] < 20000
  ) {
    return;
  }

  cooldowns[userId] = now;


  // יצירת משתמש חדש
  if (!database[userId]) {

    database[userId] = {
      xp: 0,
      level: 1,
      streak: 0,
      bestStreak: 0
    };

  }


  // כמות XP אקראית
  const xpGain = Math.floor(Math.random() * 6) + 5;


  database[userId].xp += xpGain;


  saveDatabase();

});


client.login(TOKEN);
