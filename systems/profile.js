const {
  EmbedBuilder
} = require("discord.js");

const fs = require("fs");


function loadDatabase() {

  if (!fs.existsSync("database.json")) {
    return {};
  }

  return JSON.parse(
    fs.readFileSync("database.json")
  );

}



function getLevel(xp){

  return Math.floor(
    Math.sqrt(xp / 100)
  ) + 1;

}



function getRank(database, userId){


  let players = Object.entries(database)

  .filter(([id,data]) => data.xp > 0)

  .sort((a,b)=>b[1].xp-a[1].xp);



  const place =
    players.findIndex(
      p => p[0] === userId
    ) + 1;



  return place || "אין דירוג";

}





function createProfile(member){


  const database = loadDatabase();



  const data =
    database[member.id] || {

      xp:0,
      streak:0

    };



  const xp =
    data.xp || 0;



  const level =
    getLevel(xp);



  const rank =
    getRank(
      database,
      member.id
    );



  const embed =
  new EmbedBuilder()

  .setTitle(
    `👤 הפרופיל של ${member.user.username}`
  )

  .addFields(

    {
      name:"📈 רמה",
      value:`${level}`,
      inline:true
    },


    {
      name:"💎 XP",
      value:`${xp}`,
      inline:true
    },


    {
      name:"🏆 מקום בדירוג",
      value:`#${rank}`,
      inline:true
    },


    {
      name:"🔥 סטריק",
      value:`${data.streak || 0} ימים`,
      inline:true
    }


  )

  .setTimestamp();



  return embed;

}



module.exports = {

  createProfile

};
