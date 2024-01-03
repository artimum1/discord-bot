require("dotenv").config()
const fs = require("fs")
const path = require("path")
const { Client , Collection ,GatewayIntentBits ,Events } = require('discord.js');
const {token} = process.env;
const client = new Client({
  intents: ["Guilds","GuildMessages","MessageContent", GatewayIntentBits.Guilds],
});


client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}


client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});






client.on("ready",(c)=>{
    console.log(`✅ ${c.user.username} is online`)
})

client.on('messageCreate', (msg) => {

    if (msg.author.bot) return;


    if (msg.content.startsWith('!say')) {

        const msgContent = msg.content.slice('!say'.length).trim();


        msg.channel.send(msgContent);
  }
});


client.login(token);
