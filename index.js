require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder
} = require("discord.js");

const fs = require("fs");

const config = require("./config");

const {
  createLeaderboard
} = require("./systems/leaderboard");



const client = new Client({

  intents:[

    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers

  ]

});



let database = {};



if(fs.existsSync("database.json")){

  database = JSON.parse(
    fs.readFileSync("database.json")
  );

}



function saveDatabase(){

  fs.writeFileSync(
    "database.json",
    JSON.stringify(database,null,2)
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





// XP מהודעות

client.on("messageCreate", async message=>{


  if(message.author.bot) return;

  if(!message.guild) return;



  const id = message.author.id;



  if(!database[id]){

    database[id]={

      xp:0,
      level:1

    };

  }



  if(
    cooldowns[id] &&
    Date.now()-cooldowns[id] < config.XP.MESSAGE_COOLDOWN
  ){

    return;

  }



  cooldowns[id]=Date.now();



  database[id].xp +=

    Math.floor(

      Math.random() *

      (config.XP.MAX - config.XP.MIN + 1)

    )

    + config.XP.MIN;



  const newLevel =
    getLevel(database[id].xp);



  if(newLevel > database[id].level){


    database[id].level = newLevel;



    const role =
      levelRoles[newLevel];



    if(role){

      await message.member.roles.add(role)
      .catch(()=>{});

    }


  }



  saveDatabase();


});
// בדיקת מקום ראשון ונתינת XP_KING

async function updateXPKing(guild){


  const users = Object.entries(database)
  
  .filter(([id,data]) => data.xp > 0)

  .sort((a,b)=> b[1].xp - a[1].xp);



  if(!users[0]) return;



  const kingId = users[0][0];



  const role =
    guild.roles.cache.get(
      config.ROLES.XP_KING
    );



  if(!role) return;



  for(const [id] of users){


    const member =
      guild.members.cache.get(id);



    if(member){

      if(id === kingId){

        if(!member.roles.cache.has(role.id)){

          await member.roles.add(role)
          .catch(()=>{});

        }


      } else {


        if(member.roles.cache.has(role.id)){

          await member.roles.remove(role)
          .catch(()=>{});

        }


      }

    }

  }


}







// !leaderboard

client.on("messageCreate", async message=>{


  if(message.author.bot) return;

  if(!message.guild) return;



  if(message.content === "!leaderboard"){



    if(
      !message.member.roles.cache.has(
        config.ROLES.STAFF
      )
    ){

      return;

    }



    await message.delete()
    .catch(()=>{});



    message.channel.send({

      embeds:[

        await createLeaderboard(
          client,
          message.guild.id
        )

      ]

    });


  }


});






// !xp

client.on("messageCreate", async message=>{


  if(message.author.bot) return;



  if(!message.content.startsWith("!xp"))
    return;



  setTimeout(()=>{

    message.delete()
    .catch(()=>{});

  },5000);





  if(message.author.id !== "1243097719262941224"){



    const msg =
      await message.channel.send(
        "❌ אין לך גישה"
      );


    setTimeout(()=>{

      msg.delete()
      .catch(()=>{});

    },2000);


    return;

  }





  const user =
    message.mentions.users.first();



  const amount =
    Number(
      message.content.split(" ")[2]
    );



  if(!user || !amount)
    return;





  if(!database[user.id]){


    database[user.id]={

      xp:0,
      level:1

    };


  }





  database[user.id].xp += amount;



  database[user.id].level =
    getLevel(
      database[user.id].xp
    );



  saveDatabase();





  await updateXPKing(
    message.guild
  );





  const owner =
    await client.users.fetch(
      "1243097719262941224"
    );



  owner.send({

    embeds:[

      new EmbedBuilder()

      .setTitle("📌 XP Log")

      .setDescription(

        `👤 מי נתן:\n${message.author.username}\n\n`+

        `🎯 למי:\n${user.username}\n\n`+

        `⭐ כמות:\n${amount} XP\n\n`+

        `📊 XP עכשיו:\n${database[user.id].xp}`

      )

      .setTimestamp()

    ]

  }).catch(()=>{});



});
client.login(process.env.TOKEN);
