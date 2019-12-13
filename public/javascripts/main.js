$(function() {
  const contactsTemplate = Handlebars.compile($("#contactsTemplate").html());   
  const formTemplate = Handlebars.compile($("#formTemplate").html());


  const ui = {
    // has templates properties here

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
      // called from api after api has succesfully grabbed all contacts
      // upon invocation, this method displays all contact divs

      /*
      const contacts = this.contacts;
      const $contactsGallery = $("div#contactsGallery");

      $contactsGallery.html(contactsTemplate({contacts: contacts}));
      this.showContactsGallery();
      */
    },

    retrieveContacts: function() {
      //makes request to api to tell it to make ajax request,
      // when it does, it makes call back to ui to tell it to load page
      //  via the populate contacts gallery method
      //   most below code goes to api obj

      api.getAllContacts();

      const event = jQuery.Event("contactsLoaded");
      const self = this;

      const xhr = new XMLHttpRequest();
      xhr.open("GET", "/api/contacts");
      xhr.send();
      xhr.addEventListener("load", function(e) {
        let contactData = this.response;

        self.contacts = JSON.parse(contactData);
        $("body").trigger(event);
      });
    },

    showContactsGallery: function() {
      // simple animator
      $("div#contactsGallery").slideDown(500);
    },

    showAddContactForm: function() {
      // simple animation

      $("#contactsGallery").slideUp();
      $("#addContactForm").fadeIn();

      $("#addContactForm input").on("invalid", this.handleInvalidInput);
    },

    createAddContactForm: function() {
      // should create this at ui init
      const $addContactForm = $("#addContactForm");
      $addContactForm.html(formTemplate({heading: "Add Contact", formType: "add"}));
    },

    createEditContactForm: function(data) {
      // called upon the click of an edit button, creates a contact form
      //  populating its default values with the values passed in via data param

      const name = data.full_name;
      const email = data.email;
      const phoneNumber = data.phone_number
      const tags = data.tags;

      const $editContactForm = $("#editContactForm");

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
      const formElm = $form[0];
      const contact = {
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
      const $el = $(e.target);
      $el.next().show();
    },

    refresh: function() {
      this.retrieveContacts();
    }

    init: function() {
      this.refresh();
      this.createAddContactForm();
      this.createEditContactForm();
      
      this.bindEventListeners()
      return this;
    }

    /* responsibilities:
      validates form controls
        calls app upon validations to tell it to:

          create contact
          add contact

      calls app to tell it to delete contacts
    */
  }

  const app = {

  }

  const api = {
    url: "localhost:3000/api/contacts",

    getAllContacts: function() {
      $.ajax(this.url { method: "GET" });



      const xhr = new XMLHttpRequest();
      xhr.open("GET", "/api/contacts");
      xhr.send();
      xhr.addEventListener("load", function(e) {
        let contactData = this.response;

        self.contacts = JSON.parse(contactData);
        $("body").trigger(event);
      });
    }
  }

  const Contacts = {

    
    submitNewContact: function(e) {
      e.preventDefault();
      const self = this;
      const $form = $(e.target).parent();
      const result = this.verifyFormContent.call(this, $form);
      if(!result) {
        return false;
      }
      let json = JSON.stringify(result);
      let xhr = new XMLHttpRequest();
      xhr.open("POST", "api/contacts");
      xhr.setRequestHeader("Content-Type", "json");
      xhr.send(json);
      xhr.addEventListener("load", function() {
        self.retrieveContacts();
        return true;
      });
    },
    
  }

  const $body = $("body");
  $body.on("contactsLoaded", Contacts.populateContactsGallery.bind(Contacts));

  Contacts.init();

});
