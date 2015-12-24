app.controller("indivGameCtrl", 
["$firebaseArray", "$scope", "$location", "$rootScope", "$http", "generalVariables",
function($firebaseArray, $scope, $location, $rootScope, $http, generalVariables){

	console.log("location ", $location)

	var objectName = $location.$$path.split("/")[2];
	console.log("objectName ", objectName);

	var ref = new Firebase("https://frontcapstone.firebaseio.com");

		//store profile picture in picReturned variable
		$firebaseArray(ref.child("Users").child(generalVariables.getUid())).$loaded()
		.then(function(userReturned){
			$scope.picReturned = userReturned[1].$value;
		})

	//reference to games object in firebase
	var objectFromFirebase = $firebaseArray(ref.child("Games"));

	//get game selected by user
	objectFromFirebase.$loaded()
	.then(function(data){
		console.log("data ", data)

		_.filter(data, function(game){

			if(game.$id === objectName){
				console.log("the game selected is ", game);
				$scope.selectedGame = game;
			}
		})

		//3 way data binding for comments, firebase, and DOM
		$scope.fireComments = $firebaseArray(ref.child("Games").child($scope.selectedGame.$id).child("comments"));
	})



	  //functionality for posting comments
		console.log("username is ", generalVariables.getCurrentUserName());
			
			//holds body of comment
			$scope.commentBody;

			//function to post comment to a users firebase
			$scope.postComment = function(){		

				//if user has enetered a comment
				if($scope.commentBody){

					//go into comment key on game select in firebase (if comment key does not exist yet, this will create it)
					ref.child("Games").child($scope.selectedGame.$id).child("comments").push({
						"commentBody" : $scope.commentBody,
						"commentUser" : generalVariables.getUid(),
						"commentUserPic" : $scope.picReturned,
						"userName" : generalVariables.getCurrentUserName()
					});

					//clear inner html of comment element
					document.getElementById('theCommentBody').value = "";

					//notify user that comment is posted
					$.notify({
									//icon and message
									icon: 'glyphicon glyphicon-ok',
									message: "Comment posted successfully!"
								},{
									// settings
									type: 'success'
								});

				   //notify other users in game of new comment post
					//get uids of other players in game
						var playersInGame = $firebaseArray(ref.child("GameUsers").child($scope.selectedGame.$id));

						playersInGame.$loaded(function(data){
							console.log("data ", data);

							var sendUidArray = []

							//go into usersobject in firebase to each of other players,
							for(var i =0; i < data.length; i++){
								console.log("data[i] ", data[i]);

								//if data[i] is not equal to current user logged in
								if(data[i].$value !== generalVariables.getUid()){
									sendUidArray.push(data[i].$value)
								}
							}

							//send notifications
							for(var x = 0; x < sendUidArray.length; x++){
								ref.child("Users").child(sendUidArray[x]).child("notifications").push({
									"body" : generalVariables.getCurrentUserName()+" commented on a game you are in: "+$scope.selectedGame.sportTitle,
									"read" : false,
									"archived" : false
								})
							}
							
						})


				} else {
					console.log("You must actually eneter a comment to post");
				}
			}

	//funtionality for joining and leaving games
		//Joining game
	$scope.joinGame = function(selectedGame){

		var userIsInGame = false;
		console.log("selectedGame ", selectedGame.$id);
		var currentUid = generalVariables.getUid();

		//get all users in the current game by looking at uids in GameUsers object in firebase
		var gameUsersArrayofCurrent = $firebaseArray(ref.child("GameUsers").child(selectedGame.$id));

		//if current user id doesnt exist in the game, then add game and update current players
		gameUsersArrayofCurrent.$loaded()
		.then(function(data){
			console.log("data ", data);

			//pluck the uids stored
			var uidArray = _.pluck(data, "$value");
			console.log("uidArray ", uidArray);

			//see if current uid of user exists
			var uidIndex = uidArray.indexOf(generalVariables.getUid());
			console.log("uid index is ", uidIndex);

			//if uidIndex is -1 (doesnt exist)
			if(uidIndex === -1){

				//push user uid into this game in gameUsers object in  firebase
				ref.child("GameUsers").child(selectedGame.$id).push(generalVariables.getUid());

				//add transaction to current Players
				ref.child("Games").child(selectedGame.$id).child("currentPlayers").transaction(function(currentPlayers){
					return currentPlayers + 1;
				});

				//display success message through nav notification bar
					$.notify({
								//icon and message
								icon: 'glyphicon glyphicon-ok',
								message: "Joined Game Successfully!"
							},{
								// settings
								type: 'success'
							});

				//send notification to other players

					//get uids of other players in game
					var playersInGame = $firebaseArray(ref.child("GameUsers").child(selectedGame.$id));

					playersInGame.$loaded(function(data){
						console.log("data ", data);

						var sendUidArray = []

						//go into usersobject in firebase to each of other players,
						for(var i =0; i < data.length; i++){
							console.log("data[i] ", data[i]);

							//if data[i] is not equal to current user logged in
							if(data[i].$value !== generalVariables.getUid()){
								sendUidArray.push(data[i].$value)
							}
						}

						//send notifications
						for(var x = 0; x < sendUidArray.length; x++){
							ref.child("Users").child(sendUidArray[x]).child("notifications").push({
								"body" : generalVariables.getCurrentUserName()+" joined a game of yours: "+selectedGame.sportTitle,
								"read" : false,
								"archived" : false
							})
						}
						
					});
			  } else {
			  	console.log("you already joined it bruh");
			  }
		  });
	    }

	    //leaving games
	    $scope.leaveGame = function(game){
			console.log("user wants to leave game ", game);


			//remove user from gameUsers
			var usersInGame = $firebaseArray(ref.child("GameUsers").child(game.$id));



	        usersInGame.$loaded()
	        .then(function(data){

	          //loop over users in game and find current uid
	          _.filter(data, function(index){
	          	if(index.$value === generalVariables.getUid()){
	          		console.log("this user should leave game now");

	          		//does a transaction on firebase game to reduce number of current players
	          		ref.child("Games").child(game.$id).child("currentPlayers").transaction(function(currentPlayers) {
					   
					  return currentPlayers - 1;
					});

					//send notification

					//get uids of other players in game
					var playersInGame = $firebaseArray(ref.child("GameUsers").child(game.$id));

					playersInGame.$loaded(function(data){
						console.log("data ", data);

						var sendUidArray = []

						//go into usersobject in firebase to each of other players,
						for(var i =0; i < data.length; i++){
							console.log("data[i] ", data[i]);

							//if data[i] is not equal to current user logged in
							if(data[i].$value !== generalVariables.getUid()){
								sendUidArray.push(data[i].$value)
							}
						}

						//send notifications
						for(var x = 0; x < sendUidArray.length; x++){
							ref.child("Users").child(sendUidArray[x]).child("notifications").push({
								"body" : generalVariables.getCurrentUserName()+" left a game of yours: "+game.sportTitle,
								"read" : false,
								"archived" : false
							})
						}
						
					})

					//removes user from GameUsers object
	          		ref.child("GameUsers").child(game.$id).child(index.$id).remove();

	          		$.notify({
									//icon and message
									icon: 'glyphicon glyphicon-ok',
									message: "Left game successfully"
								},{
									// settings
									type: 'warning'
								});
	          	}
	          })
	          
	          
	        })


		}


	
}]);