require("dotenv").config();

const { REST, Routes } = require("discord.js");
const { readdirSync } = require("fs");


const commands = [];


const commandFiles = readdirSync("./commands")
.filter(file => file.endsWith(".js"));



for (const file of commandFiles) {

  const command =
    require(`./commands/${file}`);


  commands.push(
    command.data.toJSON()
  );

}



const rest = new REST({

  version: "10"

}).setToken(process.env.TOKEN);



(async()=>{


  try {


    console.log("מעלה Slash Commands...");



    await rest.put(

      Routes.applicationGuildCommands(

        process.env.CLIENT_ID,

        "1524428142129840269"

      ),


      {

        body: commands

      }

    );



    console.log("✅ הפקודות נטענו לשרת");


  } catch(error){


    console.error(error);


  }


})();
