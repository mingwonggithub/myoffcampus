 appControllers.controller('addPhotoCtrl', function($scope, $stateParams, $mdBottomSheet, $cordovaImagePicker, $ionicPlatform, $stateParams, $state, $ionicHistory) {
     // initialForm is the first activity in the controller. 
     // It will initial all variable data and let the function works when page load.
     $scope.initialForm = function() {
         $scope.imageList = [];
         $scope.imageParseList = [];
         $scope.property = $stateParams.propDetail;

     }; // End initialForm.
     $scope.initialForm();

     $scope.removePic = function(index) {
         $scope.imageList.splice(index, 1);
         $scope.imageParseList.splice(index, 1);
     }


     //make sure device is ready before cordova plugins can be called 
     $ionicPlatform.ready(function() {

         $scope.selectImage = function(limit) {
                 //hide BottomSheet.
                 $mdBottomSheet.hide();

                 //Image picker will load images according to these settings
                 var options = {
                     maximumImagesCount: limit, // Max number of selected images
                     width: 800,
                     height: 800,
                     quality: 100,
                 }

                 // select image by calling $cordovaImagePicker.getPictures(options)
                 $cordovaImagePicker.getPictures(options)
                     .then(function(results) {
                         // store image data to imageList.

                         for (var i = 0; i < results.length; i++) {
                             $scope.imageList.push(results[i]);
                             console.log("images selected", results[i]);
                             $scope.imageUri = results[i];

                             // Encode URI to Base64
                             window.plugins.Base64.encodeFile($scope.imageUri, function(base64) {
                                 // Save images in Base64
                                 $scope.imageParseList.push(base64);
                                 //console.log("addPhotoCtrl': base64 - ", base64);

                             });
                         }

                     }, function(error) {
                         console.log(error);
                     });

             } //end of scope.selectImage 
     })


     // submit images into parse 
     $scope.submitParse = function() {

         for (var k = 0; k < $scope.imageParseList.length; k++) {
             var propImages = new Parse.Object("propImages");
             propImages.set("imgData", $scope.imageParseList[k]);
             propImages.set('underProp', $scope.property.object);
             propImages.save(null, {
                 success: function(savedimage) {
                     console.log("addPhotoCtrl: Succesfully saved images to Parse");
                     $scope.navigateTo('app.locationDetails', $scope.property);
                 },
                 error: function(savedimage, error) {
                     console.log('addPhotoCtrl:', JSON.stringify(error));
                 }
             });
         } //end for loop 
     }

     // showListBottomSheet for show BottomSheet.
     $scope.showListBottomSheet = function($event) {
         $mdBottomSheet.show({
             templateUrl: 'image-picker-actions-template',
             targetEvent: $event,
             scope: $scope.$new(false),
         });
     }; // End showListBottomSheet.



     //navigate to the property detail page 
     $scope.navigateTo = function(targetPage, objectData) {
         $state.go(targetPage, {
             propDetail: objectData
         });
     };
 });

 appControllers.controller('addLocationCtrl', function($scope, $state, NoteDB, $stateParams, $ionicPopup, $filter, $mdBottomSheet, $mdDialog, $mdToast, $ionicHistory) {


     // A confirm dialog for user input address string 
     $scope.showConfirm = function(addressL) {
         var confirmPopup = $ionicPopup.confirm({
             title: 'Comfirm Address',
             template: 'Is ' + addressL.formatted_address + ' the correct address?'
         });

         confirmPopup.then(function(res) {
             if (res) {
                 console.log('addLocationCtrl: You are sure');
                 $scope.savingProp(addressL);

             } else {
                 console.log('addLocationCtrl: You are not sure');
             }
         });
     };

     function isString(val) {
         return typeof val === 'string' || ((!!val && typeof val === 'object') && Object.prototype.toString.call(val) === '[object String]');
     }

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

             // when address is a user input string, convert to google object 
             if (isString($scope.addr.addressL)) {
                 var geocoder = new google.maps.Geocoder();
                 geocoder.geocode({ 'address': $scope.addr.addressL }, function(results, status) {

                     if (status == google.maps.GeocoderStatus.OK) {

                         $scope.addr.addressL = results[0];
                         console.log("geocoding", $scope.addr.addressL);
                         $scope.showConfirm($scope.addr.addressL);

                     } else {
                         console.log("Geocode was not successful for the following reason: " + status);

                     }
                 });
             } else {
                 $scope.savingProp($scope.addr.addressL);
             }

             //address object from google 
             $scope.savingProp = function(addressL) {
                 var address = addressL;

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
         }
     };

     //clear the form text and the errors 
     $scope.reset = function(propForm) {
         console.log("addLocationCtrl: propForm - ", propForm);
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
                 newProp.object = property;

                 console.log("addLocationCtrl: saveProp is ", newProp);
                 $mdToast.show({
                     controller: 'toastController',
                     templateUrl: 'toast.html',
                     hideDelay: 400,
                     position: 'top',
                     locals: {
                         displayOption: {
                             title: "Property added"
                         }
                     }
                 });
                 $state.go('app.locationFeed');
                 // The object was saved successfully.
                 // console.log("addLocationCtrl: in Parse ", property);
             },
             error: function(properties, error) {
                 // The save failed.
                 // error is a Parse.Error with an error code and message.
                 console.log("addLocationCtrl:", error);
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

         $scope.prop.hrating = 0;
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
         $scope.reverse = true; //default search result is 
         $scope.predicate = 'rating'; //top 5 properties with highest rating 

         var query = $stateParams.searchResults; //query is input from search box at welcome page 
         console.log("locationFeedCtrl beginning: query is ", query);

         $scope.initialize = function(query) {

             //if empty query, list out ten highest rating apartment 
             if (query == null) {
                 var myProperty = Parse.Object.extend("myProperty");
                 var query = new Parse.Query(myProperty);
                 query.limit(10);
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

                             property.rating = parseFloat($filter('number')(aProp.get('hrating'), 2)); //$filter('number')(aProp.get('hrating'), 2);
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
                     alert("locationFeedCtrl: Error - " + error.code + " " + error.message);
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


 // Controller of Location Detail Page.
 appControllers.controller('locationDetailCtrl', function($scope, $ionicModal, $ionicPlatform, $stateParams, $state, $filter, $mdBottomSheet, $mdDialog, $mdToast, $ionicHistory) {

     $scope.property = $stateParams.propDetail;
     $scope.reviews = []; //list of reviews on feed page 
     $scope.allImages = [];
     //all images for that propery 

     /* start of image slider */


     //Obtaining all the property images 
     $scope.img = '';
     var myPhotos = Parse.Object.extend("propImages");
     var query = new Parse.Query("propImages");
     query.equalTo("underProp", $scope.property.object);
     query.find({
         success: function(results) {

             $scope.$apply(function() {

                 console.log("locationDetailCtrl: " + results.length + " propImages found");

                 for (var j = 0; j < results.length; j++) {
                     var imagedata = results[j].get("imgData");
                     $scope.allImages.push({ src: imagedata });

                 }
             });

         },
         error: function(error) {
             console.log('locationDetailCtrl: ', error);
         }
     });


     $scope.showImages = function(index) {
         $scope.activeSlide = index;
         $scope.showModal('imageModal.html');
     }

     $scope.showModal = function(templateUrl) {
         $ionicModal.fromTemplateUrl(templateUrl, {
             scope: $scope,
             animation: 'slide-in-up'
         }).then(function(modal) {
             $scope.modal = modal;
             $scope.modal.show();
         });
     }

     // Close the modal
     $scope.closeModal = function() {
         $scope.modal.hide();
         $scope.modal.remove()
     };

     /* end of image slider */


     //initialize ht emap 
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

     //Obtaining all the reviews 
     var prop = $scope.property.object;
     var myProperty = Parse.Object.extend("myProperty");
     var query = new Parse.Query(myProperty);
     console.log("locationDetailCtrl: prop.getaddress is" + prop.get("address"))
     query.equalTo("address", prop.get("address"));
     query.include("reviews");
     query.select("reviews");
     var review = {};

     //SLOW BECAUSE 2 QUERIES ARE NEEDED. REWRITE
     //for future, one to many relationship should use pointer
     // see the image 
     query.find({
         success: function(results) {
             var relation = results[0].relation("reviews");
             relation.query().find({
                 success: function(qReviews) {
                     $scope.$apply(function() {
                         console.log("locationDetailCtrl: Successfully retrieved " + qReviews.length + " reviews.");
                         var counter = 1;
                         for (i in qReviews) {
                             aR = qReviews[i];
                             review.object = aR;
                             review.cost = aR.get('cost');
                             review.text = aR.get('mainText');
                             review.rating = aR.get('rating');
                             $scope.reviews.push(review);


                             if (counter == 0) {
                                 var query = new Parse.Query("myProperty");
                                 query.equalTo("reviews", aR);

                                 query.find({
                                     success: function(results) {
                                         console.log("cloud results are", JSON.stringify(results));
                                     },
                                     error: function(error) {
                                         response.error("error is ", JSON.stringify(error));
                                     }
                                 });

                             }
                             counter = 1;

                             review = {};


                         }
                     }); //end $scope.apply
                 },
                 error: function(error) {
                     console.log("locationDetailCtrl: Error2 - " + error.code + " " + error.message);
                 }
             }); //end 2nd query
         },
         error: function(error) {
             console.log("locationDetailCtrl: Error1 - " + error.code + " " + error.message);
         }
     });


     $scope.navigateTo = function(targetPage, object1Data, object2Data) {
         $state.go(targetPage, {
             propDetail: object1Data,
             reviews: object2Data
         });
     };



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
                         console.log("savedLocationCtrl: Successfully retrieved " + results.length + " properties.");
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
                     console.log("savedLocationCtrl': Error2 - " + error.code + " " + error.message);
                 }
             }); //end 2nd query
         },
         error: function(error) {
             console.log("savedLocationCtrl': Error1 - " + error.code + " " + error.message);
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

         console.log("savedLocationCtrl: removing property " + property);
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
                 console.log("savedLocationCtrl: error - " + error.message);
             }
         });
     }


 })