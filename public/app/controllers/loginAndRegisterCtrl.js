
// ---- Controller Summary
	// This controller handles registering and logging in users


app.controller("loginAndRegisterCtrl",
["$firebaseArray", "$scope", "$location", "$rootScope", "generalVariables",

function($firebaseArray, $scope, $location, $rootScope, generalVariables){


// ------------------------- Initial Controller vars and functionality

	//lodash
		//how to pass this as depemdency in app.js
	_ = window._;


	//Information For Login
	$scope.loginEmail="";
	$scope.loginPassword="";

	// status messages
	$scope.registerSuccess="";
	$scope.showRegisterMessage = false;

	//app reference
	var appRef = new Firebase("https://frontcapstone.firebaseio.com");

	//see if user is logged in, and if so, redirect to main page
	generalVariables.checkUserLogin("main");

// ------------------------ Registration functionality

	//registration info
	$scope.registerEmail;
	$scope.registerUserName;
	$scope.registerPassword;
	$scope.registerConfirmPassword;
	$scope.initialCity;
	$scope.initialState;

	//register user
		//when register is clicked
		//use registration info variables to add user to firebase
	$scope.registerUser = function(){
		//if username and email is not already registered, register user in firebase
		var dataArray = $firebaseArray(appRef.child("Users"));

		dataArray.$loaded()
		.then( function(data){

			//get array of all usernames (lodash method)
			var userNames = _.map(data, 'username');


			var userNameExists = false;

			// compare current entered username to username array
			_.filter(userNames, function(n){

				//if username is found in array of names, set userNameExists to true
					//looks and compares username entered to all userNames in firebase = AMAZING LODASH
				 if(n === $scope.registerUserName){
				 	userNameExists = true
				 };
			});

			//userName exists, log username already exists, else, create user
			if(userNameExists){

				// tell user this message
				$scope.registerSuccess="This username already exists please choose another";
				$scope.showRegisterMessage = true;

			//if username doesnt exist
			} else {

				//if all fields are completed and password = confirm password
				if($scope.registerEmail && $scope.registerUserName && $scope.registerPassword && $scope.registerConfirmPassword && $scope.initialCity && $scope.initialState && $scope.registerPassword === $scope.registerConfirmPassword){

						appRef.createUser({
						  email    : $scope.registerEmail,
						  password : $scope.registerPassword
						}, function(error, userData) {
						  if (error) {
								$scope.registerSuccess="Error creating user: "+ error;
								$scope.showRegisterMessage = true;
						  } else {


						    //array that holds references to the three default profile pictures
						    var picArray = ["http://bledsoedesigns.com/crown.jpg", "http://bledsoedesigns.com/light.jpg", "http://bledsoedesigns.com/shield.jpg"]

						    //generate random number between 0 and 2
						    var randIndex = Math.floor(Math.random() * 3);


						    //set default profile picture to array[randomNumber]
						    var defaultPic = picArray[randIndex];

						    //set user details

							    //set up username, pass and profile pic
							    appRef.child("Users").child(userData.uid).set({
							    		username : $scope.registerUserName,
							    		uid: userData.uid,
							    		//pic is null until user uploads, this is default profile pic
							    		profilePic: defaultPic,
							    		//profile tagline
							    		zTagline: false
							    });

							    //set up notifications
							    appRef.child("Users").child(userData.uid).child("notifications").push({
							    	body : "This is where you will see all activity!",
							    	read: false,
							    	archived: false
							    })


						    //log user in
						    $scope.loginUser($scope.registerEmail, $scope.registerPassword);


						  }
						});
				} else {
					$scope.registerSuccess="Error: Please check your passwords";
					$scope.showRegisterMessage = true;
				}

			}


		})

	}


// ------------------------ Login Functionality
	//Login user
	$scope.loginUser = function(email, password){
		appRef.authWithPassword({
		  email    : email,
		  password : password
		}, function(error, authData) {
		  if (error) {

				$scope.registerSuccess = "Login Failed: "+error;
				$scope.showRegisterMessage = true;
		  } else {

				$scope.registerSuccess = "";
				$scope.showRegisterMessage = false;

		    //change body bg image
		    document.getElementById("main_view").style.backgroundImage = "none";

		    //new path to go to
		     $rootScope.$apply(function() {

		       $location.path("/main");

		      });
		  }
		});
	};
}]);
