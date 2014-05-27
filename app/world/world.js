angular.module('openworld.world', ['ui.router', 'openworld.utils', 'openworld.world.service'])
    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('world', {
		url: '/world',
		views: {
                    '': {
			templateUrl: 'app/world/world.html',
			resolve: {
			    countrylist: ['countries', function(countries) {
				return countries.all();
			    }]
			},
			controller: ['$scope', 'countrylist', function($scope, countrylist) {
    	                    $scope.data = {};
    	                    $scope.data.countries = countrylist;
                            $scope.data.selected = countrylist[0];

                            var map = new OpenLayers.Map("basicMap");
                            var mapnik = new OpenLayers.Layer.OSM();
                            var stations = new OpenLayers.Layer.Vector.OWMStations("Stations");
                            var city = new OpenLayers.Layer.Vector.OWMWeather("Weather", {units : 'metric'});
                            map.addLayers([mapnik, stations, city]);
                            $scope.data.map = map;
                        }]
                    },
                    'hint': {
			template: 'Select a country ...'
                    }
		}
            })
            .state('world.country', {
                url: '/country{countryId:[A-Z]{1,3}}',
                views: {
                    '': {
                        templateUrl: 'app/world/country.html',
                        controller: ['$scope', '$stateParams', 'countries', 'utils', function($scope, $stateParams, countries, utils) {
                            $scope.item = utils.findById($scope.data.countries, $stateParams.countryId);

                            countries.flag($scope.item.name).then(function(flagUri) {
                                $scope.flagUri = flagUri;
                            });

                            var lat = $scope.item.latitude;
                            var lon = $scope.item.longitude;
                            var lonlat = new OpenLayers.LonLat(lon, lat);
                            var point = lonlat.transform('EPSG:4326', 'EPSG:3857');
                            $scope.data.map.setCenter(point, 10);
                            $scope.data.selected = $scope.item;
                        }]
                    },
                    'hint@': {
                        template: 'Display Detail about {{ country.name }}!',
                        resolve: {
                            prout: ['$stateParams', 'countries', function($stateParams, countries) {
                                return countries.get($stateParams.countryId);
                            }]
                        },
                        controller: ['$scope', 'countries', 'prout', function($scope, countries, prout) {
                            $scope.country = prout;
                        }]
                    }
                }
            });
    }]);
