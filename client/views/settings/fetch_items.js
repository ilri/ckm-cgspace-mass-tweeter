setOffset = new ReactiveVar(false);
setAPIEndpoint = new ReactiveVar(false);

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
        $("#fetch-items").removeClass('disabled').children("i").removeClass("fa-spin");
    }
});

Template.fetchItems.helpers({
    setEndpoint: function () {
        return setAPIEndpoint.get();
    },
    setOffset: function () {
        return setOffset.get();
    },
    totalItems: function () {
        return Counts.get("totalItemsCount");
    },
    tweetedItems: function () {
        return Counts.get("tweetedItemsCount");
    },
    pendingItems: function () {
        return Counts.get("pendingItemsCount");
    }
});

Template.fetchItems.events({
    "click #fetch-items": function (e, t) {
        t.$("#fetch-items").addClass('disabled').children("i").addClass("fa-spin");

        var endPoint = t.$("#endpoint").val();

        var minNumberOfItems = parseInt(t.$("#items-to-fetch").attr("min"), 10);
        var newNumberOfItems = parseInt(t.$("#items-to-fetch").val(), 10) || 1;
        var maxNumberOfItems = parseInt(t.$("#items-to-fetch").attr("max"), 10);

        var newNumberOfItemsToSkip = null;

        if (setOffset.get()) {

            var minNumberOfItemsToSkip = parseInt(t.$("#items-to-skip").attr("min"), 10);
            newNumberOfItemsToSkip = parseInt(t.$("#items-to-skip").val(), 10) || Counts.get("totalItemsCount");
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
    }
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