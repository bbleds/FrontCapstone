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


		$scope.getGameUsers = function(gameId){
			console.log("game searched for is ", gameId);
	        var gameUsersArray = $firebaseArray(ref.child("GameUsers").child(gameId));

	        gameUsersArray.$loaded()
	        .then(function(data){
	          //need to set a variable to data and return a promise or something  to give to other module
	          console.log("data ", data);
	          $scope.GameUsers = data;
	          
	        })
		}

		//functionlaity for user leaving game
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
								"body" : "someone left a game of yours: "+game.$id,
								"read" : false
							})
						}
						
					})

					//removes user from GameUsers object
	          		ref.child("GameUsers").child(game.$id).child(index.$id).remove();

	          		$scope.showAlert({type:"success",body:"You left the game!"});
	          	}
	          })
	          
	          
	        })


		}

		//functionlaity for host user selecting game to cancell
		$scope.setGameToCancel = function(game){
			console.log("user wants to cancel game ", game);

			//run this on modal click
			$scope.gameToCancel = game;

		}

		//functionlaity for host user cancelling game
		$scope.cancelGame = function(){
			console.log("this game should now be removed");

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

						//send notifications
						for(var x = 0; x < sendUidArray.length; x++){
							ref.child("Users").child(sendUidArray[x]).child("notifications").push({
								"body" : "someone cancelled a game you were in: "+$scope.gameToCancel.$id,
								"read" : false
							})
						}
						
					})


			// usersGames.array.indexOf();
			//remove something from array with index of

			//remove game from firebase
			ref.child("Games").child($scope.gameToCancel.$id).remove();

			//remove game from game users
			ref.child("GameUsers").child($scope.gameToCancel.$id).remove();

			//give feedback to say game was cancelled
			$scope.showAlert({type:"success",body:"Game successfully cancelled!"});


		}



}]);