Template.quickStats.helpers({
    totalItems: function () {
        return Counts.get("totalItemsCount");
    },
    tweetedItems: function () {
        return Counts.get("tweetedItemsCount");
    },
    pendingItems: function () {
        return Counts.get("pendingItemsCount");
    },
    pendingItemsWithDOI: function () {
        return Counts.get("pendingItemsWithDOICount");
    }
});