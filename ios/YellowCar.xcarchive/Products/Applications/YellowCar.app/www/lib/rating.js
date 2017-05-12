

//================== set rating ==============
Taxi.directive("setRating", function() { 
  return {
    restrict : "A",
    template : "<ul class='rating'>" + "  <li ng-repeat='star in stars' ng-class='star' ng-click='toggle($index)'>" +
               "<i class='icon ion-star'></i> </li> </ul>",
    scope : { ratingValue : "=",max : "=", onRatingSelected : "&"},
    link : function(scope, elem, attrs) {
      var updateStars = function() {
        scope.stars = [];
        for ( var i = 0; i < scope.max; i++) { scope.stars.push({ filled : i < scope.ratingValue}); }
      };
      scope.toggle = function(index) { 
          scope.ratingValue = index + 1;
          scope.onRatingSelected({ rating : index + 1}); 
            //rate_rootScope.add_rating(scope.ratingValue);
      };
      scope.$watch("ratingValue", function(oldVal, newVal) {
        if(!newVal){ newVal=1;}
        if (newVal) {  updateStars(); }
      });
    }
  };
});
//================== show rating ==============
Taxi.directive("starRating", function() {
  return {
    restrict : "A",
    template : "<ul class='rating'> <li ng-repeat='star in stars' ng-class='star'> <i class='icon ion-star'></i> </li> </ul>",
    scope : { ratingValue:"=", max:"=", onRatingSelected:"&"  },
    link : function(scope, elem, attrs) {
      var updateStars = function() {
        scope.stars = [];
        for ( var i = 0; i < scope.max; i++) { scope.stars.push({filled : i < scope.ratingValue });}
      };
      scope.$watch("ratingValue", function(oldVal, newVal) {
          if(!newVal){ newVal=1;}
          if (newVal) {updateStars(); }
      });
    }
  };
});

/*******************************************************************************************/


// set rate  <div set-rating rating-value="formdata.rate" max="5" ></div>
/*
rate_rootScope.add_rating = function(rate_count) 
    {      		
        
    }
*/
// read only <div star-rating rating-value="formdata.rate" max="5" class="rate rate_det" ></div> 

/*******************************************************************************************/
// css

