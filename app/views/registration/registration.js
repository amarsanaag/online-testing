'use strict';

angular.module('myApp.registration', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/registration', {
    templateUrl: 'views/registration/registration.html',
    controller: 'RegistrationCtrl'
  });
}])

.controller('RegistrationCtrl', ['TaoService','$scope', '$http', '$location', function(TaoService, $scope, $http, $location) {
        $scope.submit = function() {
        TaoService.getTaoGroups();
          
        };
}]);