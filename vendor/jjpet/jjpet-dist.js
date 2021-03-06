require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = (function() {
    function build_matching_result(status, captures) {
        return {status: status,
                captures: captures};
    }
    
    function build_matcher_number(expr) {
        var expr = expr;
        
        return function(what) {
            if (typeof what != "number") {
                return build_matching_result(false, {}); // <== 
            }
            else if (what == expr) {
                return build_matching_result(true, {}); // <== 
            }
            else {
                return build_matching_result(false, {}); // <== 
            }
        };
    }

    function build_matcher_string(expr) {
        var expr = expr;
        
        return function(what) {
            if (typeof what != 'string') {
                return build_matching_result(false, {}); // <== 
            }
            else if (what == expr) {
                return build_matching_result(true, {}); // <== 
            }
            else {
                return build_matching_result(false, {}); // <== 
            }
        };
    }

    function build_matcher_regex(expr) {
        var expr = new RegExp(expr);

        return function(what) {
            if (typeof what != 'string') {
                return build_matching_result(false, {}); // <== 
            }
            else if (expr.test(what)) {
                return build_matching_result(true, {}); // <== 
            }
            else {
                return build_matching_result(false, {}); // <== 
            }
        };
    }

    function build_matcher_boolean(expr) {
        var expr = expr;
        
        return function(what) {
            if (typeof what != "boolean") {
                return build_matching_result(false, {}); // <== 
            }
            else if (what == expr) {
                return build_matching_result(true, {}); // <== 
            }
            else {
                return build_matching_result(false, {}); // <== 
            }
        };
    }

    function build_matcher_null() {
        return function(what) {
            if (what == null) {
                return build_matching_result(true, {}); // <== 
            }
            else {
                return build_matching_result(false, {}); // <== 
            }
        };
    }

    function build_matcher_any() {
        return function(what) {
            return build_matching_result(true, {}); // <== 
        };
    }

    function isObject(what) {
        return what != null &&
            what instanceof Object &&
            !(what instanceof Array);
    }

    function isArray(what) {
        return what != null &&
            what instanceof Array;
    }

    function build_matcher_object_any() {
        return function(what) {
            return build_matching_result(isObject(what), {});
        };
    };

    function melt(into, from) {
        for (key in from) {
            var entry = into[key] || [];
            entry = entry.concat(from[key]);
            into[key] = entry;
        }
        return into;
    }

    function build_matcher_pair(keyMatcher, valueMatcher) {
        var keyMatcher = keyMatcher;
        var valueMatcher = valueMatcher;
        return function(key, value, params) {
            var keyMatchingRes = keyMatcher(key, params);
            var valueMatchingRes = valueMatcher(value, params);
            if (!(keyMatchingRes.status && valueMatchingRes.status)) {
                return build_matching_result(false, {}); // <== 
            }

            return build_matching_result(true, melt(keyMatchingRes.captures, valueMatchingRes.captures)); // <== 
        };
    };

    function objectMatch(what, pairMatcher, params) {
        for (k in what) {
            var res = pairMatcher(k, what[k], params);
            if (res.status) {
                return res; // <== 
            }
        }

        return build_matching_result(false, {}); // <== 
    }

    function build_matcher_object(pairMatchers) {
        return function(what, params) {
            if (!isObject(what)) {
                return build_matching_result(false, {}); // <== 
            }

            var capAcc = {};
            for (var i = 0; i < pairMatchers.length; ++i) {
                var testRes = objectMatch(what, pairMatchers[i], params);
                if (! testRes.status) {
                    return build_matching_result(false, {}); // <== 
                }

                capAcc = melt(capAcc, testRes.captures);
            }

            return build_matching_result(true, capAcc); // <== 
        };
    };

    function build_matcher_list_empty() {
        return function(what) {
            return build_matching_result(isArray(what) && what.length == 0, {}); // <== 
        };
    };

    function build_matcher_list_any() {
        return function(what) {
            return build_matching_result(isArray(what), {}); // <== 
        };
    };

    function continue_until_match(what, matcher, params) {
        if (what.length == 0) {
            return [matcher(what, params), []]; // <== 
        }
        else {
            var head = what[0];
            var tail = what.slice(1);
            var res = matcher(head, params);
            if (res.status) {
                return [res, tail]; // <== 
            }
            else {
                return continue_until_match(tail, matcher, params); // <== 
            }
        }
    };

    function build_matcher_find_item(matcher) {
        return function(what, params) {
            if (isArray(what)) {
                return continue_until_match(what, matcher, params); // <== 
            }
            else {
                return [build_matching_result(false, {}), []]; // <== 
            }
        };
    };

    function build_matcher_item(matcher) {
        return function(what, params) {
            if (isArray(what)) {
                if (what.length == 0) {
                    return [matcher(what, params), []]; // <== 
                }
                else {
                    var head = what[0];
                    return [matcher(head, params), what.slice(1)]; // <== 
                }
            }
            else {
                return [build_matching_result(false, {}), []]; // <== 
            }
        };
    };

    function build_matcher_eol() {
        return function(what) {
            return build_matching_result(isArray(what) && what.length == 0, {}); // <== 
        }
    };

    function build_matcher_list(itemMatchers) {
        return function(what, params) {
            if (!isArray(what)) {
                return build_matching_result(false, {}); // <== 
            }

            var statuses = itemMatchers.reduce(function(acc, matcher) {
                var statusAcc = acc[0];
                var items = acc[1];
                var res = matcher(items, params);
                statusAcc.push(res[0]);
                return [statusAcc, res[1]]; // <== 
            }, [[], what]);

            var finalStatus = statuses[0].reduce(function(acc, status) {
                return build_matching_result(acc.status && status.status, melt(acc.captures, status.captures)); // <== 
            }, build_matching_result(true, {}));
            
            if (finalStatus.status) {
                return finalStatus; // <== 
            }

            return build_matching_result(false, {}); // <== 
        };
    };

    function build_matcher_iterable_any() {
        return function(what) {
            return build_matching_result(isObject(what) || isArray(what), {}); // <== 
        };
    }

    function objectSize(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    }

    function continue_until_value_match_object(what, matcher, params) {
        for (var k in what) {
            var res = matcher(what[k], params);
            if (res.status) {
                return res; // <== 
            }
        }

        return build_matching_result(false, {}); // <== 
    }

    function continue_until_value_match_list(what, matcher, params) {
        for (var k = 0; k < what.length; ++k) {
            var res = matcher(what[k], params);
            if (res.status) {
                return res; // <== 
            }
        }

        return build_matching_result(false, {}); // <== 
    }

    function build_matcher_iterable(valueMatchers) {
        return function(what, params) {
            if (!isObject(what) && !isArray(what)) {
                return build_matching_result(false, {}); // <== 
            }

            var fun = isObject(what) ?
                continue_until_value_match_object :
                continue_until_value_match_list;
            var results = valueMatchers.map(function(matcher) {
                return fun(what, matcher, params); // <== 
            });

            var acc = results.reduce(function(acc, matchRes) {
                if (matchRes.status) {
                    return [melt(acc[0], matchRes.captures), acc[1]]; // <== 
                }
                return [acc[0], acc[1]+1]; // <== 
            }, [{}, 0]);

            if (acc[1] == 0) {
                return build_matching_result(true, acc[0]); // <== 
            }
            return build_matching_result(false, {}); // <== 
        };
    }

    function deep_continue_until_value_match(what, matcher, params) {
        var fun = isObject(what) ?
            deep_continue_until_value_match_object :
            deep_continue_until_value_match_list;
        return fun(what, matcher, params);
    }

    function deep_continue_until_value_match_object(what, matcher, params) {
        for (var k in what) {
            var value = what[k];
            var res = matcher(value, params);
            if (res.status) {
                return res; // <== 
            }
            else {
                if (!isObject(value) && !isArray(value)) {
                    continue; // <== 
                }
                var deepRes = deep_continue_until_value_match(value, matcher, params);
                if (deepRes.status) {
                    return deepRes; // <== 
                }
                else {
                    continue; // <== 
                }
            }
        }

        return build_matching_result(false, {}); // <== 
    }

    function deep_continue_until_value_match_list(what, matcher, params) {
        for (var k = 0; k < what.length; ++k) {
            var value = what[k];
            var res = matcher(value, params);
            if (res.status) {
                return res; // <== 
            }
            else {
                if (!isObject(value) && !isArray(value)) {
                    continue; // <== 
                }
                var deepRes = deep_continue_until_value_match(value, matcher, params);
                if (deepRes.status) {
                    return deepRes; // <== 
                }
                else {
                    continue; // <== 
                }
            }
        }

        return build_matching_result(false, {}); // <== 
    }

    function build_matcher_descendant(valueMatchers) {
        return function(what, params) {
            if (!isObject(what) && !isArray(what)) {
                return build_matching_result(false, {}); // <== 
            }

            var fun = isObject(what) ?
                deep_continue_until_value_match_object :
                deep_continue_until_value_match_list;
            var results = valueMatchers.map(function(matcher) {
                return fun(what, matcher, params); // <== 
            });

            var acc = results.reduce(function(acc, matchRes) {
                if (matchRes.status) {
                    return [melt(acc[0], matchRes.captures), acc[1]]; // <== 
                }
                return [acc[0], acc[1]+1]; // <== 
            }, [{}, 0]);

            if (acc[1] == 0) {
                return build_matching_result(true, acc[0]); // <== 
            }
            return build_matching_result(false, {}); // <== 
        };
    }

    function build_matcher_capture(name, matcher) {
        return function(what, params) {
            var res = matcher(what, params);
            if (res.status) {
                var captures = res.captures;
                var cap = captures[name] || [];
                cap = cap.concat([what]);
                captures[name] = cap;
                return build_matching_result(true, captures); // <== 
            }
            return res; // <== 
        };
    }

    var injectorsBuilders = {
        "boolean": function (name) {
            return function(what, params) {
                if (typeof what != 'boolean' ) {
                    return build_matching_result(false, {}); // <==
                }
                var injected = params[name];
                if (injected == undefined) {
                    return build_matching_result(false, {}); // <==
                }
                return build_matching_result(injected === what, {}); // <== note the strict equality
            };
        },
        "string": function (name) {
            return function(what, params) {
                if (typeof what != 'string' ) {
                    return build_matching_result(false, {}); // <==
                }
                var injected = params[name];
                if (injected == undefined) {
                    return build_matching_result(false, {}); // <==
                }
                // Here we use LOOSE equality, because, as stated in 
                //   http://stackoverflow.com/questions/359494/does-it-matter-which-equals-operator-vs-i-use-in-javascript-comparisons
                //   "abc" === new String("abc") ==> false !
                // This can lead to a wrong match result, if a injected string value is produced using String ctor.
                // 
                return build_matching_result(injected == what, {}); // <== note the LOOSE equality.
            };
        },
        "number": function (name) {
            // TODO : Add compilation param to specify if we must use strict or loose comparison.
            
            return function(what, params) {
                if (typeof what != 'number' ) {
                    return build_matching_result(false, {}); // <==
                }
                var injected = params[name];
                if (injected == undefined) {
                    return build_matching_result(false, {}); // <==
                }
                return build_matching_result(injected === what, {}); // <== note the STRICT equality.
            };
        },
        "regex": function (name) {
            return function(what, params) {
                if (typeof what != 'string' ) {
                    return build_matching_result(false, {}); // <==
                }
                var injected = params[name];
                if (injected == undefined || ! injected instanceof RegExp) {
                    return build_matching_result(false, {}); // <==
                }
                return build_matching_result(injected.test(what), {}); // <== 
            };
        }
    };

    function build_matcher_inject(name, typename) {
        return injectorsBuilders[typename](name);
    }

    return {
        build_matching_result:      build_matching_result,
        build_matcher_number:       build_matcher_number,
        build_matcher_string:       build_matcher_string,
        build_matcher_regex:        build_matcher_regex,
        build_matcher_boolean:      build_matcher_boolean,
        build_matcher_null:         build_matcher_null,
        build_matcher_any:          build_matcher_any,
        build_matcher_object_any:   build_matcher_object_any,
        build_matcher_pair:         build_matcher_pair,
        build_matcher_object:       build_matcher_object,
        build_matcher_list_empty:   build_matcher_list_empty,
        build_matcher_list_any:     build_matcher_list_any,
        build_matcher_find_item:    build_matcher_find_item,
        build_matcher_item:         build_matcher_item,
        build_matcher_eol:          build_matcher_eol,
        build_matcher_list:         build_matcher_list,
        build_matcher_iterable_any: build_matcher_iterable_any,
        build_matcher_iterable:     build_matcher_iterable,
        build_matcher_descendant:   build_matcher_descendant,
        build_matcher_capture:      build_matcher_capture,
        build_matcher_inject:       build_matcher_inject
    };
})();

},{}],"yQ6E8h":[function(require,module,exports){
module.exports = (function() {
    var builders = require('./builders.js');
    var parser = require('./spec.js');
    return {
        compile: function(pattern) {
            var matcher = parser.parse(pattern);
            return matcher; // <== 
        },
        
        run: function(json, matcher, params) {
            return matcher(json, params || {}); // <== 
        }
    }
})();

},{"./builders.js":1,"./spec.js":4}],"jjpet":[function(require,module,exports){
module.exports=require('yQ6E8h');
},{}],4:[function(require,module,exports){
module.exports = (function() {
  /*
   * Generated by PEG.js 0.7.0.
   *
   * http://pegjs.majda.cz/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function SyntaxError(message, expected, found, offset, line, column) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.offset   = offset;
    this.line     = line;
    this.column   = column;

    this.name     = "SyntaxError";
  }

  peg$subclass(SyntaxError, Error);

  function parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},

        peg$FAILED = {},

        peg$startRuleFunctions = { pattern: peg$parsepattern },
        peg$startRuleFunction  = peg$parsepattern,

        peg$c0 = peg$FAILED,
        peg$c1 = "(",
        peg$c2 = { type: "literal", value: "(", description: "\"(\"" },
        peg$c3 = "?<",
        peg$c4 = { type: "literal", value: "?<", description: "\"?<\"" },
        peg$c5 = ">",
        peg$c6 = { type: "literal", value: ">", description: "\">\"" },
        peg$c7 = ")",
        peg$c8 = { type: "literal", value: ")", description: "\")\"" },
        peg$c9 = function(name, matcher) { return builders.build_matcher_capture(name, matcher); },
        peg$c10 = function(expr) { return expr; },
        peg$c11 = [],
        peg$c12 = /^[a-zA-Z_0-9]/,
        peg$c13 = { type: "class", value: "[a-zA-Z_0-9]", description: "[a-zA-Z_0-9]" },
        peg$c14 = "{",
        peg$c15 = { type: "literal", value: "{", description: "\"{\"" },
        peg$c16 = "}",
        peg$c17 = { type: "literal", value: "}", description: "\"}\"" },
        peg$c18 = function() { return builders.build_matcher_object_any(); },
        peg$c19 = ",",
        peg$c20 = { type: "literal", value: ",", description: "\",\"" },
        peg$c21 = function(head, tail) {
                    var pairMatchers = tail.reduce(function(acc, item) {
                        return acc.concat(item[2]);
                    }, [head]);
                    return builders.build_matcher_object(pairMatchers);
                },
        peg$c22 = "[",
        peg$c23 = { type: "literal", value: "[", description: "\"[\"" },
        peg$c24 = "]",
        peg$c25 = { type: "literal", value: "]", description: "\"]\"" },
        peg$c26 = function() { return builders.build_matcher_list_empty(); },
        peg$c27 = "*",
        peg$c28 = { type: "literal", value: "*", description: "\"*\"" },
        peg$c29 = function() { return builders.build_matcher_list_any(); },
        peg$c30 = function(head, tail) { return builders.build_matcher_list([head].concat(tail)); },
        peg$c31 = "<",
        peg$c32 = { type: "literal", value: "<", description: "\"<\"" },
        peg$c33 = function() { return builders.build_matcher_iterable_any(); },
        peg$c34 = function(head, tail) {
                    var matchers = tail.reduce(function(acc, item) {
                        return acc.concat(item[2]);
                    }, [head]);
                    return builders.build_matcher_iterable(matchers);
                },
        peg$c35 = "**/",
        peg$c36 = { type: "literal", value: "**/", description: "\"**/\"" },
        peg$c37 = function(pattern) { return builders.build_matcher_descendant([pattern]); },
        peg$c38 = "*/",
        peg$c39 = { type: "literal", value: "*/", description: "\"*/\"" },
        peg$c40 = function(pattern) { return builders.build_matcher_iterable([pattern]); },
        peg$c41 = "_",
        peg$c42 = { type: "literal", value: "_", description: "\"_\"" },
        peg$c43 = function() { return builders.build_matcher_any(); },
        peg$c44 = "true",
        peg$c45 = { type: "literal", value: "true", description: "\"true\"" },
        peg$c46 = function() { return builders.build_matcher_boolean(true); },
        peg$c47 = "false",
        peg$c48 = { type: "literal", value: "false", description: "\"false\"" },
        peg$c49 = function() { return builders.build_matcher_boolean(false); },
        peg$c50 = "null",
        peg$c51 = { type: "literal", value: "null", description: "\"null\"" },
        peg$c52 = function() { return builders.build_matcher_null(); },
        peg$c53 = function(number) { return builders.build_matcher_number(parseFloat(number)); },
        peg$c54 = function(string) { return builders.build_matcher_string(string); },
        peg$c55 = function(regex) { return builders.build_matcher_regex(regex); },
        peg$c56 = "!<",
        peg$c57 = { type: "literal", value: "!<", description: "\"!<\"" },
        peg$c58 = function(name, typename) { return builders.build_matcher_inject(name, typename); },
        peg$c59 = ":",
        peg$c60 = { type: "literal", value: ":", description: "\":\"" },
        peg$c61 = function(key, valueMatcher) { var keyMatcher = builders.build_matcher_string(key);
                  return builders.build_matcher_pair(keyMatcher, valueMatcher); },
        peg$c62 = function(key) { var keyMatcher = builders.build_matcher_string(key);
                  return builders.build_matcher_pair(keyMatcher, builders.build_matcher_any()); },
        peg$c63 = function(valueMatcher) { return builders.build_matcher_pair(builders.build_matcher_any(), valueMatcher); },
        peg$c64 = function(matcher) { return builders.build_matcher_find_item(matcher); },
        peg$c65 = function(matcher) { return builders.build_matcher_item(matcher); },
        peg$c66 = function() { return builders.build_matcher_item(builders.build_matcher_eol()); },
        peg$c67 = function() { return []; },
        peg$c68 = function(item, tail) { return [item].concat(tail); },
        peg$c69 = "-",
        peg$c70 = { type: "literal", value: "-", description: "\"-\"" },
        peg$c71 = ".",
        peg$c72 = { type: "literal", value: ".", description: "\".\"" },
        peg$c73 = /^[0-9]/,
        peg$c74 = { type: "class", value: "[0-9]", description: "[0-9]" },
        peg$c75 = /^[1-9]/,
        peg$c76 = { type: "class", value: "[1-9]", description: "[1-9]" },
        peg$c77 = /^[eE]/,
        peg$c78 = { type: "class", value: "[eE]", description: "[eE]" },
        peg$c79 = null,
        peg$c80 = /^[+\-]/,
        peg$c81 = { type: "class", value: "[+\\-]", description: "[+\\-]" },
        peg$c82 = "\"",
        peg$c83 = { type: "literal", value: "\"", description: "\"\\\"\"" },
        peg$c84 = function(chars) { return chars; },
        peg$c85 = "#",
        peg$c86 = { type: "literal", value: "#", description: "\"#\"" },
        peg$c87 = function(string) { return string; },
        peg$c88 = "string",
        peg$c89 = { type: "literal", value: "string", description: "\"string\"" },
        peg$c90 = "number",
        peg$c91 = { type: "literal", value: "number", description: "\"number\"" },
        peg$c92 = "boolean",
        peg$c93 = { type: "literal", value: "boolean", description: "\"boolean\"" },
        peg$c94 = "regex",
        peg$c95 = { type: "literal", value: "regex", description: "\"regex\"" },
        peg$c96 = function(chars) { return chars.join(""); },
        peg$c97 = "\\n",
        peg$c98 = { type: "literal", value: "\\n", description: "\"\\\\n\"" },
        peg$c99 = function() { return '\n'; },
        peg$c100 = "\\r",
        peg$c101 = { type: "literal", value: "\\r", description: "\"\\\\r\"" },
        peg$c102 = function() { return '\r'; },
        peg$c103 = "\\t",
        peg$c104 = { type: "literal", value: "\\t", description: "\"\\\\t\"" },
        peg$c105 = function() { return '\t'; },
        peg$c106 = "\\b",
        peg$c107 = { type: "literal", value: "\\b", description: "\"\\\\b\"" },
        peg$c108 = function() { return '\b'; },
        peg$c109 = "\\f",
        peg$c110 = { type: "literal", value: "\\f", description: "\"\\\\f\"" },
        peg$c111 = function() { return '\f'; },
        peg$c112 = "\\s",
        peg$c113 = { type: "literal", value: "\\s", description: "\"\\\\s\"" },
        peg$c114 = function() { return '\s'; },
        peg$c115 = "\\\\",
        peg$c116 = { type: "literal", value: "\\\\", description: "\"\\\\\\\\\"" },
        peg$c117 = function() { return '\\'; },
        peg$c118 = "\\\"",
        peg$c119 = { type: "literal", value: "\\\"", description: "\"\\\\\\\"\"" },
        peg$c120 = function() { return '\"'; },
        peg$c121 = void 0,
        peg$c122 = "\\",
        peg$c123 = { type: "literal", value: "\\", description: "\"\\\\\"" },
        peg$c124 = function(char) { return char; },
        peg$c125 = { type: "any", description: "any character" },
        peg$c126 = "\\u",
        peg$c127 = { type: "literal", value: "\\u", description: "\"\\\\u\"" },
        peg$c128 = /^[0-9a-fA-F]/,
        peg$c129 = { type: "class", value: "[0-9a-fA-F]", description: "[0-9a-fA-F]" },
        peg$c130 = /^[ \n\t\r]/,
        peg$c131 = { type: "class", value: "[ \\n\\t\\r]", description: "[ \\n\\t\\r]" },

        peg$currPos          = 0,
        peg$reportedPos      = 0,
        peg$cachedPos        = 0,
        peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$maxFailMessage   = null,
        peg$silentFails      = 0,
        peg$userFail         = false,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$reportedPos, peg$currPos);
    }

    function offset() {
      return peg$reportedPos;
    }

    function line() {
      return peg$computePosDetails(peg$reportedPos).line;
    }

    function column() {
      return peg$computePosDetails(peg$reportedPos).column;
    }

    function expected(description) {
      if (peg$silentFails === 0) {
        peg$expected(
          { type: "other", description: description },
          peg$reportedPos
        );
      }
      peg$userFail = true;
    }

    function error(message) {
      if (peg$silentFails === 0) {
        peg$error(message, peg$reportedPos);
      }
      peg$userFail = true;
    }

    function peg$computePosDetails(pos) {
      function advance(details, startPos, endPos) {
        var p, ch;

        for (p = startPos; p < endPos; p++) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }
        }
      }

      if (peg$cachedPos !== pos) {
        if (peg$cachedPos > pos) {
          peg$cachedPos = 0;
          peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
        }
        advance(peg$cachedPosDetails, peg$cachedPos, pos);
        peg$cachedPos = pos;
      }

      return peg$cachedPosDetails;
    }

    function peg$expected(expected, pos) {
      if (pos < peg$maxFailPos) { return; }

      if (pos > peg$maxFailPos) {
        peg$maxFailPos = pos;
        peg$maxFailExpected = [];
        peg$maxFailMessage = null;
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$error(message, pos) {
      if (pos < peg$maxFailPos) { return; }

      if (pos > peg$maxFailPos) {
        peg$maxFailPos = pos;
        peg$maxFailExpected = [];
        peg$maxFailMessage = null;
      }

      peg$maxFailMessage = message;
    }

    function peg$buildException() {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1].description === expected[i].description) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs, expectedDesc, foundDesc, i;

        switch (expected.length) {
          case 0:
            expectedDesc = "end of input";
            break;

          case 1:
            expectedDesc = expected[0].description;
            break;

          default:
            expectedDescs = new Array(expected.length);

            for (i = 0; i < expected.length; i++) {
              expectedDescs[i] = expected[i].description;
            }

            expectedDesc = expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1];
        }

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      var pos        = Math.max(peg$currPos, peg$maxFailPos),
          posDetails = peg$computePosDetails(pos),
          expected   = peg$maxFailMessage === null ? peg$maxFailExpected : null,
          found      = pos < input.length ? input.charAt(pos) : null,
          message    = peg$maxFailMessage !== null
            ? peg$maxFailMessage
            : buildMessage(expected, found);

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new SyntaxError(
        message,
        expected,
        found,
        pos,
        posDetails.line,
        posDetails.column
      );
    }

    function peg$parsepattern() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13;

      s0 = peg$currPos;
      s1 = peg$parsespaces();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 40) {
          s2 = peg$c1;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$expected(peg$c2, peg$currPos); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsespaces();
          if (s3 !== peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c3) {
              s4 = peg$c3;
              peg$currPos += 2;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$expected(peg$c4, peg$currPos); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsespaces();
              if (s5 !== peg$FAILED) {
                s6 = peg$parsename();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parsespaces();
                  if (s7 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 62) {
                      s8 = peg$c5;
                      peg$currPos++;
                    } else {
                      s8 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$expected(peg$c6, peg$currPos); }
                    }
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parsespaces();
                      if (s9 !== peg$FAILED) {
                        s10 = peg$parseexpr();
                        if (s10 !== peg$FAILED) {
                          s11 = peg$parsespaces();
                          if (s11 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 41) {
                              s12 = peg$c7;
                              peg$currPos++;
                            } else {
                              s12 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$expected(peg$c8, peg$currPos); }
                            }
                            if (s12 !== peg$FAILED) {
                              s13 = peg$parsespaces();
                              if (s13 !== peg$FAILED) {
                                peg$reportedPos = s0;
                                peg$userFail = false;
                                s1 = peg$c9(s6, s10);
                                if (peg$userFail) { s1 = peg$FAILED; }
                                if (s1 === peg$FAILED) {
                                  peg$currPos = s0;
                                  s0 = s1;
                                } else {
                                  s0 = s1;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$c0;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$c0;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsespaces();
        if (s1 !== peg$FAILED) {
          s2 = peg$parseexpr();
          if (s2 !== peg$FAILED) {
            s3 = peg$parsespaces();
            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              peg$userFail = false;
              s1 = peg$c10(s2);
              if (peg$userFail) { s1 = peg$FAILED; }
              if (s1 === peg$FAILED) {
                peg$currPos = s0;
                s0 = s1;
              } else {
                s0 = s1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      }

      return s0;
    }

    function peg$parsename() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      if (peg$c12.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$expected(peg$c13, peg$currPos); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c12.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$expected(peg$c13, peg$currPos); }
          }
        }
      } else {
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        s1 = input.substring(s0, peg$currPos);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseexpr() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 123) {
        s1 = peg$c14;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$expected(peg$c15, peg$currPos); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsespaces();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 125) {
            s3 = peg$c16;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$expected(peg$c17, peg$currPos); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            peg$userFail = false;
            s1 = peg$c18();
            if (peg$userFail) { s1 = peg$FAILED; }
            if (s1 === peg$FAILED) {
              peg$currPos = s0;
              s0 = s1;
            } else {
              s0 = s1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 123) {
          s1 = peg$c14;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$expected(peg$c15, peg$currPos); }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parsespaces();
          if (s2 !== peg$FAILED) {
            s3 = peg$parsepair();
            if (s3 !== peg$FAILED) {
              s4 = peg$parsespaces();
              if (s4 !== peg$FAILED) {
                s5 = [];
                s6 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 44) {
                  s7 = peg$c19;
                  peg$currPos++;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$expected(peg$c20, peg$currPos); }
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$parsespaces();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsepair();
                    if (s9 !== peg$FAILED) {
                      s7 = [s7, s8, s9];
                      s6 = s7;
                    } else {
                      peg$currPos = s6;
                      s6 = peg$c0;
                    }
                  } else {
                    peg$currPos = s6;
                    s6 = peg$c0;
                  }
                } else {
                  peg$currPos = s6;
                  s6 = peg$c0;
                }
                while (s6 !== peg$FAILED) {
                  s5.push(s6);
                  s6 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 44) {
                    s7 = peg$c19;
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$expected(peg$c20, peg$currPos); }
                  }
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parsespaces();
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parsepair();
                      if (s9 !== peg$FAILED) {
                        s7 = [s7, s8, s9];
                        s6 = s7;
                      } else {
                        peg$currPos = s6;
                        s6 = peg$c0;
                      }
                    } else {
                      peg$currPos = s6;
                      s6 = peg$c0;
                    }
                  } else {
                    peg$currPos = s6;
                    s6 = peg$c0;
                  }
                }
                if (s5 !== peg$FAILED) {
                  s6 = peg$parsespaces();
                  if (s6 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 125) {
                      s7 = peg$c16;
                      peg$currPos++;
                    } else {
                      s7 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$expected(peg$c17, peg$currPos); }
                    }
                    if (s7 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      peg$userFail = false;
                      s1 = peg$c21(s3, s5);
                      if (peg$userFail) { s1 = peg$FAILED; }
                      if (s1 === peg$FAILED) {
                        peg$currPos = s0;
                        s0 = s1;
                      } else {
                        s0 = s1;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 91) {
            s1 = peg$c22;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$expected(peg$c23, peg$currPos); }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parsespaces();
            if (s2 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 93) {
                s3 = peg$c24;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$expected(peg$c25, peg$currPos); }
              }
              if (s3 !== peg$FAILED) {
                peg$reportedPos = s0;
                peg$userFail = false;
                s1 = peg$c26();
                if (peg$userFail) { s1 = peg$FAILED; }
                if (s1 === peg$FAILED) {
                  peg$currPos = s0;
                  s0 = s1;
                } else {
                  s0 = s1;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 91) {
              s1 = peg$c22;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$expected(peg$c23, peg$currPos); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parsespaces();
              if (s2 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 42) {
                  s3 = peg$c27;
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$expected(peg$c28, peg$currPos); }
                }
                if (s3 !== peg$FAILED) {
                  s4 = peg$parsespaces();
                  if (s4 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 93) {
                      s5 = peg$c24;
                      peg$currPos++;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$expected(peg$c25, peg$currPos); }
                    }
                    if (s5 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      peg$userFail = false;
                      s1 = peg$c29();
                      if (peg$userFail) { s1 = peg$FAILED; }
                      if (s1 === peg$FAILED) {
                        peg$currPos = s0;
                        s0 = s1;
                      } else {
                        s0 = s1;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 91) {
                s1 = peg$c22;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$expected(peg$c23, peg$currPos); }
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$parsespaces();
                if (s2 !== peg$FAILED) {
                  s3 = peg$parseitem();
                  if (s3 !== peg$FAILED) {
                    s4 = peg$parsetail();
                    if (s4 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      peg$userFail = false;
                      s1 = peg$c30(s3, s4);
                      if (peg$userFail) { s1 = peg$FAILED; }
                      if (s1 === peg$FAILED) {
                        peg$currPos = s0;
                        s0 = s1;
                      } else {
                        s0 = s1;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 60) {
                  s1 = peg$c31;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$expected(peg$c32, peg$currPos); }
                }
                if (s1 !== peg$FAILED) {
                  s2 = peg$parsespaces();
                  if (s2 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 62) {
                      s3 = peg$c5;
                      peg$currPos++;
                    } else {
                      s3 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$expected(peg$c6, peg$currPos); }
                    }
                    if (s3 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      peg$userFail = false;
                      s1 = peg$c33();
                      if (peg$userFail) { s1 = peg$FAILED; }
                      if (s1 === peg$FAILED) {
                        peg$currPos = s0;
                        s0 = s1;
                      } else {
                        s0 = s1;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 60) {
                    s1 = peg$c31;
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$expected(peg$c32, peg$currPos); }
                  }
                  if (s1 !== peg$FAILED) {
                    s2 = peg$parsespaces();
                    if (s2 !== peg$FAILED) {
                      s3 = peg$parsepattern();
                      if (s3 !== peg$FAILED) {
                        s4 = peg$parsespaces();
                        if (s4 !== peg$FAILED) {
                          s5 = [];
                          s6 = peg$currPos;
                          if (input.charCodeAt(peg$currPos) === 44) {
                            s7 = peg$c19;
                            peg$currPos++;
                          } else {
                            s7 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$expected(peg$c20, peg$currPos); }
                          }
                          if (s7 !== peg$FAILED) {
                            s8 = peg$parsespaces();
                            if (s8 !== peg$FAILED) {
                              s9 = peg$parsepattern();
                              if (s9 !== peg$FAILED) {
                                s7 = [s7, s8, s9];
                                s6 = s7;
                              } else {
                                peg$currPos = s6;
                                s6 = peg$c0;
                              }
                            } else {
                              peg$currPos = s6;
                              s6 = peg$c0;
                            }
                          } else {
                            peg$currPos = s6;
                            s6 = peg$c0;
                          }
                          while (s6 !== peg$FAILED) {
                            s5.push(s6);
                            s6 = peg$currPos;
                            if (input.charCodeAt(peg$currPos) === 44) {
                              s7 = peg$c19;
                              peg$currPos++;
                            } else {
                              s7 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$expected(peg$c20, peg$currPos); }
                            }
                            if (s7 !== peg$FAILED) {
                              s8 = peg$parsespaces();
                              if (s8 !== peg$FAILED) {
                                s9 = peg$parsepattern();
                                if (s9 !== peg$FAILED) {
                                  s7 = [s7, s8, s9];
                                  s6 = s7;
                                } else {
                                  peg$currPos = s6;
                                  s6 = peg$c0;
                                }
                              } else {
                                peg$currPos = s6;
                                s6 = peg$c0;
                              }
                            } else {
                              peg$currPos = s6;
                              s6 = peg$c0;
                            }
                          }
                          if (s5 !== peg$FAILED) {
                            s6 = peg$parsespaces();
                            if (s6 !== peg$FAILED) {
                              if (input.charCodeAt(peg$currPos) === 62) {
                                s7 = peg$c5;
                                peg$currPos++;
                              } else {
                                s7 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$expected(peg$c6, peg$currPos); }
                              }
                              if (s7 !== peg$FAILED) {
                                peg$reportedPos = s0;
                                peg$userFail = false;
                                s1 = peg$c34(s3, s5);
                                if (peg$userFail) { s1 = peg$FAILED; }
                                if (s1 === peg$FAILED) {
                                  peg$currPos = s0;
                                  s0 = s1;
                                } else {
                                  s0 = s1;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$c0;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$c0;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.substr(peg$currPos, 3) === peg$c35) {
                      s1 = peg$c35;
                      peg$currPos += 3;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$expected(peg$c36, peg$currPos); }
                    }
                    if (s1 !== peg$FAILED) {
                      s2 = peg$parsespaces();
                      if (s2 !== peg$FAILED) {
                        s3 = peg$parsepattern();
                        if (s3 !== peg$FAILED) {
                          peg$reportedPos = s0;
                          peg$userFail = false;
                          s1 = peg$c37(s3);
                          if (peg$userFail) { s1 = peg$FAILED; }
                          if (s1 === peg$FAILED) {
                            peg$currPos = s0;
                            s0 = s1;
                          } else {
                            s0 = s1;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      if (input.substr(peg$currPos, 2) === peg$c38) {
                        s1 = peg$c38;
                        peg$currPos += 2;
                      } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$expected(peg$c39, peg$currPos); }
                      }
                      if (s1 !== peg$FAILED) {
                        s2 = peg$parsespaces();
                        if (s2 !== peg$FAILED) {
                          s3 = peg$parsepattern();
                          if (s3 !== peg$FAILED) {
                            peg$reportedPos = s0;
                            peg$userFail = false;
                            s1 = peg$c40(s3);
                            if (peg$userFail) { s1 = peg$FAILED; }
                            if (s1 === peg$FAILED) {
                              peg$currPos = s0;
                              s0 = s1;
                            } else {
                              s0 = s1;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                      if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        if (input.charCodeAt(peg$currPos) === 95) {
                          s1 = peg$c41;
                          peg$currPos++;
                        } else {
                          s1 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$expected(peg$c42, peg$currPos); }
                        }
                        if (s1 !== peg$FAILED) {
                          peg$reportedPos = s0;
                          peg$userFail = false;
                          s1 = peg$c43();
                          if (peg$userFail) { s1 = peg$FAILED; }
                        }
                        if (s1 === peg$FAILED) {
                          peg$currPos = s0;
                          s0 = s1;
                        } else {
                          s0 = s1;
                        }
                        if (s0 === peg$FAILED) {
                          s0 = peg$currPos;
                          if (input.substr(peg$currPos, 4) === peg$c44) {
                            s1 = peg$c44;
                            peg$currPos += 4;
                          } else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$expected(peg$c45, peg$currPos); }
                          }
                          if (s1 !== peg$FAILED) {
                            peg$reportedPos = s0;
                            peg$userFail = false;
                            s1 = peg$c46();
                            if (peg$userFail) { s1 = peg$FAILED; }
                          }
                          if (s1 === peg$FAILED) {
                            peg$currPos = s0;
                            s0 = s1;
                          } else {
                            s0 = s1;
                          }
                          if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            if (input.substr(peg$currPos, 5) === peg$c47) {
                              s1 = peg$c47;
                              peg$currPos += 5;
                            } else {
                              s1 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$expected(peg$c48, peg$currPos); }
                            }
                            if (s1 !== peg$FAILED) {
                              peg$reportedPos = s0;
                              peg$userFail = false;
                              s1 = peg$c49();
                              if (peg$userFail) { s1 = peg$FAILED; }
                            }
                            if (s1 === peg$FAILED) {
                              peg$currPos = s0;
                              s0 = s1;
                            } else {
                              s0 = s1;
                            }
                            if (s0 === peg$FAILED) {
                              s0 = peg$currPos;
                              if (input.substr(peg$currPos, 4) === peg$c50) {
                                s1 = peg$c50;
                                peg$currPos += 4;
                              } else {
                                s1 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$expected(peg$c51, peg$currPos); }
                              }
                              if (s1 !== peg$FAILED) {
                                peg$reportedPos = s0;
                                peg$userFail = false;
                                s1 = peg$c52();
                                if (peg$userFail) { s1 = peg$FAILED; }
                              }
                              if (s1 === peg$FAILED) {
                                peg$currPos = s0;
                                s0 = s1;
                              } else {
                                s0 = s1;
                              }
                              if (s0 === peg$FAILED) {
                                s0 = peg$currPos;
                                s1 = peg$parsenumber();
                                if (s1 !== peg$FAILED) {
                                  peg$reportedPos = s0;
                                  peg$userFail = false;
                                  s1 = peg$c53(s1);
                                  if (peg$userFail) { s1 = peg$FAILED; }
                                }
                                if (s1 === peg$FAILED) {
                                  peg$currPos = s0;
                                  s0 = s1;
                                } else {
                                  s0 = s1;
                                }
                                if (s0 === peg$FAILED) {
                                  s0 = peg$currPos;
                                  s1 = peg$parsestring();
                                  if (s1 !== peg$FAILED) {
                                    peg$reportedPos = s0;
                                    peg$userFail = false;
                                    s1 = peg$c54(s1);
                                    if (peg$userFail) { s1 = peg$FAILED; }
                                  }
                                  if (s1 === peg$FAILED) {
                                    peg$currPos = s0;
                                    s0 = s1;
                                  } else {
                                    s0 = s1;
                                  }
                                  if (s0 === peg$FAILED) {
                                    s0 = peg$currPos;
                                    s1 = peg$parseregex();
                                    if (s1 !== peg$FAILED) {
                                      peg$reportedPos = s0;
                                      peg$userFail = false;
                                      s1 = peg$c55(s1);
                                      if (peg$userFail) { s1 = peg$FAILED; }
                                    }
                                    if (s1 === peg$FAILED) {
                                      peg$currPos = s0;
                                      s0 = s1;
                                    } else {
                                      s0 = s1;
                                    }
                                    if (s0 === peg$FAILED) {
                                      s0 = peg$currPos;
                                      if (input.charCodeAt(peg$currPos) === 40) {
                                        s1 = peg$c1;
                                        peg$currPos++;
                                      } else {
                                        s1 = peg$FAILED;
                                        if (peg$silentFails === 0) { peg$expected(peg$c2, peg$currPos); }
                                      }
                                      if (s1 !== peg$FAILED) {
                                        s2 = peg$parsespaces();
                                        if (s2 !== peg$FAILED) {
                                          if (input.substr(peg$currPos, 2) === peg$c56) {
                                            s3 = peg$c56;
                                            peg$currPos += 2;
                                          } else {
                                            s3 = peg$FAILED;
                                            if (peg$silentFails === 0) { peg$expected(peg$c57, peg$currPos); }
                                          }
                                          if (s3 !== peg$FAILED) {
                                            s4 = peg$parsespaces();
                                            if (s4 !== peg$FAILED) {
                                              s5 = peg$parsename();
                                              if (s5 !== peg$FAILED) {
                                                s6 = peg$parsespaces();
                                                if (s6 !== peg$FAILED) {
                                                  if (input.charCodeAt(peg$currPos) === 62) {
                                                    s7 = peg$c5;
                                                    peg$currPos++;
                                                  } else {
                                                    s7 = peg$FAILED;
                                                    if (peg$silentFails === 0) { peg$expected(peg$c6, peg$currPos); }
                                                  }
                                                  if (s7 !== peg$FAILED) {
                                                    s8 = peg$parsespaces();
                                                    if (s8 !== peg$FAILED) {
                                                      s9 = peg$parsetype();
                                                      if (s9 !== peg$FAILED) {
                                                        s10 = peg$parsespaces();
                                                        if (s10 !== peg$FAILED) {
                                                          if (input.charCodeAt(peg$currPos) === 41) {
                                                            s11 = peg$c7;
                                                            peg$currPos++;
                                                          } else {
                                                            s11 = peg$FAILED;
                                                            if (peg$silentFails === 0) { peg$expected(peg$c8, peg$currPos); }
                                                          }
                                                          if (s11 !== peg$FAILED) {
                                                            peg$reportedPos = s0;
                                                            peg$userFail = false;
                                                            s1 = peg$c58(s5, s9);
                                                            if (peg$userFail) { s1 = peg$FAILED; }
                                                            if (s1 === peg$FAILED) {
                                                              peg$currPos = s0;
                                                              s0 = s1;
                                                            } else {
                                                              s0 = s1;
                                                            }
                                                          } else {
                                                            peg$currPos = s0;
                                                            s0 = peg$c0;
                                                          }
                                                        } else {
                                                          peg$currPos = s0;
                                                          s0 = peg$c0;
                                                        }
                                                      } else {
                                                        peg$currPos = s0;
                                                        s0 = peg$c0;
                                                      }
                                                    } else {
                                                      peg$currPos = s0;
                                                      s0 = peg$c0;
                                                    }
                                                  } else {
                                                    peg$currPos = s0;
                                                    s0 = peg$c0;
                                                  }
                                                } else {
                                                  peg$currPos = s0;
                                                  s0 = peg$c0;
                                                }
                                              } else {
                                                peg$currPos = s0;
                                                s0 = peg$c0;
                                              }
                                            } else {
                                              peg$currPos = s0;
                                              s0 = peg$c0;
                                            }
                                          } else {
                                            peg$currPos = s0;
                                            s0 = peg$c0;
                                          }
                                        } else {
                                          peg$currPos = s0;
                                          s0 = peg$c0;
                                        }
                                      } else {
                                        peg$currPos = s0;
                                        s0 = peg$c0;
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parsepair() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parsestring();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsespaces();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 58) {
            s3 = peg$c59;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$expected(peg$c60, peg$currPos); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsespaces();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsepattern();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                peg$userFail = false;
                s1 = peg$c61(s1, s5);
                if (peg$userFail) { s1 = peg$FAILED; }
                if (s1 === peg$FAILED) {
                  peg$currPos = s0;
                  s0 = s1;
                } else {
                  s0 = s1;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsestring();
        if (s1 !== peg$FAILED) {
          s2 = peg$parsespaces();
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 58) {
              s3 = peg$c59;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$expected(peg$c60, peg$currPos); }
            }
            if (s3 !== peg$FAILED) {
              s4 = peg$parsespaces();
              if (s4 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 95) {
                  s5 = peg$c41;
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$expected(peg$c42, peg$currPos); }
                }
                if (s5 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  peg$userFail = false;
                  s1 = peg$c62(s1);
                  if (peg$userFail) { s1 = peg$FAILED; }
                  if (s1 === peg$FAILED) {
                    peg$currPos = s0;
                    s0 = s1;
                  } else {
                    s0 = s1;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 95) {
            s1 = peg$c41;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$expected(peg$c42, peg$currPos); }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parsespaces();
            if (s2 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 58) {
                s3 = peg$c59;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$expected(peg$c60, peg$currPos); }
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parsespaces();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsepattern();
                  if (s5 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    peg$userFail = false;
                    s1 = peg$c63(s5);
                    if (peg$userFail) { s1 = peg$FAILED; }
                    if (s1 === peg$FAILED) {
                      peg$currPos = s0;
                      s0 = s1;
                    } else {
                      s0 = s1;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        }
      }

      return s0;
    }

    function peg$parseitem() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 42) {
        s1 = peg$c27;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$expected(peg$c28, peg$currPos); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsespaces();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s3 = peg$c19;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$expected(peg$c20, peg$currPos); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsespaces();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsepattern();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                peg$userFail = false;
                s1 = peg$c64(s5);
                if (peg$userFail) { s1 = peg$FAILED; }
                if (s1 === peg$FAILED) {
                  peg$currPos = s0;
                  s0 = s1;
                } else {
                  s0 = s1;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsespaces();
        if (s1 !== peg$FAILED) {
          s2 = peg$parsepattern();
          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            peg$userFail = false;
            s1 = peg$c65(s2);
            if (peg$userFail) { s1 = peg$FAILED; }
            if (s1 === peg$FAILED) {
              peg$currPos = s0;
              s0 = s1;
            } else {
              s0 = s1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      }

      return s0;
    }

    function peg$parsetail() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      s1 = peg$parsespaces();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 93) {
          s2 = peg$c24;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$expected(peg$c25, peg$currPos); }
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          peg$userFail = false;
          s1 = peg$c66();
          if (peg$userFail) { s1 = peg$FAILED; }
          if (s1 === peg$FAILED) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsespaces();
        if (s1 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s2 = peg$c19;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$expected(peg$c20, peg$currPos); }
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parsespaces();
            if (s3 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 42) {
                s4 = peg$c27;
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$expected(peg$c28, peg$currPos); }
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parsespaces();
                if (s5 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 93) {
                    s6 = peg$c24;
                    peg$currPos++;
                  } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$expected(peg$c25, peg$currPos); }
                  }
                  if (s6 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    peg$userFail = false;
                    s1 = peg$c67();
                    if (peg$userFail) { s1 = peg$FAILED; }
                    if (s1 === peg$FAILED) {
                      peg$currPos = s0;
                      s0 = s1;
                    } else {
                      s0 = s1;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parsespaces();
          if (s1 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 44) {
              s2 = peg$c19;
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$expected(peg$c20, peg$currPos); }
            }
            if (s2 !== peg$FAILED) {
              s3 = peg$parsespaces();
              if (s3 !== peg$FAILED) {
                s4 = peg$parseitem();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsetail();
                  if (s5 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    peg$userFail = false;
                    s1 = peg$c68(s4, s5);
                    if (peg$userFail) { s1 = peg$FAILED; }
                    if (s1 === peg$FAILED) {
                      peg$currPos = s0;
                      s0 = s1;
                    } else {
                      s0 = s1;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        }
      }

      return s0;
    }

    function peg$parsenumber() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = peg$parseint();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsefrac();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseexp();
          if (s4 !== peg$FAILED) {
            s2 = [s2, s3, s4];
            s1 = s2;
          } else {
            peg$currPos = s1;
            s1 = peg$c0;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c0;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        s1 = input.substring(s0, peg$currPos);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = peg$parseint();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsefrac();
          if (s3 !== peg$FAILED) {
            s2 = [s2, s3];
            s1 = s2;
          } else {
            peg$currPos = s1;
            s1 = peg$c0;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c0;
        }
        if (s1 !== peg$FAILED) {
          s1 = input.substring(s0, peg$currPos);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$currPos;
          s2 = peg$parseint();
          if (s2 !== peg$FAILED) {
            s3 = peg$parseexp();
            if (s3 !== peg$FAILED) {
              s2 = [s2, s3];
              s1 = s2;
            } else {
              peg$currPos = s1;
              s1 = peg$c0;
            }
          } else {
            peg$currPos = s1;
            s1 = peg$c0;
          }
          if (s1 !== peg$FAILED) {
            s1 = input.substring(s0, peg$currPos);
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseint();
            if (s1 !== peg$FAILED) {
              s1 = input.substring(s0, peg$currPos);
            }
            s0 = s1;
          }
        }
      }

      return s0;
    }

    function peg$parseint() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parsedigit19();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsedigits();
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parsedigit();
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 45) {
            s1 = peg$c69;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$expected(peg$c70, peg$currPos); }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parsedigit19();
            if (s2 !== peg$FAILED) {
              s3 = peg$parsedigits();
              if (s3 !== peg$FAILED) {
                s1 = [s1, s2, s3];
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 45) {
              s1 = peg$c69;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$expected(peg$c70, peg$currPos); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parsedigit();
              if (s2 !== peg$FAILED) {
                s1 = [s1, s2];
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          }
        }
      }

      return s0;
    }

    function peg$parsefrac() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 46) {
        s1 = peg$c71;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$expected(peg$c72, peg$currPos); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsedigits();
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseexp() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parsee();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsedigits();
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsedigits() {
      var s0, s1;

      s0 = [];
      s1 = peg$parsedigit();
      if (s1 !== peg$FAILED) {
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          s1 = peg$parsedigit();
        }
      } else {
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsedigit() {
      var s0;

      if (peg$c73.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$expected(peg$c74, peg$currPos); }
      }

      return s0;
    }

    function peg$parsedigit19() {
      var s0;

      if (peg$c75.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$expected(peg$c76, peg$currPos); }
      }

      return s0;
    }

    function peg$parsee() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (peg$c77.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$expected(peg$c78, peg$currPos); }
      }
      if (s1 !== peg$FAILED) {
        if (peg$c80.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$expected(peg$c81, peg$currPos); }
        }
        if (s2 === peg$FAILED) {
          s2 = peg$c79;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsestring() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 34) {
        s1 = peg$c82;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$expected(peg$c83, peg$currPos); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsechars();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 34) {
            s3 = peg$c82;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$expected(peg$c83, peg$currPos); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            peg$userFail = false;
            s1 = peg$c84(s2);
            if (peg$userFail) { s1 = peg$FAILED; }
            if (s1 === peg$FAILED) {
              peg$currPos = s0;
              s0 = s1;
            } else {
              s0 = s1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseregex() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 35) {
        s1 = peg$c85;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$expected(peg$c86, peg$currPos); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsespaces();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsestring();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            peg$userFail = false;
            s1 = peg$c87(s3);
            if (peg$userFail) { s1 = peg$FAILED; }
            if (s1 === peg$FAILED) {
              peg$currPos = s0;
              s0 = s1;
            } else {
              s0 = s1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsetype() {
      var s0;

      if (input.substr(peg$currPos, 6) === peg$c88) {
        s0 = peg$c88;
        peg$currPos += 6;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$expected(peg$c89, peg$currPos); }
      }
      if (s0 === peg$FAILED) {
        if (input.substr(peg$currPos, 6) === peg$c90) {
          s0 = peg$c90;
          peg$currPos += 6;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$expected(peg$c91, peg$currPos); }
        }
        if (s0 === peg$FAILED) {
          if (input.substr(peg$currPos, 7) === peg$c92) {
            s0 = peg$c92;
            peg$currPos += 7;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$expected(peg$c93, peg$currPos); }
          }
          if (s0 === peg$FAILED) {
            if (input.substr(peg$currPos, 5) === peg$c94) {
              s0 = peg$c94;
              peg$currPos += 5;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) { peg$expected(peg$c95, peg$currPos); }
            }
          }
        }
      }

      return s0;
    }

    function peg$parsechars() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsechar();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsechar();
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        peg$userFail = false;
        s1 = peg$c96(s1);
        if (peg$userFail) { s1 = peg$FAILED; }
      }
      if (s1 === peg$FAILED) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }

      return s0;
    }

    function peg$parsechar() {
      var s0, s1, s2;

      s0 = peg$parsecodepoint();
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c97) {
          s1 = peg$c97;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$expected(peg$c98, peg$currPos); }
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          peg$userFail = false;
          s1 = peg$c99();
          if (peg$userFail) { s1 = peg$FAILED; }
        }
        if (s1 === peg$FAILED) {
          peg$currPos = s0;
          s0 = s1;
        } else {
          s0 = s1;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.substr(peg$currPos, 2) === peg$c100) {
            s1 = peg$c100;
            peg$currPos += 2;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$expected(peg$c101, peg$currPos); }
          }
          if (s1 !== peg$FAILED) {
            peg$reportedPos = s0;
            peg$userFail = false;
            s1 = peg$c102();
            if (peg$userFail) { s1 = peg$FAILED; }
          }
          if (s1 === peg$FAILED) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c103) {
              s1 = peg$c103;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$expected(peg$c104, peg$currPos); }
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              peg$userFail = false;
              s1 = peg$c105();
              if (peg$userFail) { s1 = peg$FAILED; }
            }
            if (s1 === peg$FAILED) {
              peg$currPos = s0;
              s0 = s1;
            } else {
              s0 = s1;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 2) === peg$c106) {
                s1 = peg$c106;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$expected(peg$c107, peg$currPos); }
              }
              if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                peg$userFail = false;
                s1 = peg$c108();
                if (peg$userFail) { s1 = peg$FAILED; }
              }
              if (s1 === peg$FAILED) {
                peg$currPos = s0;
                s0 = s1;
              } else {
                s0 = s1;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.substr(peg$currPos, 2) === peg$c109) {
                  s1 = peg$c109;
                  peg$currPos += 2;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$expected(peg$c110, peg$currPos); }
                }
                if (s1 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  peg$userFail = false;
                  s1 = peg$c111();
                  if (peg$userFail) { s1 = peg$FAILED; }
                }
                if (s1 === peg$FAILED) {
                  peg$currPos = s0;
                  s0 = s1;
                } else {
                  s0 = s1;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.substr(peg$currPos, 2) === peg$c112) {
                    s1 = peg$c112;
                    peg$currPos += 2;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$expected(peg$c113, peg$currPos); }
                  }
                  if (s1 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    peg$userFail = false;
                    s1 = peg$c114();
                    if (peg$userFail) { s1 = peg$FAILED; }
                  }
                  if (s1 === peg$FAILED) {
                    peg$currPos = s0;
                    s0 = s1;
                  } else {
                    s0 = s1;
                  }
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.substr(peg$currPos, 2) === peg$c115) {
                      s1 = peg$c115;
                      peg$currPos += 2;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$expected(peg$c116, peg$currPos); }
                    }
                    if (s1 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      peg$userFail = false;
                      s1 = peg$c117();
                      if (peg$userFail) { s1 = peg$FAILED; }
                    }
                    if (s1 === peg$FAILED) {
                      peg$currPos = s0;
                      s0 = s1;
                    } else {
                      s0 = s1;
                    }
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      if (input.substr(peg$currPos, 2) === peg$c118) {
                        s1 = peg$c118;
                        peg$currPos += 2;
                      } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$expected(peg$c119, peg$currPos); }
                      }
                      if (s1 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        peg$userFail = false;
                        s1 = peg$c120();
                        if (peg$userFail) { s1 = peg$FAILED; }
                      }
                      if (s1 === peg$FAILED) {
                        peg$currPos = s0;
                        s0 = s1;
                      } else {
                        s0 = s1;
                      }
                      if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        s1 = peg$currPos;
                        peg$silentFails++;
                        if (input.charCodeAt(peg$currPos) === 34) {
                          s2 = peg$c82;
                          peg$currPos++;
                        } else {
                          s2 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$expected(peg$c83, peg$currPos); }
                        }
                        if (s2 === peg$FAILED) {
                          if (input.charCodeAt(peg$currPos) === 92) {
                            s2 = peg$c122;
                            peg$currPos++;
                          } else {
                            s2 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$expected(peg$c123, peg$currPos); }
                          }
                        }
                        peg$silentFails--;
                        if (s2 === peg$FAILED) {
                          s1 = peg$c121;
                        } else {
                          peg$currPos = s1;
                          s1 = peg$c0;
                        }
                        if (s1 !== peg$FAILED) {
                          s2 = peg$parseanychar();
                          if (s2 !== peg$FAILED) {
                            peg$reportedPos = s0;
                            peg$userFail = false;
                            s1 = peg$c124(s2);
                            if (peg$userFail) { s1 = peg$FAILED; }
                            if (s1 === peg$FAILED) {
                              peg$currPos = s0;
                              s0 = s1;
                            } else {
                              s0 = s1;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parseanychar() {
      var s0;

      if (input.length > peg$currPos) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$expected(peg$c125, peg$currPos); }
      }

      return s0;
    }

    function peg$parsecodepoint() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c126) {
        s1 = peg$c126;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$expected(peg$c127, peg$currPos); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsehexa();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsehexa();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsehexa();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsehexa();
              if (s5 !== peg$FAILED) {
                s1 = [s1, s2, s3, s4, s5];
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsehexa() {
      var s0;

      if (peg$c128.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$expected(peg$c129, peg$currPos); }
      }

      return s0;
    }

    function peg$parsespaces() {
      var s0, s1;

      s0 = [];
      s1 = peg$parsespace();
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        s1 = peg$parsespace();
      }

      return s0;
    }

    function peg$parsespace() {
      var s0;

      if (peg$c130.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$expected(peg$c131, peg$currPos); }
      }

      return s0;
    }


        var builders = require('./builders.js');


    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      throw peg$buildException();
    }
  }

  return {
    SyntaxError: SyntaxError,
    parse:       parse
  };
})();

},{"./builders.js":1}]},{},[])