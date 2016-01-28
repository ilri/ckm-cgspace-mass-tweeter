Template.settings.helpers({
  communities: function(){
    return Communities.find({}, {sort: {name: 1}});
  }
});

Template.settings.events({

});

Template.settings.onRendered(function(){

});
