appControllers.controller('dashboardCtrl', function ($scope, $timeout, $state,$stateParams, $ionicHistory) {

    //$scope.isAnimated is the variable that use for receive object data from state params.
    //For enable/disable row animation.
    $scope.isAnimated =  $stateParams.isAnimated;

    // navigateTo is for navigate to other page 
    // by using targetPage to be the destination state. 
    // Parameter :  
    // stateNames = target state to go.
    $scope.navigateTo = function (stateName) {
        $timeout(function () {
            if ($ionicHistory.currentStateName() != stateName) {
                $ionicHistory.nextViewOptions({
                    disableAnimate: false,
                    disableBack: true
                });
                $state.go(stateName);
            }
        }, ($scope.isAnimated  ? 300 : 0));
    }; // End of navigateTo.

    // goToSetting is for navigate to Dashboard Setting page
    $scope.goToSetting = function () {
        $state.go("app.dashboardSetting");
    };// End goToSetting.

}); // End of dashboard controller.

// Controller of Dashboard Setting.
appControllers.controller('dashboardSettingCtrl', function ($scope, $state,$ionicHistory,$ionicViewSwitcher) {

    // navigateTo is for navigate to other page
    // by using targetPage to be the destination state.
    // Parameter :
    // stateNames = target state to go.
    // objectData = Object data will send to destination state.
    $scope.navigateTo = function (stateName,objectData) {
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
}) // End of Dashboard Setting controller.

appControllers.controller('welcomeCtrl', function($scope, $state, $ionicHistory, $ionicViewSwitcher) {
    var currentUser = JSON.parse(localStorage.getItem("mocUser"));

    //if(!currentUser) {
        currentUser = Parse.User.current();
    //}

    $scope.name = currentUser.get("firstName");
    console.log("welcomeCtrl: " + JSON.stringify(currentUser));
    
});

appControllers.controller('settingsCtrl', function($scope, $state, $mdToast, $ionicHistory, $ionicViewSwitcher) {
    self = this;
    self.firstName = "";
    self.lastName = "";
    self.password = "";
    self.currentPassword = "";

    var currentUser = Parse.User.current();

    $scope.settings = function(form, $event) {
        if(form.$valid) { // TODO check user password is valid
            if(self.firstName != "") {
                currentUser.set("firstName", self.firstName);
            }

            if(self.lastName != "") {
                currentUser.set("lastName", self.lastName);
            }

            if(self.password != "") {
                currentUser.set("password", self.password);
            }
            currentUser.save(null, {
              success: function(currentUser) {
                localStorage.setItem("mocUser", JSON.stringify(currentUser));
                
                $mdToast.show({
                    controller: 'toastController',
                    templateUrl: 'toast.html',
                    hideDelay: 400,
                    position: 'top',
                    locals: {
                        displayOption: {
                            title: "User information updated."
                        }
                    }
                });
              },
              error: function(currentUser, error) {
                console.log("error updating user object: " + error.message);
              }
            });
        }
    }
});