//controller for main page, need to break it up some more

app.controller("mainPageCtrl", 
["$firebaseArray", "$scope", "$location", "$rootScope", "generalVariables",
function($firebaseArray, $scope, $location, $rootScope, generalVariables){

	//see if user is logged in 
	var ref = new Firebase("https://frontcapstone.firebaseio.com");
	generalVariables.checkUserLogin("mainPage");

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
	$scope.gamesFound;

	//Find Game
	$scope.findGames = function(){
		var games = $firebaseArray(ref.child("Games"));

		games.$loaded()
		.then(function(data){
			console.log("data ", data);
			$scope.gamesFound = data;

		});
	}

}]);