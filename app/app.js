'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'angular-loading-bar',
  'ngRoute',
  'myApp.registration',
  'myApp.result',
  'myApp.version'
])
.value('taohost', 'http://10.0.33.103/tao26'/*'http://localhost/tao26'*/)
.value('authtoken', 'YWRtaW46YWRtaW4=')
.filter('webconfig', ['taohost', function(taohost) {
  return function(text) {
    return String(text).replace(/\%taohost\%/mg, taohost);
  };
}])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/home', {
      templateUrl: 'views/home.html'
    })
    .when('/about', {
      templateUrl: 'views/about.html'
    })
    .when('/contact', {
      templateUrl: 'views/contact.html'
    })
    .otherwise({redirectTo: '/home'});
}])
.service('TaoService',
    ['$http', '$rootScope', 'authtoken', 'taohost',
    function ($http, $rootScope, authtoken, taohost ) {
        this.getTaoGroups = function() {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + authtoken;
            $http.get(taohost+'/taoGroups/RestGroups')
                    .success(function(response){
                        console.log(response);
                    });
        };
        
}]);