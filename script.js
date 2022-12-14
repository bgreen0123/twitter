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
    var firstName = $("#firstName").val().trim();
    var lastName = $("#lastName").val().trim();
    var email = $("#email").val();
    var newPass = $("#signUpPass").val();
    var newUser = [firstName,lastName].join('_').toLowerCase(); 
    const fileReader = new FileReader();
    var theFile = $("#profilePic").prop('files')[0];
    fileReader.readAsArrayBuffer(theFile);

        fileReader.addEventListener("load", async (evt)=>{
	        let profilePicData = fileReader.result;
	        let storageRef = firebase.storage().ref();
	        let storageDest = storageRef.child(theFile.name);
	        storageDest.put(profilePicData, {
		    contentType:theFile.type,
	        }).then(ss=>{
		    ss.ref.getDownloadURL().then((theURL)=>{
			    console.log(theURL);
			    firebase.auth().createUserWithEmailAndPassword(email, newPass).then((userCredential)=>{
				let user = userCredential.user;
		    	        user.updateProfile({
	    			    displayName: newUser,
	    			    photoURL: theURL,
			        });
				let userref = db.ref(`/users/${user.uid}`);
				userref.set({tweets:0,followers:0,following:0,username:user.displayName,uid:user.uid})
			        $("#signUpPage").hide();
				loadUserPage(user);	
		    	    }).catch((error)=>{
	    			var errorCode = error.code;
	    			console.log(errorCode);
		    	    });

		   });
  	       });
        });
  });

  $("#toSignIn").on("click",()=>{
	  $("#signUpPage").hide();
	  signIn();
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
        //load(user);
	loadUserPage(user);
    })
    .catch((error)=>{
      var errorCode = error.code;
      //$("#signUpPage").prepend(`<h2>Looks like you aren't signed up yet!</h2>`)
      $("#signInPage").append(`<h2>email or password is incorrect, please try again</h2>`);
      console.log(errorCode);
    });
  });

  $("#toSignUp").on("click",()=>{
	  $("#signInPage").hide();
	  signUp();
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
	let msgref = db.ref("tweets");
	tweetref = msgref.push();
	tweetref.set({timestamp:user.metadata.createdAt,likes:0,profilePic:user.photoURL,uid:user.uid,username:user.displayName,email:user.email,tweet:msg}).then(callback);
	updateTweetCount(user);
};

let updateTweetCount = function(user){
	let userref = db.ref(`users/${user.uid}`);
	userref.get().then((ss)=>{
		userref.child("tweets").set((ss.val().tweets)+1);
	});
};

let renderTweet = ((tObj)=>{
	$("#feed").prepend(`
	  <div id="atweet" class="card mx-auto" data-uuid="${tObj.key}" style="max-width: 540px;">
    <div class="row g-0">
      <div class="col-md-4">
        <img src="${tObj.val().profilePic}" class="img-fluid rounded-start" alt="No Image">
      </div>
      <div class="col-md-8">
        <div class="card-body">
          <h5 class="card-title">${tObj.val().username}</h5>
          <p class="card-text">Says:  ${tObj.val().tweet}</p>
          <p class="card-text like-btn" tweetId="${tObj.key}">Likes: ${tObj.val().likes}</p>
	  <p id="timestamp" class="card-text">Posted: ${Date(tObj.val().timestamp)}</p>
        </div>
      </div>
    </div>
  </div>`);
});

let loadFeed = (()=>{
	let tweetref = db.ref(`/tweets`);

	tweetref.on("child_added",ss=>{
		renderTweet(ss);
		$(".like-btn").off("click");
		$(".like-btn").on("click", evt=>{
			let tweetId = $(evt.currentTarget).attr("tweetId");
			let numLikes = ss.val().likes;
			tweetref.child(tweetId).child("likes").set(numLikes+1);
			$(evt.currentTarget).html(`Likes: ${parseInt(numLikes)+1}`);
		});
	});
});


let load = ((user)=>{
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


	$("#signOut").on("click",()=>{
		signOut();
	});

	$("#fromFeedToHome").on("click",()=>{
		$("#feed").html('');
		$("#tweetit").hide();
		loadUserPage(user);
	});
	$("fromFeedToUsers").on("click",()=>{
		$("#feed").html('');
		$("#tweetit").hide();
		loadAllUsers(user);
	});
});


let loadUserPage = ((user)=>{
	$("#userHomePage").show();
	let userref = db.ref(`users/${user.uid}`);
	let numTweets = 0;
	let numFollowers=0;
	let numFollowing=0;
	userref.get().then((ss)=>{
		numTweets = ss.val().tweets;
		numFollowing = ss.val().following;
		numFollowers = ss.val().followers
	});

	$("#userHomePage").html(`
<nav class="navbar navbar-expandlg navbar-light bg-light">
  <span class="navbar-brand mb-0 h1">Twitter</span>
  <div class="btn-group role="group>
    <button id="fromHomeToHome" type="button" class="btn btn-dark">Home</button>
    <button id="fromHomeToFeed" type="button" class="btn btn-dark">Feed</button>  
    <button id="fromHomeToUsers" type="button" class="btn btn-dark">Users</button> 
  </div>
</nav>

<section class="h-100 gradient-custom-2">
  <div class="container py-5 h-100">
    <div class="row d-flex justify-content-center align-items-center h-100">
      <div class="col col-lg-9 col-xl-7">
        <div class="card">
          <div class="rounded-top text-white d-flex flex-row" style="background-color: #000; height:200px;">
            <div class="ms-4 mt-5 d-flex flex-column" style="width: 150px;height:100px;">
              <img src="${user.photoURL}"
                alt="Generic placeholder image" class="img-fluid img-thumbnail mt-4 mb-2"
                style="width: 150px; z-index: 1">
	      <button class="btn btn-outline-dark" data-mdb-ripple-color="dark">Follow</button>
            </div>
            <div class="ms-4" style="margin-top: 130px;">
              <h3>${user.displayName}</h3>
            </div>
          </div>
          <div class="p-4 text-black" style="background-color: #f8f9fa;">
            <div class="d-flex justify-content-end text-center py-1">
              <div>
                <p class="mb-1 h5">${numTweets}</p>
                <p class="small text-muted mb-0">Tweets</p>
              </div>
              <div class="px-3">
                <p class="mb-1 h5">${numFollowers}</p>
                <p class="small text-muted mb-0">Followers</p>
              </div>
              <div>
                <p class="mb-1 h5">${numFollowing}</p>
                <p class="small text-muted mb-0">Following</p>
              </div>
            </div>
          </div>
          <div class="card-body p-4 text-black">
            <div class="mb-5">
              <p class="lead fw-normal mb-1">Bio</p>
              <div class="p-4" style="background-color: #f8f9fa;">
                <p class="font-italic mb-1">...</p>
              </div>
            </div>
            <div class="d-flex justify-content-between align-items-center mb-4">
              <p class="lead fw-normal mb-0">Tweets</p>
              <p class="mb-0"><a href="#!" class="text-muted"></a></p>
            </div>
	</div>
      </div>
    </div>
  </div>
</section>`);

	$("#fromHomeToFeed").on("click", ()=>{
		$("#userHomePage").hide();
		load(user);
	});
	$("#fromHomeToUsers").on("click", ()=>{
		$("#userHomePage").hide();
		loadAllUsers(user);
	});
});

let loadAllUsers = (user)=>{
	$("#allUsers").show();
	let userref = db.ref("users");
	userref.on("child_added", ss=>{
		$("#users").append(`
			<span>${ss.val().username}</span>
			<button id="${ss.key}" class="toProfile">View Profile</button>`);
		$(".toProfile").on("click",()=>{
			alert(`You want to see ${ss.val().username}`);
		});
	});
	$("#fromUsersTofeed").on("click", ()=>{
		$("#allUsers").hide();
		$("#users").html('');
		load(user);
	});
	$("#fromUsersToHome").on("click", ()=>{
		$("#allUsers").hide();
		$("#users").html('');
		loadUserPage(user);
	});


};

let startPage = ()=>{
  $("#signUpPage").hide();
  $("#signInPage").hide();
  $("#loginSuccess").hide();
  $("#userHomePage").hide();
  $("#tweetit").hide();
  $("#allUsers").hide();
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
