angular.module('MyApp').controller('payment_page',function($timeout,$state,$http,$scope,$rootScope){
    if(map) map.setClickable( false );
    $timeout(function(){if(map) map.setClickable( false );},1000)
    $scope.rating={rating:  0,comment:''};
    $rootScope.close_payment= function() {
        console.log('closepayment')
        var trip={tripRate:$scope.rating.rating,tripLeaveComment:$scope.rating.comment,DidRated:1,tripStatus:6}
       $http.post(NodeApi+'trip/'+$rootScope.Payment_Page.tripId,{DontSendNot:true,trip:trip})
       $rootScope.gotohome();
   };
})