app.factory("generalVariables", ["$q", "$http", "$location",
  function($q, $http, $location) {
    
    //private variables
  	var userUid;
  	 var ref = new Firebase("https://frontcapstone.firebaseio.com");

  	return {
  		getUid : function(){
  			return userUid;
  		},

  		setUid : function(value){
  			userUid = value;
  		},

      logOutUser : function(){
        ref.unauth(); 
      },

      checkUserLogin : function(pathName){
      	ref.onAuth(function(authData) {
	  if (authData) {
	    console.log("Authenticated with uid:", authData.uid);
	    $location.path("/"+pathName);
	   //if user is not logged in, redirect to login page
	  } else {
	    console.log("Client unauthenticated.");
	    $location.path("/login");
		 
	  }
	});
      }
  	}

  }]);