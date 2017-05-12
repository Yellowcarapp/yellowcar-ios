angular.module('MyApp').controller('verifyCodeCtrl', function($scope,$rootScope,$http,$timeout,$ionicPopup) {
    $scope.verifyformData={userVerifyCode:'' };
    
    $scope.sendverifyCode = function() {
        $rootScope.Show_alert ($rootScope.language.resendverifycode)
        $timeout(function(){
            $http({method:"POST",url:HostApi+"GenerateCode/"+$rootScope.user_data.passengerId+"/driverActivation",timeout:TIMEOUTHTTP ,data:{}})
            .success(function(data, status, headers, config) {  
                $rootScope.Show_alert ($rootScope.language.msgverifyaccount)
            })
        },300000);
    }
    $scope.loading=false;
    $scope.CheckActivationCode = function() {
        $scope.loading=true;
        $http.post(HostApi+"CheckActivationCode/"+$rootScope.user_data.passengerId+"/"+$scope.verifyformData.userVerifyCode,{},{timeout:TIMEOUTHTTP})
        .success(function(result) { 
            $scope.loading=false;
            if(result=='Activation error') $rootScope.Show_alert ($rootScope.language.msgverify)
            else{
                $rootScope.user_data.passengerActivation=1;
                localStorage.user_data=JSON.stringify($rootScope.user_data)
                $rootScope.goto('/app/map')
            }
        }).error(function(result) {$scope.loading=false; })
    }
    $scope.changePhone=function (){	
        $scope.formData={passengerMobile:''}
        $scope.formData.countryTel=($rootScope.countries&&$rootScope.countries.length)?$rootScope.countries[0].countryTel:'966'
        $scope.ctrlRegister =$ionicPopup.show({
                template: ''//'<span> {{language.msgforgetPass}}</span>'
                + ' <div class="row two_btn">'
                + ' <div class="col col-33">'
                + '<label class="item item-input item-select sel_inp" style="height: 35px;width: 115%;">  '
                    // + '<select ng-model="formData.countryTel">'
                    // + '<option ng-selected="item.countryTel==formData.countryTel" ng-repeat="item in countries" value="{{item.countryTel}}">+{{item.countryTel}}</option>'
                    // + '</select>'
                     +'<select ng-model="formData.countryTel"'+
                     ' ng-options="item.countryTel as '+"item['countryName_'+lng] for item in"+' countries"></select>'
                + '</label>'
                +'</div>'

                + ' <div class="col col-67">'
                + '<label class="item item-input">  '
                        + ' <input maxlength="'+ $rootScope.Config.mobilelength+'" type="tel" ng-model="formData.passengerMobile" required  placeholder="{{language.Mobile}}">'
                + '</label>'
                +'</div>'
                +'</div>',
            title: $rootScope.language.changePhone,
            subTitle: ' ',
            scope: $scope,
            buttons: [
            {
                text: $rootScope.language.save,
                type: 'button button-block main_btn bg_color',
                onTap: function(e) {
                    e.preventDefault();
                    // console.log($scope.formData)
                    // console.log($rootScope.user_data)
                    if($scope.formData.passengerMobile!=''){
                        $http.post(HostApi+"UpdateMobileNumber/"+$rootScope.user_data.passengerId+"/"+$scope.formData.passengerMobile,$scope.formData,{timeout:TIMEOUTHTTP})
                        .success(function(result) { 
                            console.log(result)
                            console.log(11)

                            if(result=='Mobile exist')  $rootScope.showToast($rootScope.language.mobileexit)
                            else {
                                $scope.ctrlRegister.close();
                                $rootScope.user_data.passengerMobile=$scope.formData.passengerMobile;
                                localStorage.user_data=JSON.stringify($rootScope.user_data)
                            }
                        }).finally(function(){
                            $scope.$apply();
                        });
                    }else  $rootScope.showToast($rootScope.language.Enterrequireddata)
                }
            }, { text:$rootScope.language.cancel ,type: 'button button-block main_btn sec_bg'}
]
        });		  
    }
});
