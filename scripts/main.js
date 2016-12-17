'use strict';


function Milestone2() {
  

  
  this.messageList = document.getElementById('messages');
  this.messageForm = document.getElementById('message-form');
  this.q1 = document.getElementById('q1');
  this.q2 = document.getElementById('q2');
  this.q3 = document.getElementById('q3');
  this.q4 = document.getElementById('q4');
  this.q5 = document.getElementById('q5');
  this.submitButton = document.getElementById('submit');
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.signInSnackbar = document.getElementById('must-signin-snackbar');

  
  this.messageForm.addEventListener('submit', this.saveMessage.bind(this));
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));


  var buttonTogglingHandler = this.toggleButton.bind(this);
  this.q1.addEventListener('keyup', buttonTogglingHandler);
  this.q2.addEventListener('keyup', buttonTogglingHandler);
  this.q3.addEventListener('keyup', buttonTogglingHandler);
  this.q4.addEventListener('keyup', buttonTogglingHandler);
  this.q5.addEventListener('keyup', buttonTogglingHandler);
  this.q1.addEventListener('change', buttonTogglingHandler);
  this.q2.addEventListener('change', buttonTogglingHandler);
  this.q3.addEventListener('change', buttonTogglingHandler);
  this.q4.addEventListener('change', buttonTogglingHandler);
  this.q5.addEventListener('change', buttonTogglingHandler);

  this.initFirebase();
}


Milestone2.prototype.initFirebase = function() {

  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();

  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};


Milestone2.prototype.loadMessages = function() {

  this.messagesRef = this.database.ref('messages');
  this.messagesRef.off();

  var setMessage = function(data){
    var val = data.val();
    this.displayMessage(data.key, val.name, val.text, val.photoURL, val.imageUrl);
  }.bind(this);
  this.messagesRef.limitToLast(4).on('child_added', setMessage);
  this.messagesRef.limitToLast(4).on('child_changed', setMessage);
};


Milestone2.prototype.saveMessage = function(e) {
  e.preventDefault();
 
  if (this.q1.value && this.q2.value && this.q3.value && this.q4.value && this.q5.value && this.checkSignedInWithMessage()) {
    var correct = 0;
    var a1 = document.forms['quizForm']['q1'].value;
    var a2 = document.forms['quizForm']['q2'].value;
    var a3 = document.forms['quizForm']['q3'].value;
    var a4 = document.forms['quizForm']['q4'].value;
    var a5 = document.forms['quizForm']['q5'].value;

    if (a1 == 2 + 2 && a1 != '') correct += 1;
    if (a2 == 2 - 2 && a2 != '') correct += 1;
    if (a3 == 2 * 2 && a3 != '') correct += 1;
    if (a4 == 2 % 2 && a4 != '') correct += 1;
    if (a5 == 2 / 2 && a5 != '') correct += 1;

  
    var currentUser = this.auth.currentUser;
    this.messagesRef.push({
      name: currentUser.displayName,
      text: correct,
      photoURL: currentUser.photoURL || '/images/profile_placeholder.png'
    }).then(function(){
      Milestone2.resetMaterialTextfield(this.q1);
      Milestone2.resetMaterialTextfield(this.q2);
      Milestone2.resetMaterialTextfield(this.q3);
      Milestone2.resetMaterialTextfield(this.q4);
      Milestone2.resetMaterialTextfield(this.q5);
      this.toggleButton();
    }.bind(this)).catch(function(error){
      console.error('error writing new message to firebase database', error);
    });
  }
};


Milestone2.prototype.signIn = function() {
 
  var provider = new firebase.auth.GoogleAuthProvider();
  this.auth.signInWithPopup(provider);
};


Milestone2.prototype.signOut = function() {

  this.auth.signOut();
};


Milestone2.prototype.onAuthStateChanged = function(user) {
  if (user) { // User is signed in!
  
    var profilePicUrl = user.photoURL;   
    var userName = user.displayName;       


    this.userPic.style.backgroundImage = 'url(' + profilePicUrl + ')';
    this.userName.textContent = userName;

   
    this.userName.removeAttribute('hidden');
    this.userPic.removeAttribute('hidden');
    this.signOutButton.removeAttribute('hidden');


    this.signInButton.setAttribute('hidden', 'true');

   
    this.loadMessages();
  } else { 
  
    this.userName.setAttribute('hidden', 'true');
    this.userPic.setAttribute('hidden', 'true');
    this.signOutButton.setAttribute('hidden', 'true');

 
    this.signInButton.removeAttribute('hidden');
  }
};


Milestone2.prototype.checkSignedInWithMessage = function() {

  if(this.auth.currentUser){
    return true;
  }


  var data = {
    message: 'Please log in first!!!',
    timeout: 2000
  };
  this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
  return false;
};


Milestone2.resetMaterialTextfield = function(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
};


Milestone2.MESSAGE_TEMPLATE =
    '<div class="message-container">' +
      '<div class="spacing"><div class="pic"></div></div>' +
      '<div class="message"></div>' +
    '</div>';


Milestone2.LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif';


Milestone2.prototype.displayMessage = function(key, name, text, picUrl, imageUri) {
  var div = document.getElementById(key);
  
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = Milestone2.MESSAGE_TEMPLATE;
    div = container.firstChild;
    div.setAttribute('id', key);
    this.messageList.appendChild(div);
  }
  if (picUrl) {
    div.querySelector('.pic').style.backgroundImage = 'url(' + picUrl + ')';
  }

  var messageElement = div.querySelector('.message');
  if (text) { 
    messageElement.textContent = text;
   
    messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
  } else if (imageUri) { // If the message is an image.
    var image = document.createElement('img');
    image.addEventListener('load', function() {
      this.messageList.scrollTop = this.messageList.scrollHeight;
    }.bind(this));
    this.setImageUrl(imageUri, image);
    messageElement.innerHTML = '';
    messageElement.appendChild(image);
  }
  // Show the card fading-in.
  setTimeout(function() {div.classList.add('visible')}, 1);
  this.messageList.scrollTop = this.messageList.scrollHeight;
  this.q1.focus();
};

Milestone2.prototype.toggleButton = function() {
  if (this.q1.value && this.q2.value && this.q3.value && this.q4.value && this.q5.value) {
    this.submitButton.removeAttribute('disabled');
  } else {
    this.submitButton.setAttribute('disabled', 'true');
  }
};

window.onload = function() {
  window.milestone2 = new Milestone2();
};