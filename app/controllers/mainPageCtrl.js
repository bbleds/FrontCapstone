//controller for main page, functionality for current games, . . . in other modules

app.controller("mainPageCtrl", 
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

		//show main default for logging in
		$scope.showMainDefault = function(){
			console.log("should now show main defualt on main Page");
			//shows main default display
			angular.element("#defaultContent").addClass("show");

			//hides the find modifier
			$scope.searchOptions = true;
		}

	//see if user is logged in 
	var ref = new Firebase("https://frontcapstone.firebaseio.com");
	generalVariables.checkUserLogin("mainPage");

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
		var amOrPm

		//collapse search options
		$scope.searchOptions = true;

		
		//create Game in reference 

		if($scope.gameState.length > 2){
			console.log("Please only enter your state's abbreviation");

		} else if( $scope.gameTitle && $scope.gameMaxPlayers && $scope.gameMinPlayers && $scope.gameTime && $scope.streetAddress && $scope.gameCity && $scope.gameState && $scope.gameDate ){

		//fix entered time to the format hh:mm a.m./p.m. in the timeToPass variable
			var splitTime = $scope.gameTime.toString().split(" ")[4].split(":"); 

				if(splitTime[0] > 12){
					splitTime[0] = splitTime[0] - 12
						amOrPm = "p.m.";
				} else if(splitTime[0] < 12)  {
						amOrPm = "a.m.";
				} else {
						amOrPm = "p.m.";
				}

		var timeToPass = splitTime[0]+":"+splitTime[1]+" "+amOrPm;

		//fix entered date to format -> dayofweek month day year
		var splitDate = $scope.gameDate.toString().split(" ");
		var dateToPass = splitDate[0]+", "+splitDate[1]+" "+splitDate[2]+", "+splitDate[3];
		console.log("ready to pass");


		// un comment to push to firebase
			ref.child("Games").push({
				"sportTitle": $scope.gameTitle,
				"maxPlayers": $scope.gameMaxPlayers,
				"minPlayers": $scope.gameMinPlayers,
				"currentPlayers": 1,
				"time" : timeToPass,
				"address": $scope.streetAddress,
				"city" : $scope.gameCity,
				"state": $scope.gameState,
				"date": dateToPass,
				"hostUser": generalVariables.getUid(),
				"hostUserName": generalVariables.getCurrentUserName(),
				"finished": false
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


			//display success message through nav notification bar
			$scope.showAlert({type:"success", body:"Game creation successful!"});

		} else {
			console.log("you need to enter all fields");
		}

	}

	//prelist of sports
	$scope.sportArray = ["Abseiling","Aerobatics","Aikido","Air Racing","Airsoft","Aquathlon","Aquatics","Archery","Arm Wrestling","Artistic Billiards","Autocross","Autograss","Automobile Racing","Ba Game","Badminton","Bagatelle","Ballroom Dancing","Bando","Bandy","Base Jumping","Baseball","Basketball","Beach Volleyball","Biathlon","Bobsleigh","Bocce Ball","Body Building","Boomerang","Bowling","Boxing","Bull Fighting","Camping","Canoeing","Caving","Cheerleading","Chess","Classical Dance","Cricket","Cross Country Running","Cross Country Skiing","Curling","Cycling","Darts","Decathlon","Diving","Dog Sledding","Dog Training","Down Hill Skiing","Equestrianism","Falconry","Fencing","Figure Skating","Fishing","Flag Football","Foosball","Football","Fox Hunting","Golf","Gymnastics","Hand Ball","Hang Gliding","High Jump","Hiking","Hockey","Horseshoes","Hot Air Ballooning","Hunting","Ice Skating","Inline Skating","Jai Alai","Judo","Karate","Kayaking","Knee Boarding","Lacrosse","Land Sailing","Log Rolling","Long Jump","Luge","Modern Dance","Modern Pentathlon","Motorcycle Racing","Mountain Biking","Mountaineering","Netball","Paint Ball","Para Gliding","Parachuting","Petanque","Pool Playing","Power Walking","Ping Pong","Quad Biking","Racquetball","Remote Control Boating","River Rafting","Rock Climbing","Rodeo Riding","Roller Skating","Rowing","Rugby","Sailing","Scuba Diving","Shooting","Shot Put","Shuffleboard","Skateboarding","Skeet Shooting","Snooker","Snow Biking","Snow Boarding","Snow Shoeing","Snow Sledding","Soccer","Sombo","Speed Skating","Sport Fishing","Sport Guide","Sprint Running","Squash","Stunt Plane Flying","Sumo Wrestling","Surfing","Swimming","Synchronized Swimming","Table Tennis","Taekwondo","Tchoukball","Tennis","Track and Field","Trampolining","Triathlon","Tug of War","Volleyball","Water Polo","Water Skiing","Weight Lifting","Wheelchair Basketball","White Water Rafting","Wind Surfing","Wrestling","Wushu","Yachting","Yoga"];

	//prelist of states
	 $scope.states = ['AL','AK','AS','AZ','AR','CA','CO','CT','DE','DC','FM','FL','GA','GU','HI','ID','IL','IN','IA','KS','KY','LA','ME','MH','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','MP','OH','OK','OR','PW','PA','PR','RI','SC','SD','TN','TX','UT','VT','VI','VA','WA','WV','WI','WY'];


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

				 	//hide defualt content
				 	angular.element("#defaultContent").addClass("hide");


				 } else {
				 	console.log(" Please Enter information");
				 }

				});


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
							console.log("no reseults");
						}

						//if only city and state are entered
						}else if($scope.modState && $scope.modCity){
							console.log("city and state entered");
							if(index.state.toLowerCase() ===  $scope.modState.toLowerCase() && index.city.toLowerCase() ===  $scope.modCity.toLowerCase()){
								console.log("we have a city and state match");

								//push found games into output array
							 	$scope.gamesFound.push(index);

							} else {
								console.log("no results");
							}

					//if only state is entered match state
					} else if(index.state.toLowerCase() ===  $scope.modState.toLowerCase()){
					 	console.log("state match");

					 	//push found games into output array
						 $scope.gamesFound.push(index);

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