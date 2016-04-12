appControllers.controller('addReviewCtrl', function ($scope, $stateParams, $filter, $mdBottomSheet, $mdDialog, $mdToast, $ionicHistory) {
    $scope.property = $stateParams.propDetail;
    console.log($scope.property);
	$scope.review = {
	    createDate: $filter('date')(new Date(), 'MMM dd, yyyy'),
	    overallRating: 1,
	    cost: "",
	    text: ""
	};

   $scope.navigateTo = function(targetPage, objectData) {
         $state.go(targetPage//, {
            // propDetail: objectData
         );
    };

    $scope.addReview = function(form) {
    	if(form.$isValid) {
    		$scope.navigateTo('app.propDetail', $scope.property);
    	}
    };

    $scope.navigateTo = function(targetPage, objectData) {
         $state.go(targetPage, {
             propDetail: objectData
         });
     };

})