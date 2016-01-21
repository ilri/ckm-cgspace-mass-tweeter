Meteor.methods({
  getCGSpaceItems: function (options) {
    //this.unblock();
    var newAdditions = 0;
    var itemsCount = Items.find().count();
    options.offset = itemsCount;
    Meteor.http.get("https://cgspace.cgiar.org/rest/items/", {params: options}, function(error, results) {
      if(error) throw error;
      if((results.data.length)){
        _.each(results.data, function(item){
          // Check if the item doesn't exist
          if(Items.find({itemId: item.id}).count() == 0){
            newAdditions++;
            Items.insert({
              itemId: item.id,
              handle: "http://hdl.handle.net/" + item.handle,
              title: item.name,
              lastModified: item.lastModified,
              tweeted: false,
              createdDate: new Date()
            });
          }
        });
        console.log("New Additions:" + newAdditions);
      }
    });
  }
});
