app.controller("indivGameCtrl", 
["$firebaseArray", "$scope", "$location", "$rootScope", "$http", "generalVariables",
function($firebaseArray, $scope, $location, $rootScope, $http, generalVariables){

	console.log("location ", $location)

	var objectName = $location.$$path.split("/")[2];
	console.log("objectName ", objectName);

	var ref = new Firebase("https://frontcapstone.firebaseio.com");

	//store profile picture in picReturned variable
	$firebaseArray(ref.child("Users").child(generalVariables.getUid())).$loaded()
	.then(function(userReturned){
		$scope.picReturned = userReturned[1].$value;

	})

	var objectFromFirebase = $firebaseArray(ref.child("Games"));

	//get game selected by user
	objectFromFirebase.$loaded()
	.then(function(data){
		console.log("data ", data)

		_.filter(data, function(game){

			if(game.$id === objectName){
				console.log("the game selected is ", game);
				$scope.selectedGame = game;
			}
		})

		//3 way data binding for comments, firebase, and DOM
		$scope.fireComments = $firebaseArray(ref.child("Games").child($scope.selectedGame.$id).child("comments"));
	})

	//functionality for posting comments
	console.log("username is ", generalVariables.getCurrentUserName());
		
		//holds body of comment
		$scope.commentBody;

		//function to post comment to a users firebase
		$scope.postComment = function(){		

			//if user has enetered a comment
			if($scope.commentBody){

				//go into comment key on game select in firebase (if comment key does not exist yet, this will create it)
				ref.child("Games").child($scope.selectedGame.$id).child("comments").push({
					"commentBody" : $scope.commentBody,
					"commentUser" : generalVariables.getUid(),
					"commentUserPic" : $scope.picReturned,
					"userName" : generalVariables.getCurrentUserName()
				});

				//clear inner html of comment element
				document.getElementById('theCommentBody').value = "";

				//notify user that comment is posted
				$.notify({
								//icon and message
								icon: 'glyphicon glyphicon-ok',
								message: "Comment posted successfully!"
							},{
								// settings
								type: 'success'
							});

			   //notify other users in game of new comment post
				//get uids of other players in game
					var playersInGame = $firebaseArray(ref.child("GameUsers").child($scope.selectedGame.$id));

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
								"body" : generalVariables.getCurrentUserName()+" commented on a game you are in: "+$scope.selectedGame.sportTitle,
								"read" : false,
								"archived" : false
							})
						}
						
					})


			} else {
				console.log("You must actually eneter a comment to post");
			}
		}


	
}]);