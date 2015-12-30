app.controller("indivGroupCtrl", 
["$firebaseArray", "$scope", "$location", "$rootScope", "$http", "generalVariables",
function($firebaseArray, $scope, $location, $rootScope, $http, generalVariables){

	//see if user is logged in 
	var ref = new Firebase("https://frontcapstone.firebaseio.com");

	//instead of running onauth in general variables, we run it here because the code was being parsed in an unexpected sequence which cause generalVairables.getUid to be undefined in the code below. Since we are checking directly in this file for auth data, (and in mainPageCtrl), it elminates those errors and unexpected behavior.
	ref.onAuth(function(authdata){
		console.log("authdata ", authdata);
		if(authdata === null){
			  console.log("Client unauthenticated.");
        	    $location.path("/login");
        	} else {

        		//get group object from url
        		var objectName = $location.$$path.split("/")[2];  

        		$scope.groupSelected;  

        		//get group from firebase
        		$firebaseArray(ref.child("Groups")).$loaded()
        		.then(function(groups){

        			console.log("group ", groups);
        			//loop through groups to find group selected, and store group object in $scope.groupSelected
        			for(var i = 0; i < groups.length; i++){
        				// console.log(groups[i]);

        				//if group id matches id of current group 
        				if(groups[i].$id === objectName){
        					//store group in $scope.groupSelected variable
        					$scope.groupSelected = groups[i];
        				}
        			}

        			console.log("groupSelected ", $scope.groupSelected);
        			
        		});
        	}
        });
}]);