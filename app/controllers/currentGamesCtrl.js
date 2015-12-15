app.controller("currentGamesCtrl", 
["$firebaseArray", "$scope", "$location", "$rootScope", "$http", "generalVariables",
function($firebaseArray, $scope, $location, $rootScope, $http, generalVariables){

	//be sure to clear out all games that are finished
	generalVariables.checkFinishedGames();

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



}]);