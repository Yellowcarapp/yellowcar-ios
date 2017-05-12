window.placeTools = angular.module('ion-place-tools', []);
placeTools.directive('ionGooglePlace', [
        '$ionicTemplateLoader',
        '$ionicPlatform',
        '$q',
        '$timeout',
        '$rootScope',
        '$document',
        function($ionicTemplateLoader, $ionicPlatform, $q, $timeout, $rootScope, $document) {
            return {
                require: '?ngModel',
                restrict: 'E',
                templateUrl: 'src/ionGooglePlaceTemplate.html',
                replace: true,
                scope: {
                    searchQuery: '=ngModel',
                    locationChanged: '&',
                    addMarkers: '&',
                    radius: '=',
                    initPlaceholder: '=',
                    initList: '=',
                    initList2: '='
                },
                link: function(scope, element, attrs, ngModel) {
                    scope.dropDownActive = true;//false
                    var service = new google.maps.places.AutocompleteService();
                    var searchEventTimeout = undefined;
                    var latLng = null;

                    navigator.geolocation.getCurrentPosition(function (position) {
                        latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    });

                    var searchInputElement = angular.element(element.find('input'));
                    scope.selectLocation = function(location,isFav) {
                        console.log(location);
                        scope.dropDownActive = true;//false
                        var SelectedAddress = location;//(isFav)?location.markerAddress:
                        scope.searchQuery = '';
                        scope.locations = [];
                        if (scope.locationChanged) {
                            scope.locationChanged()(SelectedAddress);
                        }
                    };
                    scope.ClearSearch = function() {
                        scope.searchQuery='';
                        //scope.$apply();
                    };
                    scope.markLocation = function(location,Delete) {
                        scope.dropDownActive = true;//false
                        if (scope.addMarkers && Delete) {
                            scope.addMarkers()(location.markerId,Delete);
                        }
                        else if (scope.addMarkers)  scope.addMarkers()(location,Delete);
                    };
                    if (!scope.radius) {
                        scope.radius = 150000;
                    }

                    scope.locations = [];

                    scope.is_english='ltr';
                    scope.$watch('searchQuery', function(query) {
                        scope.dropDownActive = (query && query.length >= 3 && scope.locations.length);
                        if (searchEventTimeout) $timeout.cancel(searchEventTimeout);
                        searchEventTimeout = $timeout(function() {
                            if(!query) return;
                            if(/^[A-Za-z][A-Za-z0-9]*$/.test(query.charAt(0))!=true)scope.is_english='rtl';
                            else scope.is_english='ltr';
                            if (query.length < 3) {
                                scope.locations = [];
                                return;
                            };
                            var req = {};
                            req.input = query;
                            if (latLng) {
                                req.location = latLng;
                                req.radius = scope.radius;
                            }
                            service.getQueryPredictions(req, function (predictions, status) {
                                if (status == google.maps.places.PlacesServiceStatus.OK) {
                                    scope.locations = predictions;
                                    scope.$apply();
                                }
                            });
                        }, 350); // we're throttling the input by 350ms to be nice to google's API
                    });

                    var onClick = function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        scope.dropDownActive = (scope.searchQuery && scope.searchQuery.length >= 3 && scope.locations.length);
                        scope.$digest();
                        searchInputElement[0].focus();
                        setTimeout(function(){
                            searchInputElement[0].focus();
                        },0);
                    };

                    var onCancel = function(e){
                        setTimeout(function () {
                            scope.dropDownActive = (scope.searchQuery && scope.searchQuery.length >= 3 && scope.locations.length);//true;//false
                            scope.$digest();
                        }, 200);
                    };

                    element.find('input').bind('click', onClick);
                    element.find('input').bind('blur', onCancel);
                    element.find('input').bind('touchend', onClick);


                    if(scope.initPlaceholder){
                        //element.find('input').attr('placeholder', scope.initPlaceholder);
                    }
                }
            };
        }
    ]);

// Add flexibility to template directive
var template = '<div class="item ion-place-tools-autocomplete {{is_english}}" dir="{{is_english}}">' +
                    '<div class="search_autocomp">'+
                    '<i class="icon ion-search serach_icon" ></i> <input id="autocomplete_id" type="text" autocomplete="off" ng-model="searchQuery" autofocus> <i class="ion-close-round clearText" ng-click="ClearSearch()"></i>' +
                    '</div>'+
                    '<div class="ion-place-tools-autocomplete-dropdown">' +// 
                    '<ion-scroll direction="y">'+
                        '<ion-list>' +
                            '<ion-item ng-if="dropDownActive" ng-repeat="location in locations" ng-click="selectLocation(location)" on-swipe-right="markLocation(location,false)">' +
                                '{{location.description}}' +
                            '</ion-item>' +
                            '<ion-item ng-if="!dropDownActive" ng-repeat="location in initList" ng-click="selectLocation(location,true)" on-swipe-right="markLocation(location,true)">' +
                                '{{location.markerTitle}}' +
                            '</ion-item>' +
                            '<ion-item ng-if="!dropDownActive" ng-repeat="location in initList2" ng-click="selectLocation(location,true)">' +
                                '{{location.markerTitle}}' +
                            '</ion-item>' +
                        '</ion-list>' +
                        '</ion-scroll>'+
                    '</div>' +
                '</div>';
           /*
var template = '<div class="item ion-place-tools-autocomplete {{is_english}}" dir="{{is_english}}">' +
                    '<input type="text" autocomplete="off" ng-model="searchQuery"> <i class="ion-close-round clearText" ng-click="searchQuery=\'\'"></i>' +
                    '<div class="ion-place-tools-autocomplete-dropdown" ng-if="dropDownActive">' +
                        '<ion-list>' +
                            '<ion-item ng-repeat="location in locations" ng-click="selectLocation(location)" ng-class="{\"item-button-right\":is_english==\"ltr\",\"item-button-left\":is_english==\"rtl\"}">' +
                                '{{location.description}}' +
                                '<button class="button button-positive"><i class="icon ion-ios-telephone"></i></button>'+
                            '</ion-item>' +
                        '</ion-list>' +
                    '</div>' +
                '</div>'; */
placeTools.run(["$templateCache", function($templateCache) {$templateCache.put("src/ionGooglePlaceTemplate.html",template);}]);