// this is cloud code that average the reviews for the property 
Parse.Cloud.define("getPropertyRating", function(request, response) {
    var propertyquery = new Parse.Query("myProperty");

    //retrieve the property object 
    propertyquery.get(request.params.propid, {
        success: function(property) {

            // get the property relation with review
            var relation = property.relation("reviews");

            // generate a query based on that relation
            var query = relation.query();
            query.find({
                success: function(results) {
                    var sum = 0;
                    for (var i = 0; i < results.length; ++i) {
                        sum += results[i].get("rating");
                    }
                    response.success(sum / results.length);

                },
                error: function() {
                    response.error("review lookup fail");
                }
            });

        },
        error: function(object, error) {
            // The object was not retrieved successfully.
            // error is a Parse.Error with an error code and message.
            response.error(JSON.stringify(error));
        }
    });
});

Parse.Cloud.define("getLandlordRating", function(request, response) {
    var llquery= new Parse.Query("myLandLord");

    //retrieve the property object 
    llquery.get(request.params.llid, {
        success: function(landlord) {

            // get the property relation with review
            var relation = landlord.relation("reviews");

            // generate a query based on that relation
            var query = relation.query();
            query.find({
                success: function(results) {
                    var sum = 0;
                    for (var i = 0; i < results.length; ++i) {
                        sum += results[i].get("rating");
                    }
                    response.success(sum / results.length);

                },
                error: function() {
                    response.error("review lookup fail");
                }
            });

        },
        error: function(object, error) {
            // The object was not retrieved successfully.
            // error is a Parse.Error with an error code and message.
            response.error(JSON.stringify(error));
        }
    });
});



  

