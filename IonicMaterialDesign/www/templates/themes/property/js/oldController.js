 appControllers.controller('addPropertyCtrl', function($scope, NoteDB, $stateParams, $filter, $mdBottomSheet, $mdDialog, $mdToast, $ionicHistory) {

     $scope.createProperty = function(prop, isValid) {

         console.log(isValid);

         if (isValid) {
             console.log($scope.prop.prating);
             geocoder = new google.maps.Geocoder();
             console.log($scope.prop.address);
             var address = $scope.prop.address.formatted_address;
             console.log(address);


             geocoder.geocode({ 'address': address }, function(results, status) {

                 if (status == google.maps.GeocoderStatus.OK) {
                     var addressComponents = results[0].address_components;

                     for (var i = 0; i < addressComponents.length; i++) {
                         var aType = addressComponents[i].types[0];
                         var currentLongName = addressComponents[i].long_name;

                         if (aType == 'street_number') {
                             $scope.prop.streetNo = parseInt(currentLongName);
                         }
                         if (aType == 'route') {
                             $scope.prop.street = currentLongName;
                         }
                         if (aType == 'locality') {
                             $scope.prop.city = currentLongName;
                         }
                         if (aType == 'administrative_area_level_1') {
                             $scope.prop.state = currentLongName;
                         }
                         if (aType == 'country') {
                             $scope.prop.country = currentLongName;
                         }
                         if (aType == 'postal_code') {
                             $scope.prop.zipcode = currentLongName;
                         }
                     }

                     $scope.prop.kind = $scope.categories.kind;
                     $scope.prop.prating = parseInt($scope.prop.prating);
                     console.log($scope.prop);

                     // saveProp(); 

                 } else {
                     alert("Geocode was not successful for the following reason: " + status);
                 }

             });


         }



     };


     // initialForm is the first activity in the controller. 
     // It will initial all variable data and let the function works when page load.
     $scope.initialForm = function() {

         $scope.prop = {};

         $scope.categories = [
             { 'kind': 'Apartment' },
             { 'kind': 'Condo' },
             { 'kind': 'House' },
             { 'kind': 'Townhouse' },
         ];

         $scope.prop.prating = 5;

     };

     $scope.initialForm();


 });