angular.module('openworld.world.country', ['ui.router', 'openworld.utils'])
    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('world.country', {
                abstract: true,
                url: 'country'
            })
    });
