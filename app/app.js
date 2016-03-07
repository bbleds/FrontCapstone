//initialzes app and sets up routes
var app = angular.module("MainApp",

	//inject dependencies
	["firebase","ngRoute", 'ui.bootstrap']);


//routes
app.config(["$routeProvider", function($routeProvider){
	$routeProvider

	//login page
	.when("/login", {
		templateUrl: "app/partials/login.html",
		controller: "loginAndRegisterCtrl"
	})

	//main page
	.when("/main",  {
		templateUrl: "app/partials/main.html",
		controller: "mainPageCtrl"
	})

	//finding users ------------------------> Should now be able to remove this one
	.when("/findUsers",  {
		templateUrl: "app/partials/findUsers.html",
		controller: "findUsersCtrl"
	})
	// -----------------------------------------------------------------------------

	//finding games
	.when("/findGames",  {
		templateUrl: "app/partials/findGames.html",
		controller: "findGamesCtrl"
	})

	//Current game
	.when("/currentGames",  {
		templateUrl: "app/partials/currentGames.html",
		controller: "currentGamesCtrl"
	})

	//Group page
	.when("/groups",  {
		templateUrl: "app/partials/userGroups.html",
		controller: "userGroupsCtrl"
	})

	//individual group game
	.when("/groups/:individualGroup",  {
		templateUrl: "app/partials/indivGroup.html",
		controller: "indivGroupCtrl"
	})
	// individual profile page
	.when("/profile",  {
		templateUrl: "app/partials/userProfile.html",
		controller: "userProfileCtrl"
	})

	//notification number output
	.when("/notifications",  {
		templateUrl: "app/partials/notifications.html"
	})

	//individual group page
	.when("/games/:individualGame",  {
		templateUrl: "app/partials/indivGame.html",
		controller: "indivGameCtrl"
	})
	//default to login route
	.otherwise("/login");
}]);
