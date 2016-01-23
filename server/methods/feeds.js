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
          if(Items.Collection.find({itemId: item.id}).count() == 0){
            Items.Collection.insert({
              itemId: item.id,
              handle: "http://hdl.handle.net/" + item.handle,
              title: item.name,
              lastModified: new Date(item.lastModified),
              tweeted: false,
              importedDate: new Date()
            });
            // increment new items count
            newAdditions++;
            // send progress precentage
            fetchEvent.emit("progress", newAdditions, (newAdditions/totalItems)*100 + "%");
          }
        });
        // send completed adding items event
        fetchEvent.emit("complete", newAdditions);
      }
    });
  }
});
