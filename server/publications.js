Meteor.publish("users", function(){
    return Meteor.users.find();
});

Meteor.publish("Items", function(){
    return Items.find({}, {sort: {createdDate: -1}});
});
