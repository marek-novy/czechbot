module.exports = function(controller) {

  if (controller.storage && controller.storage.history) {

    function logMessage(message, user) {

        if (message.type == 'message' || message.type == 'message_received') {
          controller.storage.history.addToHistory(message, message.user).catch(function(err) {
            console.error('Error storing history: ',err);
          })
        }
    }

    // log incoming messages to the user history
    controller.middleware.receive.use(function(bot, message, next) {
        controller.storage.users.get(message.user, function(err, user) {
            logMessage(message,user);
        });
        next();
    });


    controller.middleware.format.use(function(bot, message, platform_message, next) {
        controller.storage.users.get(message.to, function(err, user) {
            logMessage(platform_message,user);
        });
        next();
    });

  } else {
    console.log("Configure a MONGO_URI to enable message history");
    controller.webserver.post('/botkit/history', function(req, res) {
      res.json({success:true, history: []});
    });
  }

}
