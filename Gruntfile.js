/* global module,require,console */
module.exports = function(grunt) {
  var path = require('path');
  var glob = require('glob');
  var fs = require('fs');
  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);
  // Time how long tasks take. Can help when optimizing build times
  //require('time-grunt')(grunt); // Not installed

  var MODULE_NAME = 'atlas';
  var SRC_DIR = 'src';
  var LIB_DIR = 'lib';
  var DIST_DIR = 'dist';
  var JSDOCS_DIR = 'jsdocs';
  var BUILD_DIR = 'build';
  var README_FILE = 'README.md';
  var RESOURCES_DIR = 'resources';
  var RESOURCES_BUILD_PATH = distPath(RESOURCES_DIR);
  var RE_AMD_MODULE = /\b(?:define|require)\s*\(/;
  var MAIN_FILE = srcPath('main.js');
  var BUILD_FILE = buildPath('build.js');
  var BUILD_OUTPUT_PATH = distPath(MODULE_NAME + '.min.js');
  var JQUERY_LIB_PATH = libPath('jquery.js');
  var STYLE_FILE = MODULE_NAME + '.less';
  var STYLE_BUILD_FILE = MODULE_NAME + '.min.css';
  var OPEN_LAYERS_CONFIG_FILE = 'atlas.openlayers.cfg';
  var OPEN_LAYERS_PATH = libPath('Openlayers');
  var OPEN_LAYERS_BUILD_PATH = path.join(OPEN_LAYERS_PATH, 'build');
  var OPEN_LAYERS_BUILD_OUTPUT_FILE = 'OpenLayers.js';
  var OPEN_LAYERS_BUILD_OUTPUT_PATH = path.join(OPEN_LAYERS_BUILD_PATH,
      OPEN_LAYERS_BUILD_OUTPUT_FILE);
  var LCOV_REPORT_PATH = 'coverage/lcov.dat';

  require('logfile-grunt')(grunt, {filePath: buildPath('grunt.log'), clearLogFile: true});
  // Define the configuration for all the tasks.
  grunt.initConfig({

    shell: {
      // Installs all NodeJS dependencies.
      installNpmDep: {
        options: {
          stdout: true
        },
        command: 'npm install --cache-min 999999999'
      },

      // Installs all Bower dependencies.
      installBowerDep: {
        options: {
          stdout: true
        },
        command: 'bower install'
      },

      // Updates all NodeJS dependencies.
      updateNpmDep: {
        options: {
          stdout: true
        },
        command: 'npm update'
      },

      // Updates all Bower dependencies.
      updateBowerDep: {
        options: {
          stdout: true
        },
        command: 'bower update'
      },

      // Compiles JSDoc from JS source files.
      jsDoc: {
        options: {
          stdout: true
        },
        command: path.join('node_modules', '.bin', 'jsdoc') + ' -c jsdoc.conf.json -l ' +
            README_FILE
      },

      // Compile JS source files.
      build: {
        options: {
          stdout: false, stderr: true, failOnError: true
        },
        command: 'node node_modules/requirejs/bin/r.js -o ' + BUILD_FILE + ' optimize=none'
      },

      buildMinify: {
        options: {
          stdout: false, stderr: true, failOnError: true
        },
        command: 'node node_modules/requirejs/bin/r.js -o ' + BUILD_FILE
      },

      buildOpenLayers: {
        options: {
          stdout: true, stderr: true, failOnError: true
        },
        command: [
              'cd ' + OPEN_LAYERS_BUILD_PATH,
              'python ./build.py -c none ' + OPEN_LAYERS_CONFIG_FILE.replace(/\.cfg$/, '') + ' ' +
              OPEN_LAYERS_BUILD_OUTPUT_FILE
        ].join('&&')
      }
    },

    copy: {
      bowerDep: {
        files: [
          {src: libPath('Requirejs', 'require.js'), dest: libPath('require.js')},
          {src: libPath('tinycolor', 'tinycolor.js'), dest: libPath('tinycolor.js')},
          {src: libPath('Keycode', 'keycode.js'), dest: libPath('keycode.js')},
          {src: libPath('numeraljs', 'min', 'numeral.min.js'), dest: libPath('numeral.js')},
          {src: libPath('q', 'q.js'), dest: libPath('Q.js')},
          {src: libPath('graham_scan', 'src',
              'graham_scan.js'), dest: libPath('ConvexHullGrahamScan.js')},
          {src: libPath('jquery', 'dist', 'jquery.min.js'), dest: JQUERY_LIB_PATH}
        ]
      },
      openLayersBuildConfig: {
        files: [
          {src: buildPath(OPEN_LAYERS_CONFIG_FILE), dest: path.join(OPEN_LAYERS_BUILD_PATH,
              OPEN_LAYERS_CONFIG_FILE)}
        ]
      },
      openLayersBuildOutput: {
        files: [
          {src: OPEN_LAYERS_BUILD_OUTPUT_PATH, dest: libPath(OPEN_LAYERS_BUILD_OUTPUT_FILE)}
        ]
      },
      resources: {
        files: [
          {
            expand: true,
            cwd: RESOURCES_DIR,
            src: '**/*',
            dest: RESOURCES_BUILD_PATH
          }
        ]
      }
    },

    less: {
      dist: {
        options: {
          cleancss: true,
          relativeUrls: true
        },
        files: [
          {
            src: path.join(RESOURCES_DIR, STYLE_FILE),
            dest: path.join(RESOURCES_BUILD_PATH, STYLE_BUILD_FILE)
          }
        ]
      }
    },

    clean: {
      doc: {
        files: [
          {
            expand: true,
            cwd: JSDOCS_DIR,
            src: [
              path.join('**', '*')
            ]
          }
        ]
      },
      dist: {
        files: [
          {
            dot: true,
            cwd: DIST_DIR,
            src: [
              distPath('**', '*')
            ]
          }
        ]
      },
      resourcesLess: {
        // Remove the .less source file from the copied resources, leaving everything else.
        files: [
          {
            expand: true,
            cwd: RESOURCES_BUILD_PATH,
            src: STYLE_FILE
          }
        ]
      }
    },

    karma: {
      options: {
        configFile: 'test/karma.conf.js',
        runnerPort: 9876
      },
      unit: {
        browsers: ['Firefox', 'Chrome']
      },
      local: {
        browsers: ['Firefox'],
        preprocessors: []
      },
      continuous: {
        singleRun: true,
        browsers: ['PhantomJS']
      },
      debug: {
        // Click DEBUG on Karma page and open Dev Tools. Refresh to re-run.
        browsers: [],
        singleRun: false,
        // Ensures source files are readable.
        preprocessors: []
      }
    },

    sed: {
      // The karma coverage outputs source file names (SF) as "./atlas/src/..."
      // Sonar-runner expects source file names to be "src/..."
      fixCoverageOutput: {
        path: LCOV_REPORT_PATH,
        pattern: './atlas/src',
        replacement: 'src'
      }
    }
  });

  grunt.registerTask('compile-imports', 'Builds a RequireJS script to import all source files ' +
      'which are AMD modules.', function() {
    console.log('Compiling modules for importing...');
    var findResults = findAmdModules(SRC_DIR);
    var modules = findResults.modules;
    var notModules = findResults.notModules;

    modules = modules.filter(function(file) {
      return srcPath(file) !== MAIN_FILE;
    });
    if (modules.length > 0) {
      console.log('Modules:');
      modules.forEach(function(file) {
        console.log(' ' + file);
      });
    }
    if (notModules.length > 0) {
      console.log('\nNot Modules:');
      notModules.forEach(function(file) {
        console.log(' ' + file);
      });
    }
    console.log('');

    var moduleIds = modules.map(function(module) {
      return MODULE_NAME + '/' + module.replace(/\.js$/, '');
    });
    var mainFile = '// This file is generated automatically - avoid modifying manually.\n' +
        "require(['" + moduleIds.join("', '") + "']);\n";
    console.log('Writing to', MAIN_FILE);
    fs.writeFileSync(MAIN_FILE, mainFile);
    console.log('Compilation complete');
  });

  grunt.registerTask('fix-openlayers-build', 'Fixes the built OpenLayers file to be compatible' +
      'with AMD.', function() {
    writeFile(OPEN_LAYERS_BUILD_OUTPUT_PATH, function(data) {
      // Remove "var" to always define in global scope even if wrapped in closure).
      data = data.replace(/^var\s*(OpenLayers\s*=)/m, '$1');
      // Add AMD module definition.
      data = wrapAmdDefine(data, 'OpenLayers');
      return data;
    });
  });

  grunt.registerTask('fix-build-nodejs', 'Fixes build to work with NodeJS.', function() {
    // Creates a closure around the build and shim client-side variables.
    var fixes = readFile(path.join(BUILD_DIR, 'nodeJsFixes.js'));
    writeFile(BUILD_OUTPUT_PATH, function(data) {
      return fixes.replace('// EXISTING CODE GOES HERE', data);
    });
  });

  grunt.registerTask('fix-jquery', 'Fixes jQuery to prevent issues with running in non-brower' +
      'environments.', function() {
    var fixes = readFile(path.join(BUILD_DIR, 'jQueryFixes.js'));
    writeFile(JQUERY_LIB_PATH, function(data) {
      return fixes.replace('// EXISTING CODE GOES HERE', data);
    });
  });

  grunt.registerTask('set-build-env', 'Sets the build environment.', function() {
    writeFile(BUILD_OUTPUT_PATH, function(data) {
      data = data.replace(/_environment\s*:\s*([^\r\n,.]+\.)\w+(,?)/,
              '_environment:$1' + 'PRODUCTION' + '$2');
      return data;
    });
  });

  grunt.registerTask('install', 'Installs dependencies.',
      ['shell:installNpmDep', 'shell:installBowerDep', 'install-openlayers', 'copy:bowerDep',
      'fix-jquery']);
  grunt.registerTask('update', 'Updates dependencies.',
      ['shell:updateNpmDep', 'shell:updateBowerDep']);
  grunt.registerTask('build', 'Builds the app into a distributable package.', function() {
    var args = arguments;
    var tasks = [];
    var addTasks = function() {
      Array.prototype.slice.apply(arguments).forEach(function(task) {
        tasks.push(task);
      });
    };
    var hasArgs = function(arg) {
      return Object.keys(args).some(function(argIndex) {
        var value = args[argIndex];
        return value === arg;
      });
    };
    addTasks('compile-imports', 'clean:dist');
    hasArgs('no-minify') ? addTasks('shell:build') : addTasks('shell:buildMinify');
    addTasks('set-build-env', 'less', 'copy:resources', 'clean:resourcesLess');
    addTasks('fix-build-nodejs');
    console.log('Running tasks', tasks);
    tasks.forEach(function(task) {
      grunt.task.run(task);
    });
  });

  grunt.registerTask('doc', 'Generates documentation.', ['clean:doc', 'shell:jsDoc']);

  grunt.registerTask('install-openlayers', 'Installs OpenLayers with a custom build.',
      ['copy:openLayersBuildConfig', 'shell:buildOpenLayers', 'fix-openlayers-build',
        'copy:openLayersBuildOutput']);

  grunt.registerTask('test', 'Runs defined tests', ['force:karma:unit', 'sed:fixCoverageOutput']);

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // AUXILIARY
  //////////////////////////////////////////////////////////////////////////////////////////////////

  function findAmdModules(dir) {
    var files = glob.sync('**/*.js', {cwd: dir});
    var modules = [];
    var notModules = [];
    files.forEach(function(file) {
      var target = isAmdModule(path.join(dir, file)) ? modules : notModules;
      target.push(file);
    });
    modules.sort();
    notModules.sort();
    return {
      modules: modules,
      notModules: notModules
    };
  }

  function isAmdModule(file) {
    var data = readFile(file);
    return RE_AMD_MODULE.test(data);
  }

  /**
   * Wraps an AMD definition around the given script.
   * @param {String} script
   * @param {String} returnStr
   */
  function wrapAmdDefine(script, returnStr) {
    returnStr = returnStr ? ';return ' + returnStr + ';' : '';
    return 'define([],function(){' + script + returnStr + '});';
  }

  // FILES

  function readFile(file) {
    return fs.readFileSync(file, {encoding: 'utf-8'});
  }

  function writeFile(file, data) {
    if (typeof data === 'function') {
      data = data(readFile(file));
    }
    fs.writeFileSync(file, data);
  }

  function _prefixPath(dir, args) {
    var prefixedArgs = Array.prototype.slice.apply(args);
    prefixedArgs.unshift(dir);
    return path.join.apply(path, prefixedArgs);
  }

  function srcPath() {
    return _prefixPath(SRC_DIR, arguments);
  }

  function libPath() {
    return _prefixPath(LIB_DIR, arguments);
  }

  function distPath() {
    return _prefixPath(DIST_DIR, arguments);
  }

  function buildPath() {
    return _prefixPath(BUILD_DIR, arguments);
  }

};
