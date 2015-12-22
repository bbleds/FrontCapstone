app.controller("notificationCtrl", 
["$firebaseArray", "$scope", "$location", "$rootScope", "$http", "generalVariables",
function($firebaseArray, $scope, $location, $rootScope, $http, generalVariables){


	//reference to database
	var ref = new Firebase("https://frontcapstone.firebaseio.com");

	//instead of running onauth in general variables, we run it here because the code was being parsed in an unexpected sequence which cause generalVairables.getUid to be undefined in the code below. Since we are checking directly in this file for auth data, (and in mainPageCtrl), it elminates those errors and unexpected behavior.
	ref.onAuth(function(authdata){
		console.log("authdata ", authdata);
		if(authdata === null){
			  console.log("Client unauthenticated.");
        	    $location.path("/login");
        	} else {
        		

				//check if authdata/session exists, and if so, load notifications.html
				generalVariables.checkUserLogin("notifications");

				//holds number of new notifications
				$scope.newNotes = 5;

				var dbNotifications = $firebaseArray(ref.child("Users").child(generalVariables.getUid()).child("notifications"));

				console.log("dbNotifications ", dbNotifications);


				dbNotifications.$loaded().then(function(data){
					$rootScope.notes = data;
					//variable to hold number of notifications to take care of doube bug in $watch					

					//watch for changes to notification array, this is applied to rootscope not scope
					$rootScope.notes.$watch(function(event){
						console.log("event ", event);	

						//if event is child added
						if(event.event === "child_added"){
							//get new item
							var newNotification = $firebaseArray(ref.child("Users").child(generalVariables.getUid()).child("notifications").child(event.key));
							newNotification.$loaded()
							.then(function(newNote){
								console.log("newNote ", newNote);
									$.notify({
									//icon and message
									icon: 'glyphicon glyphicon-ok',
									message: newNote[0].$value
								},{
									// settings
									type: 'success'
								});
							});

						}					

					});
				});







				// $scope.noteNumber = "5";

				// //reference users notifications
				// var dbNotifications = $firebaseArray(ref.child("Users").child(generalVariables.getUid()).child("notifications"));

				// //scope variable to hold array of user notifications
				// $scope.notificationsArray = []


				// dbNotifications.$loaded()
				// .then(function(data){

				// 	//WHY IS THIS RUNNING TWICE???????????????????
				// 	console.log("RUNNING >>>>>>>>>>>>>>>>>>>");
				// 	console.log("data ", data);

				// 	for(var i = 0; i < data.length; i++){
				// 		$scope.notificationsArray.push(data[i]);
				// 	}

				// 	dbNotifications.$watch(function(event){
				// 		console.log("event ", event);
				// 		console.log("event.event ", event.event);

				// 		//if event is child added
				// 		if(event.event === "child_added"){

				// 			//get new item
				// 			var newNotification = $firebaseArray(ref.child("Users").child(generalVariables.getUid()).child("notifications").child(event.key));
				// 			newNotification.$loaded()
				// 			.then(function(newNote){
				// 				console.log("newNote ", newNote);

				// 				//construct new object to give to array
				// 				var newNotificationObject = {
				// 					"body" : newNote[0].$value,
				// 					"read" : newNote[1].$value
				// 				}

				// 				//push new object into notifications array
				// 				$scope.notificationsArray.push(newNotificationObject);

				// 				//tell user something happened
				// 					$.notify({
				// 					//icon and message
				// 					icon: 'glyphicon glyphicon-ok',
				// 					message: newNote[0].$value
				// 				},{
				// 					// settings
				// 					type: 'success'
				// 				});

				// 			})

				// 		} else if(event.event === "child_removed"){
				// 			console.log("child is now removed");

				// 			//get updated Array from firebase
				// 			dbNotifications.$loaded()
				// 			.then(function(response){

				// 				//overwrite whats in notificationsArray
				// 				$scope.notificationsArray = response;

				// 			});
				// 		}
				// 	})
				// })
        	}

	});

}]);