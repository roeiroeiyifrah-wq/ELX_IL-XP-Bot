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



async function getPlayers(client, guildId, type) {

  const database = loadDatabase();

  const guild = await client.guilds.fetch(guildId);


  let players = Object.entries(database)
  .filter(([id, data]) => data.xp > 0)
  .map(([id, data]) => {

    const member = guild.members.cache.get(id);

    return {

      id,
      name: member ? member.user.username : "משתמש לא נמצא",
      xp: data.xp || 0,
      level: data.level || 1,
      streak: data.streak || 0

    };

  });



  if (type === "xp") {

    players.sort(
      (a,b) => b.xp - a.xp
    );

  }


  if (type === "level") {

    players.sort(
      (a,b) => b.level - a.level
    );

  }


  if (type === "streak") {

    players.sort(
      (a,b) => b.streak - a.streak
    );

  }


  return players.slice(0,10);

}





async function createLeaderboard(client, guildId, type="xp") {


  const players = await getPlayers(
    client,
    guildId,
    type
  );



  const embed = new EmbedBuilder()

  .setTitle("🏆 דירוג ELX_IL")

  .setDescription(
    "📊 עשרת השחקנים המובילים בשרת\n\n"
  )

  .setTimestamp();



  if (players.length === 0) {


    embed.addFields({

      name: "אין עדיין דירוג",

      value:
      "🔥 אף משתמש עדיין לא צבר XP"

    });


  } else {


    let text = "";


    players.forEach((player,index)=>{


      const medal =
      index === 0 ? "🥇" :
      index === 1 ? "🥈" :
      index === 2 ? "🥉" :
      `${index+1}.`;



      text +=

`${medal} **${player.name}**

⭐ רמה: ${player.level}
💎 XP: ${player.xp}

`;


    });



    embed.addFields({

      name: "🏆 Top 10",

      value: text

    });


  }



  embed.setFooter({

    text:
    "בחר קטגוריה מהכפתורים למטה"

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
