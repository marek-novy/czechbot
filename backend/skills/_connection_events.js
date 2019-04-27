/* This module kicks in if no Botkit Studio token has been provided */

module.exports = function(controller, watsonMiddleware) {
  controller.on("hello", helloEventHandle);
  controller.on("welcome_back", helloEventHandle);

  function helloEventHandle(bot, message) {
    console.log("Hello event");
    message.text = "";
    message.type = "welcome";

    watsonMiddleware.sendToWatson(bot, message, {}, function() {
      if (message.watsonError) {
        bot.reply(message, "Omlouvám se ale z technických důvodů nezvládnu odpovědět.");
      } else {
        bot.reply(message, message.watsonData.output);
      }
    });
  }

  controller.hears(["help", "contact", "documentation", "docs", "community"], ["message_received"], function(bot, message) {
    console.log("Specific word ********************************************");
  });
};
