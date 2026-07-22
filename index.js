require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const { readdirSync } = require("fs");

const config = require("./config");


const {
  createLeaderboard,
  leaderboardButtons
} = require("./systems/leaderboard");




// טעינת Slash Commands

const commands = new Map();


if (fs.existsSync("./commands")) {


  const commandFiles = readdirSync("./commands")
  .filter(file => file.endsWith(".js"));



  for (const file of commandFiles) {


    const command =
      require(`./commands/${file}`);



    commands.set(

      command.data.name,

      command

    );


  }

}





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





function saveDatabase(){


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





function getLevel(xp){


  return Math.floor(

    Math.sqrt(xp / 100)

  ) + 1;


}





client.once("ready",()=>{


  console.log(

    `✅ ELX_IL XP Bot מחובר בתור ${client.user.tag}`

  );


});







// =====================
// Slash Commands
// =====================


client.on("interactionCreate", async interaction => {



  if(interaction.isChatInputCommand()){



    const command =

      commands.get(

        interaction.commandName

      );



    if(!command) return;




    try {


      await command.execute(interaction);



    } catch(error){


      console.error(error);



      if(!interaction.replied){


        interaction.reply({

          content:"❌ הייתה שגיאה בפקודה",

          ephemeral:true

        });


      }


    }



    return;


  }





  // כפתורי לידרבורד


  if(!interaction.isButton()) return;




  let type = null;



  if(interaction.customId === "lb_xp")

    type = "xp";



  if(!type) return;




  await interaction.update({



    embeds:[


      await createLeaderboard(

        client,

        interaction.guild.id,

        "xp"

      )


    ],



    components:[

      leaderboardButtons()

    ]



  });



});
client.on("messageCreate", async message => {


  if(message.author.bot) return;

  if(!message.guild) return;



  const userId = message.author.id;



  if(!database[userId]){


    database[userId] = {

      xp:0,

      level:1

    };


  }





  const now = Date.now();



  if(

    cooldowns[userId] &&

    now - cooldowns[userId] < config.XP.MESSAGE_COOLDOWN

  ){

    return;

  }





  cooldowns[userId] = now;





  const oldLevel =

    database[userId].level;





  const xpGain =

    Math.floor(

      Math.random() *

      (config.XP.MAX - config.XP.MIN + 1)

    )

    + config.XP.MIN;





  database[userId].xp += xpGain;





  const newLevel =

    getLevel(

      database[userId].xp

    );





  database[userId].level = newLevel;



  saveDatabase();





  if(newLevel > oldLevel){



    const role = levelRoles[newLevel];



    if(role){


      await message.member.roles.add(role)

      .catch(()=>{});


    }





    const embed = new EmbedBuilder()


    .setTitle("🎉 עלית רמה!")


    .setDescription(

      `🔥 ${message.author.username} עלה לרמה **${newLevel}**\n\n⭐ XP: **${database[userId].xp}**`

    )


    .setTimestamp();





    message.channel.send({

      embeds:[embed]

    });



  }



});








client.on("messageCreate", async message => {



  if(message.author.bot) return;

  if(!message.guild) return;





  if(message.content === "!leaderboard"){



    if(

      !message.member.roles.cache.has(

        "1524447926213017720"

      )

    ){

      return;

    }





    await message.delete().catch(()=>{});





    const msg = await message.channel.send({



      embeds:[

        await createLeaderboard(

          client,

          message.guild.id,

          "xp"

        )

      ],



      components:[

        leaderboardButtons()

      ]



    });





    database.leaderboard = {


      channel: message.channel.id,

      message: msg.id


    };





    saveDatabase();



  }



});






client.login(process.env.TOKEN);
