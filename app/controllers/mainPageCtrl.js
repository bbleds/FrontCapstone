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
				"date": $scope.gameDate,
				"hostUser": generalVariables.getUid()
			}, function(){
				var gameArray = $firebaseArray(ref.child("Games"));

				gameArray.$loaded()
				.then(function(response){
					console.log("response ", response);

					var theOne = _.filter(response, {"hostUser": generalVariables.getUid(), "sportTitle": $scope.gameTitle});
					var objectToAdd = theOne[0];

					//add host user to game created
					ref.child("GameUsers").child(objectToAdd.$id).push(generalVariables.getUid())

				})	
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

		var userIsInGame = false;
		console.log("selectedGame ", selectedGame.$id);
		var currentUid = generalVariables.getUid();


		var gameUsersArrayofCurrent = $firebaseArray(ref.child("GameUsers").child(selectedGame.$id));

	//SHOW THIS TO RED

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

			//if it doesnt exist
			} else {

				console.log("this user already exists in the game");
			}

		});

			
		}


}]);