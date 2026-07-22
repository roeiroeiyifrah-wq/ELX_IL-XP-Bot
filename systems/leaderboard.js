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

  .filter(([id,data]) => data.xp > 0)

  .map(([id,data])=>{


    const member =
      guild.members.cache.get(id);



    return {

      name:
      member
      ? member.user.username
      : "אין שם",

      xp:
      data.xp || 0

    };


  });



  players.sort(
    (a,b)=>b.xp-a.xp
  );



  let text = "";



  for(let i = 0; i < 10; i++){


    const player = players[i];


    const place =
      i === 0 ? "🥇" :
      i === 1 ? "🥈" :
      i === 2 ? "🥉" :
      `${i + 1}.`;



    if(player){

      text +=
`${place} **${player.name}**
⭐ XP: **${player.xp}**

`;

    } else {

      text +=
`${place} **אין שם**
⭐ XP: **0**

`;

    }

  }



  return new EmbedBuilder()

  .setTitle("🏆 ELX_IL XP Leaderboard")

  .setDescription("⭐ דירוג לפי XP בלבד")

  .addFields({

    name:"Top 10",

    value:text

  })

  .setTimestamp();


}



module.exports = {
  createLeaderboard
};
