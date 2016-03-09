setOffset = new ReactiveVar(false);
setAPIEndpoint = new ReactiveVar(false);
getLatestItems = new ReactiveVar(false);
latestItemHandle = new ReactiveVar(0);
newAdditions = new ReactiveVar(0);

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
    ReactiveMethod.invalidateCall("latestItemId");
});

var fetchCGSpaceItems = function () {
    var endPoint = $("#endpoint").val();

    var minNumberOfItems = parseInt($("#items-to-fetch").attr("min"), 10);
    var newNumberOfItems = parseInt($("#items-to-fetch").val(), 10) || 1;
    var maxNumberOfItems = parseInt($("#items-to-fetch").attr("max"), 10);

    var newNumberOfItemsToSkip = null;

    if (setOffset.get()) {

        var minNumberOfItemsToSkip = parseInt($("#items-to-skip").attr("min"), 10);
        newNumberOfItemsToSkip = parseInt($("#items-to-skip").val(), 10) || Counts.get("totalItemsCount");
        var maxNumberOfItemsToSkip = parseInt($("#items-to-skip").attr("max"), 10);

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
            $("#fetch-items").removeClass('disabled').children("i").removeClass("fa-spin");
        } else {
            toastr.info(
                "<strong id='items-imported'></strong> CGSpace items imported." +
                "<div class='progress'> " +
                "<div id='items-progress' class='progress-bar progress-bar-success' style='width: 0%''>" +
                "</div>" +
                "</div>",
                "Import in progress!",
                {
                    timeOut: 0,
                    "extendedTimeOut": 0
                }
            );
        }
    });
};

var fetchLatestCGSpaceItems = function () {
    var minNumberOfItems = parseInt($("#items-to-fetch").attr("min"), 10);
    var newNumberOfItems = parseInt($("#items-to-fetch").val(), 10) || 1;
    var maxNumberOfItems = parseInt($("#items-to-fetch").attr("max"), 10);
    var startId = parseInt($("#start-id").val(), 10) || parseInt(latestItemHandle.get(), 10);

    if (newNumberOfItems < minNumberOfItems) {
        newNumberOfItems = minNumberOfItems;
    } else if (newNumberOfItems > maxNumberOfItems) {
        newNumberOfItems = maxNumberOfItems;
    }

    Meteor.call("getLatestCGSpaceItems", {
        latestItemHandle: startId,
        totalItems: newNumberOfItems
    }, function (error) {
        if (error) {
            toastr.error(error, "Error while getting items from CGSpace, please try again!");
            $("#fetch-items").removeClass('disabled').children("i").removeClass("fa-spin");
        } else {
            toastr.info(
                "<strong id='items-imported'> </strong> CGSpace items imported." +
                "<div class='progress'> " +
                "<div id='items-progress' class='progress-bar progress-bar-success' style='width: 0%;'>" +
                "</div>" +
                "</div>",
                "Import in progress!",
                {
                    timeOut: 0,
                    "extendedTimeOut": 0
                }
            );
        }
    });
};

Template.fetchItems.helpers({
    getLatestItems: function () {
        return getLatestItems.get();
    },
    setEndpoint: function () {
        return setAPIEndpoint.get();
    },
    setOffset: function () {
        return setOffset.get();
    }
});

Template.fetchItems.events({
    "click #fetch-items": function (e, t) {
        t.$("#fetch-items").addClass('disabled').children("i").addClass("fa-spin");

        if (getLatestItems.get()) {
            fetchLatestCGSpaceItems();
        } else {
            fetchCGSpaceItems();
        }
    }
});

Template.getLatestItemsOption.helpers({
    latestItemHandle: function () {
        latestItemHandle.set(ReactiveMethod.call("latestItemHandle"));
        return latestItemHandle.get();
    }
});

Template.getLatestItemsForm.helpers({
    latestItemHandle: function () {
        latestItemHandle.set(ReactiveMethod.call("latestItemHandle"));
        return latestItemHandle.get();
    }
});

Template.getLatestItemsOption.events({
    "click #get-latest-option": function (e, t) {
        var checkIcon = t.$(e.target).hasClass("fa") ? t.$(e.target) : t.$(e.target).children("i");

        if (checkIcon.hasClass("fa-square-o")) {
            checkIcon.checkItem(true);
            getLatestItems.set(true);
        } else {
            checkIcon.checkItem(false);
            getLatestItems.set(false);
        }
    }
});

Template.setAPIEndpointOption.events({
    "click #set-endpoint": function (e, t) {
        var checkIcon = t.$(e.target).hasClass("fa") ? t.$(e.target) : t.$(e.target).children("i");

        if (checkIcon.hasClass("fa-square-o")) {
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
    "click #skip-items": function (e, t) {
        var checkIcon = t.$(e.target).hasClass("fa") ? t.$(e.target) : t.$(e.target).children("i");

        if (checkIcon.hasClass("fa-square-o")) {
            checkIcon.checkItem(true);
            setOffset.set(true);
        } else {
            checkIcon.checkItem(false);
            setOffset.set(false);
        }
    }
});