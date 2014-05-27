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
                var flagImgUri = flagInfoData.data.query.pages["-1"].imageinfo[0].url;
                return flagImgUri;
            });
        };
	return factory;
    }]);
