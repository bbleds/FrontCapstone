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

		//holds output array for games associated with the group
        $scope.groupGames = [];  

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

			//set $scope.userJoin to true if the user viewing the group page has been invited
			//see if user is in ivited users
			if($scope.groupSelected.invitedUsers[generalVariables.getUid()]){
				console.log("hey there is a match here");
				$scope.userJoin = true;
			} else {
				console.log("nah there aint");
			}

			
		});

        //get all games from group
           // get games
           $firebaseArray(ref.child("Games")).$loaded()
           .then(function(games){
                console.log("games ", games);
               var filteredGroups =  _.filter(games, {"finished": false, "gameGroup": $scope.groupSelected.groupName});                

               //for each item in filter groups, push item into groupGames array
               for(var x = 0; x < filteredGroups.length; x++){
                    //push into groupGames Array
                    $scope.groupGames.push(filteredGroups[x]);
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