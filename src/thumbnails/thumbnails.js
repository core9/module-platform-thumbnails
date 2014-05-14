angular.module('core9Dashboard.thumbnails.config', [
  'ui.router'
])

.config(function ($stateProvider) {
  $stateProvider
  .state('thumbnails',  {
    url: '/config/thumbnails',
    views: {
      "main": {
        controller: 'ThumbnailsCtrl',
        templateUrl: 'thumbnails/thumbnails.tpl.html'
      }
    },
    data:{ 
      pageTitle: 'Thumbnails',
      context: 'thumbnailscontext',
      sidebar: 'config'
    }
  })
  .state('thumbnail',  {
    url: '/config/thumbnail/:id',
    views: {
      "main": {
        controller: 'ThumbnailsEditCtrl',
        templateUrl: 'thumbnails/edit.tpl.html'
      }
    },
    data:{ 
      pageTitle: 'Edit image profile',
      context: 'thumbnailscontext',
      sidebar: 'config'
    },
    resolve: {
      profile: ["ConfigFactory", "$stateParams", function(ConfigFactory, $stateParams) {
        return ConfigFactory.get({configtype: 'imageprofile', id: $stateParams.id});
      }]
    }
  });
})

.controller("ThumbnailsCtrl", function ($scope, $http, $state, ConfigFactory) {
  $scope.profiles = ConfigFactory.query({configtype: 'imageprofile'});

  $scope.edit = function (profile) {
    $state.go('thumbnail', {id: profile._id});
  };

  $scope.add = function (newName) {
    var newProfile = new ConfigFactory();
    newProfile.configtype = 'imageprofile';
    newProfile.name = newName;
    newProfile.$save();
    $scope.profiles.push(newProfile);
  };

  $scope.remove = function (profile, index) {
    profile.$remove(function() {
      $scope.profiles.splice(index, 1);
    });
  };

  $scope.flush = function() {
    $http.post("/admin/images/flush")
    .success(function() {
      alert("Image caches flushed.");
    })
    .error(function(data) {
      $scope.$emit("$error", data);
    });
  };

  $scope.flush = function(profile) {
    var suffix = "";
    if(profile !== undefined) {
      suffix = "/" + profile.name;
    }
    $http.post("/admin/images/flush" + suffix)
    .success(function() {
      alert("Image cache flushed.");
    })
    .error(function(data) {
      $scope.$emit("$error", data);
    });
  };

  $scope.refresh = function () {
    $http.post("/admin/images/refresh")
    .success(function() {
      alert("Image profiles refreshed.");
    })
    .error(function(data) {
      $scope.$emit("$error", data);
    });
  };
})

.controller("ThumbnailsEditCtrl", function ($scope, $state, profile, ConfigFactory) {
  $scope.buckets = ConfigFactory.query({configtype: 'bucket'}, function (data) {
    if(profile.bucket === undefined || profile.bucket === '') {
      $scope.bucket = '';
    } else {
      for (var i = data.length - 1; i >= 0; i--) {
        if(data[i].name === profile.bucket) {
          $scope.selectedBucket = data[i];
        }
      }
    }
  });
  $scope.profile = profile;

  $scope.$watch('selectedBucket', function () {
    if($scope.selectedBucket === undefined || $scope.selectedBucket === null || $scope.selectedBucket === '') {
      $scope.profile.bucket = '';
      $scope.profile.database = '';
    } else {
      $scope.profile.bucket = $scope.selectedBucket.name;
      $scope.profile.database = $scope.selectedBucket.database;
    }
  });

  $scope.save = function () {
    $scope.profile.$update();
    $state.go('thumbnails');
  };
})

.run(function(MenuService) {
  MenuService.add('config', {title: "Image profiles", weight: 200, link: "thumbnails"});
  MenuService.add('thumbnailscontext', 
    {title: "Refresh profiles", weight: 0, link: 'thumbnailsrefresh', template: '<a href="" ng-controller="ThumbnailsCtrl" ng-click="refresh()">Refresh profiles</a>'}
  );
  MenuService.add('thumbnailscontext', 
    {title: "Flush profiles", weight: 0, link: 'thumbnailsflush', template: '<a href="" ng-controller="ThumbnailsCtrl" ng-click="flush()">Flush profiles</a>'}
  );
})
;