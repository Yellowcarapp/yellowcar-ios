angular.module('MyApp').controller('InfoCtrl', function($scope,$rootScope,$http,$timeout) { 

// if(Domain == 'misrcab'){
        //$rootScope.show_loading();
    $http.get(HostApi+'page/4',{timeout:TIMEOUTHTTP}).success(function(res){ $scope.Page = res.rows})
            /*.finally(function(){
            $rootScope.hide_loading();
        });*/
// }

    $scope.openlink=function(link){
        // console.log(link)
    // window.open(link,'_system','location=no');
        window.open(link,'_blank','location=yes');
    }
     $scope.shareapp=function(){
       window.plugins.socialsharing.share($rootScope.language.sharetext+"\r\n"+sharelinkapp,Domain);
    }
    

});