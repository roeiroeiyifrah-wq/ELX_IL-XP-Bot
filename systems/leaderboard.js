const {
  EmbedBuilder
} = require("discord.js");

const fs = require("fs");


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
