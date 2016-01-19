itemsPaginator = new Paginator(Items, 50);

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
    var finalPageEntries = Items.find({}, {skip: (itemsPaginator.currentPage.get() - 1) * itemsPaginator.perPage, limit: itemsPaginator.perPage }).count();
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
  selectedItem: function () {
    return Session.equals("selectedItemId", this._id) ? "btn-primary" : "";
  },
  lastModified: function(){
    return moment(this.lastModified).format('YYYY MM DD');
  },
  hasBeenTweeted: function(){
    return this.tweeted ? "checked='checked'" : "";
  }
});

Template.home.events({
  "change input#show-pending": function (e, t) {
    if (e.target.checked) {
      Session.set("pendingOnly", true);
    } else {
      Session.set("pendingOnly", null);
    }
  },
  "change input#change-page-number": function (e, t) {
    var newValue = e.target.value;
    if ( newValue > 1) {
      itemsPaginator.currentPage.set(newValue);
    }
  }
});

Template.itemSelect.helpers({
  alreadyTweeted: function(){
    return this.tweeted ? "disabled" : "";
  }
});

Template.itemSelect.onRendered(function(){
  $.material.checkbox();
});
