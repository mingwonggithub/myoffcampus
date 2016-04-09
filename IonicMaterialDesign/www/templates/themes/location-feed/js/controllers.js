appControllers.controller('locationFeedCtrl', function ($scope, $state, $stateParams, $mdToast, $ionicHistory, $ionicViewSwitcher, $timeout) {
  
  $scope.properties = [];

  var myProperty = Parse.Object.extend("myProperty");
  var query = new Parse.Query(myProperty);
  //query.equalTo("playerName", "Dan Stemkoski");

     
  $timeout(function(){
    if ($scope.isAndroid) {
        jQuery('#location-list-loading-progress').show();
    }
    else {
        jQuery('#location-list-loading-progress').fadeIn(700);
    }
  }, 400);

 // get a load progress spinner if query takes a long time
  $timeout(function() {

  var property = {};
  query.find({
    success: function(results) {
      $scope.$apply(function() {
        console.log("Successfully retrieved " + results.length + " scores.");
        /*for (var i = 0; i < results.length; i++) {
          $scope.properties.push(results[i]);
          console.log($scope.properties);
        }*/
        //$scope.properties = results;

        for (i in results) {
             aProp = results[i];
             property.object = aProp;
             property.title = aProp.get("kind")
             // console.log("propListCtrl:" , i, " ", property.title);
             if (aProp.get("communityName") != undefined) {
                 property.title = aProp.get("communityName");
             }

             property.rating = aProp.get('hrating');
             property.streetNo = aProp.get('streetNo');
             property.street = aProp.get('street');
             property.city = aProp.get('city');
             property.state = aProp.get('state');
             property.zipcode = aProp.get('zipcode');
             property.address = aProp.get('address');
             property.lat = aProp.get('lat');
             property.long = aProp.get('long');
             $scope.properties.push(property);
             property = {};

         }

        $scope.isLoading = false;
        
      });
    },
    error: function(error) {
      alert("Error: " + error.code + " " + error.message);
    }
  });

  jQuery('#location-list-loading-progress').hide();
  jQuery('#location-list-content').fadeIn();
  }, 3000);

  $scope.navigateTo = function (targetPage, objectData) {
        $state.go(targetPage, {
            propDetail: objectData
        });
    };

    $scope.save = function(property) {
      var user = Parse.User.current();
      var relation = user.relation("savedProps");

     console.log("saving property: " + property);
      // Add the post as a value in the comment
      relation.add(property);

      // This will save both myPost and myComment
      user.save(null, {
        success: function(prop) {
          $mdToast.show({
                    controller: 'toastController',
                    templateUrl: 'toast.html',
                    hideDelay: 400,
                    position: 'top',
                    locals: {
                        displayOption: {
                            title:  "Property saved"
                        }
                    }
                });
        },
        error: function(error) {
          console.log("error: " + error.message);
        }
      });

    }
})// End of Location Feed Controller.

// Controller of Note Setting Page.
appControllers.controller('noteSettingCtrl', function ($scope, NoteDB,$state, $ionicViewSwitcher,$stateParams, $ionicHistory, $mdBottomSheet, $mdDialog, $mdToast) {
    
    // initialForm is the first activity in the controller. 
    // It will initial all variable data and let the function works when page load.
    $scope.initialForm = function () {

        //$scope.noteLenght is is the variable for get note count.
        $scope.noteLenght = NoteDB.count();
    };// End initialForm.

    // clearAllData is for remove all notes data.
    // Parameter :  
    // $event(object) = position of control that user tap.
    $scope.clearAllData = function ($event) {

        //$mdBottomSheet.hide() use for hide bottom sheet.
        $mdBottomSheet.hide();

        //mdDialog.show use for show alert box for Confirm to remove all data.
        $mdDialog.show({
            controller: 'DialogController',
            templateUrl: 'confirm-dialog.html',
            targetEvent: $event,
            locals: {
                displayOption: {
                    title: "Confirm to remove all data?",
                    content: "All data will remove from local storage.",
                    ok: "Confirm",
                    cancel: "Close"
                }
            }
        }).then(function () {
            // For confirm button to remove all data.
            try {
                //To remove all notes data by calling NoteDB.clear() service.
                NoteDB.clear();
                $scope.initialForm();

                // Showing toast for remove data is success.
                $mdToast.show({
                    controller: 'toastController',
                    templateUrl: 'toast.html',
                    hideDelay: 400,
                    position: 'top',
                    locals: {
                        displayOption: {
                            title: "All data removed !"
                        }
                    }
                });
            }
            catch (e) {
                //Showing toast for unable to remove data.
                $mdToast.show({
                    controller: 'toastController',
                    templateUrl: 'toast.html',
                    hideDelay: 800,
                    position: 'top',
                    locals: {
                        displayOption: {
                            title: window.globalVariable.message.errorMessage
                        }
                    }
                });
            }
        }, function () {
            // For cancel button to remove all data.
        });
    }// End clearAllData.

    // navigateTo is for navigate to other page
    // by using targetPage to be the destination state.
    // Parameter :
    // stateNames = target state to go.
    // objectData = Object data will send to destination state.
    $scope.navigateTo = function (stateName,objectData) {
        if ($ionicHistory.currentStateName() != stateName) {
            $ionicHistory.nextViewOptions({
                disableAnimate: false,
                disableBack: true
            });

            //Next view animate will display in back direction
            $ionicViewSwitcher.nextDirection('back');

            $state.go(stateName, {
                isAnimated: objectData,
            });
        }
    }; // End of navigateTo.

    $scope.initialForm();
})// End of Notes Setting Page  Controller.

// Controller of Location Detail Page.
appControllers.controller('locationDetailCtrl', function ($scope, $ionicPlatform, $stateParams, $filter, $mdBottomSheet, $mdDialog, $mdToast, $ionicHistory) {

    $scope.property = $stateParams.propDetail;
    console.log("locationDetailCtrl: " , $scope.property);

    $ionicPlatform.ready(function(){
      initialize($scope.property.lat, $scope.property.long); 
    });

   //initalize the map with the property latitude and longitude 
   function initialize(lat, long) {

    var latLng = new google.maps.LatLng(lat, long);
        var mapOptions = {
            center: latLng,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
        $scope.lat = (lat).toFixed(5);
        $scope.long = (long).toFixed(5);
        console.log("locationDetailCtrl: initialize map " + $scope.lat, $scope.long);

        //Wait until the map is loaded to add the marker 
        google.maps.event.addListenerOnce($scope.map, 'idle', function() {
            var marker = new google.maps.Marker({
                map: $scope.map,
                animation: google.maps.Animation.DROP,
                position: latLng
            });
            var infoWindow = new google.maps.InfoWindow({
                content: $scope.property.address
            });
            google.maps.event.addListener(marker, 'click', function() {
                infoWindow.open($scope.map, marker);
            });
        });
   
      }; 


    //getNoteData is for get note detail data.
    $scope.getNoteData = function (propDetail) {
        // tempNoteData is temporary note data detail.
        var tempPropData = {
            street: '',
            city: '',
            zipcode: ''
        };

        // If actionDelete is true note Detail Page will show note detail that receive form note list page.
        // else it will show tempNoteData for user to add new data.
        return (angular.copy(propDetail) );
    };// End getNoteData.



});// End of Notes Detail Page  Controller.

appControllers.controller('savedLocationCtrl', function ($scope, $state, $stateParams, $mdToast, $ionicHistory, $ionicViewSwitcher) {
  
  $scope.properties = [];
  var user = Parse.User.current();
  var query = new Parse.Query(Parse.User);
  query.equalTo("username", user.get("username"));
  query.include("savedProps");
  query.select("savedProps");
  //query.equalTo("playerName", "Dan Stemkoski");
     if ($scope.isAndroid) {
        jQuery('#prop-list-loading-progress').show();
    }
    else {
        jQuery('#prop-list-loading-progress').fadeIn(700);
    }
  var property = {};
  //SLOW BECAUSE 2 QUERIES ARE NEEDED. REWRITE
  query.find({
    success: function(results) {
      var relation = results[0].relation("savedProps"); 
      relation.query().find({
        success: function(locations) {
          $scope.$apply(function() {
            console.log("Successfully retrieved " + results.length + " properties.");
            /*for (var i = 0; i < results.length; i++) {
              $scope.properties.push(results[i]);
              console.log($scope.properties);
            }*/
            //$scope.properties = results;
            for (i in locations) {
                 aProp = locations[i];
                 property.object = aProp;
                 property.title = aProp.get("kind")
                 // console.log("propListCtrl:" , i, " ", property.title);
                 if (aProp.get("communityName") != undefined) {
                     property.title = aProp.get("communityName");
                 }

                 property.rating = aProp.get('hrating');
                 property.streetNo = aProp.get('streetNo');
                 property.street = aProp.get('street');
                 property.city = aProp.get('city');
                 property.state = aProp.get('state');
                 property.zipcode = aProp.get('zipcode');
                 property.address = aProp.get('address');
                 property.lat = aProp.get('lat');
                 property.long = aProp.get('long');
                 $scope.properties.push(property);
                 property = {};

             }

            jQuery('#prop-list-loading-progress').hide();
            jQuery('#prop-list-content').fadeIn();
            $scope.isLoading = false;
          });//end $scope.apply
        },
        error: function(error) {
          console.log("Error2: " + error.code + " " + error.message);
        }
      });//end 2nd query
    },
    error: function(error) {
      console.log("Error1: " + error.code + " " + error.message);
    }
  });

  $scope.navigateTo = function (targetPage, objectData) {
        $state.go(targetPage, {
            propDetail: objectData
        });
    };

    $scope.remove = function(property) {
      var user = Parse.User.current();
      var relation = user.relation("savedProps");

     console.log("removing property: " + property);
      // Add the post as a value in the comment
      relation.remove(property);

      // This will save both myPost and myComment
      user.save(null, {
        success: function(prop) {
          $mdToast.show({
                    controller: 'toastController',
                    templateUrl: 'toast.html',
                    hideDelay: 400,
                    position: 'top',
                    locals: {
                        displayOption: {
                            title:  "Property removed"
                        }
                    }
                });
          $state.go($state.current, {}, {reload: true});
        },
        error: function(error) {
          console.log("error: " + error.message);
        }
      });
    }


})