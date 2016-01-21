Meteor.methods({
  tweetItems:function(items){

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

    // Tweet all selected items
    _.each(items, function(item){
      Twitter.postAsync(client, 'statuses/update', {status: item.title + " " + item.handle},  function(error, tweet, response){
        if(error) throw error;
        // Update item tweeted status
        Items.update({_id: item._id}, {$set: {
          tweeted: true,
          tweeter: Meteor.user().services.twitter.screenName,
          tweetedOn: new Date()
        }});
      });
    });
  }
});
