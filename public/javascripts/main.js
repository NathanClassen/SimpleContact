$(function() {
  let contacts;
  let contactsTemplate = Handlebars.compile($("#contactsTemplate").html());   
  let formTemplate = Handlebars.compile($("#formTemplate").html());
  




  let ui = {
    // has templates properties here
    $contactsGallery: $("#contactsGallery"),
    $addContactForm: $("#addContactForm"),

    bindEventListeners: function() {
      $("button#addContact").on("click", this.showAddContactForm.bind(this)); // start new contact addition
      $("input#searchBox"); // filter
      $("#addContactSubmitButton").on("click", this.submitNewContact.bind(this)); // submit contact
      $("#cancelButton").on("click", this.cancelContactCreation.bind(this)); // cancel edit/add
      $("#editContactSubmitButton"); // submit edits
      $("button#editContact"); // to edit individual contact
      $("button#deletContact"); // to delete individual contact
    },

    populateContactsGallery: function() {
      if(contacts.length > 0) {
        this.$contactsGallery.html(contactsTemplate({contacts: contacts}));
      }
      this.showContactsGallery();
    },

    retrieveContacts: function() {
      api.getAllContacts();
    },

    showContactsGallery: function() {
      $("div#contactsGallery").slideDown(500);
    },

    showAddContactForm: function() {
      // simple animation

      $("#contactsGallery").slideUp();
      $("#addContactForm").fadeIn();

      $("#addContactForm input").on("invalid", this.handleInvalidInput);
    },

    createAddContactForm: function() {
      this.$addContactForm.html(
        formTemplate({heading: "Add Contact", formType: "add"})
      );
    },

    createEditContactForm: function(data) {
      // called upon the click of an edit button, creates a contact form
      //  populating its default values with the values passed in via data param

      let name = data.full_name;
      let email = data.email;
      let phoneNumber = data.phone_number
      let tags = data.tags;

      let $editContactForm = $("#editContactForm");

      $editContactForm.html(formTemplate({
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
      $(e.target).parent()[0].reset();
      $("#addContactForm").fadeOut();
      setTimeout(function() {
        $("#contactsGallery").slideDown();
      }, 200);

      $("p.error").hide();
    },

    verifyFormContent: function($form) {
      let formElm = $form[0];
      let contact = {
        full_name: formElm[0].value,
        email: formElm[1].value,
        phone_number: formElm[2].value
      };

      if($form[0].checkValidity()) {
        return contact;
      } else {
        return false;
      }
    },

    handleInvalidInput: function(e){
      e.preventDefault();
      let $el = $(e.target);
      $el.next().show();
    },

    refresh: function() {
      this.retrieveContacts();
    },

    init: function() {
      this.createAddContactForm();
      this.refresh();
      //this.createAddContactForm();
      //this.createEditContactForm();
      
      //this.bindEventListeners()
      //return this;
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

  }

  let api = {

    getAllContacts: function() {
      $.ajax("/api/contacts", {
        method: "GET",
        success: function(data, status) {
          contacts = data;
          ui.populateContactsGallery();
        }
      });
    },

    saveAContact: function(data) {
      // must be called from app obj, which will call it when ui validates submission form
      //  and calls the app to submit the data.

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

    deleteAContact: function() {

    },

    updateAContact: function() {

    },

  }

  ui.init();

});
