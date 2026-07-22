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



async function createLeaderboard(client, guildId, type = "xp") {


  const database = loadDatabase();


  const guild = await client.guilds.fetch(guildId);



  let players = Object.entries(database)

  .filter(([id, data]) => data.xp > 0)

  .map(([id, data]) => {


    const member =
      guild.members.cache.get(id);



    return {

      id: id,

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



  if (type === "xp") {

    players.sort(
      (a,b)=>b.xp-a.xp
    );

  }


  if (type === "level") {

    players.sort(
      (a,b)=>b.level-a.level
    );

  }


  if (type === "streak") {

    players.sort(
      (a,b)=>b.streak-a.streak
    );

  }



  players = players.slice(0,10);



  const embed =
  new EmbedBuilder()

  .setTitle("🏆 דירוג ELX_IL")

  .setDescription(
    "📊 עשרת המקומות הראשונים בשרת\n\n"
  )

  .setTimestamp();



  let table = "";



  for (let i = 0; i < 10; i++) {


    const player = players[i];



    const place =
      i === 0 ? "🥇" :
      i === 1 ? "🥈" :
      i === 2 ? "🥉" :
      `${i + 1}️⃣`;



    if (player) {


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



  embed.setFooter({

    text:
    "הדירוג מבוסס על נתוני השרת בלבד"

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
