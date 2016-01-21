Meteor.publish("users", function(){
  return Meteor.users.find();
});

Meteor.publish("allItems", function(){
  Counts.publish(this, 'itemsCount', Items.Collection.find());
  Counts.publish(this, 'pendingItemsCount', Items.Collection.find({tweeted: false}));
  Counts.publish(this, 'tweetedItemsCount', Items.Collection.find({tweeted: true}));
});
