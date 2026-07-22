const {
  SlashCommandBuilder
} = require("discord.js");

const fs = require("fs");


module.exports = {

  data: new SlashCommandBuilder()

    .setName("givexp")

    .setDescription("נותן XP למשתמש")

    .addUserOption(option =>

      option
      .setName("user")
      .setDescription("למי לתת XP")
      .setRequired(true)

    )

    .addIntegerOption(option =>

      option
      .setName("amount")
      .setDescription("כמה XP לתת")
      .setRequired(true)

    ),



  async execute(interaction) {


    // רק אתה

    if(
      interaction.user.id !==
      "1243097719262941224"
    ){

      return interaction.reply({

        content:"אין לך הרשאה להשתמש בפקודה הזאת.",

        ephemeral:true

      });

    }




    let database = {};


    if(fs.existsSync("database.json")){


      database = JSON.parse(

        fs.readFileSync("database.json")

      );


    }




    const user =

      interaction.options.getUser("user");



    const amount =

      interaction.options.getInteger("amount");




    if(!database[user.id]){


      database[user.id] = {

        xp:0,

        level:1

      };


    }




    database[user.id].xp += amount;




    fs.writeFileSync(

      "database.json",

      JSON.stringify(database,null,2)

    );




    await interaction.reply({

      content:

      `✅ נוספו **${amount} XP** ל־${user.username}`,

      ephemeral:true

    });


  }

};
