selectedItemsCount = new ReactiveVar(0);
searchFilter = new ReactiveVar({});
searchField = new ReactiveVar("dateIssued");
searchFieldType = new ReactiveVar("date");
setOffset = new ReactiveVar(false);
setAPIEndpoint = new ReactiveVar(false);
tweetInfo = new ReactiveVar();
filteredByHashtagsOrMentions = new ReactiveVar(false);

$.fn.checkItem = function(check) {
  return this.each(function() {
    if(check){
      $(this).removeClass("fa-square-o").addClass('fa-check-square-o');
    } else {
      $(this).removeClass("fa-check-square-o").addClass('fa-square-o');
    }
  });
};

fetchEvent.addListener('progress', function (userId, newAdditions, percentage) {
  if (Meteor.userId() == userId) {
    $("#items-imported").text(newAdditions);
    $("#items-progress").css({
      width: percentage
    });
  }
});

fetchEvent.addListener('complete', function (userId, newAdditions) {
  if (Meteor.userId() == userId) {
    toastr.success(newAdditions + " CGSpace items imported", "Success!", {timeOut: 0, "extendedTimeOut": 0});
    $("#fetch-items").prop('disabled', false).removeClass("fa-spin");
  }
});

tweetEvent.addListener('progress', function (userId, newTweets, percentage) {
  if (Meteor.userId() == userId) {
    $("#items-tweeted").text(newTweets);
    $("#tweets-progress").css({
      width: percentage
    });
  }
});

tweetEvent.addListener('complete', function (userId, newTweets) {
  if (Meteor.userId() == userId) {
    toastr.success(newTweets + " CGSpace items tweeted", "Success!", {timeOut: 0, "extendedTimeOut": 0});
    $("#tweet-items").prop('disabled', false);
  }
});

getItemHashtags = function (item) {
  var hashtags = item.communities.filter(function (community) {
    var parentCommunity = Communities.findOne({_id: community});
    if (parentCommunity.hashtags && parentCommunity.hashtags.length > 0) {
      return true;
    }
  }).map(function (community) {
    var parentCommunity = Communities.findOne({_id: community});
    return parentCommunity.hashtags;
  });
  return _.flatten(hashtags).length > 0 ? "#" + _.flatten(hashtags).join(" #") : "N/A";
};

getItemMentions = function (item) {
  var mentions = item.communities.filter(function (community) {
    var parentCommunity = Communities.findOne({_id: community});
    if (parentCommunity.mentions && parentCommunity.mentions.length > 0) {
      return true;
    }
  }).map(function (community) {
    var parentCommunity = Communities.findOne({_id: community});
    return parentCommunity.mentions;
  });
  return _.flatten(mentions).length > 0 ? "@" + _.flatten(mentions).join(" @") : "N/A";
};

getCommunitiesWithHashtags = function (searchHashtags) {
  var communityIds = Communities.find({hashtags: {$in: searchHashtags}}, {name: 0}).fetch();
  return _.map(communityIds, function (communityId) {
    return communityId._id;
  });
};

getCommunitiesWithMentions = function (searchMentions) {
  var communityIds = Communities.find({mentions: {$in: searchMentions}}, {name: 0}).fetch();
  return _.map(communityIds, function (communityId) {
    return communityId._id;
  });
};

getCopy = function (obj) {
  var newObj = {};
  for (var k in obj) newObj[k] = obj[k];
  return newObj;
};

findTokens = function (token, searchText) {
  var regexp = token == "#" ? /\B\#\w\w+\b/g : /\B\@\w\w+\b/g;
  return tokensFound = _.map(searchText.match(regexp), function (tokenFound) {
    return new RegExp(tokenFound.slice(1), "i");
  });
};

adjustPager = function(){
  if ($(window).width() < 405) {
    Items.set({
      paginationMargin: 0
    });
  } else if ($(window).width() >= 405 && $(window).width() < 768) {
    Items.set({
      paginationMargin: 1
    });
  } else {
    Items.set({
      paginationMargin: 3
    });
  }
}

Template.home.helpers({
  totalItems: function () {
    return Counts.get("pendingItemsCount");
  },
  totalTweetedItems: function () {
    return Counts.get("tweetedItemsCount");
  },
  selectedItemsCount: function () {
    return selectedItemsCount.get();
  },
  showDateSearchForm: function () {
    return searchFieldType.get() == "date";
  },
  setEndpoint: function () {
    return setAPIEndpoint.get();
  },
  setOffset: function () {
    return setOffset.get();
  },
  filteredByHashtagsOrMentions: function () {
    return filteredByHashtagsOrMentions.get();
  }
});

Template.home.events({
  "click #advanced-search": function (e, t) {
    if ($("#advanced-search i").hasClass("fa-chevron-circle-down")) {
      $("#advanced-search i")
      .removeClass("fa-chevron-circle-down")
      .addClass("fa-chevron-circle-up");
      $("#search-form").slideDown();
    } else {
      $("#advanced-search i")
      .removeClass("fa-chevron-circle-up")
      .addClass("fa-chevron-circle-down");
      $("#search-form").slideUp();
    }
  },
  "click #all-items": function (e, t) {
    if (t.$(e.target).hasClass("fa-square-o")) {
      t.$("table i.fa-square-o").checkItem(true);
    } else {
      t.$("table i.fa-check-square-o").checkItem(false);
    }
    selectedItemsCount.set(t.$("table tbody tr>td i.fa-check-square-o").length);
  },
  "click i.item-selected": function(e, t){
    if (t.$(e.target).hasClass("fa-square-o")) {
      t.$(e.target).checkItem(true);
      if($("table tbody tr>td i.fa-square-o").length == 0){
        t.$("i#all-items").checkItem(true);
      }
    } else {
      t.$(e.target).checkItem(false);
      t.$("i#all-items").checkItem(false);
    }
    selectedItemsCount.set(t.$("table tbody tr>td i.fa-check-square-o").length);
  },
  "click #fetch-items": function (e, t) {
    t.$("#fetch-items").prop('disabled', true).addClass("fa-spin");

    var endPoint = t.$("#endpoint").val();

    var minNumberOfItems = parseInt(t.$("#items-to-fetch").attr("min"), 10);
    var newNumberOfItems = parseInt(t.$("#items-to-fetch").val(), 10) || 1;
    var maxNumberOfItems = parseInt(t.$("#items-to-fetch").attr("max"), 10);

    var newNumberOfItemsToSkip = null;

    if (setOffset.get()) {

      var minNumberOfItemsToSkip = parseInt(t.$("#items-to-skip").attr("min"), 10);
      newNumberOfItemsToSkip = parseInt(t.$("#items-to-skip").val(), 10);
      var maxNumberOfItemsToSkip = parseInt(t.$("#items-to-skip").attr("max"), 10);

      if (newNumberOfItemsToSkip < minNumberOfItemsToSkip) {
        newNumberOfItemsToSkip = minNumberOfItemsToSkip;
      } else if (newNumberOfItemsToSkip > maxNumberOfItemsToSkip) {
        newNumberOfItemsToSkip = maxNumberOfItemsToSkip;
      }
    }

    if (newNumberOfItems < minNumberOfItems) {
      newNumberOfItems = minNumberOfItems;
    } else if (newNumberOfItems > maxNumberOfItems) {
      newNumberOfItems = maxNumberOfItems;
    }

    Meteor.call("getCGSpaceItems", {
      limit: newNumberOfItems,
      offset: newNumberOfItemsToSkip
    }, endPoint, function (error) {
      if (error) {
        toastr.error(error, "Error while getting items from CGSpace, please try again!");
      } else {
        toastr.info("<strong id='items-imported'></strong> CGSpace items imported.<div class='progress'> <div id='items-progress' class='progress-bar progress-bar-success' style='width: 0%''></div></div>", "Import in progress!", {
          timeOut: 0,
          "extendedTimeOut": 0
        });
      }
    });
  },
  "keyup #items-to-fetch": function (e, t) {
    if (e.keyCode == 13) {
      t.$("#fetch-items").trigger("click");
    }
  }
  ,
  "click table thead th.sortable": function (e, t) {
    t.$("table thead th.active").removeClass("active");
    t.$(e.target).addClass("active");

    searchField.set(t.$(e.target).data("sort-field"));
    searchFieldType.set(t.$(e.target).data("sort-field-type"));

    // Move the sorter to the header
    t.$("#sorter").appendTo(t.$(e.target));
  }
  ,
  "click table thead th.sortable div#sorter": function (e, t) {
    e.stopPropagation();
  }
  ,
  "click table thead th.sortable i": function (e, t) {
    e.stopPropagation();
    var sortDirection = 1;

    t.$("i.active").removeClass("active");
    t.$(t.$(e.target)).addClass("active");

    if (t.$(e.target).hasClass("fa-chevron-circle-up")) {
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
  }
  ,
  "keyup #search-hashtags-and-mentions": function (e, t) {
    var searchHashtagsFilter = getCopy(searchFilter.get());

    if (e.keyCode == 13) {
      var searchHashtags = findTokens("#", t.$("#search-hashtags-and-mentions").val().trim());
      var searchMentions = findTokens("@", t.$("#search-hashtags-and-mentions").val().trim());


      if (searchHashtags.length == 0 && searchMentions.length == 0) {
        toastr.info("Please specify a hashtag or a mention to search");
      } else {
        searchHashtagsFilter.communities = {$in: _.union(getCommunitiesWithHashtags(searchHashtags), getCommunitiesWithMentions(searchMentions))};
        searchFilter.set(searchHashtagsFilter);
        Items.set({
          filters: searchFilter.get()
        });
        filteredByHashtagsOrMentions.set(true);
      }
    } else if (e.keyCode == 27) {             // ESC key means reset
      e.target.value = "";
      delete searchHashtagsFilter.communities;
      searchFilter.set(searchHashtagsFilter);
      Items.set({
        filters: searchFilter.get()
      });
      filteredByHashtagsOrMentions.set(false);
    }
  }
  ,
  "click #search-hashtags-and-mentions-button": function (e, t) {
    var searchHashtagsFilter = getCopy(searchFilter.get());

    var searchHashtags = findTokens("#", t.$("#search-hashtags-and-mentions").val().trim());
    var searchMentions = findTokens("@", t.$("#search-hashtags-and-mentions").val().trim());

    if (searchHashtags.length == 0 && searchMentions.length == 0) {
      toastr.info("Please specify a hashtag or a mention to search");
    } else {
      searchHashtagsFilter.communities = {$in: _.union(getCommunitiesWithHashtags(searchHashtags), getCommunitiesWithMentions(searchMentions))};
      searchFilter.set(searchHashtagsFilter);
      Items.set({
        filters: searchFilter.get()
      });
      filteredByHashtagsOrMentions.set(true);
    }
  }
  ,
  "click #clear-hashtags-and-mentions-button": function (e, t) {
    var searchHashtagsFilter = getCopy(searchFilter.get());

    // Clear hashtags/mentions input box
    $("#search-hashtags-and-mentions").val("");

    delete searchHashtagsFilter.communities;
    searchFilter.set(searchHashtagsFilter);
    Items.set({
      filters: searchFilter.get()
    });

    filteredByHashtagsOrMentions.set(false);
  }
  ,
  "click #tweet-items": function (e, t) {
    var selectedItems = _.map(t.findAll("table tr td i.fa-check-square-o"), function (checkbox) {
      var selectedItem = {
        _id: checkbox.id,
        title: checkbox.dataset.itemTitle,
        handle: checkbox.dataset.itemHandle
      };
      if(checkbox.dataset.itemHashtags != "N/A"){
        selectedItem.hashtags = checkbox.dataset.itemHashtags;
      }
      if(checkbox.dataset.itemMentions != "N/A"){
        selectedItem.mentions = checkbox.dataset.itemMentions;
      }
      return selectedItem;
    });

    if (selectedItems.length > 0) {
      t.$("#tweet-items").prop('disabled', true);
      Meteor.call("tweetItems", selectedItems, function (error) {
        if (error) {
          toastr.error(error, "Error while tweeting items, please try again!");
        } else {
          toastr.info("<strong id='items-tweeted'></strong> Items tweeted.<div class='progress'> <div id='tweets-progress' class='progress-bar progress-bar-success' style='width: 0%''></div></div>", "Tweets in progress!", {
            timeOut: 0,
            "extendedTimeOut": 0
          });
        }
      });
      // Clear selected items
      t.$("i#all-items, table tbody tr td i.fa-check-square-o").removeClass("fa-check-square-o").addClass("fa-square-o");
      selectedItemsCount.set(0);
    } else {
      toastr.info("Please select items to Tweet");
    }
  }
})
;

Template.home.onRendered(function () {
  $.material.init();
  adjustPager();
  $(window).resize(function(){
    adjustPager();
  });
});

Template.item.helpers({
  issuedOn: function () {
    return moment(this.dateIssued).format('YYYY-MM-DD');
  },
  importedOn: function () {
    return moment(this.importedDate).format('YYYY-MM-DD');
  },
  tweetedItem: function () {
    return this.tweeted ? "tweeted" : "";
  },
  itemWithDOI: function () {
    return this.doi ? "with-doi" : "";
  },
  hashtags: function () {
    return getItemHashtags(this);
  },
  mentions: function () {
    return getItemMentions(this);
  }
});

Template.itemSelect.helpers({
  alreadyTweeted: function () {
    return this.tweeted;
  },
  hashtags: function () {
    return getItemHashtags(this);
  },
  mentions: function () {
    return getItemMentions(this);
  }
});

Template.itemSelect.events({
  "click i": function (e, t) {
    tweetInfo.set(this.tweets);
  }
});

Template.itemSelect.onRendered(function () {
  $("i#all-items, table tbody tr td i.fa-check-square-o").removeClass("fa-check-square-o").addClass("fa-square-o");
  selectedItemsCount.set(0);
});

Template.searchByForm.events({
  "change select#select-search-field": function(e,t){
    var selectedSearchBy = e.target.value;
    var selectedFieldType = $("select#select-search-field option:selected").data("sort-field-type");

    $("table thead th.active").removeClass("active");
    $("[data-sort-field='"+ selectedSearchBy +"']").addClass("active");

    // Move the sorter to the header
    $("#sorter").appendTo("[data-sort-field='"+ selectedSearchBy +"']");

    searchField.set(selectedSearchBy);
    searchFieldType.set(selectedFieldType);
  }
});

Template.sortByForm.events({
  "change input:radio[name=sort]": function(e, t){
    var sortDirection = parseInt(e.target.value, 10);

    $("#sorter i.active").removeClass("active");

    if (sortDirection == 1){
      $("#sorter i.fa-chevron-circle-up").addClass("active");
    } else {
      $("#sorter i.fa-chevron-circle-down").addClass("active");
    }

    sortKey = searchField.get();
    sortOption = {};
    sortOption[sortKey] = sortDirection;

    Items.set({
      sort: sortOption
    });
  }
});

Template.dateSearchForm.events({
  "click #search-items-by-date": function (e, t) {
    var selectedField = searchField.get();
    var searchDateFilter = getCopy(searchFilter.get());

    var afterDateString = t.$("#search-after-date").val().trim();
    var beforeDateString = t.$("#search-before-date").val().trim();

    if (afterDateString == "" && beforeDateString == "") { // no dates picked
      toastr.info("Please pick a date!");
    } else {
      var afterDate, beforeDate = null;


      if (afterDateString != "") {
        afterDate = moment(afterDateString, "YYYY-MM-DD");
      }

      if (beforeDateString != "") {
        beforeDate = moment(beforeDateString, "YYYY-MM-DD");
      }

      if (afterDate && beforeDate) { // search in specified range
        if (beforeDate > afterDate) {
          searchDateFilter[selectedField] = {
            $gte: afterDate.toDate(),
            $lte: beforeDate.toDate()
          }
        } else {
          toastr.info("Please make sure your selected date range is correct!");
        }
      } else if (afterDate) {     // search after specified date
        searchDateFilter[selectedField] = {
          $gte: afterDate.toDate()
        }
      } else if (beforeDate) {   // search before specified date
        searchDateFilter[selectedField] = {
          $lte: beforeDate.toDate()
        }
      }
    }

    if (searchDateFilter[selectedField]) { // make sure filter is specified
      searchFilter.set(searchDateFilter);
      Items.set({
        filters: searchFilter.get()
      });
    }
  },
  "click #clear-search-items-by-date": function (e, t) {
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
  selectedSearchField: function () {
    return searchField.get().match(/[A-Z]*[^A-Z]+/g).join(" ");
  }
});

Template.dateSearchForm.onRendered(function () {
  $.material.init();
});

Template.textSearchForm.helpers({
  selectedSearchField: function () {
    return searchField.get().match(/[A-Z]*[^A-Z]+/g).join(" ");
  }
});

Template.textSearchForm.events({
  "keyup #search-term": function (e, t) {
    var searchTermFilter = getCopy(searchFilter.get());
    var selectedField = searchField.get();

    if (e.keyCode == 13) {
      t.$("#search-items").trigger("click");
    } else if (e.keyCode == 27) {               // ESC key means reset

      e.target.value = "";
      delete searchTermFilter[selectedField];
      searchFilter.set(searchTermFilter);
      Items.set({
        filters: searchFilter.get()
      });
    }
  },
  "click #search-items": function (e, t) {
    var selectedField = searchField.get();
    var searchTerm = t.$("#search-term").val().trim();
    var searchTermFilter = getCopy(searchFilter.get());

    if (!searchTerm) {
      toastr.info("Please type in your search term");
    } else {
      searchTermFilter[selectedField] = {$regex: ".*" + searchTerm + ".*", $options: '-i'};
      searchFilter.set(searchTermFilter);
      Items.set({
        filters: searchFilter.get()
      });
    }
  },
  "click #clear-search-items": function (e, t) {
    var searchTermFilter = getCopy(searchFilter.get());
    var selectedField = searchField.get();

    $("#search-term").val("");
    delete searchTermFilter[selectedField];
    searchFilter.set(searchTermFilter);
    Items.set({
      filters: searchFilter.get()
    });
  }
});

Template.textSearchForm.onRendered(function () {
  $.material.init();
});

Template.setAPIEndpointOption.events({
  "click #set-endpoint": function(e, t){
    var checkIcon = t.$(e.target).hasClass("fa") ? t.$(e.target) : t.$(e.target).children("i");

    if(checkIcon.hasClass("fa-square-o")){
      checkIcon.checkItem(true);
      setAPIEndpoint.set(true);
    } else {
      checkIcon.checkItem(false);
      setAPIEndpoint.set(false);
    }
  }
});

Template.setAPIEndpointForm.onRendered(function () {
  $.material.init();
});

Template.setOffsetOption.events({
  "click #skip-items": function(e, t){
    var checkIcon = t.$(e.target).hasClass("fa") ? t.$(e.target) : t.$(e.target).children("i");

    if (checkIcon.hasClass("fa-square-o")) {
      checkIcon.checkItem(true);
      setOffset.set(true);
    } else {
      checkIcon.checkItem(false);
      setOffset.set(false);
    }
  },
});

Template.setOffsetForm.onRendered(function () {
  $.material.init();
});


Template.showItemsWithDOIOnlyOption.events({
  "click #doi-items": function(e, t){
    var searchDOIFilter = getCopy(searchFilter.get());
    var checkIcon = t.$(e.target).hasClass("fa") ? t.$(e.target) : t.$(e.target).children("i");

    if(checkIcon.hasClass("fa-square-o")){
      checkIcon.checkItem(true);

      searchDOIFilter.doi = {$exists: 1};
      searchFilter.set(searchDOIFilter);
      Items.set({
        filters: searchFilter.get()
      });
    } else {
      checkIcon.checkItem(false);

      delete searchDOIFilter.doi;
      searchFilter.set(searchDOIFilter);
      Items.set({
        filters: searchFilter.get()
      });
    }
  }
});

Template.tweetInfoModal.helpers({
  tweets: function () {
    return tweetInfo.get();
  },
  tweetedDate: function () {
    return moment(this.tweetedOn).format('MMMM Do YYYY h:mm A');
  }
});

Template.hashtagsAndMentions.helpers({
  hashtagsArray: function () {
    return Communities.find({hashtags: {$exists: true}}, {hashtags: 1});
  },
  hashtagsString: function () {
    return "#" + this.hashtags.join(" #");
  },
  hashtagsURL: function () {
    return "https://twitter.com/search?q=%23" + this.hashtags.join("%20%23");
  },
  shouldScrollHashtagsList: function () {
    return Counts.get("communitiesWithHashtags") > 7;
  },
  mentionsArray: function () {
    return Communities.find({mentions: {$exists: true}}, {mentions: 1});
  },
  mentionsString: function () {
    return "@" + this.mentions.join(" @");
  },
  mentionsURL: function () {
    return "https://twitter.com/search?q=%40" + this.mentions.join("%20%40");
  },
  shouldScrollMentionsList: function () {
    return Counts.get("communitiesWithMentions") > 7;
  }
});
