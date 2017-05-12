angular.module('MyApp').controller('Terms_ConditionsCtrl', function($scope,$rootScope,$http) { 
    
        $rootScope.show_loading();
        $http.get(HostApi+'page/6').success(function(res){
            $scope.pagedetail = res.rows;
        }).finally(function(){
            $rootScope.hide_loading();
        });

});