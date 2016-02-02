intervalHandle = null;
tweetSettings = new ReactiveVar({});

tweetItem = function(){
    var settings = tweetSettings.get();
    var item = settings.items.pop();

    item.title = item.title.substring(0, Meteor.settings.twitter_tweet_length - (item.handle.length + item.hashtags.length + item.mentions.length + 3));
    var statusText = item.title + " " +  item.hashtags + " " +  item.mentions + " " + item.handle;

    Twitter.postAsync(settings.client, 'statuses/update', {status: statusText},  function(error){
        if(error) throw error;
        // Update item tweeted status
        Items.Collection.update({_id: item._id}, {
            $set: { tweeted: true },
            $push: {
                tweets: {
                    tweeter: settings.userName,
                    tweetedOn: new Date()
                }
            }
        });
        // increment Tweets count
        settings.newTweets++;
        // send progress percentage
        tweetEvent.emit("progress", settings.newTweets, (settings.newTweets/settings.totalItems)*100 + "%");

        if(settings.items.length == 0){
            // send tweeting completed event
            tweetEvent.emit("complete", settings.newTweets);
        }
    });

    if(settings.items.length == 0){
        // Break set interval
        Meteor.clearInterval(intervalHandle);
    }

    tweetSettings.set(settings);
};

Meteor.methods({
    tweetItems:function(items){
        this.unblock();

        var settings = {
            items: items,
            totalItems: items.length,
            newTweets: 0,
            userName: Meteor.user().services.twitter.screenName,
            client: new Twitter({
                consumer_key: Meteor.settings.twitter_consumer_key,
                consumer_secret: Meteor.settings.twitter_consumer_secret,
                access_token_key: Meteor.user().services.twitter.accessToken,
                access_token_secret: Meteor.user().services.twitter.accessTokenSecret,
            })
        };

        tweetSettings.set(settings);
        tweetItem();

        intervalHandle =  Meteor.setInterval(tweetItem, Meteor.settings.twitter_tweet_delay); // Delay 37 seconds before sending
    }
});
