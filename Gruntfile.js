/*global module:false*/
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.repository.url%> */',

        // Task configuration.
        exec: {
            generate: {
                cmd: 'node generate/generate.js'
            },
            gzSize: {
                cmd: 'cat mobile-detect.min.js | gzip -9f | wc -c'
            }
        },
        jasmine_node: {
            specNameMatcher: "spec", // load only specs containing specNameMatcher
            projectRoot: ".",
            requirejs: false,
            forceExit: true,
            jUnit: {
                report: false,
                savePath: "./build/reports/jasmine/",
                useDotNotation: true,
                consolidate: true
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: 'mobile-detect.js',
                dest: 'mobile-detect.min.js'
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            lib_test: {
                src: ['generate/mobile-detect.template.js', 'tests/spec/*.js']
            }
        },
        jsdoc: {
            dist: {
                src: ['<%= uglify.dist.src %>'],
                options: {
                    destination: '../mobile-detect.js@gh-pages/doc',
                    //template: "default",
                    encoding: "utf8",
                    "private": false,
                    lenient: true
                }
            }
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            lib_test: {
                files: '<%= jshint.lib_test.src %>',
                tasks: ['jshint:lib_test', 'jasmine_node']
            }
        },
        copy: {
            jsdelivr: {
                files: [
                    {
                        expand: true,
                        src: [
                            'mobile-detect.min.js',
                            'mobile-detect.js',
                            'mobile-detect-modernizr.js'
                        ],
                        dest: '../jsdelivr/files/mobile-detect.js/<%= pkg.version %>/'
                    }
                ]
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Default task.
    grunt.registerTask('default',  ['jshint', 'exec:generate', 'jasmine_node', 'uglify', 'exec:gzSize']);
    grunt.registerTask('skip-tests',  ['jshint', 'exec:generate', 'uglify', 'exec:gzSize']);
    grunt.registerTask('dev',      ['jshint']);
    grunt.registerTask('gh-pages', ['jshint', 'exec:generate', 'jsdoc']);
    grunt.registerTask('jsdelivr', ['copy:jsdelivr']);
};
