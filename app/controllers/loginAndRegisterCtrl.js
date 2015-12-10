//test controller
app.controller("loginAndRegisterCtrl", 
["$firebaseArray", "$scope",

function($firebaseArray, $scope){

	//Information For Login
	$scope.loginEmail;
	$scope.loginpassword;

	//app reference
	var appRef = new Firebase("https://frontcapstone.firebaseio.com");


	//registration info
	$scope.registerEmail;
	$scope.registerUserName;
	$scope.registerPassword;
	$scope.registerConfirmPassword;
	$scope.initialCity;
	$scope.initialState;

	//register user
		//when register is clicked
		//use variables above to add to firebase
	$scope.registerUser = function(){
		//if username and email is not already registered, register user in firebase
		appRef.createUser({
		  email    : $scope.registerEmail,
		  password : $scope.registerPassword
		}, function(error, userData) {
		  if (error) {
		    console.log("Error creating user:", error);
		  } else {
		    console.log("Successfully created user account with uid:", userData.uid);
		    appRef.child("Users").child(userData.uid).set({
		    		username : $scope.registerUserName
		    })
		  }
		});

	}



}]);