 appControllers.controller('addLandLordCtrl', function($scope, $state, $ionicPopup, $stateParams, $filter, $mdBottomSheet, $mdDialog, $mdToast, $ionicHistory) {

     // A confirm dialog for user input address string 
     $scope.showConfirm = function(addressL) {
         var confirmPopup = $ionicPopup.confirm({
             title: 'Comfirm Address',
             template: 'Is ' + addressL + ' the correct address?'
         });

         confirmPopup.then(function(res) {
             if (res) {
                 console.log('addLandlordCtrl: You are sure');
                $scope.saveLandLord();


             } else {
                 console.log('addLandlordCtrl: You are not sure');
             }
         });
     };

     // An alert dialog
     $scope.showAlert = function() {
         var alertPopup = $ionicPopup.alert({
             title: 'Not Valid Address',
             template: 'Your input address is not valid'
         });

         alertPopup.then(function(res) {
             console.log('Thank you for not eating my delicious ice cream cone');
         });
     };
 

 console.log("addLandLordCtrl is here");
 //function that cleans up and retreive the relevant info from the form data 
 // and call the save function 
 $scope.createLandLord = function(landlord, isValid) {

     console.log("addLandLordCtrl: at create landlord");

     //check whether element is a string 
     function isString(val) {
         return typeof val === 'string' || ((!!val && typeof val === 'object') && Object.prototype.toString.call(val) === '[object String]');
     }

     //if form is valid, will save the landlord into the parse database
     if (isValid) {


         //keywords used to search for the landlord 
         var searchArray = [];
         $scope.landlord.prating = parseInt($scope.landlord.prating);
         console.log("keywords are: ", searchArray);
         $scope.landlord.searchArray = searchArray;

         if (isString($scope.addr.mailaddress)) {
             var geocoder = new google.maps.Geocoder();
             geocoder.geocode({ 'address': $scope.addr.mailaddress }, function(results, status) {

                 if (status == google.maps.GeocoderStatus.OK) {

                     $scope.landlord.address = results[0].formatted_address;
                     $scope.showConfirm( $scope.landlord.address);
                     console.log("addLandLordCtrl: $scope.landlord is ", $scope.landlord);



                 } else {
                     console.log("Geocode was not successful for the following reason: " + status);
                     $scope.showAlert();

                 }
             });
         } else {
             //formatted address 
             if ($scope.addr.mailaddress != undefined || $scope.addr.mailaddress != null) {
                 $scope.landlord.address = $scope.addr.mailaddress.formatted_address;
             }
             console.log("addLandLordCtrl: $scope.landlord is ", $scope.landlord);
             $scope.saveLandLord();

         }


         // the following commented out code may be neccessary 
         // if search landlord can searched by address 
         //latitude and longitude
         // $scope.landlord.lat = address.geometry.location.lat();
         // $scope.landlord.long = address.geometry.location.lng();

         // var addressComponents = address.address_components;

         // for (var i = 0; i < addressComponents.length; i++) {
         //     var aType = addressComponents[i].types[0];
         //     console.log(aType);
         //     var currentLongName = addressComponents[i].long_name;
         //     var currentShortName = addressComponents[i].short_name;

         //     if (aType == 'street_number') {
         //         // $scope.landlord.streetNo = parseInt(currentLongName);
         //         searchArray.push(currentLongName);
         //     }

         //      if (aType == 'route') {
         //          // $scope.landlord.street = currentLongName;

         //         //build the keywords for the route 
         //          searchArray = searchArray.concat(currentLongName.toLowerCase().split(" "));
         //          var shortNameArray = currentShortName.toLowerCase().split(" ");
         //          console.log(shortNameArray);
         //           for (var j = 0; j < shortNameArray.length; j++) {
         //              if (elementExists(searchArray, shortNameArray[i]) == false) {
         //                 searchArray.push(shortNameArray[i]);
         //              }
         //           }
         //     }

         //     if (aType == 'locality') {
         //         // $scope.landlord.city = currentLongName;
         //         console.log('locatlity', currentLongName);
         //         searchArray.push(currentLongName.toLowerCase());
         //     }

         //     if (aType == 'administrative_area_level_1') {
         //         // $scope.landlord.state = currentLongName;
         //         searchArray.push(currentLongName.toLowerCase());
         //         searchArray.push(currentShortName.toLowerCase());
         //     }
         //     if (aType == 'country') {
         //         // $scope.landlord.country = currentLongName;
         //         searchArray.push(currentLongName.toLowerCase());
         //         searchArray.push(currentShortName.toLowerCase());
         //     }
         //     if (aType == 'postal_code') {
         //         // $scope.landlord.zipcode = currentLongName;
         //         searchArray.push(currentLongName);
         //     }
         // }

     }
 };


 //clear the form text and the errors 
 $scope.reset = function(landlordForm) {
     console.log("landlordForm: landlordForm is ", landlordForm);
     if (landlordForm) {
         landlordForm.$setPristine();
         landlordForm.$setUntouched();
     }
     $scope.landlord = angular.copy($scope.master);
     $scope.addr = {};
     $scope.landlord.prating = 0;

 };

 // actual function that save the form data into Parse
 // if successful, go to the landlord details page 
 $scope.saveLandLord = function() {
     var LandLord = Parse.Object.extend("myLandLord");
     var landlord = new LandLord();

     landlord.save($scope.landlord, {
         success: function(landlord) {
             var newLandLord = {};

             newLandLord.title = landlord.get("firstname") + " " + landlord.get("lastname");
             newLandLord.rating = landlord.get('prating');
             newLandLord.address = landlord.get('address');
             newLandLord.gender = landlord.get('gender');

             console.log("addLocationCtrl: saveLandLord is ", newLandLord);

             //$state.go('app.landLordDetails');
         },
         error: function(gameScore, error) {
             // The save failed.
             // error is a Parse.Error with an error code and message.
             console.log("addLocationCtrl: ", error);
         }
     });
 }

 // initialForm is the first activity in the controller. 
 // It will initial all variable data and let the function works when page load.
 $scope.initialForm = function() {

     $scope.master = {};
     $scope.landlord = {}; // all the landlord fields goes in this dictionary
     $scope.addr = {}; //this get the google address format 
     $scope.landlord.prating = 0;
     $scope.landlord.gender = 'M'
 };

 //initiailze the form 
 $scope.initialForm();

 //navigate to the new property detail page 
 $scope.navigateTo = function(targetPage, objectData) {
     $state.go(targetPage, {
         propDetail: objectData
     });
 };

 });

 /*
 Instead of a location feed why not have a page to navigate to for the locations 
 associated with this particular landlord.
 */

 // Controller of Location Detail Page.
 appControllers.controller('landLordDetailCtrl', function($scope, $ionicPlatform, $stateParams, $state, $filter, $mdBottomSheet, $mdDialog, $mdToast, $ionicHistory) {

     //  console.log($stateParams);
     $scope.property = $stateParams.propDetail;
     // console.log("locationDetailCtrl: ", $scope.property);

     $ionicPlatform.ready(function() {
         initialize($scope.property.lat, $scope.property.long);
     });

     //initalize the map with the property's latitude and longitude 
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


     $scope.navigateTo = function(targetPage, objectData) {
         $state.go(targetPage, {
             propDetail: objectData
         });
     };



 }); // End of Notes Detail Page  Controller.

 appControllers.controller('savedLandLordCtrl', function($scope, $state, $stateParams, $mdToast, $ionicHistory, $ionicViewSwitcher) {

     $scope.properties = [];
     var user = Parse.User.current();
     var query = new Parse.Query(Parse.User);
     query.equalTo("username", user.get("username"));
     query.include("savedProps");
     query.select("savedProps");
     //query.equalTo("playerName", "Dan Stemkoski");
     if ($scope.isAndroid) {
         jQuery('#landlord-list-loading-progress').show();
     } else {
         jQuery('#landlord-list-loading-progress').fadeIn(700);
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

                         jQuery('#landlord-list-loading-progress').hide();
                         jQuery('#landlord-list-content').fadeIn();
                         $scope.isLoading = false;
                     }); //end $scope.apply
                 },
                 error: function(error) {
                     console.log("Error2: " + error.code + " " + error.message);
                 }
             }); //end 2nd query
         },
         error: function(error) {
             console.log("Error1: " + error.code + " " + error.message);
         }
     });

     $scope.navigateTo = function(targetPage, objectData) {
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
             success: function(landlord) {
                 $mdToast.show({
                     controller: 'toastController',
                     templateUrl: 'toast.html',
                     hideDelay: 400,
                     position: 'top',
                     locals: {
                         displayOption: {
                             title: "Property removed"
                         }
                     }
                 });
                 $state.go($state.current, {}, { reload: true });
             },
             error: function(error) {
                 console.log("error: " + error.message);
             }
         });
     }
 })