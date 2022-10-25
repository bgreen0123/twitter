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

let signUp = ()=>{
  $("#start").hide();
  $("#signUpPage").show();
  
  $("#signedUp").on("click",evt=>{
    var firstName = $("#firstName").val();
    var lastName = $("#lastName").val();
    var email = $("#email").val();
    var newPass = $("#signUpPass").val();
    var newUser = [firstName,lastName].join('_').toLowerCase();
    var profilePic = $("#profilePic");
    
    firebase.auth().createUserWithEmailAndPassword(email, newPass).then((userCredential)=>{
        let user = userCredential.user;
	user.updateProfile({
          displayName: newUser,
	  photoURL: profilePic
        });
	$("#signUpPage").hide();
	load(user);	

    }).catch((error)=>{
      var errorCode = error.code;
      console.log(errorCode);
    });
  });
}

let signIn = ()=>{
  $("#start").hide();
  $("#signInPage").show();
  $("#signedIn").on("click",evt=>{
    var email = $("#signInEmail").val();
    var pass = $("#signInPass").val();

    firebase.auth().signInWithEmailAndPassword(email,pass).then((userCredential)=>{
        let user = userCredential.user;
	$("#signInPage").hide();
        load(user);
    })
    .catch((error)=>{
      var errorCode = error.code;
      if(errorCode=="auth/user-not-found"){
        //$("#signUpPage").prepend(`<h2>Looks like you aren't signed up yet!</h2>`)
        $("#signInPage").append(`<h2>email or password is incorrect, please try again</h2>`);
      console.log(errorCode);
      }
    });
  });
};
    
let signOut = ()=>{
	$("#signInEmail").val('');
	$("#signInPass").val('');
	$("#feed").html('');
	$("#tweetit").hide();
	signIn();
};

let publish = function(user,msg,callback){
	let msgref = db.ref(`tweets`);
	tweetref = msgref.push();
	tweetref.set({profilePic:user.photoURL,uid:user.uid,username:user.displayName,email:user.email,tweet:msg}).then(callback);
};

let renderTweet = ((tObj)=>{
	$("#feed").prepend(`
	<div id="atweet" class="card mx-auto" style="max-width: 540px;">
  <div class="row g-0">
    <div class="col-md-4">
      <img src="${tObj.val().photoURL}" class="img-fluid rounded-start" alt="...">
    </div>
    <div class="col-md-8">
      <div class="card-body">
        <h5 class="card-title">${tObj.val().username}</h5>
        <p class="card-text">${tObj.val().tweet}</p>
        <p class="card-text"><small class="text-muted">Last updated 3 mins ago</small></p>
      </div>
    </div>
  </div>
</div>`);
});
     	
let loadFeed = (()=>{
	let tweetref = db.ref(`tweets`);
	tweetref.on("child_added",ss=>{
		renderTweet(ss);
	});
});

let load = ((user)=>{
	$("#signUpSuccess").hide();
	$("#tweetit").show();
	loadFeed();
	$("#submit").on("click", function(evt){
		evt.preventDefault();
		let name = user.displayName;
		let msg = $("#tweet").val();

		publish(user,msg, ()=>{
			$("#tweet").val('');
		});
	});


	$("#atweet").on("click", evt=>{
		alert($(evt.currentTarget).attr("id"));
	});

	$("#signOut").on("click",()=>{
		signOut();
	});
});


let startPage = ()=>{
  $("#signUpPage").hide();
  $("#signInPage").hide();
  $("#loginSuccess").hide();
  $("#signUpSuccess").hide();
  $("#tweetit").hide();
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
};

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
