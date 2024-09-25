const { Bot } = require("grammy");

// Create an instance of the `Bot` class and pass your bot token to it.
const bot = new Bot(process.env.TG_BOT_TOKEN); // <-- put your bot token between the ""


module.exports = {bot}