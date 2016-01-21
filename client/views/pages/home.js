selectedItemsCount = new ReactiveVar(0);

fetchEvent.addListener('complete', function(newAdditions) {
    toastr.success(newAdditions + " CGSpace items imported", "Success!");
});

Template.home.helpers({
  totalItems: function(){
    return Counts.get("pendingItemsCount");
  },
  totalTweetedItems: function(){
    return Counts.get("tweetedItemsCount");
  },
  selectedItemsCount: function () {
    return selectedItemsCount.get();
  }
});

Template.home.events({
  "change #all-items": function (e, t) {
    if (e.target.checked) {
      t.$("table tbody tr>td input").prop("checked", true);
      Session.set("isNotificationSelected", true);
    } else {
      t.$("table tbody tr>td input").prop("checked", false);
      Session.set("isNotificationSelected", false);
    }
    t.$("table tbody tr>td input").trigger("change");
  },
  "change input.item-selected": function(e, t){
    if (e.target.checked) {
      selectedItemsCount.set(selectedItemsCount.get() + 1);
      if(t.$("table tbody tr>td input:checked").length == t.$("table tbody tr>td input").length){
        t.$("input#all-items").prop("checked", true);
      }
    } else {
      selectedItemsCount.set(selectedItemsCount.get() - 1);
      t.$("input#all-items").prop("checked", false);
    }
  },
  "click #fetch-items": function (e, t) {
    var minNumberOfItems = parseInt(t.$("#items-to-fetch").attr("min"), 10);
    var newNumberOfItems = parseInt(t.$("#items-to-fetch").val(), 10);
    var maxNumberOfItems = parseInt(t.$("#items-to-fetch").attr("max"), 10);

    if(newNumberOfItems < minNumberOfItems){
      newNumberOfItems = minNumberOfItems;
    } else if(newNumberOfItems > maxNumberOfItems){
      newNumberOfItems = maxNumberOfItems;
    }
    Meteor.call("getCGSpaceItems", {limit: newNumberOfItems, offset: 0}, function(error){
      if(error) {
        toastr.error(error, "Error while getting items from CGSpace, please try again!");
      } else {
        toastr.info("CGSpace items are being imported.", "Import Started");
      }
    });
  }
});

Template.item.helpers({
  lastModified: function(){
    return moment(this.lastModified).format('YYYY MM DD');
  }
});

Template.itemSelect.helpers({
  alreadyTweeted: function(){
    return this.tweeted;
  }
});

Template.itemSelect.onRendered(function(){
  $.material.checkbox();
  $("input#all-items").prop("checked", false);
  selectedItemsCount.set($("table tbody tr>td input:checked").length);
});
