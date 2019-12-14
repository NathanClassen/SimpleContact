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
      $("#addContactSubmitButton").on("click", this.submitNewContact.bind(this));
      $("#cancelButton").on("click", this.cancelContactCreation.bind(this)); // cancel edit/add
      $("#editContactSubmitButton");
      //$("button#editContact"); // to edit individual contact
    },

    setNextId: function() {
      let ids = contacts.map(obj => obj.id);
      nextId = Math.max(...ids) + 1;
    },

    hideAddContactForm: () => {
      $("#addContactForm").slideUp(500);
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
      createEditContactForm(getContactById(contactId));
    },

    createEditContactForm: function(data) {
      // called upon the click of an edit button, creates a contact form
      //  populating its default values with the values passed in via data param

      let name = data.full_name;
      let email = data.email;
      let phoneNumber = data.phone_number
      let tags = data.tags;

      this.$editContactForm.html(formTemplate({
        heading: "Edit Contact",
        full_name: name,
        email: email,
        phone_number: phoneNumber,
        formType: "edit"
      }));

      openEditContactForm(); // calls a method that does animation
    },

    cancelContactCreation: function(e) {
      e.preventDefault();
      $("p.error").hide();
      $(e.target).parent()[0].reset();
      this.hideAddContactForm();
    },

    getFormDataObject: function(form) {
      return {
        id: nextId,
        full_name: form[0].value,
        email: form[1].value,
        phone_number: form[2].value
      }
    },

    updateFilter: function(e) {
      this.filter = e.target.value.trim();
      this.populateContactsGallery();
    },

    filteredContacts: function() {
      let filterStr = this.filter.toLowerCase();
      return contacts.filter(contact => contact.full_name.toLowerCase().includes(filterStr));
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

    retrieveContacts: function() {
      api.getAllContacts();
    },

    showContactsGallery: function() {
      let self = this;
      this.$addContactForm.slideUp(500);
      setTimeout(function() {
        self.$contactsGallery.slideDown();
      }, 500);
    },

    showAddContactForm: function() {
      $("#contactsGallery").slideUp(500);
      setTimeout(function() {
        $("#addContactForm").slideDown();
      }, 500)

      $("#addContactForm input").on("invalid", this.handleInvalidInput);
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

    submitNewContact: function(e) {
      e.preventDefault();
      const form = $(e.target).closest("form")[0];
      const result = this.validateForm(form);

      if(result) {
        app.submitContact(result);
      }
    },

    respondContactsLoaded: function() {
      this.setNextId();
      this.populateContactsGallery();
      $("button#editContact").on("click", this.beginContactEdit.bind(this));
      $("button#delete").on("click", this.startDeleteContact.bind(this));
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

    submitContact: function(contacObj) {
      let data = JSON.stringify(contacObj);
      api.saveAContact(data);
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

    updateAContact: function() {

    },

  }

  ui.init();
});




