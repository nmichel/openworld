angular.module('openworld', ['ui.router', 'openworld.world'])
    .constant('constants', {
        title: 'OpenWorld | Angularjs Sample App'
    })
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('root', {
                url: '/',
                views: {
                    '': {
                        templateUrl: 'app/root/root.html',
                        controller: ['$scope', 'constants', function($scope, constants) {
                            $scope.data = {};
                            $scope.data.title = constants.title;
                        }]
                    },
                    'hint': {
                        template: 'open the world by a click !'
                    }
                }
            })
            .state('about', {
		url: '/about',
		views: {
                    '': {
			templateUrl: 'app/about/about.html'
                    },
                    'hint': {
			template: ''
                    }
		}
            });
    }])
    .controller('AppCtrl', ['$scope', '$location', 'constants', function($scope, $location, constants) {
        $scope.data = {};
        $scope.data.title = constants.title;

        $scope.root = function() {
            $location.path('/root');
        };
    }]);
