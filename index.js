const {
  EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const config = require("./config");


function loadDatabase(){

  if(!fs.existsSync("database.json")){
    return {};
  }

  return JSON.parse(
    fs.readFileSync("database.json")
  );

}



async function createLeaderboard(client, guildId){


  const database = loadDatabase();


  const guild =
    await client.guilds.fetch(guildId);



  let players = Object.entries(database)

  .filter(([id,data]) =>
    data.xp > 0
  )

  .map(([id,data])=>{


    const member =
      guild.members.cache.get(id);



    return {

      name:
      member
      ? member.user.username
      : "משתמש לא נמצא",


      xp:
      data.xp || 0

    };


  });



  players.sort(
    (a,b)=>b.xp-a.xp
  );



  players =
    players.slice(0,10);



  const embed =
  new EmbedBuilder()

  .setTitle("🏆 ELX_IL XP Leaderboard")

  .setDescription(
    "⭐ דירוג לפי XP בלבד"
  )

  .setTimestamp();



  let text = "";



  players.forEach((player,index)=>{


    const place =
      index === 0 ? "🥇" :
      index === 1 ? "🥈" :
      index === 2 ? "🥉" :
      `${index+1}.`;



    text +=

`${place} **${player.name}**
⭐ XP: **${player.xp}**

`;



  });



  if(!text){

    text = "אין עדיין נתוני XP";

  }



  embed.addFields({

    name:"Top 10",

    value:text

  });



  return embed;


}



module.exports = {

  createLeaderboard

};
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
// מערכת XP
// =====================


client.on("messageCreate", async message =>{


  if(message.author.bot) return;

  if(!message.guild) return;



  const userId =
    message.author.id;



  if(!database[userId]){


    database[userId] = {

      xp:0,

      level:1

    };


  }





  const now = Date.now();



  if(

    cooldowns[userId] &&

    now - cooldowns[userId] <
    config.XP.MESSAGE_COOLDOWN

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



  database[userId].level =
    newLevel;



  saveDatabase();






  if(newLevel > oldLevel){


    const role =
      levelRoles[newLevel];



    if(role){


      await message.member.roles.add(role)
      .catch(()=>{});


    }



  }



});
// =====================
// !leaderboard
// =====================


client.on("messageCreate", async message =>{


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





    await message.delete()
    .catch(()=>{});





    const msg =
      await message.channel.send({

        embeds:[

          await createLeaderboard(

            client,

            message.guild.id

          )

        ]

      });




    return;


  }






  // =====================
  // !xp
  // =====================


  if(message.content.startsWith("!xp")){



    setTimeout(()=>{

      message.delete()
      .catch(()=>{});

    },5000);






    if(
      message.author.id !==
      "1243097719262941224"
    ){



      const noAccess =
        await message.channel.send(
          "❌ אין לך גישה"
        );



      setTimeout(()=>{


        noAccess.delete()
        .catch(()=>{});


      },2000);



      return;

    }





    const args =
      message.content.split(" ");



    const user =
      message.mentions.users.first();



    const amount =
      Number(args[2]);





    if(!user || !amount) return;






    if(!database[user.id]){


      database[user.id] = {

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






    const owner =
      await client.users.fetch(
        "1243097719262941224"
      );




    owner.send({

      embeds:[

        new EmbedBuilder()

        .setTitle("📌 XP Log")

        .setDescription(

          `👤 מי נתן:\n${message.author.username}\n\n` +

          `🎯 למי:\n${user.username}\n\n` +

          `⭐ כמות:\n${amount} XP`

        )

        .setTimestamp()

      ]

    }).catch(()=>{});




  }



});






client.login(process.env.TOKEN);
