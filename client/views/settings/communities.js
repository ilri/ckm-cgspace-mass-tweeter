editHashtags = new ReactiveVar();
editMentions = new ReactiveVar();
selectedCommunity = new ReactiveVar();


function getCommunityHashtagsString(community){
    return community.hashtags && community.hashtags.length > 0 ? community.hashtags.join(" ") : "N/A";
}

function getCommunityMentionsString(community){
    return community.mentions && community.mentions.length > 0 ? community.mentions.join(" ") : "N/A";
}

Template.communities.helpers({
    communities: function(){
        return Communities.find({}, {sort: {name: 1}});
    },
    selectedRow: function(){
        return selectedCommunity.get() == this._id ? "selected" : "";
    }
});

Template.communities.events({
    "click tbody tr": function(e, t){
        editHashtags.set(null);
        if(selectedCommunity.get() == this._id){
            selectedCommunity.set(null);
        } else {
            selectedCommunity.set(this._id);
        }
    },
    "click a.edit-hashtags-button": function(e, t){
        e.stopPropagation();
        e.preventDefault();
        editHashtags.set(this._id);
    },
    "click a.edit-mentions-button": function(e, t){
        e.stopPropagation();
        e.preventDefault();
        editMentions.set(this._id);
    },
    "click input#edit-hashtags": function(e, t){
        e.stopPropagation();
    },
    "click input#edit-mentions": function(e, t){
        e.stopPropagation();
    },
    "keyup input#edit-hashtags": function(e, t){
        var newHashtags = e.target.value.replace("#", "");
        if(e.which === 13){ // Submit change
            if(newHashtags){
                Communities.update({_id: this._id}, { $set: { hashtags: newHashtags.trim().split(" ") }});
            } else {
                Communities.update({_id: this._id}, { $unset: { hashtags: 1 }}); // remove hashtags field
            }

            editHashtags.set(null);
        } else if (e.keyCode == 27){ // Undo change
            editHashtags.set(null);
        }
    },
    "blur input#edit-hashtags": function(e, t){
        editHashtags.set(null);
    },
    "keyup input#edit-mentions": function(e, t){
        var newMentions = e.target.value.replace("@", "");
        if(e.which === 13){ // Submit change
            if(newMentions){
                Communities.update({_id: this._id}, { $set: { mentions: newMentions.trim().split(" ") }});
            } else {
                Communities.update({_id: this._id}, { $unset: { mentions: 1 }}); // remove mentions field
            }

            editMentions.set(null);
        } else if (e.keyCode == 27){ // Undo change
            editMentions.set(null);
        }
    },
    "blur input#edit-mentions": function(e, t){
        editMentions.set(null);
    }
});

Template.communityHashtags.helpers({
    editHashtagsMode: function(){
        return editHashtags.get() == this._id;
    },
    hashtagsString: function(){
        return getCommunityHashtagsString(this);
    }
});

Template.communityHashtagsEditForm.onRendered(function(){
    $("#edit-hashtags").focus();
});

Template.communityHashtagsEditForm.helpers({
    hashtagsString: function(){
        return getCommunityHashtagsString(this);
    }
});

Template.communityMentions.helpers({
    editMentionsMode: function(){
        return editMentions.get() == this._id;
    },
    mentionsString: function(){
        return getCommunityMentionsString(this);
    }
});

Template.communityMentionsEditForm.onRendered(function(){
    $("#edit-mentions").focus();
});

Template.communityMentionsEditForm.helpers({
    mentionsString: function(){
        return  getCommunityMentionsString(this);
    }
});

