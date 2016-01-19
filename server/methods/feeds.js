Meteor.methods({
  getCGSpaceItems: function (options) {
    this.unblock();
    return Meteor.http.get("https://cgspace.cgiar.org/rest/items/", {params: options});
  }
});
