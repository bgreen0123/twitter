const firebaseConfig = {
  apiKey: "AIzaSyDcVchSqkLT3462-EZQqMwNlEq5gVCHmFY",
  authDomain: "twitter-adfb5.firebaseapp.com",
  databaseURL: "https://twitter-adfb5-default-rtdb.firebaseio.com",
  projectId: "twitter-adfb5",
  storageBucket: "twitter-adfb5.appspot.com",
  messagingSenderId: "957529747771",
  appId: "1:957529747771:web:dc6f9eb320ef89bca8c71e"
};
firebase.initializeApp(firebaseConfig);
let db = firebase.database();

// let username = rtdb.ref(db, "/username/");
// let password = rtdb.ref(db, "/password/");
//let logins = rtdb.ref(db, "/logins/")
// rtdb.onValue(titleRef, ss=>{
//   alert(JSON.stringify(ss.val()));
// });

let signUp = ()=>{
  $("#start").hide();
  $("#signUpPage").show();
  
  $("#signedUp").on("click",evt=>{
    var firstName = $("#firstName").val();
    var lastName = $("#lastName").val();
    var email = $("#email").val();
    var newPass = $("#signUpPass").val();
    var newUser = [firstName,lastName].join('_').toLowerCase();
    
    // firebase.auth().onAuthStateChanged((user) => {
    //   alert("Fired at page load");
    //   if (user) {
    //     alert("Winner Winner chicken dinner");
    //   }
    // });
    
    firebase.auth().createUserWithEmailAndPassword(email, newPass)
      .then((userCredential)=>{
        var user = userCredential.user;
        user.updateProfile({
          displayName: newUser
        });
        console.log(user);
    }).catch((error)=>{
      var errorCode = error.code;
      console.log(errorCode);
    });

    $("#signUpPage").hide();
    $("#signUpSuccess").html(`
      <h1>Congrats! Your username is: ${newUser}</h1>
      <h2>Welcome to Twitter:)</h2>
    `);
    $("#signUpSuccess").show();
  })
}

let signIn = ()=>{
  $("#start").hide();
  $("#signInPage").show();
  $("#signedIn").on("click",evt=>{
    var email = $("#signInEmail").val();
    var pass = $("#signInPass").val();

    firebase.auth().signInWithEmailAndPassword(email,pass)
      .then(()=>{
        $("#signInPage").hide();
        $("#loginSuccess").show();
    })
    .catch((error)=>{
      var errorCode = error.code;
      if(errorCode=="auth/user-not-found"){
        $("#signInPage").hide();
        $("#signUpPage").show();
        $("#signUpPage").prepend(`<h2>Looks like you aren't signed up yet!</h2>`)
      }
      else{
        $("#signInPage").append(`<h2>email or password is incorrect, please try again</h2>`);
      }
      console.log(errorCode);
    });
  // let loginRef = rtdb.ref(db,"/logins");
  // rtdb.onValue(loginRef, ss=>{
  //   //alert(JSON.stringify(ss.val()));
  //   let loginObj = ss.val();
  //   let theIDs = Object.keys(loginRef);
  //   alert(theIDs.val())
  //   theIDs.map(anId=>{
  //     let theLogin = loginObj[anId];
  //     if(theLogin.username == user){
  //       alter(2);
  //       $("#signInPage").hide();
  //       $("#loginSuccess").show();
  //     }else{
  //       alert(3);
  //       $("#signInPage").append(`
  //       <h2>username or password is incorrect</h2>
  //       `);
  //     }
  //   });
  // });
 })
}



let startPage = ()=>{
  $("#signUpPage").hide();
  $("#signInPage").hide();
  $("#loginSuccess").hide();
  $("#signUpSuccess").hide();
  $("#start").html(`
  <h1 id="start">Twitter!</h1>
  <p id="ask">Sign in or sign up if you are new!</p>
  <button id="signin">Sign In</button>
  <button id="signup">Sign Up</button>
  `);
  $("#signin").on("click",()=>{
    signIn();
  });
  $("#signup").on("click",()=>{
    signUp();
  });
}

startPage();






// let tweets = [{"name":"Brendan","content":"Hello there","id":"uuid1"},
//               {"name":"Brendan","content":"Hello there","id":"uuid2"},
//               {"name":"Brendan","content":"Hello there","id":"uuid3"},
//               {"name":"Brendan","content":"Hello there","id":"uuid4"}]

// let renderTweet = (tweet)=>{
//   $("#feed").append(`
//   <div class="tweet" id=${tweet.id}>
//     ${tweet.name}: ${tweet.content}
//    </div>
//    `);
// }

// tweets.map(renderTweet);

// $(".tweet").on("click",evt=>{
//   alert($(evt.currentTarget).attr("id"));
//        });
