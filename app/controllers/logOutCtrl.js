//controller for logging out

app.controller("logOutCtrl", ["$scope", "$location",
function($scope, $location){

	var ref = new Firebase("https://frontcapstone.firebaseio.com");

	$scope.logOutUser = function(){

			//hide nav and sidebar
			angular.element("#navAndSidebar").css({"display":"none"});

			//clear auth
			ref.unauth()

			//navigate back to main
			$location.path("/login");

	}

}]);;