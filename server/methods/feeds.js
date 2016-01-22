Meteor.methods({
  getCGSpaceItems: function (options) {
    this.unblock();
    var newAdditions = 0;

    if(options.offset == null){
      options.offset = Items.Collection.find().count();
    }

    Meteor.http.get("https://cgspace.cgiar.org/rest/items/", {params: options}, function(error, results) {
      if(error) throw error;
      if((results.data.length)){
        _.each(results.data, function(item){
          // Check if the item doesn't exist
          if(Items.Collection.find({itemId: item.id}).count() == 0){
            newAdditions++;
            Items.Collection.insert({
              itemId: item.id,
              handle: "http://hdl.handle.net/" + item.handle,
              title: item.name,
              lastModified: new Date(item.lastModified),
              tweeted: false,
              importedDate: new Date()
            });
          }
        });
        //fetchEvent.setClient({additions: newAdditions});
        fetchEvent.emit("complete", newAdditions);
      }
    });
  }
});
