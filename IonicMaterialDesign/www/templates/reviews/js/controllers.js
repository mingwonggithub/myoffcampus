appControllers.controller('addReviewCtrl', function ($scope, $stateParams, $filter, $mdBottomSheet, $mdDialog, $mdToast, $ionicHistory) {

  $scope.review = {
    createDate: $filter('date')(new Date(), 'MMM dd, yyyy'),
    overallRating: 1,
    cost: "",
    text: ""
  };
})