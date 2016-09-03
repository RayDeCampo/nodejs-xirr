module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json')
    });
    require('jit-grunt')(grunt);

    /////////////////////////// JSHINT ///////////////////////////////////////
    grunt.config('jshint', {
        options: {
            eqeqeq: true,
            node: true,
            strict: true,
            undef: true,
            unused: 'vars'
        },
        all: ['**/*.js', '!node_modules/**']
    });

    grunt.config('mochaTest', {
        test: {
            src: ['test/**/*.js']
        }
    });

    grunt.config('watch', {
        all: {
            files: ['**/*.js', '!node_modules/**'],
            tasks: ['jshint', 'mochaTest']
        }
    });

    grunt.registerTask('default', ['jshint', 'mochaTest', 'watch']);
};
