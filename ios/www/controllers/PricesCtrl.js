angular.module('MyApp').controller('PricesCtrl',function($filter,$state,$http,$scope,$rootScope){
  $scope.Domain=Domain;
  
  $scope.filterPrices=function(){
        $scope.noprices=false;
        var filter=$filter('filter')($scope.pricesList,{cityId:$scope.formData.cityId} ,function(a,b){if(a==b) return true});
        if(filter.length>0){
           filter=$filter('filter')(filter,{levelId:$scope.formData.levelId} ,function(a,b){if(a==b) return true});
           if(filter.length>0){
               filter=$filter('filter')(filter,{typeId:$scope.formData.typeId} ,function(a,b){if(a==b) return true});
           }
        }
        if(filter.length>0)  $scope.priceDetail=filter[0]
        else {$scope.noprices=true; $scope.priceDetail='';}
        //formData.typeId
        console.log($scope.priceDetail)
        console.log($scope.noprices)

  }
    if($rootScope.user_data) $scope.formData={typeId:$rootScope.tripType,cityId:$rootScope.user_data.passengerCityId,levelId:$rootScope.LevelId};
    else $scope.formData={cityId:"",levelId:"",typeId:''};
      $http.get(HostApi+'prices/0/0/0/0',{timeout:TIMEOUTHTTP})
        .success(function(res){
             console.log(res.rows)
            $scope.pricesList=res.rows;
            $scope.filterPrices();
        }).error(function(res){ console.log(res)});
})