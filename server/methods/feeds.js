Meteor.methods({
    getCGSpaceItems: function (options, endpoint) {
        this.unblock();
        var totalItems = options.limit;
        var newAdditions = 0;

        endpoint = endpoint || Meteor.settings.cgspace_rest_endpoint;
        options.offset = options.offset || Items.Collection.find().count();

        Meteor.http.get(endpoint, {params: options}, function(error, results) {
            if(error) throw error;
            if((results.data.length)){
                _.each(results.data, function(item){
                    // Check if the item doesn't exist

                    // Get the top levle communities of the item
                    var topLevelCommunities = getTopLevelCommunities(item.parentCommunityList);

                    // Get the DOI if it exits
                    var doi = _.find(item.metadata, function(meta){
                        return meta.key == "dc.identifier.doi";
                    });

                    // Get the Issued Date
                    var dateIssued = _.find(item.metadata, function(meta){
                        return meta.key == "dc.date.issued";
                    });

                    // The item should not already exist and should be long at least one top level community
                    if(Items.Collection.find({itemId: item.id}).count() == 0 && topLevelCommunities.length > 0){
                        var doc = {
                            itemId: item.id,
                            handle: "http://hdl.handle.net/" + item.handle,
                            title: item.name,
                            dateIssued: moment(dateIssued.value, "YYYY-MM-DD").toDate(),
                            communities: topLevelCommunities,
                            tweeted: false,
                            importedDate: new Date()
                        };
                        if(doi){
                            doc.doi = doi.value;
                        }
                        Items.Collection.insert(doc);
                        // increment new items count
                        newAdditions++;
                        // send progress percentage
                        fetchEvent.emit("progress", Meteor.userId(), newAdditions, (newAdditions/totalItems)*100 + "%");
                    }
                });
                // send completed adding items event
                fetchEvent.emit("complete",  Meteor.userId(), newAdditions);
            }
        });
    }
});

function getTopLevelCommunities(parentCommunities){
    var communityIds = [];
    _.each(parentCommunities, function(parentCommunity){
        var community = Communities.findOne({name: parentCommunity.name});
        if(community){
            if(communityIds.indexOf(community._id) == -1){ // make sure the id is not already added
                communityIds.push(community._id);
            }
        }
    });
    return communityIds;
}
