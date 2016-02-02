intervalHandle = null;
tweetSettings = new ReactiveVar({});

itemTitle = function(item){
    var remainingStatusLength = item.handle.length;
    remainingStatusLength += item.hashtags ? item.hashtags.length : 0;
    remainingStatusLength += item.mentions ? item.mentions.length : 0;
    return item.title.substring(0, Meteor.settings.twitter_tweet_length - remainingStatusLength);
};

itemStatus = function(item){
    var status = itemTitle(item);
    status = item.hashtags ? status + " " + item.hashtags : status;
    status = item.mentions ? status + " " + item.mentions : status;
    return status + " " + item.handle;
};

tweetItem = function() {
    var settings = tweetSettings.get();

    if (settings.items && settings.items.length > 0) {
        var item = settings.items.pop();

        Twitter.postAsync(settings.client, 'statuses/update', {status: itemStatus(item)}, function (error) {
            if (error) throw error;
            // Update item tweeted status
            Items.Collection.update({_id: item._id}, {
                $set: {tweeted: true},
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
            tweetEvent.emit("progress", settings.newTweets, (settings.newTweets / settings.totalItems) * 100 + "%");

            // update tweet setting
            tweetSettings.set(settings);

            if(tweetSettings.get().items.length == 0){
                // send tweeting completed event
                tweetEvent.emit("complete", settings.newTweets);

                // clear tweet setting
                tweetSettings.set({});

                // Break set interval
                Meteor.clearInterval(intervalHandle);
            }
        });
    } else {
        // send tweeting completed event
        tweetEvent.emit("complete", settings.newTweets);

        // clear tweet setting
        tweetSettings.set({});

        // Break set interval
        Meteor.clearInterval(intervalHandle);
    }
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

        // check if there are more items
        if(tweetSettings.get().items){
            intervalHandle =  Meteor.setInterval(tweetItem, Meteor.settings.twitter_tweet_delay); // Delay 37 seconds before sending
        }

    }
});
