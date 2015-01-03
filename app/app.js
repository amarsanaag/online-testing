'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.registration',
  'myApp.view2',
  'myApp.version'
])
.value('taohost', 'http://localhost/tao26')
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
.factory('TaoService',
    ['$http', '$rootScope', 'authtoken', 'taohost',
    function ($http, $rootScope, authtoken, taohost ) {
        var service = {};
        service.getTaoGroups = function() {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + authtoken;
            $http.get(taohost+'/taoGroups/RestGroups')
                    .success(function(response){
                        return response;
                    });
        };
        /*$http.defaults.headers.common['Authorization'] = 'Basic ' + authtoken;
          $http.defaults.headers.common['label'] = $scope.firstname+' '+$scope.lastname;
          $http.defaults.headers.common['mail'] = $scope.email;
          $http.defaults.headers.common['login'] = $scope.username;
          $http.defaults.headers.common['password'] = $scope.password;
          $http.post(taohost+'/taoSubjects/RestSubjects')
                  .success(function(response){
                      console.log(response);
                  });*/
        return service;
}]);