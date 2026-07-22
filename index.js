require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const config = require("./config");


const client = new Client({

  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]

});


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


const levelRoles = {

  10: config.ROLES.LEVEL_10,
  20: config.ROLES.LEVEL_20,
  30: config.ROLES.LEVEL_30,
  40: config.ROLES.LEVEL_40,
  50: config.ROLES.LEVEL_50

};


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
      bestStreak: 0,
      lastLevelDM: 0

    };

  }


  const now = Date.now();


  if (
    cooldowns[userId] &&
    now - cooldowns[userId] < config.XP.MESSAGE_COOLDOWN
  ) {
    return;
  }


  cooldowns[userId] = now;


  const oldLevel = database[userId].level;


  const xpGain =
    Math.floor(
      Math.random() *
      (config.XP.MAX - config.XP.MIN + 1)
    )
    + config.XP.MIN;


  database[userId].xp += xpGain;


  const newLevel = getLevel(
    database[userId].xp
  );


  database[userId].level = newLevel;


  saveDatabase();



  if (newLevel > oldLevel) {


    const role = levelRoles[newLevel];


    if (role) {

      await message.member.roles.add(role)
        .catch(() => {});


      for (const level in levelRoles) {

        if (Number(level) < newLevel) {

          await message.member.roles.remove(
            levelRoles[level]
          )
          .catch(() => {});

        }

      }

    }


    const embed = new EmbedBuilder()

      .setTitle("🎉 עלית רמה!")

      .setDescription(
        `🔥 ${message.author} הגיע לרמה **${newLevel}**!\n\n⭐ XP: **${database[userId].xp}**`
      )

      .setTimestamp();



    message.channel.send({
      embeds: [embed]
    });


    if (
      now - database[userId].lastLevelDM >
      config.LEVEL_DM_COOLDOWN
    ) {


      message.author.send({

        embeds: [

          new EmbedBuilder()

          .setTitle("🏆 Level Up!")

          .setDescription(
            `עלית לרמה **${newLevel}** בשרת ELX_IL 🔥`
          )

          .setTimestamp()

        ]

      })
      .catch(() => {});


      database[userId].lastLevelDM = now;
      saveDatabase();

    }


  }


});
client.login(process.env.TOKEN);
