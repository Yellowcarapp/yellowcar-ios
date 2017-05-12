angular.module('MyApp').controller('Later', function( $filter,$state,$ionicPopup,$ionicModal,$scope,$rootScope,$http,$timeout,$ionicLoading) { 
    $scope.SearchBox={from:'',to:''}
    var currentdate=moment().format("YYYY-MM-DD HH:mm:ss")
    var day=moment().utc().format('YYYY-MM-DD')
    $scope.Date = {value:new Date(currentdate)};
    $scope.payBy='cash';
    
   $scope.select_item=function(level){
        $scope.LevelId=level.levelId;
        $scope.levelSeats=level.levelSeats;
         $scope.level_img=level.level_img;
        $scope.levelName={levelName_ar:level.levelName_ar,levelName_en:level.levelName_en}
        $timeout(function(){$scope.$apply()},1000)
        $scope.GetPrices();
    }
    $scope.getlevel=function()
    {
        if($rootScope.user_data)
        $http.get(HostApi+'getlevels/'+$rootScope.user_data.packageId+'/'+$rootScope.user_data.passengerCountryId+
                 '/'+$rootScope.user_data.passengerCityId+'/'+$scope.tripType,{timeout:TIMEOUTHTTP}).success(function(res){
                     if(Domain!='naqil') $rootScope.Levels=res.rows;
                     else {
                       if($scope.tripType==1) 
                           $rootScope.Levels= $filter('filter')(res.rows,{levelId:5} ,function(a,b){if(a<b) return true});
                      else
                         $rootScope.Levels= $filter('filter')(res.rows,{levelId:4},function(a,b){if(a>4) return true});
                     }
                     if(!$rootScope.EditTrip) $scope.select_item($rootScope.Levels[0]);
                     else{
                       var levelitem= $filter('filter')(res.rows,{levelId:$rootScope.EditTrip.tripLevelId},function(a,b){if(a=b) return true})[0];
                       $scope.select_item(levelitem);
                     }
        })
    }
    $scope.active_item=function(index){
         $scope.tripType=index;
         if(index==1) {
            if(Domain=='naqil')  $scope.triptype_img=imgfolder+'001.png';
            else $scope.triptype_img=imgfolder+'011.png';
         }
         else if(index==2) {
             if(Domain=='naqil')  $scope.triptype_img=imgfolder+'002.png';
            else $scope.triptype_img=imgfolder+'022.png';
         }
         else if(index==3) $scope.triptype_img=imgfolder+'033.png';
         else $scope.triptype_img=imgfolder+'044.png';
        $scope.getlevel();
     }
     $scope.GetPrices= function()
    {
        $http.get(HostApi+'prices/'+$scope.tripType+'/'+$scope.LevelId+'/'+$rootScope.user_data.packageId+'/'+$rootScope.user_data.passengerCityId,{timeout:TIMEOUTHTTP})
        .success(function(res){
            if(res.rows)
            {
                $rootScope.Prices = res.rows
                $scope.CalcEstimation();
            }
        })
    };
    $scope.Change_PaymentMethod=function(type)
    { 
        if(type=='cash')$scope.payBy = 'visa';
        else $scope.payBy = 'cash';
    }
   
    $ionicModal.fromTemplateUrl(templateUrl+'searchmodal_later.html', {scope: $scope,animation: 'slide-in-up'}).then(function(modal) {$scope.modal = modal;});
    $scope.openModal = function() {
        $scope.modal.show();
        $timeout(function(){document.getElementById("autocomplete_id").focus();},1000)
 };
    $scope.closeModal = function() {$scope.modal.hide();};
    
    $ionicModal.fromTemplateUrl(templateUrl+'selecttrip.html',function(modal){$scope.selecttrip=modal;}, {	scope: $scope,animation: 'slide-in-up'});
	$scope.openselecttrip= function(){$scope.selecttrip.show();	};
	$scope.closeselecttrip= function() {$scope.selecttrip.hide();};
	
    $ionicModal.fromTemplateUrl(templateUrl+'selectcar.html',function(modal){$scope.selectcar=modal;}, {scope: $scope,animation: 'slide-in-up'});
	$scope.openselectcar= function(){$scope.selectcar.show();};
	$scope.closeselectcar= function() {	$scope.selectcar.hide();};

    $scope.$on('$destroy', function() {
        $scope.selectcar.remove();
        $scope.selecttrip.remove();
        $scope.modal.remove();
    });
    
    $scope.ChoosePickUp=function(){
        $scope.OpenModalFor='pickup';
        $scope.openModal();
    }
    $scope.ToSearchBox=function()
    {
        $scope.OpenModalFor='dropoff';
        $scope.openModal();
    }
    $scope.locationChangedlater = function (location) {
        $scope.closeModal();
        var Options={}
        if(location.place_id)Options.placeId = location.place_id
        else Options.address = location.markerAddress
        var geocoder = new google.maps.Geocoder;
        geocoder.geocode(Options, function(results, status) {
            if (status === 'OK') {
                if (results[0]) {
                    var Position ={lat:results[0].geometry.location.lat(),lng:results[0].geometry.location.lng()};
                    if($scope.OpenModalFor=='dropoff')
                    {
                        $scope.ToLocation = Position
                        $scope.ToSearchDiv = (location.description)?$rootScope.short_address(location.description):$rootScope.short_address(location.markerAddress);
                        $scope.SearchBox.to=$scope.ToSearchDiv;
                   }
                    else
                    {
                        $scope.FromLocation = Position
                          $scope.SearchBox.from=(location.description)?$rootScope.short_address(location.description):$rootScope.short_address(location.markerAddress);

                    }
                    $scope.GetPrices();
                }
            }
        });
    };
    $scope.GeoCode=function(Options,ObjId)
    {
        $http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng='+Options.position.lat+','+Options.position.lng+'&key='+GOOGLEKEY)
        .success(function(results){
            results = results.results
            if(results.length)
            {
                var result = results[0]
                var position = result.geometry.location//result.position;
                
                if(ObjId=='FromSearchBox_later'){
                    $scope.FromLocation = position
                     $scope.SearchBox.from= (Options.address)?$rootScope.short_address(Options.address):$rootScope.short_address(result.formatted_address);
                }
                else if(ObjId=='ToSearchDiv' || ObjId=='ToSearchBox_later')
                {
                    $scope.ToLocation = position
                    
                    $scope.ToSearchDiv = (Options.address)?$rootScope.short_address(Options.address):$rootScope.short_address(result.formatted_address);
                     $scope.SearchBox.to=(Options.address)?$rootScope.short_address(Options.address):$rootScope.short_address(result.formatted_address);
                    $scope.CalcEstimation();
                }
            }
        });
    }   
    $scope.CalcEstimation=function(){
        if($scope.FromLocation && $scope.ToLocation)
            $http.get('https://maps.googleapis.com/maps/api/distancematrix/json?key='+GOOGLEKEY+'&origins='+
            $scope.FromLocation.lat+','+$scope.FromLocation.lng+'&destinations='+$scope.ToLocation.lat+','+$scope.ToLocation.lng+
            '&mode=driving&language=lang&sensor=false',{timeout:TIMEOUTHTTP}) 
            .success(function (res) {
                if(res.rows && res.rows.length && res.rows[0] && res.rows[0].elements.length && res.rows[0].elements[0] && res.rows[0].elements[0].duration)
                {
                    var FareEstimate = (((res.rows[0].elements[0].duration.value/60) * $rootScope.Prices.perMinute)+((res.rows[0].elements[0].distance.value/1000)* $rootScope.Prices.perKm)).toFixed(0);
                    $scope.FareEstimate=(isNaN(FareEstimate) || !FareEstimate.length)?0:FareEstimate
                }
            })
    }
    
    $scope.IsValidDate=function()
    {
        var Choose = moment($scope.Date.value).utc().format('YYYY-MM-DD HH:mm:ss')
        var Min_Date=moment().add(1, 'hours').utc().format('YYYY-MM-DD HH:mm:ss')
        return (Choose<= Min_Date)?true:false
    }
    $scope.select_proma= function()
    {
        $rootScope.show_loading();        
        $http.get(HostApi+'checkoffer/'+$scope.datapromo.code+'/'+$rootScope.user_data.passengerCountryId
                  +'/'+$rootScope.user_data.passengerCityId+'/'+$scope.LevelId+'/'+day+'/'+$rootScope.user_data.passengerId,{timeout:TIMEOUTHTTP})
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
            $rootScope.hide_loading();
        });
    };
    $scope.Popup_addpromo = function() {
            $scope.datapromo= {code:'',error:false};
      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        template: '<label class="item item-input"><input type="text" ng-model="datapromo.code"></label><p style="color:red" ng-if="datapromo.error">{{language.enteraddpromo}}</p>', 
          title: $rootScope.language.addpromo,cssClass: 'Popup_promo',scope: $scope,
        buttons: [
          { text: $rootScope.language.save, type: 'button button-block main_btn bg_color',
            onTap: function(e) {
              if ($scope.datapromo.code=='') {
                  e.preventDefault();
                  $scope.datapromo.error=true;
              } else {
                  $scope.select_proma();
              }
            }
          },{ text: $rootScope.language.cancel , type: 'button button-block main_btn  sec_bg'}
        ]
      });
    }
    $scope.Save=function()
    {
        $rootScope.show_loading();     
        var Trip=
        {
            tripType:$scope.tripType,
            tripLevelId:$scope.LevelId,
            payBy:$scope.payBy,
            from:{address: document.getElementById("FromSearchBox_later").value,location:$scope.FromLocation},
            to:{address:$scope.ToSearchDiv,location:$scope.ToLocation},
            tripNote:'',
            tripCountryId:$rootScope.user_data.passengerCountryId,
            tripCityId:$rootScope.user_data.passengerCityId,
            tripPackageId:$rootScope.user_data.packageId,
            tripStart:$rootScope.Prices.laterStart,
            tripPerKm:$rootScope.Prices.perKm,
            tripPerMinute:$rootScope.Prices.perMinute,
            tripMinCost:$rootScope.Prices.minLater,
            tripWaitingPerHour:$rootScope.Prices.WaitingperHour,
            tripNow:0,
            tripDueDate:moment($scope.Date.value).utc().format('YYYY-MM-DD HH:mm:ss')
        }
        if($scope.promo_detail && $scope.promo_detail.flag) {
            Trip.offerMaxValue= $scope.promo_detail.offerMaxValue;
            Trip.offerId = $scope.promo_detail.offerId ;
        }
        $rootScope.user_data.endPoint=localStorage.UserARN
        // $ionicLoading.show();
        $http.post(NodeApi+'trip',{passenger:$rootScope.user_data,trip:Trip},{timeout:TIMEOUTHTTP}) 
        .success(function (res) {
                var alertPopup = $ionicPopup.alert({ title: '',
                template:'<center> <p>{{language.orderplaced}}<br />{{language.contact_before_start}}</p><center>' ,
                buttons: [ { text: $rootScope.language.ok ,type: 'button button-block main_btn bg_color'}]});
                alertPopup.then(function(res) { 
                     $rootScope.hide_loading();
                     if($rootScope.EditTrip && $rootScope.EditTrip.tripId)
                    {
                        // $ionicLoading.show();
                        $http.delete(HostApi+'DeleteTrip/'+$rootScope.EditTrip.tripId,{timeout:TIMEOUTHTTP})
                        .finally(function(res){
                            //$ionicLoading.hide()
                        })
                        $rootScope.gotohome();
                    }
                    else $rootScope.gotohome();//$state.go('app.map');
                   
                });
               
        }).finally(function(){
        });
    }

     $scope.GetMyFromPosition=function()
    {
        if($rootScope.marker_postion ){
              $scope.GeoCode({position:{lat:$rootScope.marker_postion.latitude,lng:$rootScope.marker_postion.longitude}},'FromSearchBox_later');
        }
    }
      if($rootScope.EditTrip)
            {
                $scope.payBy=$rootScope.EditTrip.payBy;
                var tripto={address:$rootScope.EditTrip.tripToAdress,
                    position:{lat:$rootScope.EditTrip.tripTo.lat,lng:$rootScope.EditTrip.tripTo.lng}}
                var tripfrom={address:$rootScope.EditTrip.tripFromAddress,
                    position:{lat:$rootScope.EditTrip.tripFrom.lat,lng:$rootScope.EditTrip.tripFrom.lng}}
                $scope.ToLocation = tripto.position;
                $scope.ToSearchDiv =tripto.address;//$rootScope.short_address(tripto.address);
                $scope.SearchBox.to=tripto.address;
                $scope.FromLocation = tripfrom.position;
                $scope.SearchBox.from=tripfrom.address//$rootScope.short_address(tripfrom.address);
               $scope.Date.value=new Date($rootScope.EditTrip.tripDueDate)
                $scope.tripType=$rootScope.EditTrip.tripType;
                $scope.CalcEstimation();
                $scope.active_item($scope.tripType);
            }
            else   {
                $scope.ToSearchDiv = 'DESTINATION';
                $scope.GetMyFromPosition();
                $scope.active_item(1);
            }
   
});