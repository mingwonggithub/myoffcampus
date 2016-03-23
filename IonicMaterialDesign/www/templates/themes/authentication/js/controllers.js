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
          currentUser = user;
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
      console.log("Login user: " + self.email + "  " + self.firstName);
      
      Parse.User.logIn(self.email, self.password, {
        success: function(user) {
          currentUser = user;
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