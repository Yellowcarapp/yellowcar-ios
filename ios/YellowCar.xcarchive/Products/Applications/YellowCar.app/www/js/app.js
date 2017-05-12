var rate_rootScope={};
var Modules = [
    'ionic'
    //,'angular-svg-round-progress'
    ,'pascalprecht.translate'
    ,'angular-ladda'
    , 'oc.lazyLoad'
    ]
var Taxi = angular.module('MyApp',Modules )
Taxi.run(function($timeout,$ionicPlatform,socket,$ionicHistory,$rootScope,$ionicModal,$http,$ionicLoading,$state,$location,$ionicPopup) {
    // $rootScope.countries=[];
    // $rootScope.cities=[];
    

    $rootScope.short_address=function(location)
    { 
         var addressreturn=location
         if(location.indexOf(',')!=-1)var split_letter=','
         else  var  split_letter='،'
         var location_list=location.split(split_letter)
         if(location_list.length>2){
            location_list.splice(location_list.length-1, 1);
            location_list.splice(location_list.length-1, 1);
            address=location_list.join();
            addressreturn=address;
         }
        return addressreturn;
    }
     $rootScope.clearEditTrip=function(){ delete $rootScope.EditTrip}
     $rootScope.GoToHome=function() { $state.go('app.map');}
    
     $rootScope.checkConnection=function (){
        var networkState = navigator.connection.type;
        var states = {};
        states[Connection.UNKNOWN]  = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI]     = 'WiFi connection';
        states[Connection.CELL_2G]  = 'Cell 2G connection';
        states[Connection.CELL_3G]  = 'Cell 3G connection';
        states[Connection.CELL_4G]  = 'Cell 4G connection';
        states[Connection.CELL]     = 'Cell generic connection';
        states[Connection.NONE]     = 'No network connection';
        if(states[networkState]=='No network connection') {return  'no net';}
        else {return  'net';}
        // return  'net';
	}

     $rootScope.GetSetting=function(){
         if(listener_offline) listener_offline=false
    //    if(!$rootScope.listener_offline){
    //        $rootScope.listener_offline=true
    //         document.addEventListener("offline", offlinenetwork, false);
    //    }
        $http.get(HostApi+'Settings',{timeout:TIMEOUTHTTP}).success(function(res){
                $rootScope.Config=res.rows
                $rootScope.Config.failed_download=false;
                $rootScope.Config.pattern_mobilelength='.{'+$rootScope.Config.mobilelength+',}';
            }).error(function(){
                // $rootScope.Config={CarsLimit:2,CarsDistance:100,failed_download:true}
                // if(Domain=='naqil' || Domain=='yellowcar' )  $rootScope.Config.mobilelength=10;
                // else $rootScope.Config.mobilelength=11;
                // $rootScope.Config.pattern_mobilelength='.{'+$rootScope.Config.mobilelength+',}';
            });
    }

    $rootScope.GetCountryCity=function(){
        $http.get(HostApi+"getcountrycity/countrycity",{timeout:TIMEOUTHTTP}).success(function(data) { 
            $rootScope.countries=data.countries;
            $rootScope.cities=data.cities;            
        }).error(function(error){
            console.log(error);
        });
    }
    $rootScope.checkWifi=function(){
          cordova.plugins.diagnostic.isWifiEnabled(function(enabled){
                if(enabled==0){
                    
                    $rootScope.showToast($rootScope.language.connectWIFI)
                    // if(map) map.setClickable( false )
                    // $ionicPopup.show({
                    //     template:  '<center> <p > '+$rootScope.language.connectWIFI+'</p> </center>',
                    //    // title: '',
                    //     scope: $rootScope,
                    //     buttons: 
                    //     [
                    //         {
                    //             text: $rootScope.language.ok,
                    //             type: 'button button-block main_btn bg_color',
                    //             onTap: function(e) {
                    //               $rootScope.alertnointernet='';
                    //               cordova.plugins.diagnostic.switchToWifiSettings();
                    //               if(map) map.setClickable( true )
                    //             //   navigator.app.exitApp(); 
                    //             }
                    //         },{
                    //             text:$rootScope.language.cancel
                    //             ,type: 'button button-block main_btn sec_bg'
                    //             ,onTap: function(e) {
                    //                  $rootScope.alertnointernet='';
                    //                 if(map)map.setClickable( true );
                    //             }
                    //         }
                    //     ]
                    // });  
                } 
            }, function(error){
             console.error("The following error occurred: "+error);
            });
     }
    $rootScope.nointernet=function(){
        if(map) map.setClickable( false )
        $rootScope.alertnointernet = $ionicPopup.alert({ cssClass: 'custom-class'
            ,template:  '<center> <p>'+$rootScope.language.Failedinternet+'</p></center>',
            buttons: [ { text: $rootScope.language.ok ,type: 'button button-block main_btn bg_color'}]});
            $rootScope.alertnointernet.then(function(res) {
                $rootScope.alertnointernet='';
                if(map && (!$rootScope.modal_page || $rootScope.modal_page=='')) map.setClickable( true )
                // cordova.plugins.diagnostic.switchToWifiSettings();
                // navigator.app.exitApp(); 
        });
    }
    
    $rootScope.imgfolder =imgfolder;
    $rootScope.getpassengers=function(afteropenapp){
                $rootScope.user_data=JSON.parse(localStorage.user_data);
                var query=" select * from passengers where passengerId="+$rootScope.user_data.passengerId;
                $http({method: 'GET', url:HostApi+'query/'+query,timeout:TIMEOUTHTTP })
                .success(function(data, status, headers, config) { 
                    if(afteropenapp){          
                        if(localStorage.uuid==data.rows[0].deviceId){
                            $rootScope.user_data=data.rows[0];
                            localStorage.user_data=JSON.stringify($rootScope.user_data)
                            if($rootScope.user_data.passengerActivation && $rootScope.user_data.passengerActivation.length > 1){
                                $rootScope.goto('/app/verify')
                            }
                            else if($rootScope.user_data.passengerActivation && $rootScope.user_data.passengerActivation==1){
                            if($rootScope.user_data.blackList==0){
                                    $rootScope.Show_alert ($rootScope.language.blocktxt);
                                    delete localStorage.user_data;
                                    delete $rootScope.user_data;
                            }
                                else $rootScope.goto('/app/map')
                            }
                        }else {
                            $rootScope.showToast($rootScope.language.forcesignoutDevice)
                            delete localStorage.user_data;
                            delete $rootScope.user_data;
                            $rootScope.clearCache();
                        }
                    }else{
                         $rootScope.user_data=data.rows[0];
                         localStorage.user_data=JSON.stringify($rootScope.user_data)
                    }
                }).finally(function(){
                    if(afteropenapp){
                        $timeout(function(){
                            if(navigator.splashscreen) navigator.splashscreen.hide();
                        },2000);
                    }
                });
            }
	$ionicPlatform.ready(function() {  
        $ionicPlatform.registerBackButtonAction(onBackKeyDown, 401);     
        //document.addEventListener("offline", offlinenetwork, false);
        if (window.StatusBar)  StatusBar.styleDefault();
        if($rootScope.checkConnection()=="net"){
             $rootScope.GetSetting();
             $rootScope.GetCountryCity();
        }
        else $rootScope.nointernet();
       cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
        if(localStorage.user_data)  $rootScope.getpassengers(true);
        else  {
            delete $rootScope.user_data;
            $timeout(function(){
                if(navigator.splashscreen) navigator.splashscreen.hide();
            },2000);
        }
    });
    $rootScope.getnumber=function(num1,num2){
        var number=0.00;
        if(num1) number=parseFloat(num1/num2).toFixed(2)
        return number;
    } 
    $rootScope.getminutes=function(date1,date2){
        var moment1 = moment(date1);
        var moment2= moment(date2);
        var minutes=  moment1.diff(moment2, 'minutes');
       // if(minutes==0) minutes=moment1.diff(moment2, 'seconds')/60;
       if(minutes>3) minutes=minutes-3;
       else minutes=0;
       var r =minutes.toFixed(2)
       return (isNaN(r) || !r.length)?0:r;
    }
    $rootScope.goto = function(page,flag) {
        if(flag) page=page+"/"+Math.floor((Math.random() * 10000) );
        $location.path(page)
    }
    
    $rootScope.Show_alert = function(txt) {
        var alertPopup = $ionicPopup.alert({ cssClass: 'custom-class',template:  '<center> <p>'+txt+'</p></center>',
        buttons: [ { text: $rootScope.language.ok ,type: 'button button-block main_btn bg_color'}]});
        alertPopup.then(function(res) {});
    }
    
    
     $rootScope.exitapp=function(){
       if(!$rootScope.exitapppop){
           $rootScope.closemenumodal();
          if(map)map.setClickable( false );
            $rootScope.exitapppop=$ionicPopup.show({
            template:  '<center> <p > '+$rootScope.language.exit_app+'</p> </center>',
            title: $rootScope.language.alert_,
            scope: $rootScope,
            buttons: [
            {
                text: $rootScope.language.ok,
                type: 'button button-block main_btn bg_color',
                onTap: function(e) {
                     navigator.app.exitApp(); 
                     $rootScope.exitapppop='';
                }
            },{ 
                text:$rootScope.language.cancel
                ,type: 'button button-block main_btn  sec_bg'
                ,onTap: function(e) {
                    if($rootScope.alertnointernet){ if(map)map.setClickable( false );}
                    else { if(map)map.setClickable( true );}
                    $rootScope.exitapppop='';
                }
              }
            ]
        });
       }
     }

    $rootScope.signout=function(){
        $rootScope.closemenumodal();
        if(map)map.setClickable( false );
        $ionicPopup.show({
            template:  '<center> <p > '+$rootScope.language.signoutmsg+'</p> </center>',
            title: $rootScope.language.Signout,
            scope: $rootScope,
            buttons: [
            {
                text: $rootScope.language.ok,
                type: 'button button-block main_btn bg_color',
                onTap: function(e) {
                    if(map)map.setClickable( true );
                     var user_id=$rootScope.user_data.passengerId
                    delete localStorage.user_data;
                    delete $rootScope.user_data;
                    $http.put(HostApi+'updatepassengers/'+user_id,{deviceId:'',endPoint:''},{timeout:TIMEOUTHTTP}).success(function(res){ })
                    $location.path('/login'); 
                }
            },{ 
                text:$rootScope.language.cancel
                ,type: 'button button-block main_btn  sec_bg'
                ,onTap: function(e) {
                  if(map)map.setClickable( true );
                }
              }
            ]   
        }); 
    }
    
    $rootScope.showToast = function(msg) {
        if( window.plugins &&  window.plugins.toast)window.plugins.toast.show(msg, 'long', 'center');
    };
    
    $rootScope.show_loading = function(msg) { $ionicLoading.show({template: msg});   }
    $rootScope.hide_loading = function(){  $ionicLoading.hide();   }
    $rootScope.HostUrl=HostUrl;
    $rootScope.HostApi=HostApi;
    $rootScope.path_img=path_img;
    $rootScope.path_img_large=path_img_large;

    $rootScope.myGoBack = function() {
        $ionicHistory.goBack();
    };
    $rootScope.Call=function(numb,type){
        var Number=numb;
        if(!type) Number='+'+$rootScope.countries[0].countryTel+numb.toString();
        console.log(Number)
        window.plugins.CallNumber.callNumber(function(){}, function(){}, Number);
    }
    
    $rootScope.notificate=[{time:"1 hours age"},{time:"10 hours age"},{time:"yesterday at 2:31 PM"}]
    $rootScope.openmenumodal = function(){
         $rootScope.showdiv_menu=!$rootScope.showdiv_menu;
         if($rootScope.modal_page || $rootScope.showdiv_menu) {if(map)map.setClickable( false ); }
         else {if(map)map.setClickable( true ); }
    };
    $rootScope.closemenumodal= function(type) {
        if(map) {map.setClickable( true );}
        if(type=='disablemap') { if(map)map.setClickable( false ); }
        $rootScope.showdiv_menu=false;
    };
    $rootScope.clearCache=function(){
        $ionicHistory.clearHistory();
         $ionicHistory.clearCache();  
    }
    
    
   socket.on('connect',function (data){
        console.log('Connected');
        socket.on('disconnect',function (data){
                console.log('disconnect');
        });
   });     
   socket.on('updated',function (data){ console.log('updated',data);});       
   socket.on('joined',function (data){ console.log('joined',data); });       
   socket.on('leaved',function (data){ console.log('leaved',data); });
           /**** language *******/
   $rootScope.closemenu_change_lng=function(){
        $rootScope.closemenumodal(true);
        //$rootScope.restartTimer();
        $timeout(function(){
           $rootScope.change_lng($rootScope.otherlng);
        },500)
    }
      $rootScope.change_lng=function(lng){ 
        $rootScope.lng=lng;
        localStorage.lng=lng;
        if(lng=='ar') {
            $rootScope.otherlng='en';
            $rootScope.language=langAr;
        }
        else 
        {
            $rootScope.otherlng='ar';
            $rootScope.language=langEn;
        }
        $rootScope.$broadcast("LanguageChanged");
        $rootScope.reload_divmenu();
         if($rootScope.user_data){
                  $http.put(HostApi+'updatepassengers/'+$rootScope.user_data.passengerId,{passenger_app_lang:$rootScope.lng}
                  ,{timeout:TIMEOUTHTTP}).success(function(res){})
        }
    }
      $rootScope.retrive_language = function() {
            if(!localStorage.lng)
            {
                localStorage.lng='ar'; 
                $rootScope.language=langAr;
            }
            $rootScope.lng=localStorage.lng;
            if(localStorage.lng=='ar')   {
                $rootScope.otherlng='en';
               $rootScope.language=langAr;
            }
            else   {
                $rootScope.otherlng='ar';
                $rootScope.language=langEn;
            }
            if($rootScope.user_data){
                  $http.put(HostApi+'updatepassengers/'+$rootScope.user_data.passengerId,{passenger_app_lang:$rootScope.lng}
                  ,{timeout:TIMEOUTHTTP}).success(function(res){})
            }
            
    } 
    $rootScope.retrive_language();
    
    $rootScope.ReturnLocalTime=function(dateTime,time_flag)
    {
        var localTime  = moment.utc(dateTime).toDate();
        if(time_flag) localTime = moment(localTime).format('YYYY-MM-DD hh:mm a');
        else localTime = moment(localTime).format('YYYY-MM-DD HH:mm:ss');
        return localTime;
    }

     
    $rootScope.reload_divmenu=function(){
        var color='sec_color';
        $rootScope.div_menu='<div class="modal_menu animated slideInLeft" ng-class="{\'animated slideInRight\':lng==\'ar\'}" ng-show="showdiv_menu">';
        if(Domain=='mshawier' || Domain=='aman') var color='sec_color';
        else  var color='main_color';
        //  $rootScope.div_menu='<div class="modal_menu animated slideInLeft" ng-class="{\'animated slideInRight\':lng==\'ar\'}" ng-show="showdiv_menu">';
         if(Domain!='naqil'){
             $rootScope.div_menu+='<div class="menu_head" >';
             if($rootScope.user_data)  {
                 if($rootScope.user_data.passengerImage)  $rootScope.div_menu+=' <img  class="cir_img" ng-src="'+
                                                     $rootScope.path_img_large+$rootScope.user_data.passengerImage+'"/>';
                 else  $rootScope.div_menu+='<img class="cir_img" ng-src="'+$rootScope.imgfolder+'profile_img.png" /> ';
                 $rootScope.div_menu+='  <h3 class="sec_color">'+$rootScope.user_data.passengerName+'</h3>';
            }
            else $rootScope.div_menu+='<img class="cir_img" ng-src="'+$rootScope.imgfolder+'profile_img.png" /> ';                           
            $rootScope.div_menu+= '</div>';
         }

        $rootScope.div_menu+= '<ion-scroll  direction="y" class="scroll_menu"> <ion-list class="menu_app">';
        if(Domain!='naqil'){ 
                $rootScope.div_menu+='<ion-item  href="javascript:;" ng-click="gotohome()" class="item-icon-left" >';
                if(Domain=='naqil') $rootScope.div_menu+= '<img src="'+$rootScope.imgfolder+'ic1.png">'
                else  $rootScope.div_menu+='<i class="icon ion-home '+color+'"></i>'
                $rootScope.div_menu+= $rootScope.language.home+'</ion-item>';
        }
                            
        $rootScope.div_menu+= ' <ion-item href="javascript:;" ng-click="openPage_modal(\'profile\');" class="item-icon-left" >';
                                if(Domain=='naqil') $rootScope.div_menu+= '<img src="'+$rootScope.imgfolder+'ic6.png">'
                                else  $rootScope.div_menu+=  '<i class="icon ion-person '+color+'"></i>'
                                $rootScope.div_menu+= $rootScope.language.Profile
                                + ' </ion-item>'+
                            ' <ion-item  href="javascript:;" ng-click="clearEditTrip();openPage_modal(\'later\');" class="item-icon-left">';
                                    if(Domain=='naqil') $rootScope.div_menu+= '<img src="'+$rootScope.imgfolder+'ic7.png">'
                                    else  $rootScope.div_menu+=  '<i class="icon ion-document-text '+color+'"></i>'
                                    $rootScope.div_menu+=  $rootScope.language.LaterTrip+
                            ' </ion-item>'+
                            '  <ion-item  href="javascript:;" ng-click="openPage_modal(\'notification\');" class="item-icon-left">';
                                    if(Domain=='naqil') $rootScope.div_menu+= '<img src="'+$rootScope.imgfolder+'ic8.png">'
                                    else  $rootScope.div_menu+= '<i class="icon ion-ios-bell  '+color+'"></i>'
                                    $rootScope.div_menu+= $rootScope.language.Notify+ 
                            ' </ion-item>'+
                            ' <ion-item   href="javascript:;" ng-click="openPage_modal(\'newslist\');" class="item-icon-left">';
                                    if(Domain=='naqil') $rootScope.div_menu+= '<img src="'+$rootScope.imgfolder+'ic9.png">'
                                    else  $rootScope.div_menu+= '<i class="icon ion-earth  '+color+'"></i>'
                                    $rootScope.div_menu+= $rootScope.language.news+
                            '  </ion-item>'+
                            '<ion-item   href="javascript:;" ng-click="openPage_modal(\'list\');" class="item-icon-left">';
                                    if(Domain=='naqil') $rootScope.div_menu+= '<img src="'+$rootScope.imgfolder+'ic10.png">'
                                    else  $rootScope.div_menu+= '<i class="icon ion-document-text '+color+'"></i>'
                            if(Domain=='aman')  $rootScope.div_menu+=  $rootScope.language.HistoryAman + '</ion-item>';
                            else $rootScope.div_menu+=  $rootScope.language.History + '</ion-item>';
                                    
         if(Domain!='yellowcar' && Domain!='naqil') {  
                    $rootScope.div_menu+= '<ion-item  href="javascript:;" ng-click="openPage_modal(\'info\')"  class="item-icon-left" >';
                                    if(Domain=='naqil') $rootScope.div_menu+= '<img src="'+$rootScope.imgfolder+'ic2.png">'
                                    else  $rootScope.div_menu+= '<i class="icon ion-person  '+color+'"></i>'
                                 if(Domain=='aman')   $rootScope.div_menu+= $rootScope.language.InformationAman+'</ion-item>';
                                 else $rootScope.div_menu+= $rootScope.language.Information+'</ion-item>';
         }
         if(Domain=='aman') {  
            $rootScope.div_menu+= '<ion-item  href="javascript:;" ng-click="openPage_modal(\'prices\')"  class="item-icon-left" >';
                if(Domain=='naqil') $rootScope.div_menu+= '<img src="'+$rootScope.imgfolder+'ic2.png">'
                else  $rootScope.div_menu+= '<i class="icon ion-person  '+color+'"></i>'
                $rootScope.div_menu+= $rootScope.language.prices+'</ion-item>';
         }
         if(Domain=='aman') {                 
            $rootScope.div_menu+=  ' <ion-item href="javascript:;" ng-click="openPage_modal(\'trem_condation\');" class="item-icon-left" >';
            $rootScope.div_menu+=  '<i class="icon ion-person '+color+'"></i>'
            $rootScope.div_menu+= $rootScope.language.Terms_Conditions+' </ion-item>';
        }
         
         $rootScope.div_menu+= '<ion-item  href="javascript:;"  ng-click="closemenu_change_lng()" class="item-icon-left">';
                                    if(Domain=='naqil') $rootScope.div_menu+= '<img src="'+$rootScope.imgfolder+'ic12.png">'
                                    else  $rootScope.div_menu+= '<i class="icon ion-earth  '+color+'"></i>'
                                    $rootScope.div_menu+= $rootScope.language.btnlng+  
                                '</ion-item>';
        
        $rootScope.div_menu+='<ion-item  href="javascript:;" ng-click="closemodal_page();signout();" class="item-icon-left">';
                                    if(Domain=='naqil') $rootScope.div_menu+= '<img src="'+$rootScope.imgfolder+'ic13.png">'
                                    else  $rootScope.div_menu+= '<i class="icon ion-log-out  '+color+'"></i>'
                                    $rootScope.div_menu+= $rootScope.language.Signout+  
                            ' </ion-item>'+
                            '</ion-list></ion-scroll>'
            if(Domain=='naqil'){
                $rootScope.div_menu+=  '<div class="menu_footer">'+
                '<img src="img/naqil/lng.png" class="lng_btn">'+
                '<p>Version 2.1.0</p>'+
                '</div>'
            }
            $rootScope.div_menu+= '</div>'
 };
})

