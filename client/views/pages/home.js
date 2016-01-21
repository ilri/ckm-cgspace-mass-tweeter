itemsPaginator = new Paginator(Items, 50);
selectedItemsCount = new ReactiveVar(0);

Template.home.helpers({
  items: function(){
    if(Session.equals("pendingOnly", true)){
      return itemsPaginator.pagedItems({find: {tweeted: false}});
    } else {
      return itemsPaginator.pagedItems({});
    }
  },
  itemsPaginator: function(){
    return itemsPaginator;
  },
  totalItems: function(){
    if(Session.equals("pendingOnly", true)){
      return Counts.get("pendingItemsCount");
    } else {
      return Counts.get("itemsCount");
    }
  },
  totalTweetedItems: function(){
    return Counts.get("tweetedItemsCount");
  },
  currentPage: function(){
    return itemsPaginator.currentPage.get();
  },
  pageRange: function(){
    return "1 - " + itemsPaginator.totalPages();
  },
  maxPage: function(){
    return itemsPaginator.totalPages();
  },
  alreadyTweeted: function(){
    return this.tweeted ? "info" : "";
  },
  selectedItemsCount: function () {
    return selectedItemsCount.get();
  },
  lastModified: function(){
    return moment(this.lastModified).format('YYYY MM DD');
  },
  hasBeenTweeted: function(){
    return this.tweeted ? "checked='checked'" : "";
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
  "change input#show-pending": function (e, t) {
    if (e.target.checked) {
      Session.set("pendingOnly", true);
    } else {
      Session.set("pendingOnly", null);
    }
  },
  "change input#change-page-number": function (e, t) {
    t.$("input#all-items, table tbody tr>td input").prop("checked", false);
    selectedItemsCount.set(0);
    var newValue = e.target.value;
    if ( newValue >= 1 && newValue <= parseInt(e.target.attributes["max"].value, 10)) {
      itemsPaginator.currentPage.set(newValue);
    }
  },
  "click #tweet-items": function (e, t) {
     var selectedItems = _.map(t.findAll("table tr td input:checked"), function (checkbox) {
      return {
        _id: checkbox.value,
        title: checkbox.dataset.itemTitle,
        handle: checkbox.dataset.itemHandle
      };
    });
    Meteor.call("tweetItems", selectedItems);
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
        toastr.success("CGSpace items imported", "Success!");
      }
    });
  }
});


Template.itemSelect.helpers({
  alreadyTweeted: function(){
    return this.tweeted;
  }
});

Template.itemSelect.onRendered(function(){
  $.material.checkbox();
});
