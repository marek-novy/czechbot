const deepmerge = require("deepmerge");
module.exports = function(controller, watsonMiddleware) {
  controller.on("quickresponse", (bot, message) => {
    const contextDelta = {
      quick_response: message.value
    };
    if (!message.text) {
      message.text = " ";
    }

    watsonMiddleware.sendToWatson(bot, message, contextDelta, () => {
      watsonMiddleware.readContext(message.user, context => {
        // Reset quick_response in local context for user
        const contextDelta = {
          quick_response: ""
        };
        console.log("quick reply", message);
        if (message.watsonError) {
          bot.reply(message, "Omlouvám se ale z technických důvodů nezvládnu odpovědět. ");
        } else {
          bot.reply(message, message.watsonData.output);
        }

        watsonMiddleware.updateContext(message.user, context, () => {});
      });
    });
  });
};
