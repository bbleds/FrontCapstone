app.controller("findUsersCtrl", 
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
        		
        		//be sure to clear out all games that are finished
				generalVariables.checkFinishedGames();

				$scope.usersFound;
				$scope.userCred;

				//get user groups
				$scope.userGroups = [];

				//List groups in firebase
				$firebaseArray(ref.child("Groups")).$loaded()
				.then(function(groups){
					console.log("groups ", groups);

					//loop through groups in firebase
					for(var i = 0; i < groups.length; i++){
						// console.log("groups[i]", groups[i]);
						
						//see if user uid exists in object
						// console.log("groups[i].users.uid ", groups[i].users[generalVariables.getUid()]);					
						//if user uid is in group
						if(groups[i].users[generalVariables.getUid()] !== undefined){							
							//push group object into usersGroups
							$scope.userGroups.push(groups[i]);

						} else {
							console.log("user isnt there");
						}						
					}

					console.log("$scope.userGroups ", $scope.userGroups);
						

				});


				//store user to be invited
					$scope.userToInvite;
				$scope.setUserToInvite = function(user){
					console.log("user", user);
					$scope.userToInvite = user;
				}


				//invite user to group
				$scope.inviteUserToGroup = function(group){
					//get user
					var userSelected = $scope.userToInvite;

					console.log("userSelected ", userSelected);
					//get group from $scope.usersGroups
					var groupSelected;
					for(var i =0; i < $scope.userGroups.length; i++){
						
						if($scope.userGroups[i].groupName === group){
							groupSelected = $scope.userGroups[i];
						}
					}

					console.log("groupSelected ", groupSelected);

					//add user to invitedUsers object of group
					ref.child("Groups").child(groupSelected.$id).child("invitedUsers").set({
						[userSelected.uid] : userSelected.uid
					});

					//send user notification
					ref.child("Users").child(userSelected.uid).child("notifications").push({
						"archived": false,
						"body" : generalVariables.getCurrentUserName()+" invited you to join the group "+groupSelected.groupName,
						"read" : false,
						"zLink" : "groups/"+groupSelected.$id
					});

					//notify logged in user
					//when user goes to group page
					//display join button
				}


				//find users
				$scope.findUsers = function(userCred){
					$scope.usersFound=[];

					if($scope.userCred !== undefined){

						console.log("sassapharse");
					//get firebase users
					$firebaseArray(ref.child("Users")).$loaded()
					.then(function(users){
						console.log("users ", users);

						for(var i = 0; i < users.length; i++){
							//if username, firstname or lastname matches credentials
							if(users[i].username.toLowerCase() === userCred.toLowerCase()){
								//push into output array
								$scope.usersFound.push(users[i]);
							}
							
						}
					})

					}
				}

			}
		});
}]);