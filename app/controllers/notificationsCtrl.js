app.controller("notificationCtrl", 
["$firebaseArray", "$scope", "$location", "$rootScope", "$http", "generalVariables",
function($firebaseArray, $scope, $location, $rootScope, $http, generalVariables){

	//reference to database
	var ref = new Firebase("https://frontcapstone.firebaseio.com");

	//check if authdata/session exists, and if so, load notifications.html
	generalVariables.checkUserLogin("notifications");

	//reference users notifications
	var dbNotifications = $firebaseArray(ref.child("Users").child(generalVariables.getUid()).child("notifications"));

	//scope variable to hold array of user notifications
	$scope.notificationsArray = []


	dbNotifications.$loaded()
	.then(function(data){
		console.log("data ", data);

		for(var i = 0; i < data.length; i++){
			$scope.notificationsArray.push(data[i]);
		}

		dbNotifications.$watch(function(event){
			console.log("event ", event);
			console.log("event.event ", event.event);

			//if event is child added
			if(event.event === "child_added"){

				//get new item
				var newNotification = $firebaseArray(ref.child("Users").child(generalVariables.getUid()).child("notifications").child(event.key));
				newNotification.$loaded()
				.then(function(newNote){
					console.log("newNote ", newNote);

					//construct new object to give to array
					var newNotificationObject = {
						"body" : newNote[0].$value,
						"read" : newNote[1].$value
					}

					//push new object into notifications array
					$scope.notificationsArray.push(newNotificationObject);

				})

			} else if(event.event === "child_removed"){
				console.log("child is now removed");

				//get updated Array from firebase
				dbNotifications.$loaded()
				.then(function(response){

					//overwrite whats in notificationsArray
					$scope.notificationsArray = response;

				});
			}
		})
	})

}]);