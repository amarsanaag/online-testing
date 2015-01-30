'use strict';

angular.module('myApp.result', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/result', {
    templateUrl: 'views/result/result.html',
    controller: 'ResultCtrl'
  });
}])

.controller('ResultCtrl', ['$scope', '$http', '$location', '$timeout', 'TaoService', 'authtoken', 'taohost', '$filter', function($scope, $http, $location, $timeout, TaoService, authtoken, taohost, $filter) {
        $scope.errorText = '';
        $scope.infoText = '';
        $scope.resultNotFound = false;
        $scope.user = [];
        $scope.username = 'bold';
        $scope.grades = [];
        $scope.exams = []; // stores all exam total score for given user
        
        //
        $scope.$watchCollection('grades', function (newValue, oldValue) {
            $scope.exams = newValue;
        });
        
        $scope.viewResult = function() {
            $scope.errorText = '';
            $scope.resultNotFound = false;
            $http.defaults.headers.common['Authorization'] = 'Basic ' + authtoken;
            $http.defaults.headers.common['uri'] = taohost+'/tao.rdf#i14206823712975228'; // tricky uri
            $http.defaults.headers.common['login'] = $scope.username;
            $http.get(taohost+'/taoSubjects/RestSubjects')
                .success(function(response){
                   // console.log(response);
                    if(response.success===true){
                        $scope.user = response.data;
                        //console.log($scope.user.uri);
                        delete $http.defaults.headers.common['uri'];
                        delete $http.defaults.headers.common['login'];
                        $http.get(taohost+'/taoResults/RestResults')
                            .success(function(response){
                                if(response.success===true){
                                    $scope.results = response.data;
                                    $scope.resultNotFound = true;
                                    //console.log($scope.results);
                                    angular.forEach($scope.results, function(result, key){
                                       var grade = {}; 
                                       if(result.properties[2].predicateUri === 'http://www.tao.lu/Ontologies/TAOResult.rdf#resultOfSubject'){
                                           if(result.properties[2].values[0].value === $scope.user.uri){
                                               $http.defaults.headers.common['uri'] = result.uri;
                                               $http.get(taohost+'/taoResults/RestResults')
                                                    .success(function(response){
                                                        if(response.success === true){
                                                            //console.log(response.data); 
                                                            var totalScore = 0;
                                                            angular.forEach(response.data, function(question){
                                                                var qScoreObj = $filter('filter')(question, {identifier: 'SCORE'});
                                                                if(qScoreObj.length > 0)
                                                                    totalScore += parseFloat(qScoreObj[0].value);
                                                            });
                                                            var str = result.properties[4].values[0].value.split('-');
                                                            grade = {
                                                                title:str[2], 
                                                                score:totalScore
                                                            };
                                                            $scope.infoText = 'Шалгалтын дүн ирсэн.';
                                                            $scope.resultNotFound = false;
                                                            $scope.grades.push(grade); //on every change the $watchCollection is called
                                                            //console.log(grade);
                                                        }
                                                    });
                                           }
                                       }
                                       //console.log(result.properties[2]);
                                    });
                                }
                            });
                    }
                })
                .error(function(response, status){
                    
                    if(response.success===false)
                        $scope.errorText = "Шалгуулагчийн дүнг дуудаж чадсангүй. Хэрэглэгчийн нэрээ зөв эсэхийг шалгана уу.";
                });
        };
}]);