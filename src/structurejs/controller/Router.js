/*
 * Copyright (c) 2013 Robert S. https://github.com/codeBelt/StructureJS
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
 * OR OTHER DEALINGS IN THE SOFTWARE.
 */
define(function (require, exports, module) { // jshint ignore:line
    'use strict';

    // Imports
    var Route = require('structurejs/controller/Route');
    var RouteEvent = require('structurejs/event/RouteEvent');

    var Router = (function () {
        function Router() {
            Router.enable();
        }
        /**
         * YUIDoc_comment
         *
         * @method add
         * @public static
         */
        Router.add = function (path, callback, scope) {
            Router.enable();

            var route = new Route(path, callback, scope);

            Router._routes.push(route);
        };

        /**
         * YUIDoc_comment
         *
         * @method remove
         * @public static
         */
        Router.remove = function (path, callback, scope) {
            var route;

            for (var i = Router._routes.length - 1; i >= 0; i--) {
                route = Router._routes[i];
                if (route.path === path && route.callback === callback && route.callbackScope === scope) {
                    Router._routes.splice(i, 1);
                }
            }
        };

        /**
         * Gets the hash url minus the # or #! symbol(s).
         * @example
         * //
         *
         * @method getHash
         * @public static
         * @return {string}
         */
        Router.getHash = function () {
            var hash = Router.WINDOW.location.hash;
            var strIndex = (hash.substr(0, 2) === '#!') ? 2 : 1;

            return hash.substring(strIndex);
        };

        Router.enable = function () {
            if (Router._isEnabled === true)
                return;

            if (Router.WINDOW.addEventListener) {
                Router.WINDOW.addEventListener('hashchange', Router.onHashChange, false);
            } else {
                Router.WINDOW.attachEvent('onhashchange', Router.onHashChange);
            }

            Router._isEnabled = true;
        };


        Router.start = function () {
            setTimeout(Router.onHashChange);
        };

        Router.disable = function () {
            if (Router._isEnabled === false)
                return;

            if (Router.WINDOW.removeEventListener) {
                Router.WINDOW.removeEventListener('hashchange', Router.onHashChange);
            } else {
                Router.WINDOW.detachEvent('onhashchange', Router.onHashChange);
            }

            Router._isEnabled = false;
        };

        /**
         * @method navigateTo
         * @param {String} path
         * @param {Boolean} [silent]
         * @chainable
         */
        Router.navigateTo = function (path, silent) {
            //        if (silent === true) {
            //            this.currentPath = path;
            //        }
            if (typeof silent === "undefined") { silent = false; }

            if (Router._isEnabled === false) return;

            if (path.charAt(0) === '#') {
                var strIndex = (path.substr(0, 2) === '#!') ? 2 : 1;
                path = path.substring(strIndex);
            }

            // Enforce starting slash
            if (path.charAt(0) !== '/' && Router.forceSlash === true) {
                path = '/' + path;
            }

            if (Router.useDeepLinking === true)
            {
                if (silent === true) {
                    Router.disable();
                    setTimeout(function () {
                        window.location.hash = path;
                        Router.enable();
                    }, 1);
                } else {
                    setTimeout(function () {
                        window.location.hash = path;
                    }, 1);
                }
            }
            else
            {
                Router.changeRoute(path);
            }
        };

        /**
         * YUIDoc_comment
         *
         * @method onHashChange
         * @param event {HashChangeEvent}
         * @private static
         */
        Router.onHashChange = function (event) {
            if (Router.allowManualDeepLinking === false && Router.useDeepLinking === false) return;

            var hash = Router.getHash();

            Router.changeRoute(hash);
        };

        /**
         * YUIDoc_comment
         *
         * @method changeRoute
         * @private static
         */
        Router.changeRoute = function (hash) {
            var routeLength = Router._routes.length;
            var route;
            var match;

            for (var i = 0; i < routeLength; i++) {
                route = Router._routes[i];
                match = route.match(hash);

                if (match !== null) {
                    var routerEvent = new RouteEvent();
                    routerEvent.route = match.shift();
                    routerEvent.data = match.slice(0, match.length);
                    routerEvent.path = route.path;

                    if (event != null) {
                        routerEvent.newURL = event.newURL;
                        routerEvent.oldURL = event.oldURL;
                    }

                    var params = match.slice(0, match.length);
                    params.push(routerEvent);

                    route.callback.apply(route.callbackScope, params);
                }
            }
        };
        Router.WINDOW = window;
        Router._isEnabled = false;
        Router._routes = [];
        Router._hashChangeEvent = null;
        Router.forceSlash = true;
        Router.useDeepLinking = true;
        Router.allowManualDeepLinking = true;
        Router.currentPath = null;
        return Router;
    })();

    module.exports = Router;

});