 appControllers.controller('addLocationCtrl', function($scope, $state, NoteDB, $stateParams, $filter, $mdBottomSheet, $mdDialog, $mdToast, $ionicHistory) {

     console.log("addLocationCtrl is here");
     //function that cleans up and retreive the relevant info from the form data 
     // and call the save function 

     $scope.createProperty = function(prop, isValid) {

         console.log("addLocationCtrl: at create property");

         //check whether the element exist in the array 
         function elementExists(array, el) {
             for (var i = 0; i < array.length; i++) {
                 if (array[i] === el)
                     return true;
             }
             return false;
         }

         //if form is valid, will save the property into the parse database
         if (isValid) {

             //address object from google 
             var address = $scope.addr.addressL;
             //will write the geocode function to convert str to google object later
             // when address is a user input string 

             console.log("addLocationCtrl: valid form with address", address);

             //keywords used to search for the property 
             var searchArray = [];

             //formatted address 
             $scope.prop.address = address.formatted_address;

             //latitude and longitude
             $scope.prop.lat = address.geometry.location.lat();
             $scope.prop.long = address.geometry.location.lng();

             var addressComponents = address.address_components;

             //debugger; 
             for (var i = 0; i < addressComponents.length; i++) {
                 var aType = addressComponents[i].types[0];
                 var currentLongName = addressComponents[i].long_name;
                 var currentShortName = addressComponents[i].short_name;

                 if (aType == 'street_number') {
                     $scope.prop.streetNo = parseInt(currentLongName);
                     searchArray.push(currentLongName);
                 }


                 if (aType == 'route') {
                     $scope.prop.street = currentLongName;

                     //build the keywords for the route 
                     searchArray = searchArray.concat(currentLongName.toLowerCase().split(" "));
                     var shortNameArray = currentShortName.toLowerCase().split(" ");
                     for (var j = 0; j < shortNameArray.length; j++) {
                         if (elementExists(searchArray, shortNameArray[i]) == false) {
                             searchArray.push(shortNameArray[i]);
                         }
                     }
                 }

                 if (aType == 'locality') {
                     $scope.prop.city = currentLongName;
                     searchArray.push(currentLongName.toLowerCase());
                     var shortNameArray = currentShortName.toLowerCase().split(" ");
                     for (var k = 0; k < shortNameArray.length; k++) {
                         if (elementExists(searchArray, shortNameArray[k]) == false) {
                             searchArray.push(shortNameArray[k]);
                         }
                     }
                 }


                 if (aType == 'administrative_area_level_1') {
                     $scope.prop.state = currentLongName;
                     searchArray.push(currentLongName.toLowerCase());
                     searchArray.push(currentShortName.toLowerCase());
                 }
                 if (aType == 'country') {
                     $scope.prop.country = currentLongName;
                     searchArray.push(currentLongName.toLowerCase());
                     searchArray.push(currentShortName.toLowerCase());
                 }
                 if (aType == 'postal_code') {
                     $scope.prop.zipcode = currentLongName;
                     searchArray.push(currentLongName);
                 }
             }

             $scope.prop.kind = $scope.categories.kind;
             $scope.prop.hrating = parseInt($scope.prop.hrating);

             searchArray.push($scope.prop.kind.toLowerCase());
             searchArray = searchArray.concat($scope.prop.communityName.toLowerCase().split(" "));
             //console.log("addLocationCtrl: keywords are: ", searchArray);

             $scope.prop.searchArray = searchArray;
             //console.log("addLocationCtrl: $scope.prop is ", $scope.prop);

             //call the actual function to save the $scope.prop into parse database 
             $scope.saveProp();

         }

     };

     //clear the form text and the errors 
     $scope.reset = function(propForm) {
         console.log("propForm: propForm is ", propForm);
         if (propForm) {
             propForm.$setPristine();
             propForm.$setUntouched();
         }
         $scope.prop = angular.copy($scope.master);
         $scope.addr = {};
         $scope.prop.hrating = 5;

     };

     // actual function that save the form data into Parse
     // if successful, go to the prop list view 
     $scope.saveProp = function() {
         var Property = Parse.Object.extend("myProperty");
         var property = new Property();

         property.save($scope.prop, {
             success: function(property) {
                 var newProp = {};

                 newProp.title = property.get("kind")
                     // console.log("propListCtrl:" , i, " ", property.title);
                 if (property.get("communityName") != undefined) {
                     newProp.title = property.get("communityName");
                 }
                 newProp.rating = property.get('hrating');
                 newProp.streetNo = property.get('streetNo');
                 newProp.street = property.get('street');
                 newProp.city = property.get('city');
                 newProp.state = property.get('state');
                 newProp.zipcode = property.get('zipcode');
                 newProp.address = property.get('address');

                 console.log("addLocationCtrl: saveProp is ", newProp);

                 $state.go('app.locationFeed');
                 // The object was saved successfully.
                 // console.log("addPropertyCtrl: in Parse ", property);
                 // $scope.navigateTo('app.locationDetails', newProp);
             },
             error: function(gameScore, error) {
                 // The save failed.
                 // error is a Parse.Error with an error code and message.
                 console.log(error);
             }
         });
     }

     // initialForm is the first activity in the controller. 
     // It will initial all variable data and let the function works when page load.
     $scope.initialForm = function() {

         $scope.master = {};
         $scope.prop = {}; // all the property fields goes in this dictionary
         $scope.addr = {}; //this get the google address format 

         $scope.categories = [
             { 'kind': 'Apartment' },
             { 'kind': 'Condo' },
             { 'kind': 'House' },
             { 'kind': 'Townhouse' },
         ];

         $scope.prop.hrating = 5;
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


 appControllers.controller('locationFeedCtrl', function($scope, $state, $stateParams, $filter, $mdToast, $ionicHistory, $ionicViewSwitcher, $timeout, $mdDialog) {

         $scope.properties = []; //list of properties on feed page 
         $scope.userInput = []; //search input from search box at feed page 
         $scope.reverse = true; //default serach result is 
         $scope.predicate = 'rating'; //top 5 properties with highest rating 

         var query = $stateParams.searchResults; //query is input from search box at welcome page 
         console.log("locationFeedCtrl beginning: query is ", query);

         $scope.initialize = function(query) {

             //if empty query, list out five highet rating apartment 
             if (query == null) {
                 var myProperty = Parse.Object.extend("myProperty");
                 var query = new Parse.Query(myProperty);
                 query.limit(5);
                 query.descending("rating");
             }

             // spinning progress 
             if ($scope.isAndroid) {
                 jQuery('#location-list-loading-progress').show();
             } else {
                 jQuery('#location-list-loading-progress').fadeIn(700);
             }

             var property = {};
             query.find({
                 success: function(results) {
                     $scope.$apply(function() {
                         console.log("locationFeedCtrl: Successfully retrieved " + results.length + " properties.");
                         /*for (var i = 0; i < results.length; i++) {
                           $scope.properties.push(results[i]);
                           console.log($scope.properties);

                         }*/
                         //$scope.properties = results;

                         for (i in results) {
                             aProp = results[i];
                             property.object = aProp;
                             property.title = aProp.get("kind")
                             if (aProp.get("communityName") != undefined) {
                                 property.title = aProp.get("communityName") + " " + property.title;
                             }

                             property.rating = aProp.get('hrating');
                             property.streetNo = aProp.get('streetNo');
                             property.street = aProp.get('street');
                             property.city = aProp.get('city');
                             property.state = aProp.get('state');
                             property.zipcode = aProp.get('zipcode');
                             property.address = aProp.get('address');
                             console.log(property.title.split(" "))
                             property.lat = aProp.get('lat');
                             property.long = aProp.get('long');
                             $scope.properties.push(property);
                             property = {};

                         }

                         $scope.isLoading = false;
                         jQuery('#location-list-loading-progress').hide();
                         jQuery('#location-list-content').fadeIn();
                     });
                 },
                 error: function(error) {
                     alert("Error: " + error.code + " " + error.message);
                 }
             });
         }

         //initialize page 
         $scope.initialize(query);

         //sorting the search results 
         $scope.sortBy = function(index) {
             var predicate = '';
             console.log("locationFeedCtrl: sort index is ", index);
             if (index == 0) {
                 predicate = 'rating';
             }
             if (index == 1) {
                 predicate = 'title';
             }
             $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
             $scope.predicate = predicate;

         }


         //from search input box on location feed page 
         $scope.searchlocFeed = function() {

             console.log("locationFeedCtrl: searchinput from feed is ", $scope.userInput.propText);
             if ($scope.userInput.propText != undefined) {
                 var formattedloc = ($scope.userInput.propText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")).trim();
             }
             if ($scope.userInput.propText == undefined || formattedloc.length == 0) {
                 var query = null;

             } else {

                 var keywords = formattedloc.toLowerCase().split(" ");
                 console.log("locationFeedCtrl at searchlocFeed: keywords are ", keywords);
                 var Property = Parse.Object.extend("myProperty");
                 var query = new Parse.Query(Property);
                 query.containsAll("searchArray", keywords);

                 //reload current state
                 $state.current.params.searchResults = query;
                 $state.transitionTo($state.current, $state.current.params, { reload: true, inherit: true, notify: true });
             }

         }

         //navigate to the property detail page 
         $scope.navigateTo = function(targetPage, objectData) {
             $state.go(targetPage, {
                 propDetail: objectData
             });
         };

         //save the property to saved properties page  for the user
         $scope.save = function(property) {
             var user = Parse.User.current();
             var relation = user.relation("savedProps");

             console.log("locationFeedCtrl: saving property: " + property);

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
                                 title: "Property saved"
                             }
                         }
                     });
                 },
                 error: function(error) {
                     console.log("error: " + error.message);
                 }
             });

         }


     }) // End of Location Feed Controller.

 // Controller of Note Setting Page.
 appControllers.controller('noteSettingCtrl', function($scope, NoteDB, $state, $ionicViewSwitcher, $stateParams, $ionicHistory, $mdBottomSheet, $mdDialog, $mdToast) {

         // initialForm is the first activity in the controller. 
         // It will initial all variable data and let the function works when page load.
         $scope.initialForm = function() {

             //$scope.noteLenght is is the variable for get note count.
             $scope.noteLenght = NoteDB.count();
         }; // End initialForm.

         // clearAllData is for remove all notes data.
         // Parameter :  
         // $event(object) = position of control that user tap.
         $scope.clearAllData = function($event) {

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
                 }).then(function() {
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
                     } catch (e) {
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
                 }, function() {
                     // For cancel button to remove all data.
                 });
             } // End clearAllData.

         // navigateTo is for navigate to other page
         // by using targetPage to be the destination state.
         // Parameter :
         // stateNames = target state to go.
         // objectData = Object data will send to destination state.
         $scope.navigateTo = function(stateName, objectData) {
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
     }) // End of Notes Setting Page  Controller.

 // Controller of Location Detail Page.
 appControllers.controller('locationDetailCtrl', function($scope, $ionicPlatform, $stateParams, $filter, $mdBottomSheet, $mdDialog, $mdToast, $ionicHistory) {

     console.log($stateParams);
     $scope.property = $stateParams.propDetail;
     console.log("locationDetailCtrl: ", $scope.property);

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


     //getNoteData is for get note detail data.
     $scope.getNoteData = function(propDetail) {
         // tempNoteData is temporary note data detail.
         var tempPropData = {
             street: '',
             city: '',
             zipcode: ''
         };

         // If actionDelete is true note Detail Page will show note detail that receive form note list page.
         // else it will show tempNoteData for user to add new data.
         return (angular.copy(propDetail));
     }; // End getNoteData.



 }); // End of Notes Detail Page  Controller.

 appControllers.controller('savedLocationCtrl', function($scope, $state, $stateParams, $mdToast, $ionicHistory, $ionicViewSwitcher) {

     $scope.properties = [];
     var user = Parse.User.current();
     var query = new Parse.Query(Parse.User);
     query.equalTo("username", user.get("username"));
     query.include("savedProps");
     query.select("savedProps");
     //query.equalTo("playerName", "Dan Stemkoski");
     if ($scope.isAndroid) {
         jQuery('#prop-list-loading-progress').show();
     } else {
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
             success: function(prop) {
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