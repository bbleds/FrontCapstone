app.controller("indivGroupCtrl", 
["$firebaseArray", "$scope", "$location", "$rootScope", "$http", "generalVariables",
function($firebaseArray, $scope, $location, $rootScope, $http, generalVariables){

	//see if user is logged in 
	var ref = new Firebase("https://frontcapstone.firebaseio.com");

	//instead of running onauth in general variables, we run it here because the code was being parsed in an unexpected sequence which cause generalVairables.getUid to be undefined in the code below. Since we are checking directly in this file for auth data, (and in mainPageCtrl), it elminates those errors and unexpected behavior.
	ref.onAuth(function(authdata){
		console.log("authdata ", authdata);
		if(authdata === null){
			  console.log("Client unauthenticated.");
        	    $location.path("/login");
        	} else {

		//get group object from url
		var objectName = $location.$$path.split("/")[2];  

		//stores the current grup selected (the current group on page)
		$scope.groupSelected;

		//holds output array for all memebers of the group
        $scope.groupMembers =[] 

        //holds total number of group members
        $scope.memberTotal; 

        //store whether or not a new user is invited to the group
        $scope.userJoin = false;

		//get group from firebase
		$firebaseArray(ref.child("Groups")).$loaded()
		.then(function(groups){

			console.log("group ", groups);
			//loop through groups to find group selected, and store group object in $scope.groupSelected
			for(var i = 0; i < groups.length; i++){
				// console.log(groups[i]);

				//if group id matches id of current group 
				if(groups[i].$id === objectName){
					//store group in $scope.groupSelected variable
					$scope.groupSelected = groups[i];
				}
			}
			console.log("groupSelected ", $scope.groupSelected);

			//get all group members
			var groupMemberArray = [];

				//store group memeber uids in group member array
				for(var key in  $scope.groupSelected.users){
					groupMemberArray.push($scope.groupSelected.users[key]);
				}

				//store total member number
				  $scope.memberTotal = groupMemberArray.length;

				//get users from firebase
				$firebaseArray(ref.child("Users")).$loaded()
				.then(function(users){
					//loop through users
					for(var i = 0; i < users.length; i++){

						//loop through group members
						for(var x = 0; x < groupMemberArray.length; x++){
							//if user uid is the same as groupMemberArray[index] (which is a uid), push user to output variable
							if(users[i].uid === groupMemberArray[x]){
								//push to output variable
								$scope.groupMembers.push(users[i]);

							}
						}
					}

				})






			//set $scope.userJoin to true if the user viewing the group page has been invited
			//see if user is in ivited users
			if($scope.groupSelected.invitedUsers[generalVariables.getUid()]){
				console.log("hey there is a match here");
				$scope.userJoin = true;
			} else {
				console.log("nah there aint");
			}

			
		});




        //add user to group
        	$scope.addUserToGroup = function(){
        		console.log("ADDING USER TO GROUP");

        		//go into group object in firebase, add current user to users
        		ref.child("Groups").child(objectName).child("users").child(generalVariables.getUid()).set(generalVariables.getUid());

        	}


                        



        	}
        });
}]);