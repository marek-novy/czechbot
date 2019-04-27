module.exports = function(controller) {
  controller.hears([".*"], ["message_received"], function(bot, message) {
    console.log(message);

    if (message.watsonError) {
      bot.reply(message, "Omlouvám se ale z technických důvodů nezvládnu odpovědět.");
    } else {
      bot.reply(message, message.watsonData.output);
    }
  });
};
