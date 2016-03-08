app.controller("finishedGamesCtrl",
["$firebaseArray", "$scope", "$location", "$rootScope", "$http", "generalVariables",
function($firebaseArray, $scope, $location, $rootScope, $http, generalVariables){

	//be sure to clear out all games that are finished
	//generalVariables.checkFinishedGames();

	//collapse user toggle
		$scope.isCollapsed = true;

	_ = window._;

//see if user is logged in
	var ref = new Firebase("https://frontcapstone.firebaseio.com");
	generalVariables.checkUserLogin("finishedGames");

//get current games in array
	var gameArray = $firebaseArray(ref.child("GameUsers"));



	gameArray.$loaded()
	.then(function(data){

		//array to hold matched games
		var foundArray=[];

		
		

		//get the keys of each and see if key matches current uid
		for(var i = 0; i < data.length; i++){
			

			//for every key in data[i],
			for(var key in data[i]){
				

				//if a key matches current uid
				if(data[i][key] === generalVariables.getUid()){
					
					foundArray.push(data[i])

				}

			}

		}

		//now get each game from firebase with id from foundArray
		$scope.finishedGames =[];

			var currentArray = $firebaseArray(ref.child("Games"));

			currentArray.$loaded()
			.then(function(data){
				

			//if id of game in foundArray matches id of game in Games array send object into finishedGames
				for(var i = 0; i < foundArray.length; i++){
					for(var x = 0; x < data.length; x++){
						if(foundArray[i].$id === data[x].$id  && data[x].finished === true){
							
							$scope.finishedGames.push(data[x]);

						}
					}
				}

				


			})


	})


}]);
