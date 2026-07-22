const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const fs = require("fs");

const config = require("../config");


function getFakePlayers() {

  return [
    { name: "NoLife_Gamer", xp: 999999, level: 99 },
    { name: "BananaKing 🍌", xp: 888888, level: 88 },
    { name: "XP_Monster", xp: 777777, level: 77 },
    { name: "KeyboardWarrior", xp: 666666, level: 66 },
    { name: "AFK_Legend", xp: 555555, level: 55 },
    { name: "WiFi_Hunter", xp: 444444, level: 44 },
    { name: "Loading_99%", xp: 333333, level: 33 },
    { name: "TheRealBot", xp: 222222, level: 22 },
    { name: "Grass_Toucher", xp: 111111, level: 11 },
    { name: "PotatoDestroyer", xp: 99999, level: 10 }
  ];

}


function createLeaderboard(type) {


  let database = {};

  if (fs.existsSync("database.json")) {

    database = JSON.parse(
      fs.readFileSync("database.json")
    );

  }


  let players = Object.entries(database)
    .map(([id, data]) => {

      return {
        id,
        xp: data.xp || 0,
        level: data.level || 1,
        streak: data.streak || 0
      };

    });


  if (players.length < 10) {

    players = players.concat(
      getFakePlayers()
    );

  }


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



function leaderboardEmbed(type) {


  const players = createLeaderboard(type);


  let text = "";


  players.forEach((player,index)=>{


    let medal =
      index === 0 ? "🥇" :
      index === 1 ? "🥈" :
      index === 2 ? "🥉" :
      `${index+1}.`;


    text +=
`${medal} **${player.name || "Player"}**
⭐ Level: ${player.level}
💎 XP: ${player.xp}

`;

  });



  return new EmbedBuilder()

    .setTitle("🏆 ELX_IL GLOBAL LEADERBOARD")

    .setDescription(text)

    .setFooter({
      text:"Choose a category below 🔥"
    })

    .setTimestamp();

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
    .setLabel("📈 Levels")
    .setStyle(ButtonStyle.Success),


    new ButtonBuilder()
    .setCustomId("lb_streak")
    .setLabel("🔥 Streak")
    .setStyle(ButtonStyle.Danger)

  );

}



module.exports = {
  leaderboardEmbed,
  leaderboardButtons
};
