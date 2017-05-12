angular.module('MyApp').controller('Register',['$scope','$timeout','$interval','$http','$rootScope','$ionicLoading','$filter','$state',
    function($scope,$timeout,$interval,$http,$rootScope,$ionicLoading,$filter,$state){
        $scope.Obj={};
        $scope.ErrorMessage= false
        $scope.EmailIsValid= true;
        $scope.MobileIsValid= true;
        $scope.NameIsValid= true;
       if($rootScope.countries){
            $scope.countrySelected=$rootScope.countries[0]
            $scope.Obj.passengerCountryId=$scope.countrySelected.countryId;
            if(Domain=='mshawier'){
                var city_filter=$filter('filter')($scope.cities,{countryId:$scope.Obj.passengerCountryId}
                                                    ,function(a,b){if(a==b) return true})
                if(city_filter.length>0)$scope.Obj.passengerCityId=city_filter[0].cityId;
                else $scope.Obj.passengerCityId='';
            }
            else  $scope.Obj.passengerCityId='';
       }
        $scope.Obj.passengerEmail=$rootScope.facebookdata_Email;
        $scope.Obj.passengerName=$rootScope.facebookdata_name;
        
        $scope.CheckEmail=function()
        {
            if($scope.Obj.passengerEmail){
               $scope.EmailIsValid = true;
                $http.post(HostApi+"signin",{passengerEmail:$scope.Obj.passengerEmail},{timeout:TIMEOUTHTTP}).success(function(data) { 
                    if(data.rows) $scope.EmailIsValid=false;
                    else $scope.EmailIsValid=true;
                })
             }
        }
     //   if($scope.Obj.passengerEmail) $scope.CheckEmail();
        
        $scope.CheckMobile=function()
        {
            if($scope.Obj.passengerMobile){
                $scope.MobileIsValid= true;
                var mobile=$scope.countrySelected.countryTel+$scope.Obj.passengerMobile.toString();
                $http.post(HostApi+"signin",{passengerMobile:mobile},{timeout:TIMEOUTHTTP}).success(function(data) { 
                    if(data.rows)$scope.MobileIsValid=false;
                    else $scope.MobileIsValid=true;
                })
           }
        }

        $scope.clear_validation=function(type)
        {
            if(type=='mob' && !$scope.Obj.passengerMobile) $scope.MobileIsValid= true;
            else if(type=='email' && !$scope.Obj.passengerEmail) $scope.EmailIsValid = true;
        }
        
        $scope.Register=function()
        {
            $scope.Obj.deviceId=localStorage.uuid; 
            $scope.Obj.packageId=1;
            $scope.Obj.countryTel=$scope.countrySelected.countryTel
            $scope.Obj.passenger_app_lang=$rootScope.lng;
            // $ionicLoading.show()
            $http.post(HostApi+'passengersignup',$scope.Obj,{timeout:TIMEOUTHTTP}).success(function(res){
                console.log(res);
                if(res.id)
                {
                    $rootScope.user_data = $scope.Obj
                    $rootScope.user_data.passengerId=res.id
                    $state.go('app.verify');
                }
                else if(res=='Email exist')  $scope.EmailIsValid=false;
                else if(res=='Mobile exist')  $scope.MobileIsValid=false;
                else $scope.ErrorMessage = res
            }).finally(function(){  });
           /* .finally(function(){
                $ionicLoading.hide()
            });*/
        }
        
    $scope.chooseCountry=function(){
        $scope.countrySelected=$filter('filter')($scope.countries,{countryId:$scope.Obj.passengerCountryId}
                                                 ,function(a,b){if(a==b) return true})[0] ;
        var city_filter=$filter('filter')($scope.cities,{countryId:$scope.Obj.passengerCountryId}
                                                 ,function(a,b){if(a==b) return true})
         if(city_filter.length>0)$scope.Obj.passengerCityId=city_filter[0].cityId;
         else $scope.Obj.passengerCityId='';
    }
    $scope.$watch('Obj.passengerName',function(){
       if($scope.Obj && $scope.Obj.passengerName){
           var namelen = $scope.Obj.passengerName.split(' ');
           $scope.NameIsValid =(namelen.length>1)?true:false;
       }
    });
}])