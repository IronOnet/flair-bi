(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('Register', Register);

    Register.$inject = ['$resource'];

    function Register($resource) {
        return $resource('api/register', {}, {});
    }
})();
