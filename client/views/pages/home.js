selectedItemsCount = new ReactiveVar(0);
searchFilter = new ReactiveVar({});
searchField = new ReactiveVar("importedDate");
searchFieldType = new ReactiveVar("date");
specifySkipItems = new ReactiveVar(false);
setAPIEndpoint = new ReactiveVar(false);
tweetInfo = new ReactiveVar();

fetchEvent.addListener('progress', function(newAdditions, percentage) {
  $("#items-imported").text(newAdditions);
  $("#items-progress").css({
    width: percentage
  })
});

fetchEvent.addListener('complete', function(newAdditions) {
  toastr.success(newAdditions + " CGSpace items imported", "Success!", {timeOut: 0, "extendedTimeOut": 0});
  $("#fetch-items").prop('disabled', false);
});

tweetEvent.addListener('progress', function(newTweets, percentage) {
  $("#items-tweeted").text(newTweets);
  $("#tweets-progress").css({
    width: percentage
  })
});

tweetEvent.addListener('complete', function(newTweets) {
  toastr.success(newTweets + " CGSpace items tweeted", "Success!", {timeOut: 0, "extendedTimeOut": 0});
  $("#tweet-items").prop('disabled', false);
});

function getSearchHashTagFilter(searchHashTags){
  var communityIds = Communities.find({hashTag: {$in: searchHashTags}}, {name: 0}).fetch();
  communityIds = _.map(communityIds, function(communityId){
    return communityId._id;
  });
  return {$in : communityIds};
}

function getCopy(obj){
  var newObj = {};
  for(var k in obj) newObj[k]=obj[k];
  return newObj;
}

Template.home.helpers({
  totalItems: function(){
    return Counts.get("pendingItemsCount");
  },
  totalTweetedItems: function(){
    return Counts.get("tweetedItemsCount");
  },
  selectedItemsCount: function () {
    return selectedItemsCount.get();
  },
  selectedSearchField: function(){
    return searchField.get();
  },
  showDateSearchForm: function(){
    return searchFieldType.get() == "date";
  },
  skipItems: function(){
    return specifySkipItems.get();
  },
  setEndpoint: function(){
    return setAPIEndpoint.get();
  },
  tagSettings: function() {
    return {
      position: "bottom",
      limit: 5,
      rules: [
        {
          token: '#',
          collection: Communities,
          field: "hashTag",
          template: Template.hashTags,
          matchAll: true
        }
      ]
    };
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
    t.$("#fetch-items").prop('disabled', true);

    var endPoint = t.$("#endpoint").val();

    var minNumberOfItems = parseInt(t.$("#items-to-fetch").attr("min"), 10);
    var newNumberOfItems = parseInt(t.$("#items-to-fetch").val(), 10);
    var maxNumberOfItems = parseInt(t.$("#items-to-fetch").attr("max"), 10);

    var newNumberOfItemsToSkip = null;

    if(specifySkipItems.get()){

      var minNumberOfItemsToSkip = parseInt(t.$("#items-to-skip").attr("min"), 10);
      newNumberOfItemsToSkip = parseInt(t.$("#items-to-skip").val(), 10);
      var maxNumberOfItemsToSkip = parseInt(t.$("#items-to-skip").attr("max"), 10);

      if(newNumberOfItemsToSkip < minNumberOfItemsToSkip){
        newNumberOfItemsToSkip = minNumberOfItemsToSkip;
      } else if(newNumberOfItemsToSkip > maxNumberOfItemsToSkip){
        newNumberOfItemsToSkip = maxNumberOfItemsToSkip;
      }
    }

    if(newNumberOfItems < minNumberOfItems){
      newNumberOfItems = minNumberOfItems;
    } else if(newNumberOfItems > maxNumberOfItems){
      newNumberOfItems = maxNumberOfItems;
    }

    Meteor.call("getCGSpaceItems", {limit: newNumberOfItems, offset: newNumberOfItemsToSkip}, endPoint, function(error){
      if(error) {
        toastr.error(error, "Error while getting items from CGSpace, please try again!");
      } else {
        toastr.info("<strong id='items-imported'></strong> CGSpace items imported.<div class='progress'> <div id='items-progress' class='progress-bar progress-bar-success' style='width: 0%''></div></div>", "Import in progress!", {timeOut: 0, "extendedTimeOut": 0});
      }
    });
  },
  "keypress #items-to-fetch": function(e, t){
    if(e.keyCode == 13){
      t.$("#fetch-items").trigger("click");
    }
  },
  "click table thead th.sortable": function(e, t){
    t.$("table thead th.active").removeClass("active");
    t.$(e.target).addClass("active");

    searchField.set(t.$(e.target).data("sort-field"));
    searchFieldType.set(t.$(e.target).data("sort-field-type"));

    // Move the sorter to the header
    t.$("#sorter").appendTo(t.$(e.target));
  },
  "click table thead th.sortable div#sorter": function(e, t){
    e.stopPropagation();
  },
  "click table thead th.sortable i": function(e, t){
    e.stopPropagation();
    var sortDirection = 1;

    t.$("i.active").removeClass("active");
    t.$(t.$(e.target)).addClass("active");

    if(t.$(e.target).hasClass("fa-chevron-circle-up")){
      sortDirection = 1;
    } else {
      sortDirection = -1;
    }

    sortKey = searchField.get();
    sortOption = {};
    sortOption[sortKey] = sortDirection;

    Items.set({
      sort: sortOption
    });
  },
  "click #search-items": function(e, t){
    var selectedField = searchField.get();
    var searchTerm = t.$("#search-term").val().trim();
    var searchTermFilter = getCopy(searchFilter.get());

    if(!searchTerm) {
      toastr.info("Please type in your search term");
    } else {
      searchTermFilter[selectedField] = {$regex : ".*"+ searchTerm +".*", $options: '-i'};
      searchFilter.set(searchTermFilter);
      Items.set({
        filters: searchFilter.get()
      });
    }
  },
  "keypress #search-term": function(e, t){
    var searchTermFilter = getCopy(searchFilter.get());
    var selectedField = searchField.get();

    if(e.keyCode == 13){
      t.$("#search-items").trigger("click");
    } else if(e.keyCode == 27){               // ESC key means reset

      e.target.value = "";
      delete searchTermFilter[selectedField];
      searchFilter.set(searchTermFilter);
      Items.set({
        filters: searchFilter.get()
      });
    }
  },
  "keypress #search-hash-tag": function(e, t){
    var searchHashTagFilter = getCopy(searchFilter.get());

    if(e.keyCode == 13){
      var searchHashTags =  t.$("#search-hash-tag").val().replace("#","").trim().split(" ");

      if(searchHashTags.length == 0){
        toastr.info("Please specify hash tag to search");
      } else {
        searchHashTagFilter.communities = getSearchHashTagFilter(searchHashTags);
        searchFilter.set(searchHashTagFilter);
        Items.set({
          filters: searchFilter.get()
        });
      }
    } else if(e.keyCode == 27){             // ESC key means reset
      e.target.value = "";
      delete searchHashTagFilter.communities;
      searchFilter.set(searchHashTagFilter);
      Items.set({
        filters: searchFilter.get()
      });
    }
  },
  "click #tweet-items": function (e, t) {
    var selectedItems = _.map(t.findAll("table tr td input:checked"), function (checkbox) {
      return {
        _id: checkbox.value,
        title: checkbox.dataset.itemTitle,
        handle: checkbox.dataset.itemHandle,
        hashTags: checkbox.dataset.itemHashTags
      };
    });

    if(selectedItems.length > 0){
      t.$("#tweet-items").prop('disabled', true);
      Meteor.call("tweetItems", selectedItems, function(error){
        if(error) {
          toastr.error(error, "Error while tweeting items, please try again!");
        } else {
          toastr.info("<strong id='items-tweeted'></strong> Items tweeted.<div class='progress'> <div id='tweets-progress' class='progress-bar progress-bar-success' style='width: 0%''></div></div>", "Tweets in progress!", {timeOut: 0, "extendedTimeOut": 0});
        }
      });
      // Clear selected items
      t.$("input#all-items, table tbody tr>td input:checked").prop("checked", false);
      selectedItemsCount.set(0);
    } else {
      toastr.info("Please select items to Tweet");
    }
  }
});

Template.item.helpers({
  lastModified: function(){
    return moment(this.lastModified).format('YYYY-MM-DD');
  },
  importedOn: function(){
    return moment(this.importedDate).format('YYYY-MM-DD');
  },
  tweetedItem: function(){
    return this.tweeted ? "tweeted" : "";
  },
  hashTags: function(){
    var hashTags = _.map(this.communities, function(community){
      var parentCommunity = Communities.findOne({_id: community});
      if(parentCommunity){
        return parentCommunity.hashTag;
      }
    });
    return "#"+hashTags.join(" #");
  }
});

Template.itemSelect.helpers({
  alreadyTweeted: function(){
    return this.tweeted;
  },
  hashTags: function(){
    var hashTags = _.map(this.communities, function(community){
      var parentCommunity = Communities.findOne({_id: community});
      if(parentCommunity){
        return parentCommunity.hashTag;
      }
    });
    return "#"+hashTags.join(" #");
  }
});

Template.itemSelect.events({
  "click i": function(e, t){
    tweetInfo.set(this.tweets);
  }
});

Template.itemSelect.onRendered(function(){
  $.material.checkbox();
  $("input#all-items").prop("checked", false);
  selectedItemsCount.set($("table tbody tr>td input:checked").length);
});

Template.dateSearchForm.events({
  "click #search-items-by-date": function(e, t){
    var selectedField = searchField.get();
    var searchDateFilter = getCopy(searchFilter.get());

    var afterDateString = t.$("#search-after-date").val().trim();
    var beforeDateString = t.$("#search-before-date").val().trim();

    if(afterDateString == "" && beforeDateString == ""){ // no dates picked
      toastr.info("Please pick a date!");
    } else {
      var afterDate, beforeDate = null;


      if(afterDateString != ""){
        afterDate = moment(afterDateString, "MM/DD/YYYY h:mm A");
      }

      if(beforeDateString != ""){
        beforeDate = moment(beforeDateString, "MM/DD/YYYY h:mm A");
      }

      if(afterDate && beforeDate){ // search in specified range
        if(beforeDate > afterDate){
          searchDateFilter[selectedField] = {
            $gte: afterDate.toDate(),
            $lte: beforeDate.toDate()
          }
        } else {
          toastr.info("Please make sure your selected date range is correct!");
        }
      } else if(afterDate) {     // search after specified date
        searchDateFilter[selectedField] = {
          $gte: afterDate.toDate()
        }
      } else if(beforeDate) {   // search before specified date
        searchDateFilter[selectedField] = {
          $lte: beforeDate.toDate()
        }
      }
    }

    if(searchDateFilter[selectedField]){ // make sure filter is specified
      searchFilter.set(searchDateFilter);
      Items.set({
        filters: searchFilter.get()
      });
    }
  },
  "click #clear-search-items-by-date": function(e, t){
    var selectedField = searchField.get();
    var searchDateFilter = getCopy(searchFilter.get());

    t.$(".picker").val("");
    delete searchDateFilter[selectedField];
    searchFilter.set(searchDateFilter);
    Items.set({
      filters: searchFilter.get()
    });
  }
});

Template.dateSearchForm.helpers({
  selectedSearchField: function(){
    return searchField.get();
  }
});

Template.dateSearchForm.onRendered(function(){
  this.$('.datetimepicker').datetimepicker();
});

Template.skipSpecifyOption.events({
  "change #skip-items": function(e, t){
    if(e.target.checked){
      specifySkipItems.set(true);
    } else {
      specifySkipItems.set(false);
    }
  }
});

Template.skipSpecifyOption.onRendered(function(){
  $.material.checkbox();
});

Template.setAPIEndpointOption.events({
  "change #set-endpoint": function(e, t){
    if(e.target.checked){
      setAPIEndpoint.set(true);
    } else {
      setAPIEndpoint.set(false);
    }
  }
});

Template.setAPIEndpointOption.onRendered(function(){
  $.material.checkbox();
});

Template.tweetInfoModal.helpers({
  tweets: function(){
    return tweetInfo.get();
  },
  tweetedDate: function(){
    return moment(this.tweetedOn).format('MMMM Do YYYY h:mm A');
  }
});
