angular.module('openworld.world.service', ['openworld.utils'])
    .factory('countries', ['$http', '$filter', 'utils', function($http, $filter, utils) {
	var countryUri = 'http://api.worldbank.org/countries?per_page=300&format=jsonP&prefix=JSON_CALLBACK';
	var countries = $http.jsonp(countryUri).then(function(resp) {
	    return $filter('filter')(resp.data[1], function(value) {
                return value.region.value != "Aggregates";
            });
	});

	var factory = {};
	factory.all = function() {
	    return countries;
	};
        factory.get = function(id) {
            return countries.then(function(countrylist){
                var r = utils.findById(countrylist, id);
                return r;
            });
        };
        factory.flag = function(name) {
            var flagInfoUri = 'http://en.wikipedia.org/w/api.php?action=query&titles=Image:Flag_of_' + name + '.svg&prop=imageinfo&iiprop=url&format=json&callback=JSON_CALLBACK';
            return $http.jsonp(flagInfoUri).then(function(flagInfoData) {
                var jjpet = require('jjpet');
                var m = jjpet.compile('**/{"url":(?<url>_)}');
                var res = jjpet.run(flagInfoData.data, m);
                if (res.status) {
                    return res.captures.url[0]; // <== 
                }
            });
        };
	return factory;
    }]);
