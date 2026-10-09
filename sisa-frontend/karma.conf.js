// Stable, single-run configuration for local headless execution and CI.
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false
    },
    jasmineHtmlReporter: {
      suppressAll: true
    },
    reporters: ['progress', 'kjhtml'],
    browsers: ['ChromeHeadless'],
    captureTimeout: 60000,
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 0,
    browserNoActivityTimeout: 60000,
    restartOnFileChange: true
  });
};
