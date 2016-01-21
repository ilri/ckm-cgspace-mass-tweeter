Meteor.publish("users", function(){
  return Meteor.users.find();
});

Meteor.publish("Items", function(){
  Counts.publish(this, 'itemsCount', Items.find());
  Counts.publish(this, 'pendingItemsCount', Items.find({tweeted: false}));
  Counts.publish(this, 'tweetedItemsCount', Items.find({tweeted: true}));
  return Items.find({}, {sort: {createdDate: -1}});
});
