 appControllers.controller('addLandLordCtrl', function($scope, $state, $ionicPopup, $stateParams, $filter, $mdBottomSheet, $mdDialog, $mdToast, $ionicHistory) {

 console.log("addLandLordCtrl is here");

     // the following commented out code may be neccessary 
    // if search landlord can searched by address 
    $scope.extractAddress = function(addressComponents) {

        for (var i = 0; i < addressComponents.length; i++) {
            var aType = addressComponents[i].types[0];
            console.log(aType);
            var currentLongName = addressComponents[i].long_name;
            var currentShortName = addressComponents[i].short_name;

            if (aType == 'street_number') {
                $scope.landlord.streetNo = parseInt(currentLongName);
                //searchArray.push(currentLongName);
            }

            if (aType == 'route') {
                $scope.landlord.street = currentLongName;

                //build the keywords for the route 
                // searchArray = searchArray.concat(currentLongName.toLowerCase().split(" "));
                // var shortNameArray = currentShortName.toLowerCase().split(" ");
                // console.log(shortNameArray);
                //  for (var j = 0; j < shortNameArray.length; j++) {
                //     if (elementExists(searchArray, shortNameArray[i]) == false) {
                //        searchArray.push(shortNameArray[i]);
                //     }
                //  }
            }

            if (aType == 'locality') {
                $scope.landlord.city = currentLongName;
                // console.log('locatlity', currentLongName);
                // searchArray.push(currentLongName.toLowerCase());
            }

            if (aType == 'administrative_area_level_1') {
                $scope.landlord.state = currentLongName;
                // searchArray.push(currentLongName.toLowerCase());
                // searchArray.push(currentShortName.toLowerCase());
            }
            if (aType == 'country') {
                $scope.landlord.country = currentLongName;
                // searchArray.push(currentLongName.toLowerCase());
                // searchArray.push(currentShortName.toLowerCase());
            }
            if (aType == 'postal_code') {
                $scope.landlord.zipcode = currentLongName;
                // searchArray.push(currentLongName);
            }
        } // end of for loop 

        console.log("scope landlord is ", $scope.landlord);
        $scope.saveLandLord(); 

    } // end of scope address

     // A confirm dialog for user input address string 
     $scope.showConfirm = function(addressL) {
         var confirmPopup = $ionicPopup.confirm({
             title: 'Comfirm Address',
             template: 'Is ' + addressL.formatted_address + ' the correct address?'
         });

         confirmPopup.then(function(res) {
             if (res) {
                 console.log('addLandlordCtrl: You are sure');
                $scope.extractAddress(addressL.address_components);

             } else {
                 console.log('addLandlordCtrl: You are not sure');
             }
         });
     };

     // An alert dialog for address not recognized by google 
     $scope.showAlert = function() {
         var alertPopup = $ionicPopup.alert({
             title: 'Not Valid Address',
             template: 'Your input address is not valid'
         });

         alertPopup.then(function(res) {
             console.log('Crap, address');
         });
     };
 

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
         searchArray.push($scope.landlord.firstname);
         searchArray.push($scope.landlord.lastname); 
        $scope.landlord.searchArray = searchArray;

         $scope.landlord.prating = parseInt($scope.landlord.prating);

         if (isString($scope.addr.mailaddress)) {
             var geocoder = new google.maps.Geocoder();
             geocoder.geocode({ 'address': $scope.addr.mailaddress }, function(results, status) {

                 if (status == google.maps.GeocoderStatus.OK) {

                     $scope.landlord.addressL = results[0];
                     $scope.landlord.address = results[0].formatted_address;
                     $scope.showConfirm( $scope.landlord.addressL);
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
            $scope.extractAddress($scope.addr.mailaddress.address_components);

        }

    



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

             newLandLord.object = landlord; 
             newLandLord.title = landlord.get("firstname") + " " + landlord.get("lastname");
             newLandLord.rating = landlord.get('prating');
             newLandLord.address = landlord.get('address');
             newLandLord.gender = landlord.get('gender');
             newLandLord.phone = landlord.get('phone');
             newLandLord.email = landlord.get('email');

             newLandLord.streetNo = landlord.get('streetNo');
             newLandLord.street = landlord.get('street');
             newLandLord.city = landlord.get('city');
             newLandLord.state = landlord.get('state');
             newLandLord.zipcode = landlord.get('zipcode');
             newLandLord.address = landlord.get('address');
             if (newLandLord.gender == 'F') {
                 newLandLord.image_url = 'img/landlord_girl.jpg';
             } else {
                 newLandLord.image_url = 'img/landlord_boy.jpg';
             }

             console.log("addLocationCtrl: saveLandLord is ", newLandLord);

             $scope.navigateTo('app.landLordDetails', newLandLord);
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
        lordDetail: objectData
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
     $scope.landlord = $stateParams.lordDetail;
     console.log('landLordDetailCtrl', $scope.landlord); 
     // console.log("locationDetailCtrl: ", $scope.property);


     $scope.navigateTo = function(targetPage, objectData) {
         $state.go(targetPage, {
             landlord: objectData
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

  // Controller of Property List Page.
 // It will call Parse (not NodeDB Services)to present data to html view. /
 appControllers.controller('landlordListCtrl', function($scope, $stateParams, $timeout, NoteDB, $state, starsUtility) {

     console.log("propListCtrl");

     // initialForm is the first activity in the controller. 
     // It will initial all variable data and let the function works when page load.
     $scope.initialForm = function() {


        $scope.landlords = [];

         //$scope.isLoading is the variable that use for check statue of process.
         $scope.isLoading = true;

         //$scope.isAnimated is the variable that use for receive object data from state params.
         //For enable/disable row animation.
         $scope.isAnimated = $stateParams.isAnimated;

         // $scope.noteList is the variable that store data from NoteDB service.
         $scope.noteList = [];
         $scope.propertyList = [];

            //if empty query, list out ten highest rating apartment 
         if (query == null) {
            var myLandLord = Parse.Object.extend("myLandLord");
            var query = new Parse.Query(myLandLord);
            // query.limit(10);
            // query.descending("rating");
        }


        var landlord = {};


         // $scope.filterText is the variable that use for searching.
         $scope.filterText = "";

         // The function for loading progress.
             if ($scope.isAndroid) {
                 jQuery('#prop-list-loading-progress').show();
             } else {
                 jQuery('#prop-list-loading-progress').fadeIn(700);
             }

             //Get all notes from NoteDB service.
             // $scope.noteList = NoteDB.selectAll();

             var landlord= {};
             query.find({
                 success: function(results) {
                     $scope.$apply(function() {
                         console.log("locationFeedCtrl: Successfully retrieved " + results.length + " properties.");
                         // for (var i = 0; i < results.length; i++) {
                         //   $scope.landlords.push(results[i]);
                         //   console.log($scope.landlords);
                         // }

                         for (i in results){

                            alandlord = results[i]; 
                            landlord.object = alandlord; 
                            landlord.title = alandlord.get("firstname") + " " + alandlord.get("lastname");
                            landlord.rating = alandlord.get('prating');
                            landlord.address = alandlord.get('address');
                            landlord.gender = alandlord.get('gender');
                            landlord.phone = alandlord.get('phone');
                            landlord.email = alandlord.get('email');

                            landlord.streetNo = alandlord.get('streetNo');
                            landlord.street = alandlord.get('street');
                            landlord.city = alandlord.get('city');
                            landlord.state = alandlord.get('state');
                            landlord.zipcode = alandlord.get('zipcode');
                            landlord.address = alandlord.get('address');
                            if (landlord.gender == 'F'){
                                landlord.image_url = 'img/landlord_girl.jpg';
                            }else{
                                landlord.image_url = 'img/landlord_boy.jpg';
                            }
    
                            $scope.landlords.push(landlord); 
                             console.log($scope.landlords);
                             landlord={}; 

                         }

                         $scope.isLoading = false;
                         jQuery('#prop-list-loading-progress').hide();
                         jQuery('#prop-list-content').fadeIn();
                     });
                 },
                 error: function(error) {
                     alert("locationFeedCtrl: Error - " + error.code + " " + error.message);
                 }
             });
        

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
            lordDetail: objectData,
             actionDelete: (objectData == null ? false : true)
         });
     }; // End navigateTo.

     $scope.initialForm();
 }); // End of Notes List Page  Controller.