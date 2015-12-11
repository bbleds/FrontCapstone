//controller for main page, need to break it up some more

app.controller("mainPageCtrl", 
["$firebaseArray", "$scope", "$location", "$rootScope", "generalVariables",
function($firebaseArray, $scope, $location, $rootScope, generalVariables){

	//see if user is logged in 
	var ref = new Firebase("https://frontcapstone.firebaseio.com");
	generalVariables.checkUserLogin("mainPage");

	//lodash
		//how to pass this as depemdency in app.js
	_ = window._;


	//logOut user
	$scope.logOutUser = function(){

		//unauth ref
		ref.unauth();

		//navigate back to main
		$location.path("/login");
	}


	//game variables
	$scope.gameTitle;
	$scope.gameMaxPlayers;
	$scope.gameMinPlayers;
	$scope.gameTime;
	$scope.gameAddress;
	$scope.gameState;
	$scope.gameCity;
	$scope.gameDate;

	//creation success variable
	$scope.gameCreationSuccess;

	//create Game
	$scope.createGame = function(){
		
		//create Game in reference 
		console.log("appleSauce");

		if( $scope.gameTitle && $scope.gameMaxPlayers && $scope.gameMinPlayers && $scope.gameTime && $scope.gameAddress && $scope.gameState && $scope.gameCity){

			ref.child("Games").push({
				"sportTitle": $scope.gameTitle,
				"maxPlayers": $scope.gameMaxPlayers,
				"minPlayers": $scope.gameMinPlayers,
				"currentPlayers": 1,
				"time" : $scope.gameTime,
				"address": $scope.gameAddress,
				"city" : $scope.gameCity,
				"state": $scope.gameState,
				"date": $scope.gameDate
			});

			//display success
			$scope.gameCreationSuccess = "Game Creation Successful!";

		} else {
			console.log("you need to enter all fields");
		}

	}


	//find variables
	$scope.findCity;
	$scope.findState;
	$scope.gamesFound=[];

	//Find Game
	$scope.findGames = function(){
		$scope.gamesFound=[];
		var games = $firebaseArray(ref.child("Games"));

		games.$loaded()
		.then(function(data){
			console.log("data ", data);


			_.filter(data, function(n){

				//if state of game in array matches state entered
				 if($scope.findCity && $scope.findState && n.state.toLowerCase() === $scope.findState.toLowerCase() && n.city.toLowerCase() === $scope.findCity.toLowerCase()  ){

				 	//push found games into output array
				 	$scope.gamesFound.push(n);
				 } else {
				 	console.log(" Please Enter information");
				 }

				});


			// $scope.gamesFound = data;

		});
	}

	//join Game variables


	//Join game
	$scope.joinGame = function(selectedGame){

		console.log("selectedGame ", selectedGame.$id);

		var currentUid = generalVariables.getUid();


		var gameUsersArray = $firebaseArray(ref.child("GameUsers"));

		//if current user id doesnt exist in the game, then add game and update current players
		gameUsersArray.$loaded()
		.then(function(data){
			var userHasBeenAdded = false;

			var gameToGet = selectedGame.$id;
			console.log("gameToGet", gameToGet.toString());

			console.log("game user data ", data);
			_.filter(data, function(i){

				console.log("current Game", i[gameToGet]);

				//if index is on the current game id in the game users object, and the current user's login is connected with the game, tell user they already signed up for game
				if(i[gameToGet] && i[gameToGet] === currentUid){
					console.log("You are already registered For This Game");

				//else if any current game value if not equal to currentUid of user
				} else if( i[gameToGet] !== currentUid && userHasBeenAdded === false) {
					userHasBeenAdded = true;

					console.log("registering you for game");

				// add current user into GameUsers, with game id as key and uid of user as value
				ref.child("GameUsers").push({
					[selectedGame.$id] : currentUid
				});

				var currentPlayersRef = ref.child("Games").child(selectedGame.$id+"/currentPlayers");

				//update number of players in selected game in games object
				currentPlayersRef.transaction(function(currentVal){
					return (currentVal || 0) + 1;
				});	

				}

			});

		})



	}

}]);