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
				    $("#signUpPage").hide();
				    load(user);	
			    }).catch((error)=>{
				    var errorCode = error.code;
				    console.log(errorCode);
			    });
		    });
	    });
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
      //$("#signUpPage").prepend(`<h2>Looks like you aren't signed up yet!</h2>`)
      $("#signInPage").append(`<h2>email or password is incorrect, please try again</h2>`);
      console.log(errorCode);
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
	tweetref.set({timestamp:user.metadata.createdAt,likes:0,profilePic:user.photoURL,uid:user.uid,username:user.displayName,email:user.email,tweet:msg}).then(callback);
};

let renderTweet = ((tObj)=>{
	$("#feed").prepend(`  
	  <div id="atweet" class="card mx-auto" data-uuid="${tObj.key}" style="max-width: 540px;">
    <div class="row g-0">
      <div class="col-md-4">
        <img src="${tObj.val().photoURL}" class="img-fluid rounded-start" alt="IMAGE">
      </div>
      <div class="col-md-8">
        <div class="card-body">
          <h5 class="card-title">${tObj.val().username}</h5>
          <p class="card-text">Says:  ${tObj.val().tweet}</p>
          <p id="likes" class="card-text">Likes: ${tObj.val().likes}</p>
	  <p id="timestamp" class="card-text">Posted: ${Date(tObj.val().timestamp)}</p>
        </div>
      </div>
    </div>
  </div>`);
});
     	
let loadFeed = (()=>{
	let tweetref = db.ref(`tweets`);
	tweetref.on("child_added",ss=>{
		renderTweet(ss);
		$("#atweet").on("click", evt=>{
			alert($(evt.currentTarget).attr("data-uuid"));
		});
	});
});

let load = ((user)=>{
	console.log(user);
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
