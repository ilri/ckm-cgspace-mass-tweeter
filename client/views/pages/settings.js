editHashTag = new ReactiveVar();

Template.settings.helpers({
  communities: function(){
    return Communities.find({}, {sort: {name: 1}});
  },
  editHashTagMode: function(){
    return editHashTag.get() == this._id;
  }
});

Template.settings.events({
  "dblclick td.hashTag": function(e, t){
    editHashTag.set(this._id);
  },
  "keyup input#edit-hash-tag": function(e, t){
    var newHashTag = e.target.value;
    if(e.keyCode == 13){ // Submit change
      Communities.update({_id: this._id}, { $set: { hashTag: newHashTag }});
      editHashTag.set(null);
    } else if (e.keyCode == 27){ // Undo change
      editHashTag.set(null);
    }
  }
});
