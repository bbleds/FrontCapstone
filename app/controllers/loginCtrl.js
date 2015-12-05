//test controller
app.controller("loginCtrl", 
["$firebaseArray", "$scope",

function($firebaseArray, $scope){
	$scope.loginEmail;
	$scope.loginpassword;

	var ref = new Firebase("https://frontcapstone.firebaseio.com/Users");

	var arrayOfData = $firebaseArray(ref);

	//when array is loaded
	arrayOfData.$loaded()
	
	.then(function(data){
		console.log("data", data);
	});


}]);