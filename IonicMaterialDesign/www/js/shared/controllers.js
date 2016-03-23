//This is Controller for Dialog box.
appControllers.controller('DialogController', function ($scope, $mdDialog, displayOption) {

    //This variable for display wording of dialog.
    //object schema:
    //displayOption: {
    //        title: "Confirm to remove all data?",
    //        content: "All data will remove from local storage.",
    //        ok: "Confirm",
    //        cancel: "Close"
    //}
    $scope.displayOption = displayOption;

    $scope.cancel = function () {
        $mdDialog.cancel(); //close dialog.
    };

    $scope.ok = function () {
        $mdDialog.hide();//hide dialog.
    };
});// End Controller for Dialog box.

//Controller for Toast.
appControllers.controller('toastController', function ($scope, displayOption) {

    //this variable for display wording of toast.
    //object schema:
    // displayOption: {
    //    title: "Data Saved !"
    //}

    $scope.displayOption = displayOption;
});// End Controller for Toast.





/*.controller('WelcomeCtrl', function($scope, $state, Orders) {
    var self = this;
    $scope.login = function() {
        console.log("login executed");
        console.log(self.email);
        var loggedUser = Backendless.UserService.login(self.email, self.password);
        console.log("User has been logged in: " + loggedUser);

        var email = Backendless.UserService.getCurrentUser();
        if (email != null) {
            console.log("logedin");
            $state.go("app.orders"); //fix this redirect
        } else {
            console.log("User hasn't been logged");
        }
    }
});
*/