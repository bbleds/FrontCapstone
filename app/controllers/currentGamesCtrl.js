app.controller("currentGamesCtrl", 
["$firebaseArray", "$scope", "$location", "$rootScope", "$http", "generalVariables",
function($firebaseArray, $scope, $location, $rootScope, $http, generalVariables){

	//be sure to clear out all games that are finished
	generalVariables.checkFinishedGames();

		//show and close alerts
		$scope.show = false;
		$scope.showAlert = function(object) {
			$scope.alertMessage = object;
		    $scope.show = true;
		};

		$scope.closeAlert = function(index) {
		    $scope.show = false;
		};

	//collapse user toggle
	$scope.isCollapsed = true;

	_ = window._;

//see if user is logged in 
	var ref = new Firebase("https://frontcapstone.firebaseio.com");
	generalVariables.checkUserLogin("currentGames");

//get current games in array 
	var gameArray = $firebaseArray(ref.child("GameUsers"));

//set current uid on scope, this allows host user kick options
$scope.hostUid = generalVariables.getUid();



	gameArray.$loaded()
	.then(function(data){

		//array to hold matched games
		var foundArray=[];

		console.log("data ", data);
		console.log("Thar it is ", _.pluck(data, generalVariables.getUid()));

		//get the keys of each and see if key matches current uid
		for(var i = 0; i < data.length; i++){
			console.log("data[i] ", data[i]);

			//for every item in data[i],
			for(var key in data[i]){
				console.log("data[i][key] ", data[i][key]);

				//if an item matches current uid
				if(data[i][key] === generalVariables.getUid()){
					console.log("matches");

					foundArray.push(data[i])

				}

			}

		}

		$scope.hostedGames={};

		//now get each game from firebase with id from foundArray
		//usersGames = is the array that is output on the page for a users games
		$scope.usersGames =[];

			var currentArray = $firebaseArray(ref.child("Games"));

			currentArray.$loaded()
			.then(function(data){
				console.log("got data ", data);

				//if id of game in foundArray matches id of game in Games array send object into usersGames
				for(var i = 0; i < foundArray.length; i++){
					for(var x = 0; x < data.length; x++){
						if(foundArray[i].$id === data[x].$id && data[x].finished !== true){
							console.log("matches");

							console.log("data[x].hostUser ", data[x].hostUser);

							//if statement here will set the game in the hostedGames to true if current uid is host
							if(data[x].hostUser === generalVariables.getUid()){
								$scope.hostedGames[data[x].$id] = true;
								//insted of one variable have a hosted Games object that holds all game ids so that if current uid is host id of game, that game id in hosted games has a value of true then user can delete games

							}

							$scope.usersGames.push(data[x]);

						}
					}
				}

				console.log("FINAL MATCHES ", $scope.usersGames);

			})
		

	})

		
		//matches users in the current game, and gives back an array of objects where every user is an object in the array
		$scope.getGameUsers = function(gameId){
			console.log("game searched for is ", gameId);
        var gameUsersArray = $firebaseArray(ref.child("GameUsers").child(gameId));

        gameUsersArray.$loaded()
        .then(function(data){
          //need to set a variable to data and return a promise or something  to give to other module
          console.log("data ", data);

          	//array to hold filtered user objects
          	var matchedUsersInGame = []


          	//go into firebase users object
          		$firebaseArray(ref.child("Users")).$loaded()

          		//when all users in firebase are loaded
          		.then(function(usersInFirebase){
          			console.log("users in firebase ", usersInFirebase);

          			//for each user in data
          			for (var i = 0; i < data.length; i++){
          				console.log("data[i] ", data[i]);

	          			//filter users in firebase users object by 'id's and match to ids of users in current game (data[i])
	          			_.filter(usersInFirebase, function(userIndex){
	          				
	          				if(data[i].$value === userIndex.$id){
	          					matchedUsersInGame.push(userIndex);
	          				}
	          			})
	          		}	          		
	          		
		          $scope.GameUsers = matchedUsersInGame;
          		})
          
        })


		}

		//functionlaity for user leaving game
		$scope.leaveGame = function(game){
			console.log("user wants to leave game ", game);

			//remove game from DOM
			for(var i = 0; i < $scope.usersGames.length; i++){
				console.log("usersGames[i] ", $scope.usersGames[i]);

				if($scope.usersGames[i].$id === game.$id){
					console.log("this should be removed ", $scope.usersGames[i].$id);

					//splice item out of $scope.usersGames, which is output array to remove from DOM
					$scope.usersGames.splice(i,1);
				}
			}

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
								"archived" : false,
								"zLink" : "games/"+game.$id
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

		//functionlaity for host user selecting game to cancel
		$scope.setGameToCancel = function(game){
			console.log("user wants to cancel game ", game);

			//run this on modal click
			$scope.gameToCancel = game;

		}

		//functionlaity for host user cancelling game
		$scope.cancelGame = function(){
			console.log("this game should now be removed");

			//remove game from DOM
			for(var i = 0; i < $scope.usersGames.length; i++){
				console.log("usersGames[i] ", $scope.usersGames[i]);

				if($scope.usersGames[i].$id === $scope.gameToCancel.$id){
					console.log("this should be removed (from cancel request)", $scope.usersGames[i].$id);

					//splice item out of $scope.usersGames, which is output array to remove from DOM
					$scope.usersGames.splice(i,1);
				}
			}

			//send notifications for cancelling

					//get uids of other players in game
					var playersInGame = $firebaseArray(ref.child("GameUsers").child($scope.gameToCancel.$id));

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

						//send notifications/feedback to other users who were in the game
						for(var x = 0; x < sendUidArray.length; x++){
							ref.child("Users").child(sendUidArray[x]).child("notifications").push({
								"body" : generalVariables.getCurrentUserName()+" cancelled a game you were in: "+$scope.gameToCancel.sportTitle,
								"read" : false,
								"archived" : false
							})
						}
						
					})


			//give feedback to say game was cancelled
				//feedback to user who cancelled
				$.notify({
						//icon and message
						icon: 'glyphicon glyphicon-ok',
						message: "Game: "+$scope.gameToCancel.sportTitle+" cancelled successfully"
					},{
						// settings
						type: 'warning'
					});
				



			//remove game from firebase
			ref.child("Games").child($scope.gameToCancel.$id).remove();

			//remove game from game users
			ref.child("GameUsers").child($scope.gameToCancel.$id).remove();

		}


		// Options for host user to kick players

			// set user to kick, sets the user that you want to click and stores the game you want to remove them from
			$scope.setUserToKick = function(user, game){
				$scope.userSelectedToKick = user;
				$scope.gameToKickFrom = game;
			}

			//kick user by removing user from game users in firebase and then removing from DOM
			$scope.kickSelectedUser = function(user){

				console.log("user to kick", $scope.userSelectedToKick);
				console.log("game to kick from", $scope.gameToKickFrom);

					//remove user from gameUsers
			var usersInGame = $firebaseArray(ref.child("GameUsers").child($scope.gameToKickFrom.$id));



	        usersInGame.$loaded()
	        .then(function(data){

	          //loop over users in game and find current uid
	          _.filter(data, function(index){
	          	if(index.$value === $scope.userSelectedToKick.$id){
	          		console.log("user should now be kicked");

	          		// does a transaction on firebase game to reduce number of current players
	          		ref.child("Games").child($scope.gameToKickFrom.$id).child("currentPlayers").transaction(function(currentPlayers) {
					   
					  return currentPlayers - 1;
					});

	          		//remove from DOM
	          		for(var i = 0; i < $scope.GameUsers.length; i++){
	          			if($scope.GameUsers[i].$id === $scope.userSelectedToKick.$id){
	          				
	          				//remove from GameUsers array
	          				$scope.GameUsers.splice(i,1);
	          			}
	          		}


					//removes user from GameUsers object
	          		ref.child("GameUsers").child($scope.gameToKickFrom.$id).child(index.$id).remove();
					
					//send notification to kicked user
					ref.child("Users").child($scope.userSelectedToKick.$id).child("notifications").push({
								"body" : generalVariables.getCurrentUserName()+" kicked you from a game: "+ $scope.gameToKickFrom.sportTitle,
								"read" : false,
								"archived" : false
							})


	          		$.notify({
									//icon and message
									icon: 'glyphicon glyphicon-ok',
									message: "Kicked user from game"
								},{
									// settings
									type: 'warning'
								});
	          	}
	          })
	          
	          
	        })

			}




}]);