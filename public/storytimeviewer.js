// Filename: public/storytimeviewer.js

var StoryTimeApp = angular.module('StoryTimeApp', ['ngRoute']);

StoryTimeApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/', {
      templateUrl: 'story_list.html',
      controller: 'StoryListCtrl'
    }).
    when('/add', {
      templateUrl: 'add_story.html',
      controller: 'AddStoryCtrl'
    }).
    when('/read/:documentId', {
      templateUrl: 'view_story.html',
      controller: 'ViewStoryCtrl'
    }).    
    otherwise({
      redirectTo: '/'
    });
}]);

StoryTimeApp.controller('StoryListCtrl', ['$scope', '$http', function($scope, $http) {
  $http.get('/api/getstories').then(function(response) {
    $scope.stories = response.data;
  });
}]);

StoryTimeApp.controller('AddStoryCtrl', ['$scope', '$http', '$location', function($scope, $http, $location) {
  $scope.loadContent = function() {
    $http.post('/api/addcontent', {url: $scope.contentUrl, title: $scope.title}).then(function(response) {
      if(response.data.error) {
        alert(response.data.error);
        return;
      }

      $scope.documentId = response.data.documentId;  

      $location.path('/');
    });
  }
}]);

StoryTimeApp.controller('ViewStoryCtrl', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {
  $scope.documentId = $routeParams.documentId;

  var viewer;

  $scope.previousPage = function() {
    $scope.currentPage--;
    viewer.scrollTo($scope.currentPage);
  };

  $scope.nextPage = function() {
    $scope.currentPage++;
    viewer.scrollTo($scope.currentPage);
  };

  $http.post('/api/getsession', {documentId: $scope.documentId}).then(function(response) {
    if(response.data.error) {
      alert('Unable to get session');
      return;
    }    

    $scope.sessionId = response.data.sessionId;

    viewer = Crocodoc.createViewer('#viewer', {
      url: 'https://view-api.box.com/1/sessions/'+response.data.sessionId+'/assets/',
      layout: Crocodoc.LAYOUT_PRESENTATION
    });

    viewer.on('ready', function(event) {
      console.log(event);
      $scope.$apply(function() {
        $scope.currentPage = 1;
        $scope.totalPageCount = event.data.numPages;
      });
    });

    viewer.load();
  });
}]);