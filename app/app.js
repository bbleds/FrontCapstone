//initialzes app and sets up routes
var app = angular.module("MainApp", 

	//deps
	["firebase","ngRoute", 'ui.bootstrap']);


//routes
app.config(["$routeProvider", function($routeProvider){
	$routeProvider

	//login route
	.when("/login", {
		templateUrl: "app/partials/login.html",
		controller: "loginAndRegisterCtrl"
	})
	.when("/mainPage",  {
		templateUrl: "app/partials/mainPage.html",
		controller: "mainPageCtrl"
	})
	.when("/currentGames",  {
		templateUrl: "app/partials/currentGames.html",
		controller: "currentGamesCtrl"
	})
	//default to login route
	.otherwise("/login");
}])
