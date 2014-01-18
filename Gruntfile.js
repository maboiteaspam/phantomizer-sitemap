module.exports = function(grunt) {


    var wrench = require('wrench'),
        util = require('util');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        docco: {
            debug: {
                src: [
                    'tasks/build.js'
                ],
                options: {
                    layout:'linear',
                    output: 'documentation/'
                }
            }
        },
        'gh-pages': {
            options: {
                base: '.',
                add: true
            },
            src: ['documentation/**']
        },
        'phantomizer-sitemap': {
            options: {
            },
            "test":{
                "options":{
                    routing:[
                        {
                            "template":"/category.htm",
                            "test_url":"/some/category.htm",
                            "tests":[
                                "tests/module-name"
                            ],
                            "urls_file":"data/collection-of-urls.json"
                        },
                        {
                            "template":"/templated-page.htm",
                            "tests":[
                                "tests/module-name"
                            ],
                            sitemap:false
                        }
                    ]
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-docco');
    grunt.loadNpmTasks('grunt-gh-pages');
    grunt.loadTasks('tasks');

    grunt.registerTask('cleanup-grunt-temp', [],function(){
        wrench.rmdirSyncRecursive(__dirname + '/.grunt', !true);
        wrench.rmdirSyncRecursive(__dirname + '/documentation', !true);
    });
    grunt.registerTask('default', ['docco','gh-pages', 'cleanup-grunt-temp']);
    grunt.registerTask('sitemap', ['phantomizer-sitemap']);

};