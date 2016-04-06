appControllers.controller('registerCtrl', function($scope, $state) {
  var currentUser;
  var self = this;
  self.email = "";
  self.password = "";
  self.confirmPassword = "";
  self.firstName = "";
  self.lastName = "";

  $scope.register = function(form) {
    if(form.$valid) {
      console.log("Register user: " + self.email + "  " + self.firstName);

      var user = new Parse.User();
      user.set("username", self.email); //following parse guide, says to use email as username
      user.set("password", self.password);
      user.set("email", self.email);
      user.set("firstName", self.firstName);
      user.set("lastName", self.lastName);

      user.signUp(null, {
        success: function(user) {
          localStorage.setItem("mocUser", JSON.stringify(user));
          $state.go("app.welcome"); 
        },
        error: function(user, error) {
          // Show the error message ON THE VIEW and let the user try again.
          // Commonly username already exists
          console.log("Error: " + error.code + " " + error.message);
        }
      });
    } // else if form invalid, do nothing
  };
});


appControllers.controller('loginCtrl', function($scope, $state) {
  var currentUser;
  var self = this;
  self.email = "";
  self.password = "";

  $scope.login = function(form) {
    if(form.$valid) {
      console.log("Login user: " + self.email + "  " + self.password);
      
      Parse.User.logIn(self.email, self.password, {
        success: function(user) {
          localStorage.setItem("mocUser", JSON.stringify(user));
          $state.go("app.welcome"); 
        },
        error: function(user, error) {
          // The login failed. Check error to see why.
          console.log("Error: " + error.code + " " + error.message);
        }
      });
    }
  }
});

appControllers.controller('passwordCtrl', function($scope, $state, $mdDialog, $mdToast) {
  var currentUser;
  var self = this;
  self.email = "";

  $scope.reset = function(form, $event) {
    if(form.$valid) {

        //mdDialog.show use for show alert box for Confirm to reset password.
        $mdDialog.show({
            controller: 'DialogController',
            templateUrl: 'confirm-dialog.html',
            targetEvent: $event,
            locals: {
                displayOption: {
                    title: "Reset Password",
                    content: "An email will be sent to your account in order for you to reset your password.",
                    ok: "Confirm",
                    cancel: "Close"
                }
            }
        }).then(function () {
            // For confirm button to reset password.
            try {
                $state.go("app.login"); 

                // Showing toast for success.
                $mdToast.show({
                    controller: 'toastController',
                    templateUrl: 'toast.html',
                    hideDelay: 400,
                    position: 'top',
                    locals: {
                        displayOption: {
                            title: "Password reset request sent."
                        }
                    }
                });
            }
            catch (e) {
                //Showing toast for failure.
                $mdToast.show({
                    controller: 'toastController',
                    templateUrl: 'toast.html',
                    hideDelay: 800,
                    position: 'top',
                    locals: {
                        displayOption: {
                            title: window.globalVariable.message.errorMessage
                        }
                    }
                });
            }
        }, function () {
            // For cancel button
        });
    }
  }
});