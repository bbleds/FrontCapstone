app.controller("userGroupsCtrl", 
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

				//lodash
					//how to pass this as depemdency in app.js
				_ = window._;				

				$scope.groupName = "";
				$scope.groupDescription = "";

				//Create Group in Firebase
				$scope.createGroup = function(){										

					if($scope.groupName !== "" && $scope.groupDescription !== ""){
					//if $scope.groupName !== ""
					//if groupName doesnt exist

					$firebaseArray(ref.child("Groups")).$loaded()
					.then(function(groups){
						console.log("groups ", groups);

						var matchedName = false;

						//loops through groups, 
						for(var i = 0; i < groups.length; i++){
							console.log(groups[i]);
							if(groups[i].groupName.toLowerCase() === $scope.groupName.toLowerCase()){	

								matchedName = true;

							}
						}

						//if there is no match
						if(matchedName === false){
							console.log("this is valid");
							//push group into firebase and current user into users group			
							ref.child("Groups").push({
								"groupHost": generalVariables.getUid(),
								"groupName" : $scope.groupName,
								"groupDescription" : $scope.groupDescription,
								"users":{
									[generalVariables.getUid()] : generalVariables.getUid() 
								}
							});	

							//add new group to DOM
							var newGroup = {
								"groupHost": generalVariables.getUid(),
								"groupName" : $scope.groupName,
								"groupDescription" : $scope.groupDescription,
								"users":{
									[generalVariables.getUid()] : generalVariables.getUid() 
								}
							}
							$scope.userGroups.push(newGroup);

							//alert user
							$.notify({
									//icon and message
									icon: 'glyphicon glyphicon-ok',
									message: "Created Group Successfully"
								},{
									// settings
									type: 'success'
							});


						} else {
							console.log("this already exists");
						}								
					})						
					}
				}

				$scope.userGroups = [];

				//List groups in firebase
				$firebaseArray(ref.child("Groups")).$loaded()
				.then(function(groups){
					console.log("groups ", groups);

					//loop through groups in firebase
					for(var i = 0; i < groups.length; i++){
						console.log("groups[i]", groups[i]);
						
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


				
        	}
        });



}]);