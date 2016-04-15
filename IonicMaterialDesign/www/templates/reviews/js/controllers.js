appControllers.controller('addReviewCtrl', function($scope, $state, $stateParams, $filter, $mdBottomSheet, $mdDialog, $mdToast, $ionicHistory) {
  $scope.property = $stateParams.propDetail;
  console.log($scope.property);
  $scope.review = {
    createDate: $filter('date')(new Date(), 'MMM dd, yyyy'),
    overallRating: 1,
    cost: "",
    text: ""
  };

  $scope.addReview = function(form) {
    if (form.$valid) {
      var Review = Parse.Object.extend("Review");
      var prop = $scope.property.object;
      var review = new Review();
      review.set("cost", $scope.review.cost);
      review.set("mainText", $scope.review.text);
      review.set("rating", $scope.review.overallRating);
      console.log("reviewprop: " + prop);

      review.save(null, {
        success: function(review) {
          var relation = prop.relation("reviews");
          relation.add(review);
          prop.save(null, {
            success: function(review) {
              $mdToast.show({
                controller: 'toastController',
                templateUrl: 'toast.html',
                hideDelay: 400,
                position: 'top',
                locals: {
                  displayOption: {
                    title: "Review saved"
                  }
                }
              });
              $scope.navigateTo('app.locationDetails', $scope.property);
            },
            error: function(prop, error) {
              // save property failed
              console.log("Save property failed: " + error);
            }
          });
        },
        error: function(review, error) {
          // save review failed
          console.log("Save review failed: " + error);
        }
      });
    }
  };

  $scope.navigateTo = function(targetPage, objectData) {
    $state.go(targetPage, {
      propDetail: objectData
    });
  };
});