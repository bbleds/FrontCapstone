app.controller("findGamesCtrl", 
["$firebaseArray", "$scope", "$location", "$rootScope", "$http", "generalVariables",
function($firebaseArray, $scope, $location, $rootScope, $http, generalVariables){

	//show and close alerts
		$scope.show = false;
		$scope.showAlert = function(object) {
			//object should have two keys 1)"type" (equal to: 'success' or 'danger'), and 2) "body" (equal to: message we want to display)

			$scope.alertMessage = object;
		    $scope.show = true;
		};

		$scope.closeAlert = function(index) {
		    $scope.show = false;
		};

	//see if user is logged in 
	var ref = new Firebase("https://frontcapstone.firebaseio.com");
	generalVariables.checkUserLogin("findGames");

	//be sure to clear out all games that are finished
	generalVariables.checkFinishedGames();

	//lodash
		//how to pass this as depemdency in app.js
	_ = window._;

	//collapse user toggle
	$scope.isCollapsed = true;

	//collapse find settings
	$scope.searchOptions = true;

	//logOut user
	$scope.logOutUser = function(){

		//unauth ref
		ref.unauth();

		//navigate back to main
		$location.path("/login");
	}

	//prelist of states
	 $scope.states = ['AL','AK','AS','AZ','AR','CA','CO','CT','DE','DC','FM','FL','GA','GU','HI','ID','IL','IN','IA','KS','KY','LA','ME','MH','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','MP','OH','OK','OR','PW','PA','PR','RI','SC','SD','TN','TX','UT','VT','VI','VA','WA','WV','WI','WY'];

	//find variables
	$scope.findCity;
	$scope.findState;
	$scope.gamesFound=[];

	//variables for modifying results after looking
	$scope.modState;
	$scope.modCity;
	$scope.modSport;

	//Find Game
	$scope.findGames = function(){
		$scope.gamesFound=[];

		var games = $firebaseArray(ref.child("Games"));

		games.$loaded()
		.then(function(data){
			console.log("data ", data);


			_.filter(data, function(n){

				// console.log("n is ", n);

				//check to make sure date and time of games are in the future

				//if state of game in array matches state entered
				 if(n.finished !== true && $scope.findCity && $scope.findState && n.state.toLowerCase() === $scope.findState.toLowerCase() && n.city.toLowerCase() === $scope.findCity.toLowerCase()  ){

				 	//set findCity and findState to have the ability to be changed later
				 	$scope.modState = $scope.findState.toUpperCase();
				 	$scope.modCity = $scope.findCity;

				 	//push found games into output array
				 	$scope.gamesFound.push(n);

				 	//open find options
				 	$scope.searchOptions = false;


				 } else {
				 	console.log("no matches found for this index");
				 }

				});

				if($scope.gamesFound.length == 0){
					$scope.showAlert({type:"danger", body:"Sorry, couldn't find any matches for that"});
				}


			// $scope.gamesFound = data;

		});
	}


	//modify search
	$scope.modifySearch = function(){

		//the following code will display all games that match criteria in firebase

			//clear output array
			$scope.gamesFound = [];

			//get data from firebase
			var gamesFromFirebase = $firebaseArray(ref.child("Games"));

			gamesFromFirebase.$loaded()
			.then(function(data){
				console.log("games ", data);

			//push matched games into an output array
				_.filter(data, function(index){
					//make sure game is not already finished
					if(index.finished === true){
						console.log("this game is finished");
					} else {

					//state must always be entered

					//if all fields are entered, match each
					if($scope.modState && 	$scope.modCity && 	$scope.modSport){
						console.log("all fields entahed");
						if(index.state.toLowerCase() ===  $scope.modState.toLowerCase() && index.city.toLowerCase() ===  $scope.modCity.toLowerCase() && index.sportTitle.toLowerCase() ===  $scope.modSport.toLowerCase()){
							console.log("found some matches for all");
							
							//push found games into output array
						 	$scope.gamesFound.push(index);


						} else {
							// $scope.showAlert({type:"danger", body:"Sorry, no results found"});
							//log something
						}

						//if only city and state are entered
						}else if($scope.modState && $scope.modCity){
							console.log("city and state entered");
							if(index.state.toLowerCase() ===  $scope.modState.toLowerCase() && index.city.toLowerCase() ===  $scope.modCity.toLowerCase()){
								console.log("we have a city and state match");

								//push found games into output array
							 	$scope.gamesFound.push(index);

							} else {
								$scope.showAlert({type:"danger", body:"Sorry, couldn't find any matches for that"});
							}

					//if only state is entered match state
					} else if(index.state.toLowerCase() ===  $scope.modState.toLowerCase()){
					 	console.log("state match");

					 	//push found games into output array
						 $scope.gamesFound.push(index);

					 } else {
					 	$scope.showAlert({type:"danger", body:"Sorry, couldn't find any matches for that"});
					 }
				  }
				});

			})


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

				//display success message through nav notification bar
				$scope.showAlert({type:"success", body:"Awesome! Joined game successfully!"});

			//if it doesnt exist
			} else {

				$scope.showAlert({type:"danger", body:"You have already joined this game!"});
			}

		});

			
		}


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