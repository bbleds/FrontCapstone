app.controller("notificationCtrl",
["$firebaseArray", "$scope", "$location", "$rootScope", "$http", "generalVariables",
function($firebaseArray, $scope, $location, $rootScope, $http, generalVariables){


	//reference to database
	var ref = new Firebase("https://frontcapstone.firebaseio.com");

	//instead of running onauth in general variables, we run it here because the code was being parsed in an unexpected sequence which cause generalVairables.getUid to be undefined in the code below. Since we are checking directly in this file for auth data, (and in mainPageCtrl), it elminates those errors and unexpected behavior.
	ref.onAuth(function(authdata){
		
		if(authdata === null){
			  
        	    $location.path("/login");
        	} else {


				//check if authdata/session exists, and if so, load notifications.html
				generalVariables.checkUserLogin("notifications");

				var dbNotifications = $firebaseArray(ref.child("Users").child(generalVariables.getUid()).child("notifications"));

				


				dbNotifications.$loaded().then(function(data){
					$rootScope.notes = data;

					//show number of unread notifications by setting this initial variable equal to the length of an array of all notifications in which the "read" key is false,
					var unreadNotes = _.filter(data, {"read": false, "archived": false})
					$scope.newNotes = unreadNotes.length;

					//check if there are no new notifications and if all current notes are archived, if so set variable to true
					var unarchievedReadNotes = _.filter(data, {"read": true, "archived": false});

					//if there are no notifications that are not archieved and read
					if(unarchievedReadNotes.length === 0){
						$rootScope.tellNoNotes = true;
					} else {
						$rootScope.tellNoNotes = false;
					}


					//watch for changes to notification array, this is applied to rootscope not scope
					$rootScope.notes.$watch(function(event){
						

						//update number of unread notifications, this will run when anykey changes in the array, and will update the unreadNotes array length with only unread notifications
 						unreadNotes = _.filter(data, {"read": false})
						$scope.newNotes = unreadNotes.length;

						//if event is child added
						if(event.event === "child_added"){
							//get new item
							var newNotification = $firebaseArray(ref.child("Users").child(generalVariables.getUid()).child("notifications").child(event.key));
							newNotification.$loaded()
							.then(function(newNote){
								
									$.notify({
									//icon and message
									icon: 'glyphicon glyphicon-ok',
									message: newNote[1].$value
								},{
									// settings
									type: 'success'
								});
							});

						}

					});
				});


				//function that handles changing a notification to read
				$rootScope.changeRead = function(notificationClicked){
					

					//change read key of notification clicked to true
					ref.child("Users").child(generalVariables.getUid()).child("notifications").child(notificationClicked.$id).child("read").set(true);

				}

				//function that handles archiving notifications
				$rootScope.removeNote = function(notificationClicked){
						

						//remove clicked notification from user's firebase
					ref.child("Users").child(generalVariables.getUid()).child("notifications").child(notificationClicked.$id).child("archived").set(true);

				}

        	}

	});

}]);
