app.controller("findGamesCtrl", 
["$firebaseArray", "$scope", "$location", "$rootScope", "$http", "generalVariables",
function($firebaseArray, $scope, $location, $rootScope, $http, generalVariables){

	//see if user is logged in 
	var ref = new Firebase("https://frontcapstone.firebaseio.com");
	generalVariables.checkUserLogin("findGames");

	//be sure to clear out all games that are finished
	generalVariables.checkFinishedGames();

	//lodash
		//how to pass this as depemdency in app.js
	_ = window._;

	console.log("poopshoot -------------------------->>>>");

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

				console.log("gamesFound ", $scope.gamesFound);

				if($scope.gamesFound.length == 0){
					// $scope.showAlert({type:"danger", body:"Sorry, couldn't find any matches for that"});
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
								"body" : "someone joined a game of yours: "+selectedGame.$id,
								"read" : "false"
							})
						}
						
					})


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


}]);