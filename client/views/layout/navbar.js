Template.navbar.helpers({
  username: function(){
    return "@" + Meteor.user().services.twitter.screenName;
  }
});
