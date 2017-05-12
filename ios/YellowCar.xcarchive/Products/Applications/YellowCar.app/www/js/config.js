var NodeApi='https://airocab.eu-gb.mybluemix.net/';
NodeApi='http://api.airocab.com/';
var HostUrl='http://airocab.com/service/';
var HostApi= HostUrl+'api/v1/passenger/';
var path_img=HostUrl+"resources/uploads/files/original/";
var path_img_large=HostUrl+"resources/uploads/files/large/";
var Socket_Url='ws://api.airocab.com:80'//ws://socket.airocab.com:80';
var TIMEOUTHTTP = 10000;
var senderID = "1088304747653";
var GOOGLEKEY='AIzaSyCV2I10CaDtILqXyigNHz7NL7CQikCPblM'
/******** yellowcar *********/
 var Authorizations = 'Basic c8bc49c21b59774294d282e7d107ffe5';
 var Domain = 'yellowcar'
 var Sms_Sender = 'yellowcar'
 var AppIdDriver="a52bd1d8-56df-41f6-9a16-361ee724953b";
 var AppSecretDriver='MWQyM2U0MmItYjhmOC00ZWQ0LWExYzctZTM4MTRjYTNkNjlm';
 var AppIdPassenger="77cc10db-4a8a-493b-a07b-bb273c0254f5";
 var AppSecretPassenger="M2M0N2Q0NWQtZGM0NC00ZjlkLTkzMzItYmVlMWE4MDEyNjU0";

var templateUrl = 'templates/'+Domain+'/';
var imgfolder='img/'+Domain+'/';
var sharelinkapp='https://play.google.com/store/apps/details?id=passenger.'+Domain+'.com';
var map;
var myMedia;
var First_Open=false;
Taxi.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider,$translateProvider,$httpProvider) {
    $httpProvider.interceptors.push('httpRequestInterceptor');
    $httpProvider.interceptors.push(function ($q, $injector) {
        var incrementalTimeout = 1;
        function retryRequest (httpConfig) {
            var $timeout = $injector.get('$timeout');
            return $timeout(function() {
                var $http = $injector.get('$http');
                return $http(httpConfig);
            }, 1000);
        };
        return {
            responseError: function (response) {
                //if (response.status === 500) 
                {
                    if (incrementalTimeout < 5) {
                        incrementalTimeout += 1;
                        return retryRequest(response.config);
                    }
                    else {
                        incrementalTimeout = 1;
                        var $rootScope = $injector.get('$rootScope');
                        if( window.plugins &&  window.plugins.toast)window.plugins.toast.showLongBottom($rootScope.language.NoInternet, function(a){}, function(b){})
                    }
                }
                //else {
                //    incrementalTimeout = 1000;
                //}
                return $q.reject(response);
            }
        };
    });
    $httpProvider.defaults.timeout = TIMEOUTHTTP;
    $ionicConfigProvider.views.maxCache(0);
    $ionicConfigProvider.backButton.text('').previousTitleText('')  ;
    $ionicConfigProvider.views.transition('none')
    $ionicConfigProvider.navBar.alignTitle('center');
    $ionicConfigProvider.scrolling.jsScrolling(true);
    $translateProvider.translations('en', langEn);
    $translateProvider.translations('ar', langAr);
    //$stateProvider.state('splash', {url: '/splash',  templateUrl: 'templates/splash.html' })
    $stateProvider.state('restPassword', {url: '/restPassword',  templateUrl: templateUrl+'restPassword.html', controller: 'restPasswordCtrl'  
        ,resolve: { 
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(['controllers/restPasswordCtrl.js']);
            }]
        }})
    $stateProvider.state('app', {url: "/app",abstract: true,templateUrl: templateUrl+"menu.html",controller:'menuCtrl'
    ,resolve: { 
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(['controllers/menuCtrl.js']);
            }]
        }
    })

    $stateProvider.state('login', {url: "/login",templateUrl: templateUrl+"login.html",controller:'LoginCtrl'
        ,resolve: { 
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(['controllers/LoginCtrl.js']);
            }]
        }
    })
    $stateProvider.state('app.register', {url: "/register",
        views: {
            'menuContent': {templateUrl: templateUrl+"register.html" ,controller:'Register'}
        }
        ,resolve: { 
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(['controllers/RegisterCtrl.js']);
            }]
        }
    })
    
    $stateProvider.state('app.verify', {url: "/verify",
        views: {
            'menuContent': {templateUrl: templateUrl+"verify.html",controller:'verifyCodeCtrl'}
        }
        ,resolve: { 
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(['controllers/verifyCodeCtrl.js']);
            }]
        }
    })
  /*  $stateProvider.state('app.payment_page', {url: "/payment_page",
        views: {
            'menuContent': {templateUrl: templateUrl+"payment_page.html",controller:'payment_page'}
        }
        ,resolve: { 
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(['controllers/payment_page.js']);
            }]
        }
    })*/
    /*$stateProvider.state('app.success', {url: "/success",
        views: {
            'menuContent': {templateUrl: templateUrl+"success.html"}
        }
   })*/
    
    $stateProvider.state('app.map', {url: "/map",
        views: {
            'menuContent': {
                templateUrl: templateUrl+"map.html",controller:'Map'
            }
        },
        resolve: { 
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                    'controllers/map.js', 
                     'js!https://maps.googleapis.com/maps/api/js?language=en&libraries=places,geometry&key='+GOOGLEKEY
                ]);
            }]
        }
    })
    
    $stateProvider.state('app.payment', {url: "/payment",
        views: {
            'menuContent': {templateUrl: templateUrl+"payment_setting.html"}
        }
    })
    
    /*$stateProvider.state('app.failed', {url: "/failed",
        views: {
            'menuContent': {templateUrl: templateUrl+"failed.html"}
        }
    })*/
   
   $urlRouterProvider.otherwise('/login');
})
Taxi.directive('compile', function ($compile) {
	return {
		restrict: 'A',
		replace: true,
		link: function (scope, ele, attrs) {
			scope.$watch(attrs.compile, function(html) {
				ele.html(html);
                $compile(ele.contents())(scope);
			});
		}
	};
})
Taxi.directive('focus', function() {
  return {
    restrict: 'A',
    link: function($scope,elem,attrs) {

      elem.bind('keydown', function(e) {
        var code = e.keyCode || e.which;
        if (code === 13) {
          e.preventDefault();
          elem.parent('div').parent('div').parent('div').next().find('input')[0].focus();
        }
      });
    }
  }
});
Taxi.factory('socket', function ($rootScope) {
        var socket = io.connect(Socket_Url, {transports: ['xhr-polling'],'forceNew':true,reconnect: true});
        if (socket.connected === false)
         {
         $rootScope.status = 'offline';
         }
         var disconnect = false;
         var Obj =
         {
         on: function (eventName,callback)
         {
         socket.on(eventName, function() {
                   var args = arguments;
                   if (!disconnect)
                   {
                   $rootScope.$apply(function() {callback.apply(socket, args);});
                   }
                   });
         }
         ,emit: function (eventName, data, callback)
         {
         socket.emit(eventName, data, function() {
                     var args = arguments;
                     $rootScope.$apply(function() {
                                       if (callback)
                                       callback.apply(socket, args);
                                       });
                     });
         }
         ,disconnect: function(){
            disconnect = true;
            socket.disconnect();
        }
    }
    return Obj;
         
});

Taxi.factory('httpRequestInterceptor', function () {
    return {
        request: function (config) {
            config.headers['Authorizations'] = Authorizations;
            config.headers['domain'] = Domain;
            config.headers['SmsSender'] = Sms_Sender; 
            config.headers['AppIdPassenger'] = AppIdPassenger;   
            config.headers['AppSecretPassenger'] = AppSecretPassenger;
            config.headers['AppIdDriver'] = AppIdDriver;   
            config.headers['AppSecretDriver'] = AppSecretDriver;   
            config.headers['test'] = 1;  
            config.headers['applang'] =  localStorage.lng;   
            return config;
        }
    };
});
function ltrim (str, charlist) {
  charlist = !charlist ? ' \\s\u00A0' : (charlist + '')
    .replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '$1')
  var re = new RegExp('^[' + charlist + ']+', 'g')
  return (str + '')
    .replace(re, '')
}

function rtrim (str, charlist) {
  charlist = !charlist ? ' \\s\u00A0' : (charlist + '')
    .replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^:])/g, '\\$1')

  var re = new RegExp('[' + charlist + ']+$', 'g')

  return (str + '').replace(re, '')
}
function getMediaURL(s) {
    if(device.platform.toLowerCase() === "android") return "/android_asset/www/" + s;
    return s;
}
