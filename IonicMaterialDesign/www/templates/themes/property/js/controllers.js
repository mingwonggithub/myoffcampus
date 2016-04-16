 appControllers.controller('addPropertyCtrl', function($scope, $state, NoteDB, $stateParams, $filter, $mdBottomSheet, $mdDialog, $mdToast, $ionicHistory) {

      console.log("addPropertyCtrl is here");
     //function that cleans up and retreive the relevant info from the form data 
     // and call the save function 

     $scope.createProperty = function(prop, isValid) {


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
             console.log("is Valid", address);

             //keywords used to search for the property 
             var searchArray = [];

             //formatted address 
             $scope.prop.address = address.formatted_address;

             //latitude and longitude
             $scope.prop.lat = address.geometry.location.lat();
             $scope.prop.long = address.geometry.location.lng();

             var addressComponents = address.address_components;

             for (var i = 0; i < addressComponents.length; i++) {
                 var aType = addressComponents[i].types[0];
                 console.log(aType);
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
                      console.log(shortNameArray);
                       for (var j = 0; j < shortNameArray.length; j++) {
                        console.log("helo in fort loop")
                          if (elementExists(searchArray, shortNameArray[i]) == false) {
                             searchArray.push(shortNameArray[i]);
                          }
                       }
                 }

                 if (aType == 'locality') {
                     $scope.prop.city = currentLongName;
                     console.log('locatlity', currentLongName);
                     searchArray.push(currentLongName.toLowerCase());
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
             console.log("keywords are: ", searchArray);

             $scope.prop.searchArray = searchArray; 
             console.log("addPropertyCtrl: $scope.prop is ", $scope.prop);


            // $scope.saveProp();

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

                 console.log("saveProp is ", newProp);
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

     $scope.navigateTo = function(targetPage, objectData) {
         $state.go(targetPage, {
             propDetail: objectData
         });
     };

 });


 // Controller of Property List Page.
 // It will call Parse (not NodeDB Services)to present data to html view. /
 appControllers.controller('propListCtrl', function($scope, $stateParams, $timeout, NoteDB, $state, starsUtility) {

     console.log("propListCtrl");

     // initialForm is the first activity in the controller. 
     // It will initial all variable data and let the function works when page load.
     $scope.initialForm = function() {

         //$scope.isLoading is the variable that use for check statue of process.
         $scope.isLoading = true;

         //$scope.isAnimated is the variable that use for receive object data from state params.
         //For enable/disable row animation.
         $scope.isAnimated = $stateParams.isAnimated;

         // $scope.noteList is the variable that store data from NoteDB service.
         $scope.noteList = [];
         $scope.propertyList = [];


         // $scope.filterText is the variable that use for searching.
         $scope.filterText = "";

         // The function for loading progress.
         $timeout(function() {
             if ($scope.isAndroid) {
                 jQuery('#prop-list-loading-progress').show();
             } else {
                 jQuery('#prop-list-loading-progress').fadeIn(700);
             }
         }, 1000);
         $timeout(function() {

             //Get all notes from NoteDB service.
             // $scope.noteList = NoteDB.selectAll();

             var property = {};

             //the query get all properties from the Parse database
             var allProperty = Parse.Object.extend("myProperty");
             var query = new Parse.Query(allProperty);
             query.find({
                 success: function(results) {

                     //CommunityName, Type, rating, and address
                     // will be displayed for each property in the list
                     for (i in results) {
                         aProp = results[i];
                         property.ptitle = aProp.get("kind")

                         console.log("propListCtrl:", i, " ", property.ptitle);
                         if (aProp.get("communityName") != undefined) {
                             property.ptitle = aProp.get("communityName") + " " + property.ptitle;
                         }

                         property.rating = aProp.get('hrating');
                         property.address = aProp.get('address');
                         $scope.propertyList.push(property);
                         property = {};

                     }

                     console.log("propListCtrl: propertyList is ", $scope.propertyList);
                 },
                 error: function(myObject, error) {
                     console.log(error);
                 }
             })

             jQuery('#prop-list-loading-progress').hide();
             jQuery('#prop-list-content').fadeIn();
             $scope.isLoading = false;
         }, 3000); // End loading progress.

     }; //End initialForm.


     //navigation to property detail page has not been written yet 
     //Default code from sterter app 
     // navigateTo is for navigate to other page 
     // by using targetPage to be the destination page 
     // and sending objectData to the destination page.
     // Parameter :  
     // targetPage = destination page.
     // objectData = object that will sent to destination page.
     $scope.navigateTo = function(targetPage, objectData) {
         $state.go(targetPage, {
             noteDetail: objectData,
             actionDelete: (objectData == null ? false : true)
         });
     }; // End navigateTo.

     $scope.initialForm();
 }); // End of Notes List Page  Controller.