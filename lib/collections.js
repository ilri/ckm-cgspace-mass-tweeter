this.Items = new Meteor.Pagination("items", {
  perPage: 50,
  fastRender: true,
  itemTemplate: "item",
  divWrapper: false,
  sort: {
    importedDate: -1
  },
  availableSettings: {
    perPage: true,
    sort: true,
    filters: true
  }
});
