var myMedia;
angular.module('MyApp',[[ 'lib/ion-places/ion-place-autocomplete.css',
    'lib/ion-places/ion-place-autocomplete.js'
    ]]).controller('Map',['$location','$state','$filter','socket','$scope','$timeout','$interval','$http','$window','$ionicModal','$rootScope','$ionicLoading','$ionicActionSheet','$ionicPopup',
    function($location,$state,$filter,socket,$scope,$timeout,$interval,$http,$window,$ionicModal,$rootScope,$ionicLoading,$ionicActionSheet,$ionicPopup){
    $scope.centermap_flag=true;
    $scope.show_levels=true; 
    $rootScope.Levels=[];
    var MyLocationoption = {  enableHighAccuracy: true };/* Force GPS*/
    $scope.check_LimitCanceltrip=function(tripAcceptDate){
          var flag_New=false;
         if(tripAcceptDate && $scope.CurrentTripData && ($scope.CurrentTripData.tripStatus==3 ||$scope.CurrentTripData.tripStatus==4)){
            var timenow= moment().utc();
            //console.log('timenow'+timenow)
            var tripAccept= moment(tripAcceptDate).utc()
             //console.log('tripAccept'+tripAccept)
            var timepermin=timenow.diff(tripAccept,'minutes');
            //console.log('timepermin'+timepermin)
            //console.log('LimitCanceltrip'+$rootScope.Config.LimitCanceltrip)
            if(timepermin>$rootScope.Config.LimitCanceltrip) flag_New= true;
         }
         
         if(flag && $scope.intervalcancel) {$interval.cancel($scope.intervalcancel); delete $scope.intervalcancel;}
         else if(!flag && !$scope.intervalcancel){ 
              $scope.intervalcancel=$interval($scope.check_LimitCanceltrip,2000);
         }
         
         return flag_New;
    }

    $scope.cancelTrip=function(reasonId){
        map.setClickable( false );
      var cancel_msg=  $rootScope.language.CancelCostLabel +' '+$scope.CurrentTripData.cancellationFees+' ';
      if(Domain!='yellowcar' && Domain!='naqil') cancel_msg+=$rootScope.language.EGP;
      else cancel_msg+=$rootScope.language.RS;
      cancel_msg+= $rootScope.language.CancelCostLabel1;
         if($scope.check_LimitCanceltrip($scope.CurrentTripData.tripAcceptDate)){
            var myPopup = $ionicPopup.show({
                template:  cancel_msg, 
                title: $rootScope.language.cancelthisTrip,cssClass: 'Popup_promo',scope: $scope,
                buttons: [
                    { text: $rootScope.language.ok, type: 'button-block main_btn bg_color',
                        onTap: function(e) {
                            $scope.UpdateRequest(true,{tripStatus:7,tripCanceledBy:'passenger', trpCancelReasonId:reasonId,tripCost:$scope.CurrentTripData.cancellationFees,fineCancellation:0.00});
                            $scope.closeignor_request();
                        }
                    },{ text: $rootScope.language.cancel , type: 'button-block main_btn sec_bg',
                        onTap: function(e) {$scope.closeignor_request();}}
                ]
            });
         }
         else {
             $scope.UpdateRequest(true,{tripStatus:7,tripCanceledBy:'passenger', trpCancelReasonId:reasonId,tripCost:'0.00',fineCancellation:0.00});
           }
    }

    $rootScope.checkshow_levels=function(){
       // $scope.show_detailpath=false;
        $scope.show_pathdiv=false
        $scope.show_div_request=false;
        $scope.flag_closerequest=false;
        $scope.show_levels=true;
        $timeout(function(){$scope.$apply();},100);
   }

    $rootScope.checkshow_levels();
    $scope.check_show_detailpath=function(){ $scope.show_detailpath=!$scope.show_detailpath;}  
    $scope.getPathMsg=function(PathMsg)
    {
       if(PathMsg) PathMsg= PathMsg.split('<br/>').join(' ');
       return PathMsg;
    }

    $scope.MapSettings=function()
    {
        $http.get(HostApi+'MapSettings/'+$rootScope.user_data.passengerId+'/'+$rootScope.user_data.packageId+'/'+$rootScope.user_data.passengerCountryId+
                 '/'+$rootScope.user_data.passengerCityId+'/'+$rootScope.tripType,{timeout:TIMEOUTHTTP})
        .success(function(res){
            $scope.MyMarkers = res.markers
            $scope.PlacesMarkers = res.places
             $rootScope.AllLevels=res.levels;
            if(Domain!='naqil') $rootScope.Levels=res.levels;
            else {
                if($rootScope.tripType==1) 
                    $rootScope.Levels= $filter('filter')($rootScope.AllLevels,{levelId:5} ,function(a,b){if(a<b) return true});
                else
                $rootScope.Levels= $filter('filter')($rootScope.AllLevels,{levelId:4},function(a,b){if(a>4) return true});
            }
            $scope.select_item($rootScope.Levels[0]);
            if(res.currentTrip && res.currentTrip.length)$scope.CurrentTripData =res.currentTrip[0];
        }).finally(function(){
            console.log($scope.CurrentTripData)
            if($scope.CurrentTripData && $scope.CurrentTripData.tripStatus)
            {
                var CurrentType = 'accepted'
                if($scope.CurrentTripData.tripStatus==4)CurrentType='arrived'
                else if($scope.CurrentTripData.tripStatus==5)CurrentType='pickedup'
                else if($scope.CurrentTripData.tripStatus==6){console.log('dropoffdropoffdropoff');CurrentType='dropoff'}
                if($scope.CurrentTripData.tripStatus!=3)$scope.StartTripDriverTimer(6000);
                $rootScope.$broadcast("pushRecieved",{trip:$scope.CurrentTripData,type:CurrentType});
            }
        });
        
    }
    $scope.MyMarkers=[];
    $scope.PlacesMarkers=[];
    $scope.select_item=function(level){
        $rootScope.LevelId=level.levelId;
        $rootScope.levelSeats=level.levelSeats;
        $rootScope.levelName={levelName_ar:level.levelName_ar,levelName_en:level.levelName_en}
        $scope.StartTimer();
    }
    $scope.active_item=function(index){
         $rootScope.tripType=index;
         if(Domain=='naqil'){
           if($rootScope.tripType==1) {
                $rootScope.tripType_name=$rootScope.language.typetrip_1;
                 $rootScope.Levels= $filter('filter')($rootScope.AllLevels,{levelId:5} ,function(a,b){if(a<b) return true});
           }
           else {
                $rootScope.tripType_name=$rootScope.language.typetrip_2;
                $rootScope.Levels= $filter('filter')($rootScope.AllLevels,{levelId:4},function(a,b){if(a>4) return true});
             }
           if($rootScope.Levels)  {
               $scope.select_item($rootScope.Levels[0]);
           }
         }
         $rootScope.triptype_img=imgfolder+'0'+index+index+'.png';
     }
    
        
    var day=moment().utc().format('YYYY-MM-DD')
    $ionicModal.fromTemplateUrl(templateUrl+'promodetail.html',function(modal){$scope.promomodal=modal;}, {	scope: $scope,animation: 'slide-in-up'});
	 $scope.open_promomodal= function(){ 
         map.setClickable( false );
         $scope.promomodal.show();	
         };
	$scope.closeopen_promomodal= function() {
        map.setClickable( true ); 
        $scope.promomodal.hide();
     };
    $scope.select_proma= function()
    {

        $scope.ShowSearchLoading=true;
        $http.get(HostApi+'checkoffer/'+$scope.datapromo.code+'/'+$rootScope.user_data.passengerCountryId
                  +'/'+$rootScope.user_data.passengerCityId+'/'+$rootScope.LevelId+'/'+day+'/'+$rootScope.user_data.passengerId,{timeout:TIMEOUTHTTP})
        .success(function(res){
            $scope.promo_detail=false;
            if(res.rows=='used') $rootScope.showToast($rootScope.language.promo_used);
            else if(res.rows=='not found')  $rootScope.showToast($rootScope.language.promo_notfound);
            else if(res.rows=='for new')  $rootScope.showToast($rootScope.language.promo_for_new);
            else if(res.rows=='for current')  $rootScope.showToast($rootScope.language.promo_forcuurrent);
            else  {
                $scope.promo_detail=res.rows;
                $scope.promo_detail.flag=true;
            }
        }).finally(function(){
            map.setClickable(true);
            $scope.ShowSearchLoading=false;
        });
    };
    $scope.Popup_addpromo = function() {
          if(map) map.setClickable( false );
          $timeout(function(){ map.setClickable( false );},1000)
           $scope.datapromo= {code:'',error:false};
      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        template: '<label class="item item-input"><input type="text"  ng-model="datapromo.code" autofocus></label><p style="color:red" ng-if="datapromo.error">{{language.enteraddpromo}}</p>', 
          title: $rootScope.language.addpromo,cssClass: 'Popup_promo',scope: $scope,
          buttons: [
            { text: $rootScope.language.save, type: 'button-block main_btn bg_color',
                onTap: function(e) {
                    if ($scope.datapromo.code=='') {
                        e.preventDefault();
                        $scope.datapromo.error=true;
                    } else {$scope.select_proma();}
                }
            },{ text: $rootScope.language.cancel , type: 'button-block main_btn sec_bg',
                onTap: function(e) {map.setClickable( true );}}
         ]
      });
    }

    $scope.openpayment= function(){
        if($rootScope.Payment_Page.offerMaxValue >= $rootScope.Payment_Page.tripCost) {
             $rootScope.Payment_Page.totaltripCost=0.00
        }
        else  $rootScope.Payment_Page.totaltripCost= $rootScope.Payment_Page.tripCost- $rootScope.Payment_Page.offerMaxValue;
          $rootScope.Payment_Page.totaltripCost+=$rootScope.Payment_Page.fineCancellation;
         $rootScope.Payment_Page.totaltripCost= $rootScope.Payment_Page.totaltripCost.toFixed(2);
         $rootScope.openPage_modal('payment_page',true);
    };
    $scope.$on('pushRecieved',function(e,Obj){
        console.log(Obj.trip)
        if(Obj.trip)
        {   
            $rootScope.trip_Status=Obj.trip.tripStatus;
            Obj.trip.brandName = ($rootScope.language.lang=='en')?Obj.trip.brandName_en:Obj.trip.brandName_ar
            Obj.trip.modelTitle = ($rootScope.language.lang=='en')?Obj.trip.modelTitle_en:Obj.trip.modelTitle_ar
        }
        if(Obj.type && Obj.type !='new request' && device.platform == 'android' || device.platform == 'Android')navigator.vibrate([500, 500, 500]);
        if(device.platform=='iOS' && !Obj.noSound && Obj.playsound){
          myMedia = new Media('raw/'+Obj.type.replace(/ /g, "_")+'_'+$rootScope.lng+".mp3");
            $timeout(function(){
            myMedia.play();
            },1000);
       }
          switch (Obj.type) {
              case 'new request':
                    delete localStorage.TimeToCome;
                break;
              case 'accepted':
                    map.trigger("RemoveMarkers");
                    $scope.Hide_Cancel=false;
                    $scope.StopStartTimer = true;
                    $scope.ShowSearchLoading=false;
                    if($scope.Timeout)$timeout.cancel($scope.Timeout);
                    delete $scope.Timeout;
                    if($scope.Timer)$timeout.cancel($scope.Timer);
                    delete $scope.Timer;
                    $scope.CurrentTripData = Obj.trip;
                    $scope.CurrentTripData.driverRate=Math.round($scope.CurrentTripData.driverRate);
                    $scope.PathMsg=$rootScope.language.ridearrivesoon;  
                    if(!localStorage.TimeToCome && ($scope.TimeToCome!='لا توجد سيارات'&& $scope.TimeToCome!='No Cars Found')){
                        $scope.PathMsg+=$scope.TimeToCome;
                        localStorage.TimeToCome=$scope.TimeToCome;
                    }
                    else {
                        if(localStorage.TimeToCome!='لا توجد سيارات'&&localStorage.TimeToCome!='No Cars Found')$scope.PathMsg+=localStorage.TimeToCome;
                    }
                   if($scope.passenger_marker) {
                       $scope.passenger_marker.remove();
                       $scope.passenger_marker='';
                   }
                   $timeout(function(){
                        if($scope.Timer)$timeout.cancel($scope.Timer);
                        $scope.StartTripDriverTimer(6000);
                    },1500);
                    $scope.openpath(true);
                  break;
                case 'arrived':
                    if($scope.ignor_request.isShown())$scope.closeignor_request();
                    map.trigger("RemoveMarkers");
                    delete localStorage.TimeToCome;
                    if(!$scope.show_pathdiv)$scope.openpath();
                    $scope.CurrentTripData = Obj.trip;
                    $scope.CurrentTripData.driverRate=Math.round($scope.CurrentTripData.driverRate);
                    $scope.PathMsg= $rootScope.language.ridepickup;
                    $timeout(function(){$scope.StartTripDriverTimer(1000);$scope.$apply()},1000)
                break;
                case 'pickedup':
                    if($scope.ignor_request.isShown())$scope.closeignor_request();
                    if(!$scope.show_pathdiv)$scope.openpath();
                    $scope.Hide_Cancel=true;
                    $scope.CurrentTripData = Obj.trip;
                    $scope.CurrentTripData.driverRate=Math.round($scope.CurrentTripData.driverRate);
                    
                     if(!localStorage.TimeToCome || !$scope.CurrentTripData.tripTo)$scope.PathMsg=$rootScope.language.goodtrip;
                    else {
                        if(localStorage.TimeToCome<1) localStorage.TimeToCome='1'
                        $scope.PathMsg=$rootScope.language.ridearrivesoon +localStorage.TimeToCome+' '+$rootScope.language.MIN;
                    }

                    $timeout(function(){$scope.StartTripDriverTimer(1000);$scope.$apply()},1000)
                break;
                case 'dropoff':
                    $scope.CurrentTripData = Obj.trip;
                    $scope.CurrentTripData.driverRate=Math.round($scope.CurrentTripData.driverRate);
                    $rootScope.Payment_Page = Obj.trip;
                    $scope.closepath();
                    $scope.Hide_Cancel=false;
                    $timeout.cancel($scope.Timer);
                    delete $scope.Timer;
                     $scope.HideFromSearchBox=false;
                    if($scope.trip_marker) {$scope.trip_marker.remove();$scope.trip_marker='';}
                    if($scope.driver_marker){$scope.driver_marker.remove();$scope.driver_marker='';}
                    delete $scope.CurrentTripData
                    $scope.update_SearchBox();
                    // $scope.ToLocation='';
                    // $scope.ToSearchDiv = 'DESTINATION';
                    $scope.centermap_flag=true; 
                    if($rootScope.marker_postion){
                      $scope.add_markerlocation($rootScope.marker_postion.latitude,$rootScope.marker_postion.longitude,false);
                      $rootScope.changemapcenter(true);
                    }
                    $scope.openpayment()
                break;
                case 'canceled':
                    $scope.CurrentTripData = Obj.trip;
                    $rootScope.Payment_Page = Obj.trip;
                    $scope.HideFromSearchBox=false;
                    if($scope.CurrentTripData.tripCanceledBy=='passenger')
                    {
                        $scope.Hide_Cancel=false;
                        if(!Obj.trip.tripFailedToAssign)
                        {
                            map.setClickable( false );
                            if($scope.show_pathdiv)$scope.closepath();
                             var alertPopup = $ionicPopup.alert({ title: $rootScope.language.TripCanceledTitle,
                                template:'<center> <p>'+$rootScope.language.TripCanceled+'</p></center>',
                                buttons: [ { text: $rootScope.language.ok ,type: 'button button-block main_btn bg_color'}]});
                                alertPopup.then(function(res) {  map.setClickable( true ); $timeout(function(){$scope.$apply();},500);});
                        }
                    }
                    else if($scope.CurrentTripData.tripCanceledBy=='driver')
                    {
                        if($scope.show_pathdiv)$scope.closepath();
                        if($scope.ignor_request.isShown())$scope.closeignor_request();
                        $scope.Hide_Cancel=false;
                        $scope.openpayment()
                        $rootScope.showToast($rootScope.language.TripCanceled)
                        // map.setClickable( false );
                        // var alertPopup = $ionicPopup.alert({ title: $rootScope.language.TripCanceledTitle,
                        // template:'<center> <p>'+$rootScope.language.TripCanceled+'</p></center>',
                        // buttons: [ { text: $rootScope.language.ok ,type: 'button button-block main_btn bg_color'}]});
                        // alertPopup.then(function(res) { map.setClickable( true ); $timeout(function(){$scope.$apply();},500);});
                    }
                     delete $scope.CurrentTripData
                     $scope.update_SearchBox();
                    //  $scope.ToLocation='';
                    //  $scope.ToSearchDiv = 'DESTINATION';
                     if($scope.trip_marker) {$scope.trip_marker.remove();$scope.trip_marker='';}
                     if($scope.driver_marker){$scope.driver_marker.remove();$scope.driver_marker='';}
                     $scope.centermap_flag=true; 
                      $scope.add_markerlocation($rootScope.marker_postion.latitude,$rootScope.marker_postion.longitude,false);
                     $rootScope.changemapcenter(true);
                     $scope.update_SearchBox();
                break;
                 case 'timeout':
                    $scope.HideFromSearchBox=false;
                    if($scope.ShowSearchLoading)
                    {
                        delete $scope.CurrentTripData;
                        // $scope.ToLocation='';
                        // $scope.ToSearchDiv = 'DESTINATION';
                        if($scope.Timeout)
                        {
                            $timeout.cancel($scope.Timeout);
                            delete $scope.Timeout;
                        }
                        $scope.ShowSearchLoading=false;
                        $rootScope.openPage_modal('failed');
                    }
                break;
                 case 'suspended':
                   delete localStorage.user_data;
                  navigator.app.exitApp(); 
                break;
                 case 'signout':
                   delete localStorage.user_data;
                   navigator.app.exitApp(); 
                break;
            default:
                break;
          }
      });
    $scope.UpdateRequest=function(CloseModels,TripObj,Mins)
    { 
        if($scope.ignor_request.isShown()) $scope.disable_ignorbtn=true;
        //console.log($scope.disable_ignorbtn)
        if($scope.Timer)$timeout.cancel($scope.Timer);
        $http.post(NodeApi+'trip/'+$scope.CurrentTripData.tripId,{trip:TripObj},{timeout:TIMEOUTHTTP})
        .success(function(){})
        .error(function(){
            var alertPopup = $ionicPopup.alert({ cssClass: 'custom-class'
            ,template:  '<center> <p>'+$rootScope.language.Failedinternet+'</p></center>',
            buttons: [ { text: $rootScope.language.ok ,type: 'button button-block main_btn bg_color'}]});
                alertPopup.then(function(res) {
                    navigator.app.exitApp(); 
            });
        })
        .finally(function(){
            if(TripObj.tripStatus==7)
            {
                $rootScope.getpassengers(false);
                if($scope.ignor_request.isShown()){
                    $scope.disable_ignorbtn=false;
                  //  console.log($scope.disable_ignorbtn)
                    $scope.closeignor_request();
                }
                if($scope.show_pathdiv)$scope.closepath();//true
            }
        });
        
    }
    var El2 = document.getElementById('MyApp')
    El2 =angular.element(El2);
    if(El2.hasClass('platform-android')) El2.removeClass('platform-android');
    $scope.payBy='cash';
    $scope.Change_PaymentMethod=function(type)
    { 
        if(type=='cash')$scope.payBy = 'visa';
        else $scope.payBy = 'cash';
    }
    $scope.ChangePaymentMethod=function()
    {
        $ionicActionSheet.show({
            buttons: [
                { text:  $rootScope.language.Cash },
                { text:  $rootScope.language.Visa }
            ],
            titleText: $rootScope.language.Paymentmethod,
            cancelText:$rootScope.language.cancel ,
            cancel: function() {},
            buttonClicked: function(index) {
                if(index==0)$scope.payBy = 'cash';
                else if(index==1)$scope.payBy = 'visa';
                return true;
            }
        });
    }
     $scope.update_SearchBox=function()
    { 
        document.getElementById("ToSearchBox").value='';
        $scope.ToLocation='';
        $scope.ToSearchDiv='DESTINATION';
        map.getMyLocation(MyLocationoption,function(location) {
            $scope.GeoCode({position:location.latLng},true,'FromSearchBox');
        });
    }
    $scope.AddNewTrip=function()
    {   
        if($scope.disableNewTrip){
            $scope.disableNewTrip=false;
            $rootScope.IsNow=1
            var Trip=
            {
                tripType:$rootScope.tripType,
                tripLevelId:$rootScope.LevelId,
                payBy:$scope.payBy,
                from:{address:document.getElementById("FromSearchBox").value,location:$scope.FromLocation},
                to:{address:$scope.ToSearchDiv,location:$scope.ToLocation},
                tripNote:$scope.tripNote.text,
                tripCountryId:($scope.Markers && $scope.Markers.length && $scope.Markers[0])?$scope.Markers[0].driverCountryId:$rootScope.user_data.passengerCountryId,
                tripCityId:($scope.Markers && $scope.Markers.length && $scope.Markers[0])?$scope.Markers[0].driverCityId:$rootScope.user_data.passengerCityId,
                tripPackageId:$rootScope.user_data.packageId,
                tripStart:($rootScope.IsNow==1)?$rootScope.Prices.nowStart:$rootScope.Prices.laterStart,
                tripPerKm:$rootScope.Prices.perKm,
                tripPerMinute:$rootScope.Prices.perMinute,
                tripMinCost:($rootScope.IsNow==1)?$rootScope.Prices.minNow:$rootScope.Prices.minLater,
                tripWaitingPerHour:$rootScope.Prices.WaitingperHour,
                cancellationFees:$rootScope.Prices.cancellationFees,
                tripNow:$rootScope.IsNow,
                driverCost:$rootScope.Prices.driverCost,
                fixedCommission:$rootScope.Config.fixedCommission,
                fineCancellation:$rootScope.user_data.passengerCredit
            }
            if($scope.promo_detail && $scope.promo_detail.flag) {
                Trip.offerMaxValue= $scope.promo_detail.offerMaxValue;
                Trip.offerId = $scope.promo_detail.offerId ;
            }
            if($rootScope.IsNow==0)Trip.tripDueDate = $rootScope.Laterdate
            $rootScope.user_data.endPoint=localStorage.UserARN
            $scope.opensend_order();
            $http.post(NodeApi+'trip',{drivers:$scope.Markers,passenger:$rootScope.user_data,trip:Trip},{timeout:TIMEOUTHTTP}) 
            .success(function (res) {
                if($rootScope.IsNow==1)
                {
                    delete res.sns;
                    $scope.CurrentTripData = res
                }
                else{
                    $ionicPopup.alert({title: ' ',template: '<p>{{language.orderplaced}}<br />{{language.contact_before_start}}</p>'})
                    .then(function(res) {
                        $scope.closesend_order();
                    });
                }
            }).finally(function(){
                $scope.closerequest();
                $rootScope.checkshow_levels();
                $scope.disableNewTrip=true;
                $scope.Timeout = $timeout(function(){
                    if($scope.CurrentTripData && $scope.CurrentTripData.tripId)
                        $scope.UpdateRequest(true,{tripDriverId:0,tripStatus:7,tripCanceledBy:'passenger',trpCancelReasonId:-1,tripFailedToAssign:1,fineCancellation:0.00})
                },50000);
            });
        }
    }
    $scope.tripNote = {text:'',date:'',IsNow:true};
    $scope.Canceler=false;
    $scope.SearchList=[];
    $scope.SearchObj={text:''};
    $scope.ToSearchDiv = 'DESTINATION';
    $scope.locationChanged = function (location) {
        $scope.closesearchModal();
        var Options={}
        if(location.place_id)
        {
            Options.placeId = location.place_id;
            var geocoder = new google.maps.Geocoder;
            geocoder.geocode(Options, function(results, status) {
                if (status === 'OK') {
                    if (results[0]) {
                        var Position ={lat:results[0].geometry.location.lat(),lng:results[0].geometry.location.lng()};
                      //  console.log($scope.OpenModalFor)
                        if($scope.OpenModalFor=='dropoff')
                        {
                            $scope.ToLocation = Position
                            $scope.ToSearchDiv = (location.description)?$rootScope.short_address(location.description):$rootScope.short_address(location.markerAddress);
                            document.getElementById("ToSearchBox").value = $scope.ToSearchDiv;
                        }
                        else
                        {
                            $scope.FromLocation = Position
                            console.log(1)
                            document.getElementById("FromSearchBox").value = (location.description)?$rootScope.short_address(location.description):$rootScope.short_address(location.markerAddress);
                        //    'bearing':90,
                            map.moveCamera({'duration': 1000,'target':new plugin.google.maps.LatLng(Position.lat,Position.lng),'zoom': 15},function(){});
                        }
                    }
                }
            });
        }
        else if(location.markerAddress)
        {
            var Position = {lat:location.markerLat,lng:location.markerLng}
          //  console.log($scope.OpenModalFor)
            if($scope.OpenModalFor=='dropoff')
            {
                $scope.ToLocation = Position
                $scope.ToSearchDiv = $rootScope.short_address(location.markerAddress)
                $rootScope.short_address
                document.getElementById("ToSearchBox").value = $rootScope.short_address(location.markerAddress)
            }
            else
            {
                $scope.FromLocation = Position
                console.log(2)
                document.getElementById("FromSearchBox").value = $rootScope.short_address(location.markerAddress);
                map.moveCamera({'duration': 1000,'target':new plugin.google.maps.LatLng(Position.lat,Position.lng),'zoom': 15},function(){});
            }
        }
    };
    $scope.AddToMarker=function(loc,Delete)
    {
        if(Delete)
        {
            $ionicLoading.show();
            $http.post(HostApi+'RemoveMarker',{markerId:loc},{timeout:TIMEOUTHTTP})
            .finally(function(){
                $ionicLoading.hide();
                $scope.GetMyMarkers();
            });
        }
        else
        {
            $scope.favData={title:''}
            $scope.favLocationPopup =$ionicPopup.show({
            template: '<label class="item item-input"><input  type="text" ng-model="favData.title"></label>',
            title: $rootScope.language.EnterPlace_Name, subTitle: ' ', scope: $scope,
            buttons: [ {
                text: $rootScope.language.ok,
                type: 'button button-block main_btn bg_color',
                onTap: function(e) {
                    e.preventDefault();
                        if($scope.favData.title!='')
                        {
                           $ionicLoading.show();
                            var Options={}
                            if(loc.place_id)Options.placeId = loc.place_id
                            else Options.address = loc
                            var geocoder = new google.maps.Geocoder;
                            geocoder.geocode(Options, function(results, status) {
                                if (status === 'OK') {
                                    if (results[0]) {
                                        $http.post(HostApi+'AddMarker',{
                                            passengerId:$rootScope.user_data.passengerId,
                                            markerTitle:$scope.favData.title,
                                            markerLat:results[0].geometry.location.lat(),
                                            markerLng:results[0].geometry.location.lng(),
                                            markerAddress:results[0].formatted_address
                                        },{timeout:TIMEOUTHTTP})
                                        .success(function(res){
                                            
                                        })
                                        .finally(function(){
                                            $scope.favLocationPopup.close();
                                            $ionicLoading.hide();
                                            $scope.GetMyMarkers();
                                        });
                                    }
                                }
                            });
                        }
                        else  $rootScope.showToast($rootScope.language.Enterrequireddata)
                }
            }, { text:$rootScope.language.cancel ,type: 'button button-block main_btn sec_bg'}
            ]
        });	
        }
        
    }
    $scope.innerHeight=(($window.innerHeight-60- ($window.innerHeight * 0.07) )/2);
    $scope.innerWidth=(($window.innerWidth-40)/2);
    $scope.Markers=[];
    $scope.GeoCode=function(Options,changeCenter,ObjId)
    {
        $http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng='+Options.position.lat+','+Options.position.lng+'&key='+GOOGLEKEY+'&language='+$rootScope.lng)
        .success(function(results){
            results = results.results
                if(results.length)
                {
                    var result = results[0]
                    var position = result.geometry.location
                  // console.log(ObjId)
                    if(ObjId=='FromSearchBox'){
                        $scope.FromLocation = position
                        console.log(3)
                        document.getElementById("FromSearchBox").value =  $rootScope.short_address(result.formatted_address)
                    }
                    else if(ObjId=='ToSearchDiv' || ObjId=='ToSearchBox')
                    {
                        $scope.ToLocation = position
                        $scope.ToSearchDiv = (Options.address)?$rootScope.short_address(Options.address):$rootScope.short_address(result.formatted_address)
                        document.getElementById("ToSearchBox").value = $scope.ToSearchDiv
                    }
                        if(changeCenter)  {
                           if(!$scope.CurrentTripData) $rootScope.marker_postion={latitude:position.lat,longitude:position.lng}
                            $scope.centermap_flag=true; 
                            $rootScope.changemapcenter(true);
                        }
                }
        });
    }  

    // $scope.gettimetocome=function(origin1){
    //     if($scope.CurrentTripData.tripTo){
    //         var destination1 = new google.maps.LatLng($scope.CurrentTripData.tripTo.lat,$scope.CurrentTripData.tripTo.lng);
    //         var service = new google.maps.DistanceMatrixService();
    //         service.getDistanceMatrix(
    //         {
    //             origins: [origin1],
    //             destinations: [destination1],
    //             travelMode: 'DRIVING',
    //         }, function(res){
    //             if(res.rows && res.rows.length && res.rows[0] && res.rows[0].elements.length && res.rows[0].elements[0] && res.rows[0].elements[0].duration){
    //                     $scope.TimeToCome=rtrim(res.rows[0].elements[0].duration.text,'s').substr(0,7).replace(/ /g, '<br/>').replace(/min/g, '');
    //                     if($scope.TimeToCome<1) $scope.TimeToCome='1'
    //                     $scope.TimeToCome +=' '+$rootScope.language.MIN;
    //             }else $scope.TimeToCome='';
    //             $scope.PathMsg=$rootScope.language.time_dropoff +$scope.TimeToCome;
    //             localStorage.TimeToCome=$scope.TimeToCome;
    //         });
    //     }
    // }
    
    $scope.LastMatrix = 0 
   socket.on('update',function (data){
        console.log('update socket '+JSON.stringify(data))
        if($scope.driver_marker && $scope.CurrentTripData && $scope.CurrentTripData.tripId) {
           // console.log('driver socket')
            // if($scope.CurrentTripData.tripStatus<5){
                var LatLng = new plugin.google.maps.LatLng(data.location[1], data.location[0]);
                $scope.driver_postion=LatLng;
                $scope.driver_marker.setPosition(LatLng)
            // }
            if(data.timetocome && data.timetocome.time && $scope.CurrentTripData.tripStatus==3 || ($scope.CurrentTripData.tripStatus==5 && $scope.CurrentTripData.tripTo)){
                //
                $scope.TimeToCome=data.timetocome.time;
                if($scope.TimeToCome<1) $scope.TimeToCome='1'
               // console.log("TimeToCome: "+$scope.TimeToCome)
                if($scope.CurrentTripData.tripStatus==5 ) $scope.PathMsg=$rootScope.language.time_dropoff +$scope.TimeToCome+' '+$rootScope.language.MIN;
                else if($scope.CurrentTripData.tripStatus==3) $scope.PathMsg=$rootScope.language.ridearrivesoon +$scope.TimeToCome+' '+$rootScope.language.MIN;
                localStorage.TimeToCome=$scope.TimeToCome;
            }
            $rootScope.changemapcenter();
        }
        else 
        {
           //  console.log('else  socket')
            angular.forEach($scope.Markers,function(Obj,i){
                if($scope.HideFromSearchBox && Obj.driverId==data.driverId && (new Date().getTime()-$scope.LastMatrix) > 60000)
                {
                    $scope.LastMatrix = new Date().getTime();
                    $scope.Markers[i].geo.coordinates=data.location
                    var LatLng = new plugin.google.maps.LatLng(data.location[1], data.location[0]);
                    
                    if($scope.Markers[i].marker) $scope.Markers[i].marker.setPosition(LatLng);
                    map.getMyLocation(MyLocationoption,function(location) {
                        $rootScope.Current_Location = location.latLng;
                        if(location.latLng.lat && location.latLng.lng && $scope.Markers[i].geo.coordinates[1] && $scope.Markers[i].geo.coordinates[0] )
                        { 
                            var origin1 = new google.maps.LatLng($scope.Markers[i].geo.coordinates[1], $scope.Markers[i].geo.coordinates[0]);
                            var destination1 = new google.maps.LatLng(location.latLng.lat, location.latLng.lng);
                            var service = new google.maps.DistanceMatrixService();
                            service.getDistanceMatrix(
                            {
                                origins: [origin1],
                                destinations: [destination1],
                                travelMode: 'DRIVING',
                            }, function(res){
                            if(res.rows && res.rows.length && res.rows[0] && res.rows[0].elements.length && res.rows[0].elements[0] && res.rows[0].elements[0].duration){
                                    $scope.TimeToCome=rtrim(res.rows[0].elements[0].duration.text,'s').substr(0,7).replace(/ /g, '<br/>').replace(/min/g, '');
                                    if($scope.TimeToCome<1) $scope.TimeToCome='1'
                                    $scope.TimeToCome +=' '+$rootScope.language.MIN;
                            }else
                                    $scope.TimeToCome='';
                                if($scope.CurrentTripData && $scope.CurrentTripData.tripId)
                                    $scope.PathMsg=$rootScope.language.ridearrivesoon +$scope.TimeToCome;
                                    localStorage.TimeToCome=$scope.TimeToCome;
                            });
                        } 
                    });
                }
                $scope.Markers[i].dis = $scope.distance($scope.Markers[i].geo.coordinates[1],$scope.Markers[i].geo.coordinates[0]);
            });
            var List = $filter('orderBy')($scope.Markers,'dis',false);
            if(List.length && !$scope.HideFromSearchBox && (new Date().getTime()-$scope.LastMatrix) > 30000)
            {
                $scope.LastMatrix = new Date().getTime();
                $scope.ShowSpinner=true;
                 var destination1= new google.maps.LatLng($rootScope.Current_Location.lat,$rootScope.Current_Location.lng);
                var origin1 = new google.maps.LatLng(List[0].geo.coordinates[1],List[0].geo.coordinates[0]);
                var service = new google.maps.DistanceMatrixService();
                service.getDistanceMatrix(
                {
                    origins: [origin1],
                    destinations: [destination1],
                    travelMode: 'DRIVING',
                }, function(res){
                    if(res.rows && res.rows.length && res.rows[0] && res.rows[0].elements.length && res.rows[0].elements[0] && res.rows[0].elements[0].duration){
                        $scope.TimeToCome=Math.round(res.rows[0].elements[0].duration.value/60)
                        if($scope.TimeToCome<1)$scope.TimeToCome='1';
                        $scope.TimeToCome+=' '+$rootScope.language.MIN
                    }    else
                        $scope.TimeToCome='';
                    $scope.ShowSpinner=false;
                    $timeout(function(){$scope.$apply();},500);
                });
            }
     }
   }); 
    $scope.UpdateMarkers=function() {
        if(map) map.trigger("RemoveMarkers");
        if($scope.Markers.length)
        {
            console.log(1,$scope.CurrentTripData);
            if(!$scope.driver_marker && !$scope.CurrentTripData){
                angular.forEach($scope.Markers,function(Obj,i){
                    map.addMarker({
                        'position': { lat:Obj.geo.coordinates[1],lng:Obj.geo.coordinates[0] },'icon': {'url': './'+imgfolder+'taxi.png','size': { width: 35,height:35}}
                    },function(marker){
                        console.log(i)
                        $scope.Markers[i].marker = marker;
                        map.on("RemoveMarkers", function() {
                            marker.remove();
                        });
                    });
                });
            }
            if($scope.CurrentTripData)
            {
                if($scope.CurrentTripData.tripFrom && ($scope.CurrentTripData.tripStatus ==3 || $scope.CurrentTripData.tripStatus ==4))
                {
                    console.log(2,$scope.CurrentTripData.tripFrom);
                    $scope.trip_postion=new plugin.google.maps.LatLng($scope.CurrentTripData.tripFrom.lat,$scope.CurrentTripData.tripFrom.lng)
                    if(!$scope.trip_marker) {
                        map.addMarker({
                            'position': { lat:$scope.CurrentTripData.tripFrom.lat,lng:$scope.CurrentTripData.tripFrom.lng},
                            'title': $scope.CurrentTripData.tripFromAddress,
                            'icon':{'url':'./'+imgfolder+'passenger.png'}
                        },function(marker){ 
                            if($scope.trip_marker){  
                                $scope.trip_marker.setVisible(false);
                                $scope.trip_marker.remove();
                            }

                            $scope.trip_marker=marker; 
                            $rootScope.changemapcenter();
                    });
                    }
                }
                if($scope.CurrentTripData.tripStatus ==5)
                {
                    if($scope.CurrentTripData.tripTo) {
                        console.log(3,$scope.CurrentTripData.tripFrom);
                        $scope.trip_postion=new plugin.google.maps.LatLng($scope.CurrentTripData.tripTo.lat,$scope.CurrentTripData.tripTo.lng)
                        if(!$scope.trip_marker) 
                                map.addMarker({
                                    'position': { lat:$scope.CurrentTripData.tripTo.lat,lng:$scope.CurrentTripData.tripTo.lng},
                                    'title': $scope.CurrentTripData.tripToAdress,
                                    'icon':{'url':'./'+imgfolder+'pin2.png'}
                                },function(marker){ 
                                     if($scope.trip_marker){
                                           $scope.trip_marker.setVisible(false);
                                           $scope.trip_marker.remove();
                                     }
                                     $scope.trip_marker=marker; $rootScope.changemapcenter();
                                });
                        else {
                            $scope.trip_marker.setPosition($scope.trip_postion);
                            $scope.trip_marker.setTitle($scope.CurrentTripData.tripToAdress);
                            $scope.trip_marker.setIcon({ 'url': './'+imgfolder+'pin2.png' });
                            $rootScope.changemapcenter();
                        }
                    }else {
                        if($scope.trip_marker) {$scope.trip_marker.remove();$scope.trip_marker=''; $rootScope.changemapcenter();}
                    }
                }
            }
        }
    }
    $scope.$on("LanguageChanged", function(){
       if($scope.TimeToCome=='لا توجد سيارات' || $scope.TimeToCome=='No Cars Found') $scope.TimeToCome=$rootScope.language.nocarnear
    //    else {
            //$scope.TimeToCome='';
            $rootScope.restartTimer();
    //    }
    });
    $scope.add_markerlocation=function(lat,lng,movecamera){
        console.log('lat:'+lat+',lng:'+lng)
        if(!$scope.passenger_marker && !$scope.CurrentTripData)  {
            map.addMarker({'position': {lat:lat,lng:lng},'icon':{'url':'./'+imgfolder+'location.png'
            ,'size': { width: 20,height:20}
            }},function(marker){ 
                if($scope.passenger_marker){
                    $scope.passenger_marker.setVisible(false);  
                    $scope.passenger_marker.remove();
                }
                $scope.passenger_marker=marker;
             });
             if(movecamera){
                map.moveCamera({'target':{lat:lat,lng:lng},'zoom': 15},function(){
                $timeout(function(){ $scope.centermap_flag=true;},2000)
                });
             }
        }
    }

    $scope.$on("$ionicView.afterEnter", function(event, data){
         $scope.active_item(1);
        $scope.MapSettings();
        var div = document.getElementById("map_canvas");
        map = plugin.google.maps.Map.getMap(div);
        map.on(plugin.google.maps.event.MAP_READY, function(){
            
            map.setOptions({
                'backgroundColor': 'white',
                'controls': {'compass': false,'myLocationButton': false,'indoorPicker': false,'zoom': false},
                'gestures': {'scroll': true,'tilt': true,'rotate': true,'zoom': true}
            });
            map.setZoom(15)
            map.setTrafficEnabled(true);
            $scope.StartTimer();
            map.getMyLocation(MyLocationoption,function(location) {
                console.log('success getMyLocation')
                    $rootScope.Current_Location = location.latLng;
                    $rootScope.marker_postion={latitude:location.latLng.lat,longitude:location.latLng.lng}
                    $scope.add_markerlocation($rootScope.marker_postion.latitude,$rootScope.marker_postion.longitude,true);                   
            },function(error) {
                console.log('error getMyLocation')
                $scope.add_markerlocation(0,0,true); 
                 
            });
            $rootScope.checkWifi();
            map.on(plugin.google.maps.event.MAP_CLICK, function(Location) {
                if($scope.show_div_request) $rootScope.checkshow_levels();
                if($scope.show_detailpath) {
                    $scope.show_detailpath=false;
                    $timeout(function(){ $scope.$apply()});
                }
            });
            map.on(plugin.google.maps.event.CAMERA_CHANGE, function(Location) {
                
                if(!$rootScope.marker_postion)$rootScope.marker_postion={latitude:Location.target.lat,longitude:Location.target.lng}
                $scope.centermap_flag=false;
               // $scope.add_markerlocation(Location.target.lat,Location.target.lng);
                if(!$scope.CurrentTripData)//!$scope.OpenModalFor &&
                {
                    var Options={location:Location.target}
                    var geocoder = new google.maps.Geocoder;
                    geocoder.geocode(Options, function(results, status) {
                        if (status === 'OK') {
                            if (results[0]) {
                                var Position ={lat:results[0].geometry.location.lat(),lng:results[0].geometry.location.lng()};
                                $scope.FromLocation = Position
                                $rootScope.Current_Location=Position;
                                console.log(4)
                               // console.log('FromSearchBox')
                                document.getElementById("FromSearchBox").value =  $rootScope.short_address(results[0].formatted_address);//(Options.address)?Options.address:result.formatted_address;
                            }
                        }
                    });
                }
                //$scope.OpenModalFor='pickup'
                //delete $scope.OpenModalFor;
                if(!$scope.CurrentTripData)$scope.StartTimer();
            });
        });
    });
     $rootScope.changemapcenter=function(zoom){
        if(map){
            var postion= new plugin.google.maps.LatLng($rootScope.marker_postion.latitude, $rootScope.marker_postion.longitude );
            if($scope.passenger_marker) $scope.passenger_marker.setPosition(postion);
            console.log(postion)
            if($scope.CurrentTripData && $scope.CurrentTripData.tripStatus>=3&& $scope.CurrentTripData.tripStatus<6) {
                // if($scope.CurrentTripData.tripStatus==5){
                //      $scope.driver_postion=postion;
                //      $scope.addmarkerdriver(false);
                //      $scope.gettimetocome(postion)
                // }
                var bounds = [];
                if($scope.passenger_marker) bounds.push(postion)
                if($scope.trip_marker)  bounds.push($scope.trip_postion)
                if($scope.driver_marker)  bounds.push($scope.driver_postion)
                if(bounds.length>1){
                    map.moveCamera({'target':bounds},function(){
                        $timeout(function(){ $scope.centermap_flag=true; },1000) 
                    });
                }
                else {
                    map.setZoom(18); 
                    map.setCenter(postion);
                    $timeout(function(){ $scope.centermap_flag=true; },2000)
                }
            }
            else if($scope.centermap_flag) {
                if(zoom)  map.setZoom(15); 
                map.setCenter(postion);
                $timeout(function(){ $scope.centermap_flag=true; },2000) 
            }
        }
    }
    

    $scope.ToSearchBox=function()
    {
        $scope.OpenModalFor='dropoff';
        $scope.opensearchModal();
    }
    $scope.mapzoom = false;
    $scope.MoveNext=false;
    $scope.HideFromSearchBox=false;
    $scope.TimeToCome =''
    $scope.addmarkerdriver=function(changemapcenter){
        if(!$scope.driver_marker){
            map.addMarker({ 'position': $scope.driver_postion,'icon':{'url':'./'+imgfolder+'taxi.png','size': { width: 35,height:35}}
                },function(marker){
                    if($scope.driver_marker)  { 
                        $scope.driver_marker.setVisible(false);
                        $scope.driver_marker.remove();
                    }
                    $scope.driver_marker=marker;
                    if(changemapcenter)  $rootScope.changemapcenter();
            });
        }else  {
            $scope.driver_marker.setPosition($scope.driver_postion)
            if(changemapcenter) $rootScope.changemapcenter();  
        }
    }
    $scope.StartTripDriverTimer=function(Time)
    {
        $scope.HideFromSearchBox=true;
        $scope.Timer = $timeout(function(){
            if($scope.CurrentTripData && $scope.CurrentTripData.driverId)
            {
                $scope.GetNearestCars(NodeApi+'drivers/'+$scope.CurrentTripData.driverId,$scope.CurrentTripData.tripFrom,'',true)
            }
        },Time);
    }
    $scope.ShowSpinner=false;
    $scope.GetNearestCars=function(Url,Obj,LoadingResult,IsDriver)
    {
        $scope.ShowSpinner=true;
        $scope.MoveNext=true;
        $http.get(Url,{timeout:TIMEOUTHTTP})
        .success(function (res) {
            if($scope.Markers.length)
            {
                var rooms = [];
                $scope.Markers.forEach(function(marker,i){
                    rooms.push(Domain+'_'+marker.driverId)
                });
                if(map) map.trigger("RemoveMarkers");
                socket.emit('leave',rooms);
            }
            $scope.Markers = res
        })
        .finally(function(){
            if($scope.Markers.length)
            {                           
                var rooms = [];
                $scope.Markers.forEach(function(marker,i){
                    rooms.push(Domain+'_'+marker.driverId)
                });
                socket.emit('join',rooms);
                if(IsDriver) {
                    if($scope.CurrentTripData.tripStatus!=5){
                    $scope.driver_postion={lat:$scope.Markers[0].geo.coordinates[1],lng:$scope.Markers[0].geo.coordinates[0]}                    
                    $scope.addmarkerdriver(true);
                }
            }
                var  destination1= new google.maps.LatLng(Obj.lat,Obj.lng);
                var  origin1= new google.maps.LatLng($scope.Markers[0].geo.coordinates[1],$scope.Markers[0].geo.coordinates[0]);
                var service = new google.maps.DistanceMatrixService();
                service.getDistanceMatrix(
                {
                    origins: (IsDriver)?[destination1]:[origin1],
                    destinations: (IsDriver)?[origin1]:[destination1],
                    travelMode: 'DRIVING',
                }, function(res){
                    if(res.rows && res.rows.length && res.rows[0] && res.rows[0].elements.length && res.rows[0].elements[0] && res.rows[0].elements[0].duration){
                        $scope.TimeToCome=Math.round(res.rows[0].elements[0].duration.value/60)
                        if($scope.TimeToCome<1) $scope.TimeToCome='1'
                        $scope.TimeToCome +=' '+$rootScope.language.MIN
                    }else $scope.TimeToCome=LoadingResult;

                    $scope.ShowSpinner=false;
                    $scope.MoveNext=false;
                    $scope.UpdateMarkers();
                    if($scope.Timer)
                    {
                        $timeout.cancel($scope.Timer);//new
                        delete $scope.Timer;
                    }
                    $timeout(function(){$scope.$apply();},500);
                });
            }
            else
            {
                $scope.ShowSpinner=false;
                $scope.TimeToCome=LoadingResult;
                $scope.MoveNext=false;
                $scope.UpdateMarkers();
                if(!$scope.mapzoom) $scope.StartTimer(1500);
            }
        });
    }
    $scope.StartTimer=function(Time)
    {
        map.getCameraPosition(function(location1) { 
                if(!$scope.mapzoom)
                {
                    map.getMyLocation(MyLocationoption,function(location) {
                        if(location.latLng.lat<1 || location.latLng.lng<1)
                        {
                            $scope.StartTimer();
                        }
                        else
                        {
                            $scope.mapzoom=true;
                            // 'bearing':90,
                            map.moveCamera({'target':location.latLng,'zoom': 15},function(){
                                $scope.GeoCode({position:location.latLng},false,'FromSearchBox');
                                var Url = NodeApi+'nearby?limit='+$rootScope.Config.CarsLimit+'&longitude='+location.latLng.lng
                                Url += '&latitude='+location.latLng.lat+'&distance='+$rootScope.Config.CarsDistance+'&levelId='+$rootScope.LevelId+'&driverCredit='+$rootScope.Config.DriverMustHaveCredit
                                if(!$scope.MoveNext)
                                {
                                    $scope.GetNearestCars(Url,location.latLng,$rootScope.language.nocarnear,false);
                                }
                            });
                        }
                    });
                }
                else
                {
                    if(location1.target.lat<1 && location1.target.lng<1){ $scope.StartTimer();}
                    else 
                    {
                        var Url = NodeApi+'nearby?limit='+$rootScope.Config.CarsLimit+'&longitude='+location1.target.lng
                        Url += '&latitude='+location1.target.lat+'&distance='+$rootScope.Config.CarsDistance+'&levelId='+$rootScope.LevelId+'&driverCredit='+$rootScope.Config.DriverMustHaveCredit
                        if(!$scope.MoveNext)
                        {
                            $scope.GetNearestCars(Url,location1.target,$rootScope.language.nocarnear,false);
                        }
                    }
                }
        });
    }
    /*************************************request.html******************/
	$scope.openrequest= function()
    {
        $scope.promo_detail=false;        
        delete localStorage.TimeToCome;
        $scope.disableNewTrip=true;
        $scope.modal_flag=true; 
        if(!$scope.Markers || !$scope.Markers.length || !$scope.Markers[0] || !$scope.Markers[0].driverCityId) return;
        $scope.ShowSearchLoading=true;
        $http.get(HostApi+'prices/'+$rootScope.tripType+'/'+$rootScope.LevelId+'/'+$rootScope.user_data.packageId+'/'+$scope.Markers[0].driverCityId,{timeout:TIMEOUTHTTP})
        .success(function(res){
           // console.log(res.rows)
            if(res.rows)
            {
                $rootScope.Prices = res.rows
                $scope.FareEstimate =$rootScope.Prices.minNow;
                if($scope.ToLocation && $scope.ToLocation.lat && $scope.FromLocation && $scope.FromLocation.lat)
                {
                    var origin1 = new google.maps.LatLng($scope.FromLocation.lat, $scope.FromLocation.lng);
                    var destination1 = new google.maps.LatLng($scope.ToLocation.lat, $scope.ToLocation.lng);
                    var service = new google.maps.DistanceMatrixService();
                    service.getDistanceMatrix(
                    {
                        origins: [origin1],
                        destinations: [destination1],
                        travelMode: 'DRIVING',
                    }, function(res){
                       if(res.rows && res.rows.length && res.rows[0] && res.rows[0].elements.length && res.rows[0].elements[0] && res.rows[0].elements[0].duration)
                        {
                            var FareEstimate = (((res.rows[0].elements[0].duration.value/60) * $rootScope.Prices.perMinute)+((res.rows[0].elements[0].distance.value/1000)* $rootScope.Prices.perKm)).toFixed(0);
                            $scope.FareEstimate=(isNaN(FareEstimate) || !FareEstimate.length)?0:FareEstimate
                        }
                        if($scope.ToSearchDiv != 'DESTINATION'){
                           if($scope.FareEstimate<$rootScope.Prices.minNow) $scope.FareEstimate=$rootScope.Prices.minNow
                       }
                    });
                }
                $scope.flag_closerequest=true;
                $scope.show_levels=false;
                $scope.show_div_request=true;
                $timeout(function(){$scope.$apply();},100)
            }
        }).finally(function(){
            $scope.ShowSearchLoading=false;
        });
    };
	$scope.closerequest= function() {
        $scope.show_div_request=false;
        $scope.modal_flag=false;
        $scope.StopStartTimer==false;
    };
    $scope.$on('modal.hidden', function() {
        if($scope.modal_flag){ $scope.modal_flag=false; map.setClickable( true );   }
  });

    /*************************************ignor_request.html******************/
    $ionicModal.fromTemplateUrl(templateUrl+'ignor_request.html',function(modal){$scope.ignor_request=modal;}, {scope: $scope,animation: 'slide-in-up',backdropClickToClose:false,hardwareBackButtonClose:false});
    $scope.openignor_request= function(){ 
        $scope.disable_ignorbtn=false;
        $scope.ignoreReason={value:0};
        if($scope.Timer)$timeout.cancel($scope.Timer);
        $http.get(HostApi+'Reasons',{timeout:TIMEOUTHTTP}).success(function(res){
            $scope.Reasons = res.rows
            if(res.rows.length)$scope.ignoreReason.value=res.rows[0].reasonId
            map.setClickable( false );
            $scope.ignor_request.show();
        })
    };
    $scope.closeignor_request= function(){
        map.setClickable( true );
        $scope.ignor_request.hide();
    };
    /*************************************ignor_request.html******************/
        
    $scope.ShowSearchLoading=false;
	$scope.opensend_order= function(){
        $scope.ShowSearchLoading=true;
        map.setClickable( false );
    };
	$scope.closesend_order= function() {
        map.setClickable( true );
        $scope.ShowSearchLoading=false;
    };
    /*************************************path******************/
	$scope.openpath= function(aftertime){
        // if(Domain!='aman')$scope.show_detailpath=false;
        // else 
        $scope.show_detailpath=true;
        $scope.show_levels=false;
        $scope.show_div_request=false;
        $scope.show_pathdiv=true;
        $timeout(function(){$scope.$apply()},100)
    };
   $scope.closepath= function(flag) {$rootScope.checkshow_levels();};
    /*************************************path******************/
   
    $scope.CloseModels=function()
    {
        if($scope.show_div_request) $scope.closerequest();
        else if($scope.show_pathdiv)$scope.closepath();
        $rootScope.checkshow_levels();
    }
   
    $scope.$on('$destroy', function() {
        if($scope.Timer)
        {
            $timeout.cancel($scope.Timer);
            delete $scope.Timer;
        }
        $scope.mapzoom=false;
        map.off(plugin.google.maps.event.MAP_READY);
        map.off(plugin.google.maps.event.CAMERA_CHANGE);
        map.remove();
        $scope.searchModal.remove();
        $scope.selecttrip.remove();
        $scope.promomodal.remove();
    });
    // var PinItemObj = document.getElementById("PinItem");
    var MyLocationObj = document.getElementById("MyLocation");
    var ToSearchBoxObj = document.getElementById("ToSearchBox");
    var StartTripNowObj = document.getElementById("StartTripNow");
    var openselecttrip = document.getElementById("openselecttrip");
    var FromSearchBoxObj = document.getElementById("FromSearchBox");
    // PinItemObj.addEventListener("click", function() { 
    //     if($scope.flag_closerequest)  $scope.hide_requestdiv();
    //     else $timeout(function(){$scope.openrequest();},200); 
    // });
    ToSearchBoxObj.addEventListener("click", function() {$scope.ToSearchBox();});
    StartTripNowObj.addEventListener("click", function() {
        $timeout(function(){
            if($rootScope.language.nocarnear!=$scope.TimeToCome) {
                 if($scope.flag_closerequest) $rootScope.checkshow_levels();
                else $scope.openrequest();
            }
        },500)
         });
    openselecttrip.addEventListener("click", function() {
        if(Domain!='naqil') $scope.openselecttrip();
        else{
            if($rootScope.tripType==2)  $scope.active_item(1);
            else  $scope.active_item(2);
        }
    });
    FromSearchBoxObj.addEventListener("click", function() {$scope.OpenModalFor='pickup'; $scope.opensearchModal();});
    MyLocationObj.addEventListener("click", function() {
        map.getMyLocation(MyLocationoption,function(location) {
            $scope.GeoCode({position:location.latLng},true,'FromSearchBox');
        });
    });
        /*************************************SearchModal.html******************/
    $ionicModal.fromTemplateUrl(templateUrl+'searchmodal.html', {scope: $scope,animation: 'slide-in-up'}).then(function(modal) {$scope.searchModal = modal;});
    $scope.opensearchModal = function(flag) {
        $scope.searchModal.show();
        $timeout(function(){
            document.getElementById("autocomplete_id").focus();
             map.setClickable( false );
        },1000)
        $timeout(function(){$scope.$apply();},500);
    };
    $scope.closesearchModal  = function() {$scope.searchModal.hide();  map.setClickable( true );};
    $scope.distance=function (lat2,lon2)
    {
        map.getMyLocation(MyLocationoption,function(location) {
            $rootScope.Current_Location = location.latLng
        });
        var radlat1 = Math.PI * $rootScope.Current_Location.lat/180;
        var radlat2 = Math.PI * lat2/180;
        var radlon1 = Math.PI * $rootScope.Current_Location.lng/180;
        var radlon2 = Math.PI * lon2/180;
        var theta = $rootScope.Current_Location.lng-lon2;
        var radtheta = Math.PI * theta/180;

        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        dist = dist * 1.609344;
        return dist.toFixed(2);
    }
    
    /*************************************selecttrip.html******************/
	$ionicModal.fromTemplateUrl(templateUrl+'selecttrip.html',function(modal){$scope.selecttrip=modal;}, {	scope: $scope,animation: 'slide-in-up'});
	$scope.openselecttrip= function(){
        $timeout(function(){map.setClickable( false ); },500) 
        //console.log('false');
        $scope.modal_flag=true; 
        $scope.selecttrip.show();	
        };
	$scope.closeselecttrip= function() {
        $scope.modal_flag=false; 
        $scope.selecttrip.hide();
        map.setClickable( true ); 
    };
	
        
    $scope.GetMyMarkers=function()
    {
        $http.get(HostApi+'MyMarkers/'+$rootScope.user_data.passengerId,{timeout:TIMEOUTHTTP})
        .success(function(res){
            $scope.MyMarkers = res.rows
        })
    }
    // $scope.GetPlacesMarkers=function()
    // {
    //     $http.get(HostApi+'PlacesMarkers',{timeout:TIMEOUTHTTP})
    //     .success(function(res){
    //         $scope.PlacesMarkers = res.rows
    //     })
    // }
    
    $rootScope.restartTimer=function(){
      if(map)  $scope.StartTimer();
    }
}]);
