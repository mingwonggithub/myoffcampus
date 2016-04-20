appControllers.controller('addReviewCtrl', function($scope, $state, $stateParams, $filter, $mdBottomSheet, $mdDialog, $mdToast, $ionicHistory) {
  $scope.property = $stateParams.propDetail;
  // console.log($scope.property);
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
      console.log("addReviewCtrl: reviewprop - " + prop);

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

            $scope.$apply(function() {
              //average the property ratings
              Parse.Cloud.run('getPropertyRating', { propid: prop.id }, {
              
                success: function(rating) {
                  console.log("addReviewCtrl: rating - ", rating); 
                  prop.set('hrating', rating);
                  $scope.property.rating = parseFloat($filter('number')(rating, 1));
                
                  prop.save(null, {
                    success: function(aprop) {
                      console.log("addReviewCtrl: Save property with new rating successfully");
                    },
                    error: function(aprop, error) {
                      console.log("addReviewCtrl: Error - ", error);
                    }
                  }); // end of inner prop save   

                },
                error: function(error) {
                  console.log(JSON.stringify(error)); 
                } 
              }); // end of parse cloud function 
            }); // end of scope apply

            $scope.navigateTo('app.locationDetails', $scope.property);

            },
            error: function(prop, error) {
              // save property failed
              console.log("addReviewCtrl: Save property with review fail " + JSON.stringify(error));
            } 
          }); //end of outer prop save 
        },
        error: function(review, error) {
          // save review failed
          console.log("addReviewCtrl: Save review fail " + JSON.stringify(error));
        } 
      }); // end of review save 
    }

  };

  $scope.navigateTo = function(targetPage, objectData) {
    $state.go(targetPage, {
      propDetail: objectData
    });
  };
})

appControllers.controller('addReviewLandlordCtrl', function($scope, $state, $stateParams, $filter, $mdBottomSheet, $mdDialog, $mdToast, $ionicHistory) {
  $scope.landlord = $stateParams.lordDetail;
   console.log($scope.landlord);
  $scope.review = {
    createDate: $filter('date')(new Date(), 'MMM dd, yyyy'),
    overallRating: 1,
    time: "",
    text: ""
  };

  $scope.addReview = function(form) {
    if (form.$valid) {
      var LandlordReview = Parse.Object.extend("LandlordReview");
      var ll = $scope.landlord.object;
      var review = new LandlordReview();
      review.set("time", $scope.review.time);
      review.set("mainText", $scope.review.text);
      review.set("rating", $scope.review.overallRating);
      console.log("addReviewLLCtrl: reviewprop - " + ll);

      review.save(null, {
        success: function(review) {
          
          var relation = ll.relation("reviews");
          relation.add(review);
          
          ll.save(null, {
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

    //           var llquery= new Parse.Query("myLandLord");
   //           llquery.get(ll.id, {
   //     success: function(landlord) {

   //         // get the property relation with review
   //         var relation = landlord.relation("reviews");

   //         // generate a query based on that relation
   //         var query = relation.query();
   //         query.find({
   //             success: function(results) {
   //                 var sum = 0;
   //                 for (var i = 0; i < results.length; ++i) {
   //                     sum += results[i].get("rating");
   //                 }
   //                 console.log(sum/results.length);
   //                 //response.success(sum / results.length);

   //             },
   //             error: function(error) {
   //                 //response.error("review lookup fail");
   //                 conosle.log('error is ', JSON.stringify(error)); 
   //             }
   //         });

   //     },
   //     error: function(object, error) {
   //         // The object was not retrieved successfully.
   //         // error is a Parse.Error with an error code and message.
   //         //response.error(JSON.stringify(error));
   //     }
   // });


            $scope.$apply(function() {
              //average the landlord ratings
              Parse.Cloud.run('getLandlordRating', { llid: ll.id }, {
              
                success: function(rating) {
                  console.log("addReviewCtrl: rating - ", rating); 
                  ll.set('prating', rating);
                  $scope.landlord.rating = parseFloat($filter('number')(rating , 1)); 
                
                  ll.save(null, {
                    success: function(alord) {
                      console.log("addReviewLandlordCtrl:  Save landlord with new rating successfully");
                    },
                    error: function(aprop, error) {
                      console.log("addReviewLandlordCtrl: Error - ", error);
                    }
                  }); // end of inner prop save   

                },
                error: function(error) {
                  console.log(JSON.stringify(error)); 
                } 
              }); // end of parse cloud function 
            }); // end of scope apply

            $scope.navigateTo('app.landLordDetails', $scope.landlord);

            },
            error: function(prop, error) {
              // save property failed
              console.log("addReviewLLCtrl: Save property with review fail " + JSON.stringify(error));
            } 
          }); //end of outer prop save 
        },
        error: function(review, error) {
          // save review failed
          console.log("addReviewLLCtrl: Save review fail " + JSON.stringify(error));
        } 
      }); // end of review save 
    }

  };

  $scope.navigateTo = function(targetPage, objectData) {
    $state.go(targetPage, {
      lordDetail: objectData
    });
  };
})

appControllers.controller('allReviewsCtrl', function($scope, $state, $stateParams, $filter, $mdBottomSheet, $mdDialog, $mdToast, $ionicHistory) {
  $scope.property = $stateParams.propDetail;
  $scope.reviews = $stateParams.reviews;
  // console.log($scope.property);

  $scope.navigateTo = function(targetPage, objectData) {
    $state.go(targetPage, {
      propDetail: objectData
    });
  };
})

appControllers.controller('allReviewsLLCtrl', function($scope, $state, $stateParams, $filter, $mdBottomSheet, $mdDialog, $mdToast, $ionicHistory) {
  $scope.landlord = $stateParams.lordDetail;
  $scope.reviews = $stateParams.reviews;
   console.log($scope.reviews);

  $scope.navigateTo = function(targetPage, objectData) {
    $state.go(targetPage, {
      lordDetail: objectData
    });
  };
});