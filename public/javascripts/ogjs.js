$(function() {
  const contactsTemplate = Handlebars.compile($("#contactsTemplate").html());   
  const formTemplate = Handlebars.compile($("#formTemplate").html());

  const Contacts = {
    showContactsGallery: function() {
      $("div#contactsGallery").slideDown(500);
    },
    createAddContactForm: function() {
      const $addContactForm = $("#addContactForm");
      $addContactForm.html(formTemplate({heading: "Add Contact", formType: "add"}));
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
    createEditContactForm: function(contact) {
      const name = contact.full_name;
      const email = contact.email;
      const phoneNumber = contact.phone_number
      const tags = contact.tags;

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
    populateContactsGallery: function() {
      const contacts = this.contacts;
      const $contactsGallery = $("div#contactsGallery");

      $contactsGallery.html(contactsTemplate({contacts: contacts}));
      this.showContactsGallery();
    },
    showAddContactForm: function() {
      $("#contactsGallery").slideUp();
      $("#addContactForm").fadeIn();

      $("#addContactForm input").on("invalid", this.handleInvalidInput);
    },
    handleInvalidInput: function(e){
      e.preventDefault();
      const $el = $(e.target);
      $el.next().show();
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
    retrieveContacts: function() {
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
    bindEventListeners: function() {
      //$("input#searchBox")
      $("button#addContact").on("click", this.showAddContactForm.bind(this));
      $("#addContactForm #addButton").on("click", this.submitNewContact.bind(this));
      $("#addContactForm #cancelButton").on("click", this.cancelContactCreation.bind(this));
      // $("button#editContact") this listener will have to go on AFTER an edit form is made.
    },
    init: function() {
      this.retrieveContacts();
      this.createAddContactForm();
      //this.createEditContactForm();
      
      this.bindEventListeners()
      return this;
    }
  }

  const $body = $("body");
  $body.on("contactsLoaded", Contacts.populateContactsGallery.bind(Contacts));

  Contacts.init();

});
