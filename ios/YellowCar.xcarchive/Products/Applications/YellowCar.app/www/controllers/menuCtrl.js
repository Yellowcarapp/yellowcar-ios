angular.module('MyApp').controller('menuCtrl', function($location,$ocLazyLoad,$scope,$rootScope,$ionicModal,$timeout,$ionicBackdrop) { 


    $rootScope.openPage_modal=function(page_name,time){
         if(map) map.setClickable(false);
         if($rootScope.modal_page) $rootScope.closemodal_page();
         if(document.getElementById('FromSearchBox_later')){
            document.getElementById('FromSearchBox_later').innerHTML = "";
            document.getElementById('ToSearchBox_later').innerHTML = "";
        }
         $rootScope.modal_loadflag=true;
         $rootScope.showdiv_menu=false;
         $rootScope.show_newsDtails=false;
         $rootScope.show_tripDtails=false;
         var page=templateUrl+page_name+'.html';
        $ionicModal.fromTemplateUrl(page,function(modal){$rootScope.modal_page=modal;}
        ,{scope: $rootScope, animation: 'slide-in-up',backdropClickToClose:false,hardwareBackButtonClose:false});
        $rootScope.openmodal_page= function(){ 
            if(map)   map.setClickable(false);
            $rootScope.modal_page.show();	
        };
        $rootScope.closemodal_page= function(flag) { 
            if($rootScope.modal_page)  {
                $rootScope.modal_loadflag=false; 
                $rootScope.modal_page.hide();
                $rootScope.modal_page='';
            }
            if(flag && map) map.setClickable(true);
        };
        $rootScope.$on('modal.hidden', function() {
            if($rootScope.modal_loadflag){ 
                $rootScope.modal_loadflag=false; 
                $rootScope.closemenumodal();
            }
        });
        var time=200;
        if(!time) time=1000
        $timeout(function(){  $rootScope.openmodal_page(); },time)

    }

    $rootScope.gotohome=function(){
        // if($rootScope.modal_page) $rootScope.closemodal_page(true)
        // else  if(map)   map.setClickable(true);
       if($rootScope.modal_page) $rootScope.closemodal_page(true);
        $rootScope.restartTimer();
        $rootScope.closemenumodal();
        // if($location.path().indexOf('map')!=-1){
        //     $rootScope.closemodal_page(true); $rootScope.restartTimer();
        // }
        // else  $location.path('/app/map')
    }

 $rootScope.reload_divmenu();
});