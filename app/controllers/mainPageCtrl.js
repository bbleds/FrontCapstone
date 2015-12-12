//controller for main page, need to break it up some more

app.controller("mainPageCtrl", 
["$firebaseArray", "$scope", "$location", "$rootScope", "$http", "generalVariables",
function($firebaseArray, $scope, $location, $rootScope, $http, generalVariables){

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

	//time picker functions from angular bootstrap ui
			  $scope.mytime = new Date();

			  $scope.hstep = 1;
			  $scope.mstep = 1;

			  $scope.options = {
			    hstep: [1, 2, 3],
			    mstep: [1, 5, 10, 15, 25, 30]
			  };

			  $scope.ismeridian = true;
			  $scope.toggleMode = function() {
			    $scope.ismeridian = ! $scope.ismeridian;
			  };

			  $scope.update = function() {
			    var d = new Date();
			    d.setHours( 14 );
			    d.setMinutes( 0 );
			    $scope.mytime = d;
			  };

			  $scope.changed = function () {
			    console.log('Time changed to: ' + $scope.gameTime);
			  };

			  $scope.clear = function() {
			    $scope.mytime = null;
			  };


	 //datepicker functions from angular bootstrap ui
			  $scope.today = function() {
			    $scope.gameDate = new Date();
			  };
			  $scope.today();

			  $scope.clear = function () {
			    $scope.gameDate = null;
			  };

			  // Disable weekend selection
			  $scope.disabled = function(date, mode) {
			    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
			  };

			  $scope.toggleMin = function() {
			    $scope.minDate = $scope.minDate ? null : new Date();
			  };
			  $scope.toggleMin();
			  $scope.maxDate = new Date(2020, 5, 22);

			  $scope.open = function($event) {
			    $scope.status.opened = true;
			  };

			  $scope.setDate = function(year, month, day) {
			    $scope.gameDate = new Date(year, month, day);
			  };

			  $scope.dateOptions = {
			    formatYear: 'yy',
			    startingDay: 1
			  };

			  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
			  $scope.format = $scope.formats[0];

			  $scope.status = {
			    opened: false
			  };

			  var tomorrow = new Date();
			  tomorrow.setDate(tomorrow.getDate() + 1);
			  var afterTomorrow = new Date();
			  afterTomorrow.setDate(tomorrow.getDate() + 2);
			  $scope.events =
			    [
			      {
			        date: tomorrow,
			        status: 'full'
			      },
			      {
			        date: afterTomorrow,
			        status: 'partially'
			      }
			    ];

			  $scope.getDayClass = function(date, mode) {
			    if (mode === 'day') {
			      var dayToCheck = new Date(date).setHours(0,0,0,0);

			      for (var i=0;i<$scope.events.length;i++){
			        var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

			        if (dayToCheck === currentDay) {
			          return $scope.events[i].status;
			        }
			      }
			    }

			    return '';
			  };

		//typeahead for states
		  $scope.getLocation = function(val) {
		    return $http.get('//maps.googleapis.com/maps/api/geocode/json', {
		      params: {
		        address: val,
		        sensor: false
		      }
		    }).then(function(response){
		      return response.data.results.map(function(item){
		      	console.log("date", item);
		        return item.formatted_address;
		      });
		    });
		  };



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