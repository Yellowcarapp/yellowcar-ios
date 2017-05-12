angular.module('MyApp').controller('newsCtrl', function($scope,$rootScope,$http,$timeout) {
    $scope.news={StopLoadMorenews:false}
    if(localStorage.lng=='en') var newsLanguage="english"
    else if(localStorage.lng=='ar')var newsLanguage="arabic"
    else var newsLanguage="urdo"
    $scope.news_list=[];
    $scope.flag_download=true  ;
    $scope.doRefresh = function() {
        if($scope.flag_download){
            $scope.flag_download=false;
            if($scope.news_list.length>0){
                var queryrefresh="SELECT * from news where  newsLanguage ='"+newsLanguage+"' and newsStatus=1 and newsId>"+
                $scope.news_list[0].newsId;
                if($rootScope.user_data.passengerCreateDate)queryrefresh+=" and newsDate>='"+$rootScope.user_data.passengerCreateDate+"'";
                $http({method: 'GET', url:HostApi+'query/'+queryrefresh,timeout:TIMEOUTHTTP })
                .success(function(data, status, headers, config) {
                    $scope.flag_download=true
                    angular.forEach(data.rows,function(obj){ 
                        if(obj.newsImage)obj.newsImage=$rootScope.path_img+obj.newsImage;
                        else obj.newsImage=imgfolder+"default_icon.png";
                        $scope.news_list.unshift(obj);
                    })
                }).finally(function(){
                    $scope.$broadcast('scroll.refreshComplete');
                });	
            }else{
                $scope.flag_download=true;
                $scope.$broadcast('scroll.refreshComplete');
            }
        }	
    };
    $scope.download_list = function() {
        if($scope.flag_download){
            $scope.flag_download=false;
            var query="SELECT * from news where  newsLanguage ='"+newsLanguage+"' "
            if($scope.news_list.length>0) query+=" and newsId<"+$scope.news_list[$scope.news_list.length-1].newsId;
            if($rootScope.user_data.passengerCreateDate)query+=" and newsDate>='"+$rootScope.user_data.passengerCreateDate+"'";
            query+=" and  newsStatus=1 ORDER BY newsId  DESC LIMIT 10";
            $http({method: 'GET', url:HostApi+'query/'+query,timeout:TIMEOUTHTTP })
            .success(function(data, status, headers, config) {
                angular.forEach(data.rows,function(obj){ 
                    if(obj.newsImage) obj.newsImage=path_img+obj.newsImage;
                    else obj.newsImage=imgfolder+"default_icon.png";
                    $scope.news_list.push(obj);
                })
                if(data.rows.length==0) $scope.news.StopLoadMorenews=true;
                $timeout(function(){$scope.$apply()})
            }).finally(function(data, status, headers, config) {
                $scope.flag_download=true;
                $scope.$broadcast('scroll.infiniteScrollComplete');
            })
        }else $scope.$broadcast('scroll.infiniteScrollComplete');
    };	
     $scope.download_list();
    $scope.godetails = function(item) {
        $rootScope.show_newsDtails=true;
        $rootScope.newsDtails= item;
    }
    $rootScope.close_newsDtails = function() {
        $rootScope.show_newsDtails=false;
    }
});