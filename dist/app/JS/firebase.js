// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyDWUMTzt9HgH0XAMyYGuRsf6YX5axEhCdE",
  authDomain: "my-homework-d98c1.firebaseapp.com",
  projectId: "my-homework-d98c1",
  storageBucket: "my-homework-d98c1.appspot.com",
  messagingSenderId: "641574292347",
  appId: "1:641574292347:web:07f4fd9ee06eb90be40bde",
  measurementId: "G-VSBQKSZCM0"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

var databaseRef = firebase.firestore();
var authRef = firebase.auth();