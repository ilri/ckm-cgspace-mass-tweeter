Router.configure({
    layoutTemplate: "layout",
    loadingTemplate: "loading"
});

Router.route("/", {
    name: "home",
    waitOn: function () {
        return Meteor.subscribe('users');
    },
    action: function () {
        if (this.ready()) {
            // Send user to sign in form, if not logged in
            if (!Meteor.userId()) {
                Router.go("/sign_in");
            } else {
                this.render("home");
            }
        }
    }
});

Router.route("/fetch-items", {
    name: "fetchItems",
    waitOn: function () {
        return Meteor.subscribe('users');
    },
    action: function () {
        if (this.ready()) {
            // Send user to sign in form, if not logged in
            if (!Meteor.userId()) {
                Router.go("/sign_in");
            } else {
                this.render("fetchItems");
            }
        }
    }
});

Router.route("/communities", {
    name: "communities",
    waitOn: function () {
        return Meteor.subscribe('users');
    },
    action: function () {
        if (this.ready()) {
            // Send user to sign in form, if not logged in
            if (!Meteor.userId()) {
                Router.go("/sign_in");
            } else {
                this.render("communities");
            }
        }
    }
});

Router.route("/sign_in", {
    name: "signIn",
    layout: "layoutAnonymous",
    action: function () {
        if (this.ready()) {
            // Render sign in form if the user is not logged in
            if (!Meteor.userId()) {
                this.render("signIn");
            } else {
                Router.go("/");
            }
        }
    }
});

Router.route("/sign_out", {
    name: "signOut",
    action: function () {
        Meteor.logout();
        Router.go("/");
    }
});
