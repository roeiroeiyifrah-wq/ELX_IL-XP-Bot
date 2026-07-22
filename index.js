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
