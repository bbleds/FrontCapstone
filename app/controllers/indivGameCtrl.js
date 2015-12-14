app.controller("indivGameCtrl", 
["$firebaseArray", "$scope", "$location", "$rootScope", "$http", "generalVariables",
function($firebaseArray, $scope, $location, $rootScope, $http, generalVariables){

	console.log("location ", $location)

	var objectName = $location.$$path.split("/")[2];
	console.log("objectName ", objectName);

	var ref = new Firebase("https://frontcapstone.firebaseio.com");

	var objectFromFirebase = $firebaseArray(ref.child("Games"));

	objectFromFirebase.$loaded()
	.then(function(data){
		console.log("data ", data)

		_.filter(data, function(game){

			if(game.$id === objectName){
				console.log("the game selected is ", game);
				//set $scope.selectedGame = game
				$scope.selectedGame = game;
			}
		})

	})

	
}]);