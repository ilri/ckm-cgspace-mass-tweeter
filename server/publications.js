Meteor.publish("users", function(){
  return Meteor.users.find();
});

Meteor.publish("allItems", function(){
  Counts.publish(this, 'totalItemsCount', Items.Collection.find());
  Counts.publish(this, 'pendingItemsCount', Items.Collection.find({tweeted: false}));
  Counts.publish(this, 'tweetedItemsCount', Items.Collection.find({tweeted: true}));
});


Meteor.publish("communities", function(){
  Counts.publish(this, 'communitiesWithHashtags', Communities.find({hashtags: {$exists: true}}));
  Counts.publish(this, 'communitiesWithMentions', Communities.find({mentions: {$exists: true}}));
  return Communities.find();
});