angular.module('app.routes', ['ngRoute'])

.config(function($routeProvider, $locationProvider) {

    console.log('app.routes.js config');
    $routeProvider

    // home page route
    .when('/', {
      templateUrl: 'app/views/pages/home.html'
    })

    // login page
    .when('/login', {
      templateUrl: 'app/views/pages/login.html',
      controller: 'mainController',
      controllerAs: 'login'
    });

    // get rid of th hash in the URL
    $locationProvider.html5Mode(true);

  });

