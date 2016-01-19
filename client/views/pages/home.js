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
      return Items.find({tweeted: false}).count();
    } else {
      return Items.find().count()
    }
  },
  totalTweetedItems: function(){
    return Items.find({tweeted: true}).count();
  },
  showingItems: function(){
    var finalPageEntries = Items.find({}, {
      skip: (itemsPaginator.currentPage.get() - 1) * itemsPaginator.perPage,
      limit: itemsPaginator.perPage
    }).count();
    var initialEntry = (itemsPaginator.currentPage.get() * itemsPaginator.perPage) - (itemsPaginator.perPage - 1 );
    var finalEntry = initialEntry + finalPageEntries - 1;
    return initialEntry + " - " + finalEntry;
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
});


Template.itemSelect.helpers({
  alreadyTweeted: function(){
    return this.tweeted;
  }
});

Template.itemSelect.onRendered(function(){
  $.material.checkbox();
});
