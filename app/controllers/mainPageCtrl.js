//controller for main page, need to break it up some more

app.controller("mainPageCtrl", 
["$firebaseArray", "$scope", "$location", "$rootScope", "generalVariables",
function($firebaseArray, $scope, $location, $rootScope, generalVariables){

	//see if user is logged in 
	var ref = new Firebase("https://frontcapstone.firebaseio.com");
	generalVariables.checkUserLogin("mainPage");

}]);