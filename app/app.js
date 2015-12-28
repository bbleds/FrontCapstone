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
	.when("/findGames",  {
		templateUrl: "app/partials/findGames.html",
		controller: "findGamesCtrl"
	})
	.when("/currentGames",  {
		templateUrl: "app/partials/currentGames.html",
		controller: "currentGamesCtrl"
	})
	.when("/finishedGames",  {
		templateUrl: "app/partials/finishedGames.html",
		controller: "finishedGamesCtrl"
	})
	.when("/profile",  {
		templateUrl: "app/partials/userProfile.html",
		controller: "userProfileCtrl"
	})

	//do not attach controller here, attached controller in sidebar, otherwise controller is digested twice, resulting in odd bugs
	.when("/notifications",  {
		templateUrl: "app/partials/notifications.html"
	})
	.when("/games/:individualGame",  {
		templateUrl: "app/partials/indivGame.html",
		controller: "indivGameCtrl"
	})
	//default to login route
	.otherwise("/login");
}])




