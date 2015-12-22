app.controller("userProfileCtrl", 
["$firebaseArray", "$scope", "$location", "$rootScope", "$http", "generalVariables",
function($firebaseArray, $scope, $location, $rootScope, $http, generalVariables){

	//see if user is logged in 
	var ref = new Firebase("https://frontcapstone.firebaseio.com");
	// generalVariables.checkUserLogin("main");


	//instead of running onauth in general variables, we run it here because the code was being parsed in an unexpected sequence which cause generalVairables.getUid to be undefined in the code below. Since we are checking directly in this file for auth data, (and in notificationsCtrl), it elminates those errors and unexpected behavior
	ref.onAuth(function(authdata){
		console.log("authdata ", authdata);
		if(authdata === null){
			  console.log("Client unauthenticated.");
        	    $location.path("/login");
        	}  else {

        		//variables to hold any info from user requesting to edit profile
        		$scope.profilePicEntered;
        		$scope.taglineEntered;

        		//set username
        		$scope.userName = generalVariables.getCurrentUserName();

        		//get profile picture and profile tagline from firebase and set to $scope.profilePic & $scope.profileTag variable
        		$firebaseArray(ref.child("Users").child(generalVariables.getUid())).$loaded()
        		.then(function(userData){
        			// console.log("userData ", userData);
        			$scope.profilePic = userData[1].$value;

        			$scope.profileTag = userData[4].$value;

        		});

        		//function to change profile picture
        		$scope.editUserDetails = function(){

        			//if new profil pic enetered
        			if($scope.profilePicEntered){
        				console.log("we should now change the pic");
        			//set profile picture to new picture given by user
        			ref.child("Users").child(generalVariables.getUid()).child("profilePic").set($scope.profilePicEntered);

        			//change profile pic to what user entered
        			$scope.profilePic = $scope.profilePicEntered;
        			}
        			if($scope.taglineEntered){
        				console.log("we should now change tagline");

        				//set profile tagline to new tagline given by user
        			ref.child("Users").child(generalVariables.getUid()).child("zTagline").set($scope.taglineEntered);

        			//change profile tagline to what user entered
        			$scope.profileTag = $scope.taglineEntered

        			}

        			else {
        				console.log("you need to enter someting bruh");
        			}
        		}



        	}
        });
}]);