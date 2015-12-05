//initialzes app and sets up routes
var app = angular.module("MainApp", 

	//deps
	["firebase","ngRoute"]);


//routes
app.config(["$routeProvider", function($routeProvider){
	$routeProvider

	//login route
	.when("/login", {
		templateUrl: "app/partials/login.html",
		controller: "loginCtrl"
	})

	//default to login route
	.otherwise("/login");
}])
