this.Items = new Meteor.Pagination("items", {
  perPage: 50,
  fastRender: true,
  itemTemplate: "item",
  divWrapper: false,
  sort: {
    dateIssued: -1
  },
  availableSettings: {
    perPage: true,
    sort: true,
    filters: true
  }
});
Communities = new Mongo.Collection("communities");
