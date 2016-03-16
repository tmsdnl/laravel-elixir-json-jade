var elixir          = require('laravel-elixir');
var gulp            = require('gulp');
var jade;
var rename          = require('gulp-rename');
var plumber         = require('gulp-plumber');
var notify          = require('gulp-notify');
var changed         = require('gulp-changed');
var jadeInheritance = require('gulp-jade-inheritance');
var _               = require('underscore');

var data            = require('gulp-data');
var lodash          = require('lodash');
var path            = require('path');
var fs              = require('fs');

var Task = elixir.Task;

/*
 |----------------------------------------------------------------
 | Gulp Jade Wrapper
 |----------------------------------------------------------------
 |
 | This task will compile your Jade files into your views folder.
 | You can make use of Blade variables in your jade files as well.
 | Examples see README.md
 |
 */

elixir.extend('jade', function (options) {

    options = _.extend({
        baseDir: './resources',
        blade: true,
        html: false,
        dest: '/views/',
        pretty: true,
        search: '**/*.jade',
        src: '/jade/',
        jadephp: false
    }, options);

    jade = options.jadephp ? require('gulp-jade-php') : require('gulp-jade');

    var gulp_src = options.baseDir + options.src + options.search;

    var jade_options = _.pick(
        options,
        'filename',
        'doctype',
        'pretty',
        'self',
        'debug',
        'compileDebug',
        'compiler'
    );

    jade_options.basedir = options.baseDir + options.src;

    var gulp_dest = options.baseDir + options.dest;

    var extension;
    if(typeof options.extension === 'string') {
        extension = options.extension;
        if(extension.slice(0,1)!=='.') {
            extension = '.' + extension;
        }
    } else {
        extension = (options.html === true ? '.html' : (options.blade === true ? '.blade.php' : '.php'));
    }


    var getJsonData = function(file) {
        var fileData = path.parse(file.path);
        var splitted = fileData.dir.split('/');
        fileData.lang = splitted.pop();

        if (fileData.lang.length !== 2) {
            fileData.lang = splitted.pop();
        }

        var pathGroupLang   = 'resources/assets/translates/blocks/' + fileData.lang + '/',
            configJson      = JSON.parse(fs.readFileSync('resources/assets/translates/config.json')),
            filesToConcat   = configJson['general'].concat(configJson[fileData.lang][fileData.name]);

        var json = {};

        for(var i = 0; i < filesToConcat.length; i++) {
            json = lodash.assign(json, JSON.parse(fs.readFileSync(pathGroupLang + filesToConcat[i])));
        }

        return json;
    };


    new Task('jade', function() {
        return gulp.src(gulp_src)
            .pipe(plumber())
            //.pipe(changed(gulp_dest, {extension: extension}))
            .pipe(jadeInheritance({basedir: options.baseDir + options.src }))
            .pipe(data(getJsonData))
            .pipe(jade(jade_options))
            .pipe(rename(function (path) {
                path.extname = extension;
            }))
            .pipe(gulp.dest(gulp_dest))
            .pipe(notify({
                title: 'Jade completed',
                message: '<%= file.relative %> have been compiled.',
                icon: __dirname + '/../laravel-elixir/icons/pass.png'
            }));
    })
        .watch([ options.baseDir + options.src + options.search ]);

});
