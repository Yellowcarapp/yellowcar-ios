angular.module('MyApp').controller('HistoryCtrl', function($ionicPopup,$state,$ionicLoading,$scope,$rootScope,$http,$timeout,$location) { 
    $scope.List=[];
    $scope.Scroll={active:true};
    $scope.flag_download=true;
    $scope.opentrip_detail=function(item){
       $rootScope.show_tripDtails=true;
       $rootScope.trip_detail=item;
    //    if($rootScope.trip_detail.offerId>0){
    //      if($rootScope.trip_detail.offerMaxValue >= $rootScope.trip_detail.tripCost)  $rootScope.trip_detail.pay_trip=0 
    //      else $rootScope.trip_detail.pay_trip= $rootScope.trip_detail.tripCost- $rootScope.trip_detail.offerMaxValue;
    //    }
    }
    $rootScope.close_trip_detail = function() {
        $rootScope.show_tripDtails=false;
    }

    $scope.GoogleMapImage=function(item)
    {
        var path='https://maps.googleapis.com/maps/api/staticmap?key='+GOOGLEKEY+'&zoom=13&size=600x300&maptype=roadmap&center=';
        if(item.tripRealFrom && typeof item.tripRealFrom == 'string'){
            item.tripRealFrom=JSON.parse(item.tripRealFrom);
              path+= item.tripRealFrom.lat+','+item.tripRealFrom.lng+'&markers=color:red%7Clabel:P%7C' +item.tripRealFrom.lat
                    +','+item.tripRealFrom.lng;
        }else{
            item.tripFrom=JSON.parse(item.tripFrom);
            path+= item.tripFrom.lat+','+item.tripFrom.lng+'&markers=color:red%7Clabel:P%7C'+item.tripFrom.lat+','
                    +item.tripFrom.lng;
        } 
        
        if(item.tripRealDropoff && typeof item.tripRealDropoff == 'string'){
            item.tripRealDropoff=JSON.parse(item.tripRealDropoff);
             path+= '&markers=color:green%7Clabel:D%7C'+item.tripRealDropoff.lat+','+item.tripRealDropoff.lng;
        }else if(item.tripTo && typeof item.tripTo == 'string'){
            item.tripTo=JSON.parse(item.tripTo);
            path+= '&markers=color:green%7Clabel:D%7C'+item.tripTo.lat+',' +item.tripTo.lng;
        } 
        return path;
    }
    
    $scope.LoadData=function()
    {
         if($scope.flag_download){
            $scope.flag_download=false;
            $http.get(HostApi+'history/'+$rootScope.user_data.passengerId+'/'+$scope.List.length,{timeout:TIMEOUTHTTP}).success(function(res){
                $scope.Scroll.active = res.rows.length
                angular.forEach(res.rows,function(Obj,i){
                    if(Obj.offerMaxValue >=  Obj.tripCost) Obj.totaltripCost=0.00+Obj.fineCancellation;
                    else Obj.totaltripCost=Obj.tripCost-Obj.offerMaxValue+Obj.fineCancellation;
                    Obj.totaltripCost=Obj.totaltripCost.toFixed(2);
                    Obj.link=$scope.GoogleMapImage(Obj);
                    Obj.waitingtime=$rootScope.getminutes(Obj.tripPickUpdate,Obj.tripArriveDate);
                    if(Obj.waitingtime>0) Obj.waitingcost=Obj.waitingtime*(Obj.tripWaitingPerHour/60);
                    else  Obj.waitingcost=0;
                    Obj.waitingcost= Obj.waitingcost.toFixed(2);
                    if(Obj.tripCost) Obj.tripCost=Obj.tripCost
                    else Obj.tripCost='0.00'
                    $scope.List.push(Obj);
                });
            }).finally(function(){
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $scope.flag_download=true;
            });
         }
    }
     $scope.LoadData();

    $rootScope.TripStatus=function(item)
    {
        var now = moment().utc(); //todays date
        var end = moment(item.tripDueDate); // another date
        var duration = moment.duration(end.diff(now));
        var minutes = duration.asMinutes();
        // var hours = duration.asHours();
        if(item.tripNow==1)
        {
            if(item.tripStatus==1)return $rootScope.language.WaitingAssign;
            else if(item.tripStatus==2)return $rootScope.language.Waitingaccepting;
            else if(item.tripStatus==3)return $rootScope.language.Current;
            else if(item.tripStatus==4)return $rootScope.language.Current;
            else if(item.tripStatus==5)return $rootScope.language.Current;
            else if(item.tripStatus==6)return $rootScope.language.Finished;
            else if(item.tripStatus==7)return $rootScope.language.Canceled;
        }
        else if(item.tripNow!=1)
        {
            //if(!$rootScope.Config.LimitEditlaterTrip) $rootScope.Config.LimitEditlaterTrip=0.5;
            if(item.tripStatus==1 && minutes >$rootScope.Config.LimitEditlaterTrip)return $rootScope.language.notstarted;
            else if(item.tripStatus==1  && minutes < $rootScope.Config.LimitEditlaterTrip && minutes > 0)return $rootScope.language.searchForDriver;
            else if(item.tripStatus==2)return $rootScope.language.Waitingaccepting;
            else if(item.tripStatus==3)return $rootScope.language.Current;
            else if(item.tripStatus==4)return $rootScope.language.Current;
            else if(item.tripStatus==5)return $rootScope.language.Current;
            else if(item.tripStatus==6)return $rootScope.language.Finished;
            else if(item.tripStatus==7)return $rootScope.language.Canceled;
            else return $rootScope.language.CannotFindDriver;
        }
    }
    $scope.CanDelete=function(Trip,edit)
    {
        var now = moment(new Date()); //todays date
        var end = moment(Trip.tripDueDate); // another date
        var duration = moment.duration(end.diff(now));
        // var hours = duration.asHours();
        var minutes = duration.asMinutes();
        var returnvalue=(Trip.tripNow==0 && Trip.tripStatus==1)?true:false;
        if(edit) returnvalue= (Trip.tripNow==0 && Trip.tripStatus==1 && minutes > $rootScope.Config.LimitEditlaterTrip)?true:false;
        return returnvalue;
   }
    $scope.EditTripLater=function(Trip)
    {
        $rootScope.EditTrip = Trip
        $rootScope.openPage_modal('later');
        //$state.go('app.later')
    }
    $scope.DeleteTrip=function(Trip)
    {
        var now = moment(new Date()); //todays date
        var end = moment(Trip.tripDueDate); // another date
        var duration = moment.duration(end.diff(now));
        // var hours = duration.asHours();
        var minutes = duration.asMinutes();
        if(minutes > $rootScope.Config.LimitEditlaterTrip){
            $ionicPopup.show({
            template:  '<center> <p > '+$rootScope.language.DeleteTripMsg+'</p> </center>',
            title: $rootScope.language.alert_,
            scope: $rootScope,
            buttons: [
            {
                text: $rootScope.language.ok,
                type: 'button button-block main_btn bg_color',
                onTap: function(e) {
                    $ionicLoading.show($rootScope.language.loadingdeletetrip)
                    var tripedit={tripStatus:7,tripCanceledBy:'passenger',tripCost:0.00,fineCancellation:0.00}
                     $http.post(NodeApi+'trip/'+Trip.tripId,{trip:tripedit},{timeout:TIMEOUTHTTP})
                    .success(function(res){
                        $scope.List=[];
                        $scope.LoadData();
                     })
                    .finally(function(res){  $ionicLoading.hide() })
                }
            },{ 
                text:$rootScope.language.cancel
                ,type: 'button button-block main_btn  sec_bg'
              }
            ]   
        }); 
      }else {
            var msg=$rootScope.language.CancelCostLabel+' '+ Trip.cancellationFees;
           if(Domain=='naqil' || Domain=='yellowcar' )  msg+= " "+$rootScope.language.RS;
           else  msg+= " "+$rootScope.language.EGP;
           msg+= $rootScope.language.CancelCostLabel1;
          $ionicPopup.show({
            template:  '<center> <p > '+msg+'</p> </center>',
            title: $rootScope.language.DeletethisTrip,
            scope: $rootScope,
            buttons: [
            {
                text: $rootScope.language.ok,
                type: 'button button-block main_btn bg_color',
                onTap: function(e) {
                    $ionicLoading.show($rootScope.language.loadingdeletetrip)
                     var tripedit={tripStatus:6,tripCost:Trip.cancellationFees,fineCancellation:0.00,tripRealFrom:JSON.stringify(Trip.tripFrom),tripRealDropoff:JSON.stringify(Trip.tripTo)}
                     $http.post(NodeApi+'trip/'+Trip.tripId,{trip:tripedit},{timeout:TIMEOUTHTTP})
                    .success(function(res){
                        $scope.List=[];
                        $scope.LoadData();
                     })
                    .finally(function(res){  $ionicLoading.hide()
                        $rootScope.getpassengers(false);
                     })
                }
            },{ 
                text:$rootScope.language.cancel
                ,type: 'button button-block main_btn  sec_bg'
              }
            ]   
        }); 
      }
    }
});