angular.module( 'core9Dashboard.thumbnails', [
  'core9Dashboard.thumbnails.config',
  'templates-module-platform-thumbnails'
  ])

;

angular.module('core9Dashboard.admin.dashboard').requires.push('core9Dashboard.thumbnails');