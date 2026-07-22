const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const fs = require("fs");


module.exports = {

  data: new SlashCommandBuilder()

    .setName("profile")

    .setDescription("מציג את הפרופיל שלך")

    .addUserOption(option =>

      option

      .setName("user")

      .setDescription("צפייה בפרופיל של משתמש אחר (צוות בלבד)")

      .setRequired(false)

    ),



  async execute(interaction) {


    const database =

      fs.existsSync("database.json")

      ? JSON.parse(fs.readFileSync("database.json"))

      : {};



    const teamRole = "1524447926213017720";



    const target =

      interaction.options.getUser("user")

      || interaction.user;



    // אם מנסים לראות מישהו אחר בלי צוות

    if(

      target.id !== interaction.user.id &&

      !interaction.member.roles.cache.has(teamRole)

    ){

      return interaction.reply({

        content:"אין לך הרשאה לראות פרופיל של משתמש אחר.",

        ephemeral:true

      });

    }



    const data =

      database[target.id] || {

        xp:0,

        level:1,

        streak:0

      };



    const embed =

    new EmbedBuilder()

    .setTitle(`👤 הפרופיל של ${target.username}`)

    .addFields(

      {

        name:"📈 רמה",

        value:`${data.level || 1}`,

        inline:true

      },

      {

        name:"💎 XP",

        value:`${data.xp || 0}`,

        inline:true

      },

      {

        name:"🔥 סטריק",

        value:`${data.streak || 0}`,

        inline:true

      }

    )

    .setTimestamp();



    await interaction.reply({

      embeds:[embed],

      ephemeral:true

    });


  }

};
