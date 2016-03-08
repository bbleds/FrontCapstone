app.factory("generalVariables", ["$q", "$http", "$location", "$firebaseArray",
  function($q, $http, $location, $firebaseArray) {

    //private variables
  	var userUid;
    var currentUserName;
  	var ref = new Firebase("https://frontcapstone.firebaseio.com");
    var userProfilePic;

  	return {
  		getUid : function(){
  			return userUid;
  		},

  		setUid : function(value){
  			userUid = value;
  		},

      getUserPic : function(){
        return userProfilePic;
      },

      setUserPic : function(value){
        userProfilePic = value;
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
        	    
              userUid = authData.uid;
        	    $location.path("/"+pathName);

              //setUsername for later access
              //get username
              var arrayOfName = $firebaseArray(ref.child("Users").child(authData.uid));

              //connect controller for notifications
              // angular.element("#notificationsSide").attr("ng-controller", "notificationCtrl")

              arrayOfName.$loaded()
              .then(function(data){
                

                //data[index] will change if notifcations key is deleted on a user
                

                //set current username
                currentUserName = data[3].$value;

                //show sidebar options
                angular.element("#navAndSidebar").css({"display":"block"});
              });

        	   //if user is not logged in, redirect to login page
        	  } else {
        	    
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
            // 

            //start with year
            //if year of game is less than current year
            if(yearToCompare < today.getFullYear()){
              // 
              ref.child("Games").child(data[i].$id).child("finished").set(true);

              //check month
            } else if(monthArray.indexOf(monthAbrev) < monthArray.indexOf(month)){
              // 
              ref.child("Games").child(data[i].$id).child("finished").set(true);

              //check day
            } else if(dayAbrev < today.getDate()){
              // 
              ref.child("Games").child(data[i].$id).child("finished").set(true);
            }
            //after finished app, set it by time by hour
          }

        });


      },

      setUnreadNotifications : function(){
          //set promise
          var deffered = $q.defer();

        var unreadArray = [];

        //go into firebase
        //go into current user's uid

        var allNotifs = $firebaseArray(ref.child("Users").child(userUid).child("notifications"));

        //get notifcations
        allNotifs.$loaded()
        .then(function(noteResponse){


          _.filter(noteResponse, function(note){
            

            if(note.read === "false"){
              //push all notifications where read = false into array
              
              unreadArray.push(note);
            }
          });

          //set length of that array to noteNumber
          noteNumber = unreadArray.length;
          

          deffered.resolve(noteNumber);

        });

        return deffered.promise;


      },

      getUnreadNotifications: function(){
        return noteNumber;
      },

      hideMainBg: function(){
        //change body bg image
		    document.getElementById("main_view").style.backgroundImage = "none";
      },

      showMainBg: function(){
        //change body bg image
		    document.getElementById("main_view").style.backgroundImage = 'url("../imgs/bike.jpg")';
      }

  	};

  }]);
