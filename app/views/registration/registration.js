'use strict';

angular.module('myApp.registration', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/registration', {
    templateUrl: 'views/registration/registration.html',
    controller: 'RegistrationCtrl'
  });
}])

.controller('RegistrationCtrl', ['$scope', '$http', '$location', '$timeout', 'TaoService', 'authtoken', 'taohost', '$filter', function($scope, $http, $location, $timeout, TaoService, authtoken, taohost, $filter) {
        
        $scope.taoGroups = {}; // empty object representing Tao Groups in JSON from Tao REST service
        $scope.errorText = '';
        $scope.infoText = '';
        
        $scope.createTestTaker = function() {
           $scope.errorText = '';
           $scope.infoText = '';
           $http.defaults.headers.common['Authorization'] = 'Basic ' + authtoken;
           // 1. Create new user
           $scope.userUri = null;
           $http.defaults.headers.common['label'] = $scope.firstname+' '+$scope.lastname;
           $http.defaults.headers.common['mail'] = $scope.email;
           $http.defaults.headers.common['login'] = $scope.username;
           $http.defaults.headers.common['password'] = $scope.password;
           $http.post(taohost+'/taoSubjects/RestSubjects')
                .success(function(response){
                    if(response.success===true){
                        delete $http.defaults.headers.common['label'];
                        delete $http.defaults.headers.common['mail'];
                        delete $http.defaults.headers.common['login'];
                        delete $http.defaults.headers.common['password'];
                        // 2. Get the new user's uri
                        $scope.userUri = response.data.uriResource;
                        // getting groups
                        $http.get(taohost+'/taoGroups/RestGroups')
                            .success(function(groupsResponse){
                                $scope.taoGroups = groupsResponse.data;
                                $scope.groupMembersCount = [];
                                $scope.groupDetails = [];
                                var i = 0;
                                angular.forEach($scope.taoGroups, function(group, key){
                                    $http.defaults.headers.common['uri'] = group.uri;
                                    $http.get(taohost+'/taoGroups/RestGroups')
                                        .success(function(groupResponse){
                                            var groupDetail = groupResponse.data;
                                            $scope.groupDetails.push(groupDetail);
                                            var count = 0;
                                            var groupDetailMembers = $filter('filter')(groupDetail.properties, {predicateUri: 'http://www.tao.lu/Ontologies/TAOGroup.rdf#Members'});
                                            if(groupDetailMembers.length > 0)
                                                count = groupDetailMembers[0].values.length;
                                            $scope.groupMembersCount.push({uri: groupDetail.uri, count: count});
                                            i++;
                                            if(i==$scope.taoGroups.length) { // if all groups loaded
                                                $scope.groupMembersCount = $filter('orderBy')($scope.groupMembersCount, '+count', false);
                                                var userToGroupUri = $scope.groupMembersCount[0].uri; // the group with fewest members
                                                // 3. Get All members' uri from the group
                                                var existingGroupMembers = $filter('filter')($scope.groupDetails, {uri: userToGroupUri});
                                                var membersString = '';
                                                // 4. Prepare all members's uris for updating the group members
                                                if(existingGroupMembers[0].properties[0].predicateUri === 'http://www.tao.lu/Ontologies/TAOGroup.rdf#Members'){
                                                    angular.forEach(existingGroupMembers[0].properties[0].values, function(member, key){
                                                        membersString += member.value+',';
                                                    });
                                                    membersString += $scope.userUri;
                                                }
                                                else
                                                    membersString = $scope.userUri;
                                                
                                                /*console.log('member:'+membersString);
                                                console.log($scope.groupDetails);
                                                console.log('the group to add:');
                                                console.log(existingGroupMembers);
                                                console.log('groupUri: '+userToGroupUri);
                                                console.log('userUri: '+$scope.userUri);*/
                                                
                                                // 5. Update the group members
                                                $http.defaults.headers.common['uri'] = userToGroupUri;
                                                $http.defaults.headers.common['member'] = membersString;
                                                $http.put(taohost+'/taoGroups/RestGroups')
                                                        .success(function(response){
                                                            delete $http.defaults.headers.common['uri'];
                                                            //console.log(response);
                                                            $scope.infoText = 'Таныг амжилттай бүртгэлээ. 3 секундын дараа автоматаар нүүр хуудасруу очно.';
                                                            $timeout(function() {
                                                                $location.path('/');
                                                               }, 3000);
                                                             
                                                        });
                                            }
                                        });
                                });
                                //console.log($scope.taoGroups);
                        });
                    }// end if user created
                    
                })
                .error(function(response, status){
                    if(response.success===false)
                        $scope.errorText = "Таныг бүртгэж чадсангүй. Хэрэглэгчийн нэр давхацсан байж магадгүй.";
                    //console.log(response);
                });

        };
}]);