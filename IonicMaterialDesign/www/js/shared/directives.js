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

appControllers.directive('uniEmail', function() {
    return {
      require: "ngModel",
      scope: {
        otherModelValue: "=uniEmail"
      },
      link: function(scope, element, attributes, ngModel) {
        ngModel.$validators.uniEmail = function(modelValue) {
          var validEmail = [a-z0-9!#$%&/'*+/=?^_/{|}~-]+(?:\.[a-z0-9!#$%&/'*+/=?^_/{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+sc\.edu$]?;
          return validEmail.(modelValue);
        };
      }
    };
});
