module.exports = function (wallaby) {

    return {
        files: [
            { pattern: 'node_modules/core-js/client/shim.min.js', instrument: false },
            { pattern: 'node_modules/systemjs/dist/system.src.js', instrument: false },
            { pattern: 'node_modules/zone.js/dist/zone.js', instrument: false },
            { pattern: 'node_modules/zone.js/dist/long-stack-trace-zone.js', instrument: false },
            { pattern: 'node_modules/zone.js/dist/async-test.js', instrument: false },
            { pattern: 'node_modules/zone.js/dist/fake-async-test.js', instrument: false },
            { pattern: 'node_modules/zone.js/dist/sync-test.js', instrument: false },
            { pattern: 'node_modules/zone.js/dist/proxy.js', instrument: false },
            { pattern: 'node_modules/zone.js/dist/jasmine-patch.js', instrument: false },

            { pattern: 'wallaby.system.config.js', instrument: false },

            { pattern: 'src/**/*.ts', load: false },
            { pattern: 'src/**/*.css', load: false },
            { pattern: 'src/**/*.html', load: false },
            { pattern: 'src/**/*spec.ts', ignore: true }
        ],

        tests: [
            { pattern: 'src/**/*.spec.ts', load: false }
        ],

        env: {
            kind: 'electron'
        },

        middleware: function (app, express) {
            app.use('/node_modules',
                express.static(
                    require('path').join(__dirname, 'node_modules')));
        },

        debug: true,

        bootstrap: function (wallaby) {
            wallaby.delayStart();

            var testFiles = [];

            Promise.all([
                System.import('@angular/core/testing'),
                System.import('@angular/platform-browser-dynamic/testing'),
                System.import('src/client/app/operators')
            ]).then(function (providers) {
                var testing = providers[0];
                var testingBrowser = providers[1];

                testing.TestBed.initTestEnvironment(
                    testingBrowser.BrowserDynamicTestingModule,
                    testingBrowser.platformBrowserDynamicTesting()
                );

                for (var i = 0, len = wallaby.tests.length; i < len; i++) {
                    testFiles.push((wallaby.tests[i].replace(/\.js$/, '')));
                }

            }).then(function () {
                return Promise.all(
                    testFiles.map(function (test) {
                        return System.import(test).then(function (module) {
                            if (module.hasOwnProperty('main')) {
                                module.main();
                            }
                        })
                    }));
            }).then(function () {
                wallaby.start();
            }).catch(function (e) {
                setTimeout(function () {
                    throw e;
                }, 0);
            });
        }
    };
};
