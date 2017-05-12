angular.module('MyApp').controller('LoginCtrl', function($scope,$rootScope,$http,$ionicPopup) { 
    delete $rootScope.facebookData
    
    if(Domain == 'mshawier' || Domain == 'misrcab' || Domain == 'aman') var countryTel=20;
    else var countryTel=966;
    
    $scope.formData={passengerMobile:"",passengerPass:"",countryTel:($rootScope.countries&&$rootScope.countries.length)?$rootScope.countries[0].countryTel:countryTel};
    $scope.LogIn=function (type) 
    {  
        
       if(type=='facebook' || ($scope.formData.passengerMobile && $scope.formData.passengerPass)){ 
             $rootScope.show_loading();
             $scope.loading=true
             if(!$rootScope.Config) $rootScope.GetSetting();
             $rootScope.GetCountryCity();
             $http.post(HostApi+"signin",$scope.formData,{timeout:TIMEOUTHTTP}).success(function(data) { 
                //  if($rootScope.Config.failed_download)$rootScope.GetSetting();
                //  if($rootScope.countries.length==0)  $rootScope.GetCountryCity();
                if(data.rows==false&&!type) $rootScope.showToast($rootScope.language.login_error);
                else if(data.rows==false&&type=='facebook'){
                    var confirmPopup=$ionicPopup.confirm({title: $rootScope.language.alert, okText:  $rootScope.language.ok,
                                           cancelText: $rootScope.language.cancel, template:$rootScope.language.completeRegister,
                                           okType :'button button-block main_btn', cancelType:'button button-block main_btn sec_bg' });
                    confirmPopup.then(function(res) {if(res) $rootScope.goto('/app/register') });
                }else {
                     if(localStorage.uuid==data.rows.deviceId||data.rows.deviceId==''||data.rows.deviceId==null )
                      {
                          localStorage.user_data=JSON.stringify(data.rows);
                          $rootScope.user_data=data.rows;
                          if(data.rows.deviceId==''||data.rows.deviceId==null ){
                              var data_put={deviceId:localStorage.uuid,passenger_app_lang:$rootScope.lng}
                             if(localStorage.UserARN) data_put.endPoint=localStorage.UserARN;
                              $http.put(HostApi+'updatepassengers/'+$rootScope.user_data.passengerId 
                                        ,data_put,{timeout:TIMEOUTHTTP}).success(function(res){
                                     if(localStorage.uuid) $rootScope.user_data.deviceId=localStorage.uuid;
                                     if(localStorage.UserARN) $rootScope.user_data.endPoint=localStorage.UserARN;
                                     localStorage.user_data=JSON.stringify($rootScope.user_data)
                              })
                          }
                           if($rootScope.user_data && $rootScope.user_data.blackList==0)
                          {
                               $rootScope.Show_alert ($rootScope.language.blocktxt);
                               delete localStorage.user_data;
                               delete $rootScope.user_data;
                          }
                         else if($rootScope.user_data.passengerActivation && $rootScope.user_data.passengerActivation==1)
                          {
                            $rootScope.goto('/app/map') 
                            $rootScope.reload_divmenu();               
                          }
                         else if($rootScope.user_data.passengerActivation.toString().length>1)
                          {
                              $rootScope.goto('/app/verify')
                          }
                          
                      }
                     else $rootScope.Show_alert ($rootScope.language.signoutDevice);
                }
                $scope.loading=false
                $scope.loadingfacebook=false
            }).error(function(data){
                $scope.loading=false; $scope.loadingfacebook=false;
            }).finally(function(){  $rootScope.hide_loading(); });
        } else $rootScope.Show_alert ($rootScope.language.Enterrequireddata); 
    }
                
                
    $scope.changepassword=function (){
        $scope.button_availabe=true;
        $scope.formData_forgetpass={passengerMobile:'',countryTel:($rootScope.countries&&$rootScope.countries.length)?$rootScope.countries[0].countryTel:countryTel};//$rootScope.user_data.driverMobile
        $scope.ctrlRegister =$ionicPopup.show({
            template: '<span> {{language.msgforgetPass}}</span>'
                    + ' <div class="row two_btn">'
                    + ' <div class="col col-33">'
                    + '<label class="item item-input item-select sel_inp" style="height: 35px;width: 115%;">  '
                        +'<select ng-model="formData_forgetpass.countryTel"'+
                        ' ng-options="item.countryTel as '+"item['countryName_'+lng] for item in"+' countries"></select>'
                        // + '<select ng-model="formData.countryTel">'
                        //     + '<option ng-selected="item.countryTel==formData.countryTel" ng-repeat="item in countries" value="{{item.countryTel}}">+{{item.countryTel}}</option>'
                        // + '</select>'
                    + '</label>'
                    +'</div>'

                    + ' <div class="col col-67">'
                    + '<label class="item item-input">  '
                        + '<input maxlength="'+$rootScope.Config.mobilelength+'" type="tel" ng-model="formData_forgetpass.passengerMobile" required placeholder="{{language.emailMobile}}">'
                    + '</label>'
                    +'</div>'
                    +'</div>',
            title: $rootScope.language.forgetPassword,
            subTitle: ' ',
            scope: $scope,
            buttons: [ {
                text: $rootScope.language.send,
                type: 'button button-block main_btn bg_color',
                onTap: function(e) {
                    e.preventDefault();
                    if($scope.button_availabe){
                        if($scope.formData_forgetpass.passengerMobile!='')
                        {
                            $scope.button_availabe=false;
                            $http.post(HostApi+"ResetPassword/"+$scope.formData_forgetpass.passengerMobile,$scope.formData_forgetpass,{timeout:TIMEOUTHTTP})
                            .success(function(result) { 
                                if(result=='data not exist')  $rootScope.showToast($rootScope.language.mobileMobnoexit)
                                else {
                                    $scope.ctrlRegister.close();
                                    $rootScope.datasend=result.rows
                                    $rootScope.goto('/restPassword')
                                }
                                $scope.button_availabe=true;
                               })
                        }
                        else  $rootScope.showToast($rootScope.language.Enterrequireddata)
                    }
                }
            }, { text:$rootScope.language.cancel ,type: 'button button-block main_btn sec_bg'}
            ]
        });		  
    }
});