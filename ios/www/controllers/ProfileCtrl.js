angular.module('MyApp').controller('ProfileCtrl',['$scope','$timeout','$interval','$http','$rootScope','$ionicLoading','$filter','$state','$ionicActionSheet','$ionicPopup',
    function($scope,$timeout,$interval,$http,$rootScope,$ionicLoading,$filter,$state,$ionicActionSheet,$ionicPopup){
        $scope.NameIsValid= true;
        $scope.EmailIsValid=true;
        $scope.CheckEmail=function()
        {
            $scope.EmailIsValid = false;
            $http.post(HostApi+"checkprofile",{passengerEmail:$scope.Obj.passengerEmail,passengerId:$scope.Obj.passengerId},{timeout:TIMEOUTHTTP})
            .success(function(data) { 
                if(data.rows==false)$scope.EmailIsValid=true;
                else $scope.EmailIsValid=false;
            })
        }
     
//        $scope.CheckMobile=function()
//        {
//            $scope.MobileIsValid = false;
//            var data_check={passengerMobile:$scope.countrySelected.countryTel+$scope.Obj.passengerMobile
//                            ,passengerId:$scope.Obj.passengerId};
//            $http.post(HostApi+"checkprofile",data_check).success(function(data) { 
//                if(data.rows==false)$scope.MobileIsValid=true;
//                else $scope.MobileIsValid=false;
//            })
//        }
        
        $scope.updateprofile=function()
        {
//            $scope.Obj.passengerMobile = ltrim($scope.Obj.passengerMobile,'0')
//            $scope.Obj.passengerMobile = ltrim($scope.Obj.passengerMobile,$scope.countrySelected.countryTel)
//            $scope.Obj.passengerMobile = $scope.countrySelected.countryTel+$scope.Obj.passengerMobile
            // $ionicLoading.show()
           
  

            var profile_data={passenger_app_lang:$rootScope.lng,passengerEmail:$scope.Obj.passengerEmail,passengerCountryId:$scope.Obj.passengerCountryId
                              ,passengerCityId:$scope.Obj.passengerCityId,passengerImage:$scope.Obj.passengerImage,
                              passengerName:$scope.Obj.passengerName,deviceId:localStorage.uuid}
            if($scope.Obj.passengerPass) profile_data.passengerPass=$scope.Obj.passengerPass;
            $http.put(HostApi+'updatepassengers/'+$scope.Obj.passengerId ,profile_data,{timeout:TIMEOUTHTTP}).success(function(res){
                $rootScope.showToast($rootScope.language.sucess_save); 
                localStorage.user_data=JSON.stringify($scope.Obj);
                $rootScope.user_data=$scope.Obj;
                 $rootScope.reload_divmenu();
                 $rootScope.closemodal_page();
                //$state.go('app.map');
                
             }).finally(function(){})
            /* .finally(function(){
              //  $scope.Obj.passengerMobile= ltrim($scope.Obj.passengerMobile,$scope.countrySelected.countryTel)
                $ionicLoading.hide();
            });*/
        }
        
    $scope.chooseCountry=function(){
        $scope.countrySelected=$filter('filter')($scope.countries,{countryId:$scope.Obj.passengerCountryId}
                                                 ,function(a,b){if(a==b) return true})[0] ;
        
        var city_filter=$filter('filter')($scope.cities,{countryId:$scope.Obj.passengerCountryId}
                                                 ,function(a,b){if(a==b) return true});
         if(city_filter.length>0)$scope.Obj.passengerCityId=city_filter[0].cityId;
         else $scope.Obj.passengerCityId='';
    }
    
     function onFail(message) {/*alert('Failed because:' + message);*/}
    
    /** sendimage **/	
	$scope.sendimage = function(image,imgType){ 
        var list=[]; list.push(image);
        $scope.loadingimage=true;
		$http({ method : 'POST',url: HostUrl+'upload_base64.php',timeout:TIMEOUTHTTP,data: {'image':list}}).success(function(resultx) {
            $scope.Obj.passengerImage=resultx[0]
            $scope.loadingimage=false;
            //$timeout(function(){  $scope.$apply(); },1000);
		}).error(function(data, status, headers, config) {	
            $scope.loadingimage=false;
              $scope.Obj.passengerImage='' 
		});
	};
	
    $scope.get_camera=function (source,imgType) {
        var pictureSource=navigator.camera.PictureSourceType;
		var destinationType=navigator.camera.DestinationType;		 
        if(source==1){    
            navigator.camera.getPicture(function(imageURI){
                $scope.sendimage("data:image/jpeg;base64," +imageURI,imgType);
            }, onFail, { quality: 30, destinationType: destinationType.DATA_URL,sourceType: pictureSource.PHOTOLIBRARY,
                        correctOrientation:true,allowEdit: true ,targetWidth: 100,targetHeight: 100});
		} else if(source==0){ 
            navigator.camera.getPicture(function(imageURI){
                $scope.sendimage("data:image/jpeg;base64," +imageURI,imgType);
            }, onFail, { quality: 30,destinationType: destinationType.DATA_URL,sourceType: Camera.PictureSourceType.CAMERA,
                        correctOrientation:true,allowEdit: true ,targetWidth: 100,targetHeight: 100});
		}
    }
    
     $scope.delete_image= function() {
        var confirmPopup = $ionicPopup.confirm({ title:$rootScope.language.alert, template: $rootScope.language.deleteimg
                                                ,cancelText: $rootScope.language.cancel,okText: $rootScope.language.ok });
        confirmPopup.then(function(res) {
            if(res)  
            {
                $scope.Obj.passengerImage=''; 
                $scope.HideActionSheet();
            }
        });
    }
     
    $scope.getPhoto=function (imgType)
    { 	
        var arrbutton=[];
		var arrbutton=[{id:0,text: $rootScope.language.cameraimg},{id:1, text:$rootScope.language.galleryimg}]
        
        if(arrbutton.length>0){
            var Options = 
            {
                buttons: arrbutton ,
                titleText:  $rootScope.language.chooseImg ,
                cancelText:$rootScope.language.cancel,
                cancel: function() {},
                buttonClicked: function(index) {                  
                    $scope.get_camera(arrbutton[index].id);
                    return true;
                },destructiveButtonClicked:function() {
                    $scope.delete_image()
                }
            }
            if($scope.Obj.passengerImage && $scope.Obj.passengerImage.length)Options.destructiveText=$rootScope.language.Delete
            $scope.HideActionSheet=$ionicActionSheet.show(Options);
      }
	};
	
   
    // $scope.$on('$ionicView.loaded',function(){
       // console.log(localStorage.user_data)
            $scope.Obj= JSON.parse(localStorage.user_data)//$rootScope.user_data;
            $scope.Obj.passengerCityId = parseInt($scope.Obj.passengerCityId);
            $scope.Obj.passengerPass='';
            $scope.countrySelected=$filter('filter')($scope.countries,{countryId:$scope.Obj.passengerCountryId}
                                                    ,function(a,b){if(a==b) return true})[0] ;
            //$scope.Obj.passengerMobile= ltrim($scope.Obj.passengerMobile,$scope.countrySelected.countryTel)
            $scope.ErrorMessage = false
            $scope.EmailIsValid = true;
            $scope.MobileIsValid = true;
            $timeout(function(){$scope.$apply();},100)  
            $scope.$watch('Obj.passengerName',function(){
                if($scope.Obj && $scope.Obj.passengerName){
                    var namelen = $scope.Obj.passengerName.split(' ');
                    $scope.NameIsValid =(namelen.length>1)?true:false;
                }
            });
        // });
}])