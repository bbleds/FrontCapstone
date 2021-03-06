//controller for main page, functionality for current games and other subfunctionality is modularized into other modules

app.controller("mainPageCtrl",
["$firebaseArray", "$scope", "$location", "$rootScope", "$http", "generalVariables",
function($firebaseArray, $scope, $location, $rootScope, $http, generalVariables){

	//see if user is logged in
	var ref = new Firebase("https://frontcapstone.firebaseio.com");

	//instead of running onauth in general variables, we run it here because the code was being parsed in an unexpected sequence which cause generalVairables.getUid to be undefined in the code below. Since we are checking directly in this file for auth data, (and in notificationsCtrl), it elminates those errors and unexpected behavior
	ref.onAuth(function(authdata){
		if(authdata === null){
        	    $location.path("/login");
        	}  else {
							// clear background image
							generalVariables.hideMainBg();

		        	//store current username in variable
		        	$scope.currentUsername = generalVariables.getCurrentUserName();

		        	//get profile picture
		        	$firebaseArray(ref.child("Users").child(generalVariables.getUid())).$loaded()
		        		.then(function(userData){
		        			$scope.profilePic = userData[1].$value;
		        		});


							//Clear out all games that are finished from possible games to be seen
							generalVariables.checkFinishedGames();

							//get notification promise from generalVariables
							$scope.noteNumber = generalVariables.setUnreadNotifications()
							//when promise is returned
							.then(function(response){
								//set response equal to noteNumber on scope
								$scope.noteNumber = response;
							});

							//lodash
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
							};


							//toggle sidebar
							$("#toggle_sidebar").click(function(){
								if($("#sidebar-wrapper").width()>0){
								$("#sidebar-wrapper").css( "width", "-=250" );
								} else {
									$("#sidebar-wrapper").css( "width", "+=250" );
								}

							});

							//store current groups

									$scope.userGroups = [];

										//List groups in firebase
										$firebaseArray(ref.child("Groups")).$loaded()
										.then(function(groups){

											//loop through groups in firebase
											for(var i = 0; i < groups.length; i++){

												//see if user uid exists in object
													
												//if user uid is in group
												if(groups[i].users[generalVariables.getUid()] !== undefined){
													//push group object into usersGroups
													$scope.userGroups.push(groups[i]);

												}
											}
										});


							//game variables
							$scope.gameTitle;
							$scope.gameMaxPlayers;
							$scope.gameMinPlayers;
							$scope.gameTime;
							$scope.gameAddress;
							$scope.gameState;
							$scope.gameCity;
							$scope.gameDate;
							$scope.skillLevel;
							$scope.gameDescription;

							//creation success variable
							$scope.gameCreationSuccess;

							//create Game
							$scope.createGame = function(){
								var amOrPm;

								//collapse search options
								$scope.searchOptions = true;

								// if all required data is filled in
							 if( $scope.gameTitle && $scope.gameMaxPlayers && $scope.gameMinPlayers && $scope.gameTime && $scope.streetAddress && $scope.gameCity && $scope.gameState && $scope.gameDate && $scope.skillLevel){

								//fix entered time to the format hh:mm a.m./p.m. in the timeToPass variable
									var splitTime = $scope.gameTime.toString().split(" ")[4].split(":");

										if(splitTime[0] > 12){
											splitTime[0] = splitTime[0] - 12;
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

								if($scope.gameDescription === "" || $scope.gameDescription === null || $scope.gameDescription === undefined){
									$scope.gameDescription = false;
								}

								//Tell user that state length is two long if full state name is entered
								if($scope.gameState.length > 2){
									$.notify({
														//icon and message
														icon: 'glyphicon glyphicon-remove',
														message: "Please only enter your state's abbreviation"
													},{
														// settings
														type: 'warning'
													});

								}

								// convert city to uppercase
								$scope.gameCity = $scope.gameCity.toUpperCase();

								// push object to firebase
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
										"hostUserPic" : $scope.profilePic,
										"finished": false,
										"skillLevel" : $scope.skillLevel,
										"gameDescription" : $scope.gameDescription
									}, function(){
										var gameArray = $firebaseArray(ref.child("Games"));

										gameArray.$loaded()
										.then(function(response){

											var theOne = _.filter(response, {"hostUser": generalVariables.getUid(), "sportTitle": $scope.gameTitle, "city": $scope.gameCity, "address": $scope.streetAddress, "maxPlayers": $scope.gameMaxPlayers,
										"minPlayers": $scope.gameMinPlayers, "time" : timeToPass, "date": dateToPass, "state": $scope.gameState});
											var objectToAdd = theOne[0];

											//add host user to game created
											ref.child("GameUsers").child(objectToAdd.$id).push(generalVariables.getUid());

											//display success message through notification
													$.notify({
														//icon and message
														icon: 'glyphicon glyphicon-ok',
														message: "Game created successfully!"
													},{
														// settings
														type: 'success'
													});
										});
									});


								} else {
									$.notify({
														//icon and message
														icon: 'glyphicon glyphicon-remove',
														message: "Please enter all required fields"
													},{
														// settings
														type: 'warning'
													});
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
      	}

  });


}]);
