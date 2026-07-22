require("dotenv").config();

const { REST, Routes } = require("discord.js");
const { readdirSync } = require("fs");

const commands = [];


const commandFiles = readdirSync("./commands")
.filter(file => file.endsWith(".js"));


for (const file of commandFiles) {

  const command = require(`./commands/${file}`);

  commands.push(
    command.data.toJSON()
  );

}


const rest = new REST({

  version:"10"

}).setToken(process.env.TOKEN);



(async()=>{


  try {


    console.log("מעלה פקודות Slash...");


    await rest.put(

      Routes.applicationCommands(
        process.env.CLIENT_ID
      ),

      {
        body: commands
      }

    );


    console.log("✅ הפקודות נטענו");


  } catch(error){

    console.error(error);

  }


})();
