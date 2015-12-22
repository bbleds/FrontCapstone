app.factory("generalVariables", ["$q", "$http", "$location", "$firebaseArray",
  function($q, $http, $location, $firebaseArray) {
    
    //private variables
  	var userUid;
    var currentUserName;
  	var ref = new Firebase("https://frontcapstone.firebaseio.com");
    var noteNumber;

  	return {
  		getUid : function(){
  			return userUid;
  		},

  		setUid : function(value){
  			userUid = value;
  		},

      logOutUser : function(){

          //unauth ref
          ref.unauth();

          //navigate back to main
          $location.path("/login");
          
      },

      getCurrentUserName : function(){
        return currentUserName;
      },

      generateAlert : function(type,message){

        angular.element("#mainNotification").addClass("alert-"+type);
        angular.element("#mainNotification").html(message);
        $("#mainNotification").fadeIn(1000);


      },

      checkUserLogin : function(pathName){
          ref.onAuth(function(authData) {
        	  if (authData) {
        	    console.log("Authenticated with uid:", authData.uid);
              userUid = authData.uid;
        	    $location.path("/"+pathName);

              //setUsername for later access
              //get username
              var arrayOfName = $firebaseArray(ref.child("Users").child(authData.uid));

              //connect controller for notifications
              // angular.element("#notificationsSide").attr("ng-controller", "notificationCtrl")

              arrayOfName.$loaded()
              .then(function(data){
                console.log("data ", data);
                console.log("user ", data[1].$value);

                //set current username
                currentUserName = data[1].$value

                //show sidebar options
                angular.element("#navAndSidebar").css({"display":"block"})
              })

        	   //if user is not logged in, redirect to login page
        	  } else {
        	    console.log("Client unauthenticated.");
        	    $location.path("/login");
        		 
        	  }
        	});
      },

      //checks games in firebase and compares to current date to change games that have already happened to finished = true
      checkFinishedGames : function(){
        //get current date
        var today = new Date();
        var monthArray = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        var splitToday = today.toString().split(" ");

        //keep month
        var month = splitToday[1];
        var gameArray = $firebaseArray(ref.child("Games"));
        gameArray.$loaded()
        .then(function(data){

          //loop through data and extract games that have dates before today
          for(var i = 0; i < data.length; i++){

            var splitDate = data[i].date.split(", ");
            //index of month to compare
            var monthAbrev = splitDate[1].split(" ")[0];
            var dayAbrev = parseInt(splitDate[1].split(" ")[1]);
            var yearToCompare = splitDate[2];
            console.log("yearToCompare ", parseInt(yearToCompare));

            //start with year
            //if year of game is less than current year
            if(yearToCompare < today.getFullYear()){
              console.log("this game was in a past year");
              ref.child("Games").child(data[i].$id).child("finished").set(true);

              //check month
            } else if(monthArray.indexOf(monthAbrev) < monthArray.indexOf(month)){
              console.log("this game was in a past month");
              ref.child("Games").child(data[i].$id).child("finished").set(true);

              //check day
            } else if(dayAbrev < today.getDate()){
              console.log("this game was at a past day bruh bruh");
              ref.child("Games").child(data[i].$id).child("finished").set(true);
            } 
            //after finished app, set it by time by hour
          }

        })


      },

      setUnreadNotifications : function(){
          //set promise
          var deffered = $q.defer();

        var unreadArray = []

        //go into firebase
        //go into current user's uid

        var allNotifs = $firebaseArray(ref.child("Users").child(userUid).child("notifications"));
        
        //get notifcations
        allNotifs.$loaded()
        .then(function(noteResponse){


          _.filter(noteResponse, function(note){
            console.log("note ", note);

            if(note.read === "false"){
              //push all notifications where read = false into array
              console.log("this hasnt been read yet");
              unreadArray.push(note)
            }
          })

          //set length of that array to noteNumber
          noteNumber = unreadArray.length;
          console.log("noteNumber ", noteNumber);

          deffered.resolve(noteNumber);

        })

        return deffered.promise;


      },

      getUnreadNotifications: function(){
        return noteNumber
      }

  	}

  }]);