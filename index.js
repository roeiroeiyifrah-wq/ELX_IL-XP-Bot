require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder
} = require("discord.js");

const fs = require("fs");


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});


const TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD_ID;


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


const cooldown = {};


function getLevel(xp) {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}


client.once("ready", () => {

  console.log(
    `✅ ELX_IL XP Bot מחובר בתור ${client.user.tag}`
  );

});


client.on("messageCreate", async message => {


  if (message.author.bot) return;


  if (!message.guild) return;


  const userId = message.author.id;


  if (!database[userId]) {

    database[userId] = {
      xp: 0,
      level: 1,
      streak: 0,
      bestStreak: 0
    };

  }



  const now = Date.now();


  if (
    cooldown[userId] &&
    now - cooldown[userId] < 20000
  ) {
    return;
  }


  cooldown[userId] = now;



  const oldLevel = database[userId].level;


  const xpAdd = Math.floor(Math.random() * 10) + 5;


  database[userId].xp += xpAdd;


  const newLevel = getLevel(
    database[userId].xp
  );


  database[userId].level = newLevel;


  saveDatabase();



  if (newLevel > oldLevel) {


    const embed = new EmbedBuilder()

      .setTitle("🎉 Level Up!")

      .setDescription(
        `🔥 ${message.author} עלה לרמה **${newLevel}**!\n\n⭐ XP: ${database[userId].xp}`
      )

      .setTimestamp();



    message.channel.send({
      embeds: [embed]
    });


  }


});


client.login(TOKEN);
