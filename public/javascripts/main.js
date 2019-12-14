$(function() {
  let contacts;
  let contactsTemplate = Handlebars.compile($("#contactsTemplate").html());   
  let formTemplate = Handlebars.compile($("#formTemplate").html());
  let nextId;

  let ui = {
    // has templates properties here
    $contactsGallery: $("#contactsGallery"),
    $addContactForm:  $("#addContactForm"),
    $editContactForm: $("#editContactForm"),
    filter:       "",
    selectedTags: [],

    bindEventListeners: function() {
      $("button#addContact").on("click", this.showAddContactForm.bind(this));
      $("#searchBox")[0].addEventListener("input", this.updateFilter.bind(this));
      $("#addContactSubmitButton").on("click", this.submitContactForm.bind(this));
      $("#cancelButton").on("click", this.cancelContactManagement.bind(this)); // cancel edit/add
      
      //$("button#editContact"); // to edit individual contact
    },

    bindEditFormListeners: function() {
      $("#editContactForm input").on("invalid", this.handleInvalidInput);
      $("#editContactSubmitButton").on("click", this.submitContactForm.bind(this));
      $("#editContactForm #cancelButton").on("click", this.cancelContactManagement.bind(this));
    },

    setNextId: function() {
      let ids = contacts.map(obj => obj.id);
      nextId = Math.max(...ids) + 1;
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
      let id = +$(e.target).closest("div").attr("id");
      let result = window.confirm("Delete contact? " + id);
      if (result) { app.deleteContact(id) };
    },

    getContactById: function(id) {
      return contacts.find(contact => contact.id === id);
    },

    beginContactEdit: function(e) {
      let contactId = +$(e.target).closest("div").attr("id");
      this.createEditContactForm(this.getContactById(contactId));
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

      this.bindEditFormListeners();
      this.showEditContactForm(); // calls a method that does animation
    },

    cancelContactManagement: function(e) {
      e.preventDefault();
      $("p.error").hide();
      $(e.target).parent()[0].reset();
      this.hideManagementForm();
    },

    updateFilter: function(e) {
      this.filter = e.target.value.trim();
      this.populateContactsGallery();
    },

    filteredContacts: function() {
      let filterStr = this.filter.toLowerCase();
      return contacts.filter(contact => contact.full_name.toLowerCase().includes(filterStr));
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

      $("#addContactForm input").on("invalid", this.handleInvalidInput);
    },

    showEditContactForm: function() {
      $("#contactsGallery").slideUp(500);
      setTimeout(function() {
        $("#editContactForm").slideDown();
      }, 500);
    },

    getFormDataObject: function(form) {
      return {
        full_name: form[0].value,
        email: form[1].value,
        phone_number: form[2].value
      }
    },

    validateForm: function(form) {
      if(form.checkValidity()) {
        return this.getFormDataObject(form);
      }
      return false;
    },

    handleInvalidInput: function(e){
      // this function will be the event handler for the 'invalid' event fired on the form (and its child inputs) and it will find the name of the input elm(s) and .show() the p el's with the corresponding name
      e.preventDefault();
      let $input = $(e.target);
      $input.next().show();
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
        entryType === "add" ? app.submitContact(result) : app.submitEdits(result, id);
      }
    },

    populateContactsGallery: function() {
      if(contacts.length <= 0) {
        // add "no contacts" banner later
        return;
      }
      let visibleContacts = contacts;
      if(this.filter || this.selectedTags.length > 0) {
        visibleContacts = this.filteredContacts();
      }
      this.$contactsGallery.html(contactsTemplate({contacts: visibleContacts}));
      this.showContactsGallery();
    },

    respondContactsLoaded: function() {
      this.setNextId();
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
      //this.createEditContactForm();
      this.bindEventListeners();
    }

    /* responsibilities:
      validates form controls
        calls app upon validations to tell it to:

          create contact
          add contact

      calls app to tell it to delete contacts
    */
  }

  let app = {

    submitContact: function(contactObj) {
      contactObj.id = nextId;
      let data = JSON.stringify(contactObj);
      api.saveAContact(data);
    },

    submitEdits: function(contactObj, id) {
      console.log(id + ": check");
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
      console.log(data);
      $.ajax("/api/contacts", {
        method: "POST",
        data: data,
        dataType: "json",
        headers: {
          "Content-Type": "application/json",
        },
        success: function(data, status) {
          console.log('suc');
          ui.refresh();
        }
      });

    },

    deleteAContact: function(id) {
      $.ajax(`api/contacts/${id}`, {
        method: "DELETE",
        success: function(data, status) {
          console.log('suc');
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
          console.log('edit suc');
          ui.refresh();
        }
      });
    },

  }

  ui.init();
});




