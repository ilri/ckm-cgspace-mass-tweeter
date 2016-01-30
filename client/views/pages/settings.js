editHashTag = new ReactiveVar();
selectedCommunity = new ReactiveVar();

Template.settings.helpers({
  communities: function(){
    return Communities.find({}, {sort: {name: 1}});
  },
  selectedRow: function(){
    return selectedCommunity.get() == this._id ? "selected" : "";
  }
});

Template.settings.events({
  "click tbody tr": function(e, t){
    editHashTag.set(null);
    if(selectedCommunity.get() == this._id){
      selectedCommunity.set(null);
    } else {
      selectedCommunity.set(this._id);
    }
  },
  "click a.edit-hash-tag": function(e, t){
    e.stopPropagation();
    e.preventDefault();
    editHashTag.set(this._id);
  },
  "click input#edit-hash-tag": function(e, t){
    e.stopPropagation();
  },
  "keypress input#edit-hash-tag": function(e, t){
    var newHashTag = e.target.value;
    if(e.which === 13){ // Submit change
      Communities.update({_id: this._id}, { $set: { hashTag: newHashTag }});
      editHashTag.set(null);
    } else if (e.keyCode == 27){ // Undo change
      editHashTag.set(null);
    }
  },
  "blur input#edit-hash-tag": function(e, t){
    editHashTag.set(null);
  }
});

Template.communityHashTags.helpers({
  editHashTagMode: function(){
    return editHashTag.get() == this._id;
  }
});

Template.communityHashTagsEditForm.onRendered(function(){
  console.log("Should be focused!");
  $("#edit-hash-tag").focus();
});
