$(function() {
  let contacts;
  let contactsTemplate = Handlebars.compile($("#contactsTemplate").html());   
  let formTemplate = Handlebars.compile($("#formTemplate").html());
  let tagCloudTemplate = Handlebars.compile($("#tagCloudTemplate").html());
  let nextId;

  let ui = {
    $contactsGallery: $("#contactsGallery"),
    $addContactForm:  $("#addContactForm"),
    $editContactForm: $("#editContactForm"),
    $tagCloud:        $("#tagCloud"),
    filter:       "",
    tagBank:      [],
    tagFilters:   [],
    selectedTags: [],

    bindEventListeners: function() {
      $("button#addContact").on("click", this.showAddContactForm.bind(this));
      $("#searchBox")[0].addEventListener("input", this.updateFilter.bind(this));
      $("#addContactSubmitButton").on("click", this.submitContactForm.bind(this));
      $("#cancelButton").on("click", this.cancelContactManagement.bind(this));
      $("#filterByTag").on("click", this.toggleTagCloud);
      $("#tagCloud button").on("click", this.toggleTagCloud);
      $("#divider").on("click", this.toggleTagCloud);
    },

    bindEditFormListeners: function() {
      $("#editContactForm input").on("invalid", this.handleInvalidInput);
      $("#editContactSubmitButton").on("click", this.submitContactForm.bind(this));
      $("#editContactForm #cancelButton").on("click", this.cancelContactManagement.bind(this));
      $("#editContactForm #addTag").on("click", this.addTag.bind(this));
    },

    toggleTagCloud: function(e) {
      e.preventDefault();
      $("#divider").fadeToggle(300);
      $("#tagCloud").fadeToggle(300);
    },

    hideManagementForm: () => {
      $("div.form").slideUp(500);
      setTimeout(function() {
        $("#contactsGallery").slideDown();
      }, 500);
    },

    createAddContactForm: function() {
      this.$addContactForm.html(
        formTemplate({heading: "Add Contact", formType: "add"})
      );
    },

    startDeleteContact: function(e) {
      this.selectedTags = [];
      let id = +$(e.target).closest("div").attr("id");
      let result = window.confirm("Delete contact?");
      if (result) { application.deleteContact(id) };
    },

    getContactById: function(id) {
      return contacts.find(contact => contact.id === id);
    },

    tagBankHas: function(tagName) {
      return !!this.tagBank.includes(tagName);
    },

    addTag: function(e) {
      e.preventDefault();
      let formType = $(e.target).parent().attr("id");
      let input = $(`input#${formType}TagInput`);
      let tagName = input.val().trim();
      if (tagName) {
        if(this.tagBankHas(tagName)) {
          this.tagBank = this.tagBank.filter(tag => tag !== tagName);
        } else {
          this.tagBank.push(tagName);
        }
      }
    },

    showEditContactForm: function() {
      $("#contactsGallery").slideUp(500);
      setTimeout(function() {
        $("#editContactForm").slideDown();
      }, 500);
    },

    createEditContactForm: function(contactData) {
      this.$editContactForm.html(formTemplate({
        heading: "Edit Contact",
        id: contactData.id,
        full_name: contactData.full_name,
        email: contactData.email,
        phone_number: contactData.phone_number,
        formType: "edit"
      }));
      
      this.tagBank = contacts.find(contact => contact.id == contactData.id).tags.split(',');
      this.bindEditFormListeners();
      this.showEditContactForm();
    },

    beginContactEdit: function(e) {
      this.selectedTags = [];
      let contactId = +$(e.target).closest("div").attr("id");
      this.createEditContactForm(this.getContactById(contactId));
    },

    cancelContactManagement: function(e) {
      e.preventDefault();
      $("p.error").hide();
      $(e.target).parent()[0].reset();
      this.tagBank = [];
      this.hideManagementForm();
    },

    updateFilter: function(e) {
      this.filter = e.target.value.trim();
      this.populateContactsGallery();
    },

    showContactsGallery: function() {
      let self = this;
      $("div.form").slideUp(500);
      setTimeout(function() {
        self.$contactsGallery.slideDown();
      }, 500);
      $("button#editContact").on("click", this.beginContactEdit.bind(this));
      $("button#delete").on("click", this.startDeleteContact.bind(this));
    },

    showAddContactForm: function() {
      $("#contactsGallery").slideUp(500);
      setTimeout(function() {
        $("#addContactForm").slideDown();
      }, 500)
      this.selectedTags = [];
      $("#addContactForm input").off().on("invalid", this.handleInvalidInput);
      $("button#addTag").off().on("click", this.addTag.bind(this));
    },

    stringifyTagBank: function() {
      return this.tagBank.join(',');
    },

    handleInvalidInput: function(e){
      e.preventDefault();
      let $input = $(e.target);
      $input.next().show();
    },

    getFormDataObject: function(form) {
      return {
        full_name: form[0].value,
        email: form[1].value,
        phone_number: form[2].value,
        tags: this.stringifyTagBank()
      }
    },

    validateForm: function(form) {
      if(form.checkValidity()) {
        return this.getFormDataObject(form);
      }
      return false;
    },

    submitContactForm: function(e) {
      e.preventDefault();
      let form = $(e.target).closest("form")[0];
      let id;
      if ($(form).attr("data-id")) {
        id = +$(form).attr("data-id");
      }
      let entryType = $(form).attr("id");
      let result = this.validateForm(form);
      if(result) {
        this.tagBank = [];
        form.reset();
        entryType === "add" ? application.submitContact(result) : application.submitEdits(result, id);
      }
    },

    toggleTagIsSelected: function(tagName) {
      if(this.selectedTags.includes(tagName)) {
        this.selectedTags = this.selectedTags.filter(tag => tag !== tagName);
      } else {
        this.selectedTags.push(tagName);
      }
    },

    tagClickPrototype: function(e) {
      let tag = $(e.target);
      let tagName = (tag.text());
      this.toggleTagIsSelected(tagName);
      tag.toggleClass("activeTag");
      this.populateContactsGallery();
      
    },

    displayNoContacts: function() {
      let div = $("<div id='noContacts'><h1>there are no contacts</h1></div>");
      this.$contactsGallery.append(div);
      this.showContactsGallery();
    },

    refreshTagCloud: function() {
      let tags = this.tagFilters;
      this.$tagCloud.html(tagCloudTemplate({tags: tags}));
      $("#tagCloud button").on("click", this.toggleTagCloud);
      $("#tagCloud span").on("click", this.tagClickPrototype.bind(this));
    },

    isTagged: function(contact) {
      for(i = 0; i < this.selectedTags.length; i++) {
        if(contact.tags.includes(this.selectedTags[i])) {
          return true;
        }
      }
      return false;
    },

    filteredContacts: function() {
      let self = this;
      let filterStr = this.filter.toLowerCase();
      return contacts.filter(function(contact) {
        return (!!filterStr && contact.full_name.toLowerCase().includes(filterStr))
          || self.isTagged(contact);
      });
    },

    populateContactsGallery: function() {
      if(contacts.length <= 0) {
        this.displayNoContacts();
        return;
      }
      $("#noContacts").remove();
      let visibleContacts = contacts;
      if(this.filter || this.selectedTags.length > 0) { 
        visibleContacts = this.filteredContacts();
      }
      $("#contactList").remove();
      this.$contactsGallery.append(contactsTemplate({contacts: visibleContacts}));
      this.showContactsGallery();
    },

    getAllTags: function() {
      let self = this;
      this.tagFilters = [];
      contacts.forEach(function(contact) {
        if(contact.tags) {
          let contactsTags = contact.tags.split(',');
          contactsTags.forEach(function(tagName) {
            if(!self.tagFilters.map(obj => obj.tag).includes(tagName)) {
              self.tagFilters.push({tag: tagName});

            }
          });
        }
      });
      this.refreshTagCloud();
    },

    setNextId: function() {
      let ids = contacts.map(obj => obj.id);
      nextId = Math.max(...ids) + 1;
    },

    respondContactsLoaded: function() {
      this.setNextId();
      this.getAllTags();
      this.populateContactsGallery();
    },

    retrieveContacts: function() {
      api.getAllContacts();
    },

    refresh: function() {
      this.retrieveContacts();
    },

    init: function() {
      this.createAddContactForm();
      this.refresh();
      this.bindEventListeners();
    }
  }

  let application = {

    submitContact: function(contactObj) {
      contactObj.id = nextId;
      let data = JSON.stringify(contactObj);
      api.saveAContact(data);
    },

    submitEdits: function(contactObj, id) {
      let data = JSON.stringify(contactObj);
      api.updateAContact(id, data);
    },

    deleteContact: function(id) {
      id = `${id}`;
      api.deleteAContact(id);
    }

  }

  let api = {

    getAllContacts: function() {
      $.ajax("/api/contacts", {
        method: "GET",
        success: function(data, status) {
          contacts = data;
          ui.respondContactsLoaded();
        }
      });
    },

    saveAContact: function(data) {
      $.ajax("/api/contacts", {
        method: "POST",
        data: data,
        dataType: "json",
        headers: {
          "Content-Type": "application/json",
        },
        success: function(data, status) {
          ui.refresh();
        }
      });

    },

    deleteAContact: function(id) {
      $.ajax(`api/contacts/${id}`, {
        method: "DELETE",
        success: function(data, status) {
          ui.refresh();
        }
      });
    },

    updateAContact: function(id, data) {
      $.ajax(`api/contacts/${id}`, {
        method: "PUT",
        data: data,
        dataType: "json",
        headers: {
          "Content-Type": "application/json",
        },
        success: function(data, status) {
          ui.refresh();
        }
      });
    },
  }

  ui.init();
});
