require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder
} = require("discord.js");

const fs = require("fs");

const config = require("./config");

const {
  leaderboardEmbed,
  leaderboardButtons
} = require("./systems/leaderboard");


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

  return Math.floor(
    Math.sqrt(xp / 100)
  ) + 1;

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



  const newLevel =
    getLevel(database[userId].xp);



  database[userId].level = newLevel;


  saveDatabase();



  if (newLevel > oldLevel) {



    const newRole = levelRoles[newLevel];


    if (newRole) {

      await message.member.roles.add(newRole)
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

      .setTitle("🎉 Level Up!")

      .setDescription(
        `🔥 ${message.author} עלה לרמה **${newLevel}**!\n\n⭐ XP: **${database[userId].xp}**`
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

          .setTitle("🏆 עלית רמה!")

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
client.on("interactionCreate", async interaction => {


  if (!interaction.isButton()) return;



  if (interaction.customId === "lb_xp") {

    await interaction.update({

      embeds: [
        leaderboardEmbed("xp")
      ],

      components: [
        leaderboardButtons()
      ]

    });

  }




  if (interaction.customId === "lb_level") {

    await interaction.update({

      embeds: [
        leaderboardEmbed("level")
      ],

      components: [
        leaderboardButtons()
      ]

    });

  }




  if (interaction.customId === "lb_streak") {

    await interaction.update({

      embeds: [
        leaderboardEmbed("streak")
      ],

      components: [
        leaderboardButtons()
      ]

    });

  }



});




client.on("messageCreate", async message => {

  if (message.author.bot) return;

  if (message.content === "!leaderboard") {


    if (database.leaderboard) {

      try {

        const channel = await client.channels.fetch(
          database.leaderboard.channel
        );

        const oldMessage = await channel.messages.fetch(
          database.leaderboard.message
        );


        await oldMessage.edit({

          embeds: [
            leaderboardEmbed("xp")
          ],

          components: [
            leaderboardButtons()
          ]

        });

        return;


      } catch {

        delete database.leaderboard;
        saveDatabase();

      }

    }


    const newMessage = await message.channel.send({

      embeds: [
        leaderboardEmbed("xp")
      ],

      components: [
        leaderboardButtons()
      ]

    });


    database.leaderboard = {

      channel: message.channel.id,
      message: newMessage.id

    };


    saveDatabase();


  }

});
client.login(process.env.TOKEN);
