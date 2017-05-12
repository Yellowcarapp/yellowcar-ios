angular.module('MyApp').controller('restPasswordCtrl', function($scope,$rootScope,$http,$timeout) {
    $scope.formData={resetcode:'',driverPass:'' };
    $scope.passwordType = 'password';
    var Time_resend= moment().add(5,'m');
    var  toast_resend= $rootScope.language.resendverifycode;
    $scope.ChangePasswordType=function()
    {
        $scope.passwordType = ($scope.passwordType == 'password')?'text':'password'
    }
    
    $scope.sendverifyCode = function() {
        var timenow=moment();
        if(Time_resend>timenow){ 
            $rootScope.showToast(toast_resend)
            toast_resend= $rootScope.language.waitresendverifycode;
        }
        else {
            $http({method:"POST",url:HostApi+"GenerateCode/"+$rootScope.datasend.passengerId+"/resetcode",timeout:TIMEOUTHTTP,data:{}})
                .success(function(data, status, headers, config) {  
                    $rootScope.showToast($rootScope.language.msgverifyaccount)
                })
        }
        
    }
    
    $scope.loading=false;
    $scope.CheckActivationCode = function() {
        $scope.loading=true;
        $http.post(HostApi+"Checkresetcode/"+$rootScope.datasend.passengerId+"/"+$scope.formData.resetcode+"/"+$scope.formData.driverPass,{},{timeout:TIMEOUTHTTP})
        .success(function(result) { 
            $scope.loading=false;
            if(result=='resetcode error') $rootScope.Show_alert ($rootScope.language.msgverify)
            else{
                $rootScope.showToast($rootScope.language.scuucessChangpass)
                $rootScope.goto('/login')
            }
        }).error(function(result) {$scope.loading=false; })
    }
});