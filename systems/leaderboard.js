const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
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


function calculateLevel(xp) {

  return Math.floor(
    Math.sqrt(xp / 100)
  ) + 1;

}



async function createLeaderboard(
  client,
  guildId,
  type = "xp",
  viewerId
) {


  const database = loadDatabase();


  const guild =
    await client.guilds.fetch(guildId);



  let players = Object.entries(database)

  .filter(([id, data]) => data.xp > 0)

  .map(([id, data]) => {


    const member =
      guild.members.cache.get(id);



    return {

      id,

      name:
      member
      ? member.user.username
      : "משתמש לא נמצא",


      xp:
      data.xp || 0,


      level:
      calculateLevel(data.xp || 0),


      streak:
      data.streak || 0

    };


  });



  if(type === "xp") {

    players.sort(
      (a,b)=>b.xp-a.xp
    );

  }


  if(type === "level") {

    players.sort(
      (a,b)=>b.level-a.level
    );

  }


  if(type === "streak") {

    players.sort(
      (a,b)=>b.streak-a.streak
    );

  }



  const allPlayers = [...players];



  const top10 =
    players.slice(0,10);



  const title =
    type === "xp"
    ? "🏆 דירוג ELX_IL - XP"
    : type === "level"
    ? "🏆 דירוג ELX_IL - רמות"
    : "🏆 דירוג ELX_IL - סטריק";



  const embed =
  new EmbedBuilder()

  .setTitle(title)

  .setDescription(
    "📊 עשרת השחקנים המובילים בשרת\n"
  )

  .setTimestamp();



  let table = "";



  for(let i = 0; i < 10; i++){


    const player = top10[i];


    const place =
      i === 0 ? "🥇" :
      i === 1 ? "🥈" :
      i === 2 ? "🥉" :
      `${i+1}️⃣`;



    if(player){


      table +=

`${place} **${player.name}**
⭐ רמה: ${player.level}
💎 XP: ${player.xp}

`;

    } else {


      table +=

`${place} **אין שחקן**
⭐ רמה: -
💎 XP: -

`;

    }


  }



  embed.addFields({

    name:"🏆 Top 10",

    value:table

  });



  const myPlace =
    allPlayers.findIndex(
      p => p.id === viewerId
    ) + 1;



  if(
    viewerId &&
    myPlace > 10 &&
    allPlayers[myPlace - 1]
  ){

    const me =
      allPlayers[myPlace - 1];


    embed.addFields({

      name:"📍 המקום שלך",

      value:
`#${myPlace} **${me.name}**
⭐ רמה: ${me.level}
💎 XP: ${me.xp}`

    });

  }



  embed.setFooter({

    text:
    type === "xp"
    ? "דירוג לפי XP 💎"
    : type === "level"
    ? "דירוג לפי רמות 📈"
    : "דירוג לפי סטריק 🔥"

  });



  return embed;

}





function leaderboardButtons(){


return new ActionRowBuilder()

.addComponents(

new ButtonBuilder()
.setCustomId("lb_xp")
.setLabel("⭐ XP")
.setStyle(ButtonStyle.Primary),


new ButtonBuilder()
.setCustomId("lb_level")
.setLabel("📈 רמות")
.setStyle(ButtonStyle.Success),


new ButtonBuilder()
.setCustomId("lb_streak")
.setLabel("🔥 סטריק")
.setStyle(ButtonStyle.Danger)

);


}



module.exports = {

createLeaderboard,

leaderboardButtons

};
