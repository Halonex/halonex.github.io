  // Import the functions you need from the SDKs you need



  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.1/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional



  const firebaseConfig = {
    apiKey: "AIzaSyDXAZU-U5VLwRdp-CEPuLubO1tJ996cbTo",
    authDomain: "halonex-companion.firebaseapp.com",
    databaseURL: "https://halonex-companion-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "halonex-companion",
    storageBucket: "halonex-companion.appspot.com",
    messagingSenderId: "339446753160",
    appId: "1:339446753160:web:32a6a61a3ee0065cd5fc3d",
    measurementId: "G-6J7ZEE5YKJ"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);

  firebase.auth().createUserWithEmailAndPassword(email, password)
  .then((userCredential) => {
    // Signed in 
    window.alert("account created");
    var user = userCredential.user;
    // ...
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    // ..
  });

  firebase.auth().signInWithEmailAndPassword(email, password)
  .then((userCredential) => {
    // Signed in
    var user = userCredential.user;
    // ...
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
  });

