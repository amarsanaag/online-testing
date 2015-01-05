'use strict';

angular.module('myApp.registration', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/registration', {
    templateUrl: 'views/registration/registration.html',
    controller: 'RegistrationCtrl'
  });
}])

.controller('RegistrationCtrl', ['$scope', '$http', '$location', 'TaoService', 'authtoken', 'taohost', '$filter', function($scope, $http, $location, TaoService, authtoken, taohost, $filter) {
        
        $scope.taoGroups = {}; // empty object representing Tao Groups in JSON from Tao REST service
        
        $scope.lastname = "asd";
        $scope.firstname = "asd";
        $scope.email = "asd";
        $scope.submit = function() {
           // 1. Create new user
           // 2. Get the new user's uri
           $http.defaults.headers.common['Authorization'] = 'Basic ' + authtoken;
           $http.get(taohost+'/taoGroups/RestGroups')
                    .success(function(groupsResponse){
                        $scope.taoGroups = groupsResponse.data;
                        $scope.groupMembersCount = [];
                        var i = 0;
                        angular.forEach($scope.taoGroups, function(group, key){
                            $http.defaults.headers.common['Authorization'] = 'Basic ' + authtoken;
                            $http.defaults.headers.common['uri'] = group.uri;
                            $http.get(taohost+'/taoGroups/RestGroups')
                                     .success(function(groupResponse){
                                            var groupDetail = groupResponse.data;
                                            // 3. Get All users' uri from the group
                                            var count = 0;                                            
                                            if(groupDetail.properties[0].predicateUri == 'http://www.tao.lu/Ontologies/TAOGroup.rdf#Members')
                                                count = groupDetail.properties[0].values.length;
                                            $scope.groupMembersCount.push({uri: groupDetail.uri, count: count});
                                            i++;
                                            if(i==$scope.taoGroups.length) { // if all groups loaded
                                               $scope.groupMembersCount = $filter('orderBy')($scope.groupMembersCount, '+count', false);
                                               var newUserToGroup = $scope.groupMembersCount[0].uri; // the group with fewest members
                                               // 4. Push the new user's uri into the all users' uri (all users' uri for update)
                                               // 5. Update the group members
                                            }
                                     });
                        });
                        
                        //console.log($scope.taoGroups);
                    });
        };

}]);