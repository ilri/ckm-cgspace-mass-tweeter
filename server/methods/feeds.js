fetchIntervalHandle = null;
fetchSettings = new ReactiveVar({});

var fetchLatestItems = function () {
    var settings = fetchSettings.get();
    settings.latestItemId++;

    // Set the endpoint in the format https://cgspace.cgiar.org/rest/items/ID?expand=parentCommunityList,metadata
    var endpoint = Meteor.settings.cgspace_rest_endpoint_latest + settings.latestItemId + Meteor.settings.cgspace_rest_endpoint_latest_options;

    Meteor.http.get(endpoint, function (error, results) {
        if (error) {
            console.log("Error while importing item with ID: " + settings.latestItemId);
        }

        // Decrease the number of items
        settings.items--;

        if (results.data) {

            // Get the only item fetched
            var item = results.data;

            // Get the top level communities of the item
            var topLevelCommunities = getTopLevelCommunities(item.parentCommunityList);

            // Get the DOI if it exits
            var doi = _.find(item.metadata, function (meta) {
                return meta.key == "dc.identifier.doi";
            });

            // Get the Issued Date
            var dateIssued = _.find(item.metadata, function (meta) {
                return meta.key == "dc.date.issued";
            });

            // The item should not already exist and should belong at least one top level community
            if (Items.Collection.find({itemId: item.id}).count() == 0 && topLevelCommunities.length > 0) {
                var doc = {
                    itemId: item.id,
                    handle: parseInt(item.handle.match(/\/([^/]*)$/)[1]),
                    title: item.name,
                    dateIssued: moment(dateIssued.value, "YYYY-MM-DD").toDate(),
                    communities: topLevelCommunities,
                    tweeted: false,
                    importedDate: new Date()
                };
                if (doi) {
                    doc.doi = doi.value;
                }

                // Add item to database
                Items.Collection.insert(doc);

                // increment new items count
                settings.newAdditions++;

                // send progress percentage
                fetchEvent.emit("progress", settings.userId, settings.newAdditions, (settings.newAdditions / settings.totalItems) * 100 + "%");
            }
        }

        // Set fetchSettings
        fetchSettings.set(settings);

        if (fetchSettings.get().items == 0) {
            // Send fetching completed event
            fetchEvent.emit("complete", settings.userId, settings.newAdditions);

            // Clear fetch settings
            fetchSettings.set({});

            // Break set interval
            Meteor.clearInterval(fetchIntervalHandle);
        }
    });
};

Meteor.methods({
    getCGSpaceItems: function (options, endpoint) {
        this.unblock();
        var totalItems = options.limit;
        var newAdditions = 0;

        endpoint = endpoint || Meteor.settings.cgspace_rest_endpoint;
        options.offset = options.offset || Items.Collection.find().count();

        Meteor.http.get(endpoint, {params: options}, function (error, results) {
            if (error) throw error;
            if ((results.data.length)) {
                _.each(results.data, function (item) {
                    // Get the top level communities of the item
                    var topLevelCommunities = getTopLevelCommunities(item.parentCommunityList);

                    // Get the DOI if it exits
                    var doi = _.find(item.metadata, function (meta) {
                        return meta.key == "dc.identifier.doi";
                    });

                    // Get the Issued Date
                    var dateIssued = _.find(item.metadata, function (meta) {
                        return meta.key == "dc.date.issued";
                    });

                    // The item should not already exist and should belong at least one top level community
                    if (Items.Collection.find({itemId: item.id}).count() == 0 && topLevelCommunities.length > 0) {
                        var doc = {
                            itemId: item.id,
                            handle: parseInt(item.handle.match(/\/([^/]*)$/)[1]),
                            title: item.name,
                            dateIssued: moment(dateIssued.value, "YYYY-MM-DD").toDate(),
                            communities: topLevelCommunities,
                            tweeted: false,
                            importedDate: new Date()
                        };
                        if (doi) {
                            doc.doi = doi.value;
                        }
                        Items.Collection.insert(doc);
                        // increment new items count
                        newAdditions++;
                        // send progress percentage
                        fetchEvent.emit("progress", Meteor.userId(), newAdditions, (newAdditions / totalItems) * 100 + "%");
                    }
                });
                // send completed adding items event
                fetchEvent.emit("complete", Meteor.userId(), newAdditions);
            }
        });
    },
    getLatestCGSpaceItems: function (options) {
        this.unblock();

        var settings = {
            latestItemId: options.latestItemId,
            items: options.totalItems,
            totalItems: options.totalItems,
            newAdditions: 0,
            userId: Meteor.userId()
        };

        fetchSettings.set(settings);

        fetchLatestItems();

        // check if there are more items
        if (fetchSettings.get().items) {
            fetchIntervalHandle = Meteor.setInterval(fetchLatestItems, Meteor.settings.cgspace_rest_endpoint_latest_delay); // Delay 37 seconds before sending
        }
    },
    latestItemId: function () {
        var latestItem = Items.Collection.findOne({}, {sort: {itemId: -1}});
        return latestItem ? latestItem.itemId : 0;
    },
    updateHandle: function() {
        _.each(Items.Collection.find().fetch(), function(item){
            item.handle = typeof item.handle == 'string' ? parseInt(item.handle.match(/\/([^/]*)$/)[1]) : item.handle;
            Items.Collection.update({_id: item._id}, {$set: {handle: item.handle}});
        });
        console.log("Updated handles for all items!");
    }
});

function getTopLevelCommunities(parentCommunities) {
    var communityIds = [];
    _.each(parentCommunities, function (parentCommunity) {
        var community = Communities.findOne({name: parentCommunity.name});
        if (community) {
            if (communityIds.indexOf(community._id) == -1) { // make sure the id is not already added
                communityIds.push(community._id);
            }
        }
    });
    return communityIds;
}
