angular.module('openworld.utils', [])
    .factory('utils', function () {
        return {
            findById: function findById(a, id) {
                for (var i = 0; i < a.length; i++) {
                    if (a[i].id == id) {
                        return a[i]; // <== 
                    }
                }
                return null;
            }
        };
    })
    .filter('capitalize', function() {
        return function(input) {
            if (input == null) {
                return ; // <== 
            }
            return input.substring(0,1).toUpperCase() + input.substring(1);
        }
    });
