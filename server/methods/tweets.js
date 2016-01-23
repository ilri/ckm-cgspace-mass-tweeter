intervalHandle = null;

Meteor.methods({
  tweetItems:function(items){
    this.unblock();
    var totalItems = items.length;
    var newTweets = 0;
    var currentUserName = Meteor.user().services.twitter.screenName;

    var keys = {
      consumer_key: Meteor.settings.twitter_consumer_key,
      consumer_secret: Meteor.settings.twitter_consumer_secret,
      access_token_key: Meteor.user().services.twitter.accessToken,
      access_token_secret: Meteor.user().services.twitter.accessTokenSecret,
    }

    var client = new Twitter(keys);

    console.log(Meteor.settings.twitter_consumer_key);
    console.log(Meteor.settings.twitter_consumer_secret);
    console.log(Meteor.user().services.twitter.accessToken);
    console.log(Meteor.user().services.twitter.accessTokenSecret);


    intervalHandle =  Meteor.setInterval(function(){
      var item = items.pop();
      item.title = item.title.substring(0, Meteor.settings.twitter_tweet_length - item.handle.length);

      Twitter.postAsync(client, 'statuses/update', {status: item.title + " " + item.handle},  function(error, tweet, response){
        if(error) throw error;
        // Update item tweeted status
        Items.Collection.update({_id: item._id}, {
          $set: { tweeted: true },
          $push: {
            tweets: {
              tweeter: currentUserName,
              tweetedOn: new Date()
            }
          }
        });
        // increment Tweets count
        newTweets++;
        // send progress percentage
        tweetEvent.emit("progress", newTweets, (newTweets/totalItems)*100 + "%");

        if(items.length == 0){
          // send tweeting completed event
          tweetEvent.emit("complete", newTweets);
        }
      });

      if(items.length == 0){
        // Break set interval
        Meteor.clearInterval(intervalHandle);
      }
    }, Meteor.settings.twitter_tweet_delay); // Delay 37 seconds before sending

  }
});
