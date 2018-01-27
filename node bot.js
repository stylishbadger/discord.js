"use strict";

var Discord = require("discord.js");
var fs = require('fs');

var bot = new Discord.Client({autoReconnect: true});

bot.OWNERID = '<BobAndVegene>';
bot.PREFIX = '<y:>';
bot.TOKEN = '<NDA2ODk3NjY5Mzg3MzIxMzQ2.DU6ITQ.Zkeo5VNLttqhBBxlOc2bHziy5fQ>';

bot.DETAILED_LOGGING = false;
bot.DELETE_COMMANDS = false;

bot.COLOR = 0x351C75;
bot.SUCCESS_COLOR = 0x00ff00;
bot.ERROR_COLOR = 0x0000ff;
bot.INFO_COLOR = 0x0000ff;

String.prototype.padRight = function(l,c) {return this+Array(l-this.length+1).join(c||" ")}

bot.sendNotification = function(info, type, msg) {
	var icolor;
	
	if(type == "success") icolor = bot.SUCCESS_COLOR;
	else if(type == "error") icolor = bot.ERROR_COLOR;
	else if(type == "info") icolor = bot.INFO_COLOR;
	else icolor = bot.COLOR;
	
	let embed = {
		color: icolor,
		description: info
	}
	msg.channel.sendMessage('', {embed});
}

var commands = {}

commands.help = {};
commands.help.args = '';
commands.help.help = "Displays a list of usable commands.";
commands.help.main = function(bot, msg) {
    var cmds = [];
	
	for (let command in commands) {
        if (!commands[command].hide) {
			cmds.push({
				name: bot.PREFIX + command,
				value: commands[command].help,
				inline: true
			});
        }
    }
	
	let embed = {
		color: bot.COLOR,
		description: "Here are a list of commands you can use.",
		fields: cmds,
		footer: {
			icon_url: bot.user.avatarURL,
			text: bot.user.username
		}
	}
	
	msg.channel.sendMessage('', {embed});
}

commands.load = {};
commands.load.args = '<command>';
commands.load.help = '';
commands.load.hide = true;
commands.load.main = function(bot, msg) {
    if(msg.author.id == bot.OWNERID) {
		try {
			delete commands[msg.content];
			delete require.cache[__dirname+'/commands/'+ msg.content +'.js'];
			commands[msg.content] = require(__dirname+'/commands/'+ msg.content +'.js');
			bot.sendNotification("Loaded " + msg.content + ".js succesfully.", "success", msg);
		} catch(err) {
			bot.sendNotification("The command was not found, or there was an error loading it.", "error", msg);
		}
    }else {
		bot.sendNotification("You do not have permission to use this command.", "error", msg);
	}
}

commands.unload = {};
commands.unload.args = '<command>';
commands.unload.help = '';
commands.unload.hide = true;
commands.unload.main = function(bot, msg) {
    if (msg.author.id == bot.OWNERID){
        try {
            delete commands[msg.content];
            delete require.cache[__dirname+'/commands/' + msg.content + '.js'];
            bot.sendNotification("Unloaded " + msg.content + ".js succesfully.", "success", msg);
        }
        catch(err){
			bot.sendNotification("Command not found.", "error", msg);
        }
    }else {
		bot.sendNotification("You do not have permission to use this command.", "error", msg);
	}
}

commands.reload = {};
commands.reload.args = '';
commands.reload.help = '';
commands.reload.hide = true;
commands.reload.main = function(bot, msg) {
    if (msg.author.id == bot.OWNERID){
        try {
            delete commands[msg.content];
            delete require.cache[__dirname+'/commands/' + msg.content +'.js'];
            commands[args] = require(__dirname+'/commands/' + msg.content +'.js');
            bot.sendNotification("Reloaded " + msg.content + ".js successfully.", "success", msg);
        }
        catch(err){
            msg.channel.sendMessage("Command not found");
        }
    }else {
		bot.sendNotification("You do not have permission to use this command.", "error", msg);
	}
}

var loadCommands = function() {
    var files = fs.readdirSync(__dirname+'/commands');
    for (let file of files) {
        if (file.endsWith('.js')) {
            commands[file.slice(0, -3)] = require(__dirname+'/commands/'+file);
			if(bot.DETAILED_LOGGING) console.log("Loaded " + file);
        }
    }
    console.log("———— All Commands Loaded! ————");
}

var checkCommand = function(msg, isMention) {
	if(isMention) {
		var command = msg.content.split(" ")[1];
		msg.content = msg.content.split(" ").splice(2, msg.content.split(' ').length).join(' ');
		if(command) commands[command].main(bot, msg);
	}else {
		var command = msg.content.split(bot.PREFIX)[1].split(" ")[0];
		msg.content = msg.content.replace(bot.PREFIX + command + " ", "");
		if(command) commands[command].main(bot, msg);
	}
}

bot.on("ready", () => {
    console.log('Ready to begin! Serving in ' + bot.guilds.array().length + ' servers.');
    bot.user.setStatus("online", "");
    loadCommands();
});

bot.on("message", msg => {
    if(msg.content.startsWith('<@'+bot.user.id+'>') || msg.content.startsWith('<@!'+bot.user.id+'>')) {
		checkCommand(msg, true);
		if(bot.DELETE_COMMANDS) msg.delete();
    }else if (msg.content.startsWith(bot.PREFIX)) {
		checkCommand(msg, false);
		if(bot.DELETE_COMMANDS) msg.delete();
    }
});

bot.on('error', (err) => {
    console.log("————— BIG ERROR —————");
    console.log(err);
    console.log("——— END BIG ERROR ———");
});

bot.on("disconnected", () => {
	console.log("Disconnected!");
});

bot.login(bot.TOKEN);
