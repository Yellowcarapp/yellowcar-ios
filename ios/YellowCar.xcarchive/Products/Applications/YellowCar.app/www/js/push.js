var listener_offline=true;
var bgOptions = {
    stationaryRadius: 25,//2
  distanceFilter:50,//1
  desiredAccuracy: 10,
  debug:false,
  notificationTitle: 'Dreamsoft trackking',
  notificationText: 'enabled',
  notificationIconColor: '#FEDD1E',
  notificationIconLarge: 'smallicon',
  notificationIconSmall: 'largeicon',
  locationProvider:1,// distance=0
  interval: 5000,//5,
  fastestInterval:5000,//2,
  activitiesInterval: 5000,//5,
  stopOnTerminate: true,
  startOnBoot: false,
  startForeground: false,
  stopOnStillActivity: true,
  activityType: 'AutomotiveNavigation',
  url: '',
  syncUrl:'',
  syncThreshold: 100,
  httpHeaders: {
    'X-FOO': 'bar'
  },
  pauseLocationUpdates: false,
  saveBatteryOnBackground: false,
  maxLocations: 100
};

function onBackKeyDown(e) {
    e.preventDefault();
    var el = document.getElementById('MyApp');
    var $injector = angular.element(el).injector();
    var $location = $injector.get('$location');
    var $rootScope = $injector.get('$rootScope');
    var path=$location.path();
    if(path=='/app/map')
    { 
        if($rootScope.modal_page)  {
            if($rootScope.show_tripDtails || $rootScope.show_newsDtails) {
               $rootScope.$apply(function(){
                    $rootScope.show_tripDtails=false;
                    $rootScope.show_newsDtails=false;
               });
            }
            else  $rootScope.closemodal_page(true)
        }
        else $rootScope.exitapp(); 
    }
    else if(path.indexOf('login')!=-1)
    { 
        navigator.app.exitApp(); 
    }
    else if(path.indexOf('register')!=-1 || path.indexOf('verify')!=-1 || path.indexOf('restPassword')!=-1) {
       //$rootScope.myGoBack(); 
       $rootScope.$apply(function(){
            $location.path('/login')
        }) 
    }
    // else if(path.indexOf('trip_detail')!=-1 || path.indexOf('detailNews')!=-1) {
    //    $rootScope.myGoBack(); 
    // }
    else
    { 
        $rootScope.$apply(function(){
            $location.path('/app/map')
        }) 
    }
}
document.addEventListener("pause", function(){
    if(device.platform!='iOS')return false;
    var el = document.getElementById('MyApp');
    var $injector = angular.element(el).injector();
    var $http = $injector.get('$http');
    var $rootScope = $injector.get('$rootScope')
    if($rootScope.user_data){
    $http.get(HostApi+'MapSettings/'+$rootScope.user_data.passengerId+'/'+$rootScope.user_data.packageId+'/'+$rootScope.user_data.passengerCountryId+
                 '/'+$rootScope.user_data.passengerCityId+'/'+$rootScope.tripType,{timeout:TIMEOUTHTTP})
        .success(function(res){
            // console.log('pause');
            console.log(res);
            if(res.currentTrip && res.currentTrip.length){ 
                localStorage.HaveTrip =1
                console.log(res.currentTrip[0].tripStatus)
                //$rootScope.trip_Status=res.currentTrip[0].tripStatus;
            }
            else localStorage.HaveTrip=0; 
        })
    }
}, false);
document.addEventListener("resume", function(){
    if(device.platform!='iOS')return false;
        // console.log(localStorage.HaveTrip);
        if(localStorage.HaveTrip=='1')
        {
            var el = document.getElementById('MyApp');
            var $injector = angular.element(el).injector();
            var $http = $injector.get('$http');
            var $rootScope = $injector.get('$rootScope')
            var $state = $injector.get('$state')
            // console.log(HostApi+'MapSettings/'+$rootScope.user_data.passengerId+'/'+$rootScope.user_data.packageId+'/'+$rootScope.user_data.passengerCountryId+
            //             '/'+$rootScope.user_data.passengerCityId+'/'+$rootScope.tripType);
            $http.get(HostApi+'MapSettings/'+$rootScope.user_data.passengerId+'/'+$rootScope.user_data.packageId+'/'+$rootScope.user_data.passengerCountryId+
                        '/'+$rootScope.user_data.passengerCityId+'/'+$rootScope.tripType,{timeout:TIMEOUTHTTP})
                .success(function(res){
                    if(res.currentTrip && res.currentTrip.length)
                    {
                        if($rootScope.trip_Status!=res.currentTrip[0].tripStatus){
                            var CurrentType = 'accepted'
                            if(res.currentTrip[0].tripStatus==0)  $rootScope.checkshow_levels();
                            else {
                                if(res.currentTrip[0].tripStatus==4)CurrentType='arrived'
                                else if(res.currentTrip[0].tripStatus==5)CurrentType='pickedup'
                                else if(res.currentTrip[0].tripStatus==6)CurrentType='dropoff'
                                $rootScope.$broadcast("pushRecieved",{trip:res.currentTrip[0],type:CurrentType});
                            }
                        }
                    }
                    else{ 
                        $rootScope.checkshow_levels();
                        $rootScope.openPage_modal('list');
                    }
                })
        }
        delete localStorage.HaveTrip;
        	
}, false);
document.addEventListener("offline", offlinenetwork, false);
document.addEventListener("deviceready", function(){
    cordova.plugins.backgroundMode.setDefaults({silent: true,title:Domain.charAt(0).toUpperCase() + Domain.slice(1), text:'Watching Your Location'});
    cordova.plugins.backgroundMode.enable();
    window.plugins.insomnia.keepAwake();
    //Yahia Comment*/
    window.plugins.uniqueDeviceID.get(function(uuid){
        localStorage.uuid=uuid;
    }) 
     //var inFocusDisplaying=(device.platform=='iOS')?window.plugins.OneSignal.OSInFocusDisplayOption.InAppAlert:window.plugins.OneSignal.OSInFocusDisplayOption.Notification;
    var inFocusDisplaying=window.plugins.OneSignal.OSInFocusDisplayOption.Notification;

    window.plugins.OneSignal
        .startInit(AppIdPassenger,senderID)
        .inFocusDisplaying(inFocusDisplaying)
        .handleNotificationOpened(function(jsonData) {
            console.log(jsonData)
           if(jsonData.notification.payload.additionalData)
            {
                var notification=jsonData.notification.payload.additionalData;
                // var notification=JSON.parse(jsonData.notification.payload.additionalData);
                opennotiication(notification);
            } 
        }) 
        .handleNotificationReceived(function(jsonData) {
            console.log(jsonData)
           if(jsonData.payload.additionalData)
            {
                var notification=jsonData.payload.additionalData;
                notification.playsound=true
                opennotiication(notification);
           } 
        }) 
        .endInit();
         window.plugins.OneSignal.enableVibrate(true)
          window.plugins.OneSignal.sendTag("name",Domain);
          window.plugins.OneSignal.clearOneSignalNotifications();
         getids_onesignal();


         StartBackGroundGpsTracking();
});
function getids_onesignal(){
    window.plugins.OneSignal.getIds(function(ids) {
        if(ids)  localStorage.UserARN=ids.userId;
        else   setTimeout(function(){ getids_onesignal();}, 4000);
    });
}
function opennotiication(notification){
    setTimeout(function(){window.plugins.OneSignal.clearOneSignalNotifications();}, 5000);
   
    if(notification.type){
        console.log(notification.type);
        var el = document.getElementById('MyApp');
        var $injector = angular.element(el).injector();
        var $location = $injector.get('$location');
        var $rootScope = $injector.get('$rootScope')
        $rootScope.$broadcast("pushRecieved",notification); 
    }
}

 function StartBackGroundGpsTracking()
 {
        backgroundGeolocation.configure(callbackFn, failureFn, bgOptions);
        backgroundGeolocation.start();
 }

 
 
 function callbackFn(location) {
    // console.log('BackgroundGeolocation callback:' + location.latitude + ',' + location.longitude);
    var el = document.getElementById('MyApp');
    var $injector = angular.element(el).injector();
    var $rootScope = $injector.get('$rootScope');
    $rootScope.marker_postion=location;
    console.log($rootScope.marker_postion)
    if(map) $rootScope.changemapcenter();
    backgroundGeolocation.finish();
};

function failureFn(error) {
    console.log('BackgroundGeolocation error');
};

 function offlinenetwork() {
        var el = document.getElementById('MyApp');
        var $injector = angular.element(el).injector();
        var $rootScope = $injector.get('$rootScope')
       if(!listener_offline && !$rootScope.alertnointernet) $rootScope.nointernet();
  }