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
	.when("/main",  {
		templateUrl: "app/partials/main.html",
		controller: "mainPageCtrl"
	})
	.when("/currentGames",  {
		templateUrl: "app/partials/currentGames.html",
		controller: "currentGamesCtrl"
	})
	.when("/finishedGames",  {
		templateUrl: "app/partials/finishedGames.html",
		controller: "finishedGamesCtrl"
	})
	.when("/games/:individualGame",  {
		templateUrl: "app/partials/indivGame.html",
		controller: "indivGameCtrl"
	})
	//default to login route
	.otherwise("/login");
}])
