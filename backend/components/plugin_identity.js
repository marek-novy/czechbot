module.exports = function(controller) {
  controller.middleware.spawn.use(function(bot, next) {
    bot.identity = {
      name: "Botkit for Web",
      id: "web"
    };
  });

  controller.middleware.receive.use(function(bot, message, next) {
    if (!message.user) {
      next();
    } else {
      controller.storage.users.get(message.user, function(err, user) {
        if (!user) {
          user = {
            id: message.user,
            attributes: {}
          };
        }
        user.name = message.user.name;

        for (var key in message.user_profile) {
          if (key != "name" && key != "id") {
            user.attributes[key] = message.context[key];
          }
        }
        controller.storage.users.save(user, function(err) {
          next();
        });
      });
    }
  });
};
