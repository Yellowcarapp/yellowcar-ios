angular.module('MyApp').controller('notifyCtrl', function($scope,$rootScope,$http) {
    $scope.NotifyList=[];
    $scope.flag_download=true;    
    $scope.download_list = function() {
        if($scope.flag_download)
        {
            $scope.flag_download=false;
            var query="SELECT * from notifications where  notType='passenger' "
            if($scope.NotifyList.length>0) query+=" and notId<"+$scope.NotifyList[$scope.NotifyList.length-1].notId;
            if($rootScope.user_data.passengerCreateDate)query+=" and notDate>='"+$rootScope.user_data.passengerCreateDate+"'";
            query+=" ORDER BY notId  DESC LIMIT 10";
            $http({method: 'GET', url:HostApi+'query/'+query,timeout:TIMEOUTHTTP })
            .success(function(data, status, headers, config) {
                angular.forEach(data.rows,function(obj){ 
                    $scope.NotifyList.push(obj);
                })
                if(data.rows.length==0) $scope.StopLoadMoreNotify=true;
            }).finally(function(){
                 $scope.flag_download=true;
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }
        else $scope.$broadcast('scroll.infiniteScrollComplete');
    };
     $scope.download_list();
});