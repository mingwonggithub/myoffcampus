//Directive numbersOnly :
//Use for change input to have ability accept only number.
//Example : <input ng-model="contract.age" numbers-only type="tel">
//
appControllers.directive('numbersOnly', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var transformedInput = text.replace(/[^0-9]/g, '');

                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }

            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});// End Directive numbersOnly.

appControllers.directive('compareTo', function() {
    return {
      require: "ngModel",
      scope: {
        otherModelValue: "=compareTo"
      },
      link: function(scope, element, attributes, ngModel) {
        ngModel.$validators.compareTo = function(modelValue) {
          return modelValue == scope.otherModelValue;
        };

        scope.$watch("otherModelValue", function() {
          ngModel.$validate();
        });
      }
    };
});

// appControllers.directive('uniEmail', function() {
//     return {
//       require: "ngModel",
//       scope: {
//         otherModelValue: "=uniEmail"
//       },
//       link: function(scope, element, attributes, ngModel) {
//         ngModel.$validators.uniEmail = function(modelValue) {
//           var validEmail = [a-z0-9!#$%&/'*+/=?^_/{|}~-]+(?:\.[a-z0-9!#$%&/'*+/=?^_/{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+sc\.edu$]?;
//           return validEmail.(modelValue);
//         };
//       }
//     };
// });



appControllers.directive('googleplace', [ function() {
    return {
        require: 'ngModel',
        scope: {
            ngModel: '=',
            details: '=?'
        },
        link: function(scope, element, attrs, model) {
            var options = {
                types: [],
                componentRestrictions: {}
            };
            console.log("I am at googleplace");
            scope.gPlace = new google.maps.places.Autocomplete(element[0], options);

            google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
                var geoComponents = scope.gPlace.getPlace();
                var latitude = geoComponents.geometry.location.lat();
                var longitude = geoComponents.geometry.location.lng();
                console.log("directive: " + latitude);
                console.log("directive: " + longitude);
                var addressComponents = geoComponents.address_components;
                //console.log(JSON.stringify(addressComponents));

                addressComponents = addressComponents.filter(function(component){
                    switch (component.types[0]) {
                        case "locality": // city
                            return true;
                        case "administrative_area_level_1": // state
                            return true;
                        case "country": // country
                            return true;
                        default:
                            return false;
                    }
                }).map(function(obj) {
                    return obj.long_name;
                });

                addressComponents.push(latitude, longitude);

                scope.$apply(function() {
                    scope.details = addressComponents; // array containing each location component
                    model.$setViewValue(element.val());
                });
            });
        }
    };
}]);


appControllers.directive('starRating', ['$compile', '$templateCache', '$timeout', function($compile, $templateCache, $timeout) {
            return {
                restrict: 'A',
                scope: {
                    percent: "=outerPercent",
                    starsSelected: "=outerStarSelection"
                },
                template: '<div class="stars" ng-mousemove="changeRating($event)" ng-mouseleave="leaveRating()" style="background-color: {{emptyBackColor}}"><div class="stars-selected" style="width: {{percent}}%; background-color: {{selColor}};"></div></div>',
                controller: function($scope, stars, starsUtility) {

                    // Apply Utilities
                    for(var method in starsUtility) {
                        (function(m) {
                            $scope[m] = function() { return starsUtility[m].apply(null, arguments); };
                        }(method));
                    }

                    // Invoke the factory method: draw transparent star
                    $scope.drawStar = function() {
                        return stars.emptyStar.apply(null, arguments);
                    };



                },
                link: function($scope, el, attrs, scope) {

                    // Configs
                    var starEl = [];
                    var wrapper = angular.element(el[0].querySelector('.stars'));
                    var filler = angular.element(el[0].querySelector('.stars-selected'));

                    $scope.howManyStars = $scope.createRange( attrs.stars ) || $scope.createRange(5);
                    $scope.starRadius = parseInt( attrs.starRadius ) || 20;
                    $scope.percent = $scope.prevPercent = $scope.calculatePercent( attrs );
                    $scope.backColor = attrs.backColor || 'white';
                    $scope.emptyBackColor = attrs.emptyBackColor || '#d3d3d3';
                    $scope.selColor = attrs.selColor || 'gold';
                    $scope.ratingDefine = attrs.ratingDefine || false;

                    // Allowed to define a new rating?
                    // -------------------------------
                    if ($scope.ratingDefine) {

                        // watch percent value to update the view
                        $scope.$watch('percent', function(newValue, oldValue) {
                            filler.css('width', newValue + '%');
                            $scope.starsSelected = $scope.starsByPercent($scope.howManyStars.length, $scope.percent);
                        });

                        // handle events to change the rating
                        // $scope.changeRating = function(e) {
                        //     var el = wrapper[0];
                        //     var w = el.offsetWidth;
                        //     var selected = e.clientX - el.getBoundingClientRect().left + 1;
                        //     var newPercent = $scope.ratingDefine == 'star' ? $scope.percentFullStars($scope.howManyStars.length, w, $scope.starRadius*2, selected) : Math.floor((selected * 100) / w);
                        //     $scope.percent = newPercent > 100 ? 100 : newPercent;
                        //     console.log($scope.percent);
                        // };

                        // $scope.leaveRating = function() {
                        //     $scope.percent = $scope.prevPercent;
                        //     console.log("leave rating: ", $scope.percent);
                        //     scope.percent = $scope.percent

                        // };

                        // $scope.secureNewRating = function() {
                        //     $scope.prevPercent = $scope.percent;
                        //     console.log("new rating: ", $scope.percent);

                        // };
                    }

                    // add canvas to DOM first
                    $scope.howManyStars.forEach(function() {
                        var star = angular.element('<canvas class="star" ng-click="secureNewRating()" height="{{starRadius*2}}" width="{{starRadius*2}}"></canvas>');
                        $compile(star)($scope);
                        wrapper.append(star);
                        starEl.push(star);
                    });

                    // we should wait for next JS 'tick' to show up the stars
                    $timeout(function() {
                        starEl.forEach(function(el) {
                            $scope.drawStar(el[0].getContext("2d"), $scope.starRadius, $scope.backColor);
                        });
                        wrapper.css('visibility', 'visible'); // this to avoid to show partly rendered layout
                    });

                },


            };
        }])

