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


	//show and close alerts
		$scope.show = false;
		$scope.showAlert = function(object) {
			//object should have two keys 1)"type" (equal to: 'success' or 'danger'), and 2) "body" (equal to: message we want to display)

			$scope.alertMessage = object;
		    $scope.show = true;
		};

	//collapse user toggle
	$scope.isCollapsed = true;

	//collapse find settings
	$scope.searchOptions = true;

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

	//Find Game  REFACTORED, now runs immediately
		$scope.gamesFound=[];


		//get games that match users selected search
		$scope.findGames = function(city, state){

			//clear group array
			$scope.gamesFound = [];

			// load all games from firebase that match the criteria and are in the future
			 $firebaseArray(ref.child("Games")).$loaded()
                   .then(function(games){
										//  if city was only thing user input
										 if(city !== "" && state === undefined){
											//  notify that a state must be included
											 $.notify({
												 //icon and message
												 icon: 'glyphicon glyphicon-remove',
												 message: "You must input a state, please try again!"
											 },{
												 // settings
												 type: 'warning'
											 });

											//  search by city and state
										}  else if(city !== "" && state !== "" && city !== undefined && state !== undefined){

										var filteredGroups =  _.filter(games, {"finished": false, "state": state.toUpperCase(), "city":city.toUpperCase()});

										//for each item in filter groups, push item into groupGames array
										for(var x = 0; x < filteredGroups.length; x++){
											//push into groupGames Array
											$scope.gamesFound.push(filteredGroups[x]);
										}

										if($scope.gamesFound.length === 0){
											$.notify({
											//icon and message
											icon: 'glyphicon glyphicon-remove',
											message: "No results found for that request, please try again!"
										},{
											// settings
											type: 'warning'
										});
										}

										// search by state
									} else if(state !== "" && state !== undefined && city === "" || city === undefined) {
										
										var filteredGroups =  _.filter(games, {"finished": false, "state": state.toUpperCase()});

										//for each item in filter groups, push item into groupGames array
										for(var x = 0; x < filteredGroups.length; x++){
											//push into groupGames Array
											$scope.gamesFound.push(filteredGroups[x]);
										}

										if($scope.gamesFound.length === 0){
											$.notify({
											//icon and message
											icon: 'glyphicon glyphicon-remove',
											message: "No results found for that request, please try again!"
										},{
											// settings
											type: 'warning'
										});
										}
							 //  search by city and state
							 } else {
											 $.notify({
												//icon and message
												icon: 'glyphicon glyphicon-remove',
												message: "Sorry, there was an error, please try again!"
											},{
												// settings
												type: 'warning'
											});
										 }


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
				

			//push matched games into an output array
				_.filter(data, function(index){
					//make sure game is not already finished
					if(index.finished === true){
						
					} else {

					//state must always be entered

					//if all fields are entered, match each
					if($scope.modState && 	$scope.modCity && 	$scope.modSport){
						
						if(index.state.toLowerCase() ===  $scope.modState.toLowerCase() && index.city.toLowerCase() ===  $scope.modCity.toLowerCase() && index.sportTitle.toLowerCase() ===  $scope.modSport.toLowerCase()){
							

							//push found games into output array
						 	$scope.gamesFound.push(index);


						} else {
							$.notify({
								//icon and message
								icon: 'glyphicon glyphicon-remove',
								message: "Sorry no results found, please try again!"
							},{
								// settings
								type: 'warning'
							});
						}

						//if only city and state are entered
						}else if($scope.modState && $scope.modCity){

							if(index.state.toLowerCase() ===  $scope.modState.toLowerCase() && index.city.toLowerCase() ===  $scope.modCity.toLowerCase()){


								//push found games into output array
							 	$scope.gamesFound.push(index);

							} else {
														$.notify({
								//icon and message
								icon: 'glyphicon glyphicon-remove',
								message: "Sorry no results found, please try again!"
							},{
								// settings
								type: 'warning'
							});
							}

					//if only state is entered match state
					} else if(index.state.toLowerCase() ===  $scope.modState.toLowerCase()){
					 	

					 	//push found games into output array
						 $scope.gamesFound.push(index);

					 } else {
					 		$.notify({
								//icon and message
								icon: 'glyphicon glyphicon-remove',
								message: "Sorry no results found, please try again!"
							},{
								// settings
								type: 'warning'
							});
					 }
				  }
				});

			})


	}



	//join Game variables


	//Join game
	$scope.joinGame = function(selectedGame){

		var userIsInGame = false;
		var currentUid = generalVariables.getUid();


		var gameUsersArrayofCurrent = $firebaseArray(ref.child("GameUsers").child(selectedGame.$id));
		
		

	//SHOW THIS TO RED

		//if current user id doesnt exist in the game, then add game and update current players
		gameUsersArrayofCurrent.$loaded()
		.then(function(data){

			//pluck the uids stored
			var uidArray = _.pluck(data, "$value");

			//see if current uid of user exists
			var uidIndex = uidArray.indexOf(generalVariables.getUid());

			//if uidIndex is -1 (doesnt exist)
			if(uidIndex === -1){

				//push user uid into this game in gameUsers object in  firebase
				ref.child("GameUsers").child(selectedGame.$id).push(generalVariables.getUid());

				//add transaction to current Players
				ref.child("Games").child(selectedGame.$id).child("currentPlayers").transaction(function(currentPlayers){
					return currentPlayers + 1;
				});

				//display success message through nav notification bar
					$.notify({
								//icon and message
								icon: 'glyphicon glyphicon-ok',
								message: "Joined Game Successfully!"
							},{
								// settings
								type: 'success'
							});

				//send notification to other players

					//get uids of other players in game
					var playersInGame = $firebaseArray(ref.child("GameUsers").child(selectedGame.$id));

					playersInGame.$loaded(function(data){
						

						var sendUidArray = []

						//go into usersobject in firebase to each of other players,
						for(var i =0; i < data.length; i++){

							//if data[i] is not equal to current user logged in
							if(data[i].$value !== generalVariables.getUid()){
								sendUidArray.push(data[i].$value)
							}
						}

						//send notifications
						for(var x = 0; x < sendUidArray.length; x++){
							ref.child("Users").child(sendUidArray[x]).child("notifications").push({
								"body" : generalVariables.getCurrentUserName()+" joined a game of yours: "+selectedGame.sportTitle,
								"read" : false,
								"archived" : false,
								"zLink" : "games/"+selectedGame.$id
							})
						}

					})


			//if it doesnt exist
			} else {
			$.notify({
						//icon and message
						icon: 'glyphicon glyphicon-remove',
						message: "You have already joined this game!"
					},{
						// settings
						type: 'danger'
					});
			}

		});


		}


		$scope.getGameUsers = function(gameId){
        var gameUsersArray = $firebaseArray(ref.child("GameUsers").child(gameId));

        gameUsersArray.$loaded()
        .then(function(data){
          //need to set a variable to data and return a promise or something  to give to other module

          	//array to hold filtered user objects
          	var matchedUsersInGame = []


          	//go into firebase users object
          		$firebaseArray(ref.child("Users")).$loaded()

          		//when all users in firebase are loaded
          		.then(function(usersInFirebase){

          			//for each user in data
          			for (var i = 0; i < data.length; i++){

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
