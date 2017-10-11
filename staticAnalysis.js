'use strict';

const Compiler = require('./compiler.js');
const request = require('request');
const swarmgw = require('swarmgw');
const StaticAnalysisRunner = require('./staticAnalysisRunner.js');
const list = require('./modules/list');

const filesProviders = {};

function fileProviderOf (file) {
  var provider = file.match(/[^/]*/);

  if (provider !== null) {
    return filesProviders[provider[0]];
  }

  return null;
}

function handleGithubCall (root, path, cb) {
  request.get({
    url: 'https://api.github.com/repos/' + root + '/contents/' + path,
    json: true
  }, (err, response, data) => {
    if (err) {
      return cb(err || 'Unknown transport error');
    }

    if ('content' in data) {
      cb(null, new Buffer((data.content, 'base64').toString('ascii')));
    } else {
      cb('Content not received');
    }
  });
}

function handleSwarmImport (url, cb) {
  swarmgw.get(url, cb);
}

function handleIPFS (url, cb) {
  // replace ipfs:// with /ipfs/
  url = url.replace(/^ipfs:\/\/?/, 'ipfs/');

  request.get({
    url: 'https://gateway.ipfs.io/' + url
  }, (err, response, data) => {
    if (err) {
      return cb(err || 'Unknown transport error');
    }

    cb(null, data);
  });
}

function handleImportCall (url, cb) {
  var provider = fileProviderOf(url);

  if (provider && provider.exists(url)) {
    return provider.get(url, cb);
  }

  var handlers = [
    {
      match: /^(https?:\/\/)?(www.)?github.com\/([^/]*\/[^/]*)\/(.*)/,
      handler: function (match, handlerCb) {
        handleGithubCall(match[3], match[4], handlerCb);
      }
    },
    {
      match: /^(bzz[ri]?:\/\/?.*)$/,
      handler: function (match, handlerCb) {
        handleSwarmImport(match[1], handlerCb);
      }
    },
    {
      match: /^(ipfs:\/\/?.+)/,
      handler: function (match, handlerCb) {
        handleIPFS(match[1], handlerCb);
      }
    }
  ];

  var found = false;

  handlers.forEach(function (handler) {
    if (found) {
      return;
    }

    var match = handler.match.exec(url);

    if (match) {
      found = true;

      handler.handler(match, function (err, content) {
        if (err) {
          cb('Unable to import "' + url + '": ' + err);
          return;
        }

        // FIXME: at some point we should invalidate the cache
        // filesProviders['browser'].addReadOnly(url, content);

        cb(null, content);
      });
    }
  });

  if (found) {
    return;
  } else if (/^[^:]*:\/\//.exec(url)) {
    cb('Unable to import "' + url + '": Unsupported URL schema');
  } else {
    cb('Unable to import "' + url + '": File not found');
  }
}

function staticAnalysis(cb) {
  this.compiler = new Compiler(handleImportCall);
  this.compiler.loadVersion();

  this.runner = new StaticAnalysisRunner();

  this.compiler.event.register('compilationFinished', (success, compilationResult) => {
    if (!success) {
      throw new Error();
    }

    var compilationErrors = this.compiler.lastCompilationResult.data.errors || [];

    if (compilationErrors.length > 0) {
      console.log("Compilation Errors/Warnings: ");
    }
    for (var ii = 0; ii < compilationErrors.length; ii++) {
      var error = compilationErrors[ii];
      var bits = error.split(": ");
      console.log(bits.shift());
      console.log(bits.join(": "));
    }

    this.run(compilationResult, cb);
  });
}

staticAnalysis.prototype.run = function (compilationResult) {
  var selected = [];
  for (var ii = 0; ii < list.length; ii++) {
    selected.push(ii);
  }

  this.runner.run(compilationResult, selected, function (results) {
    results.map(function (result) {
      result.report.map(function (item) {
        var cleanWarning = item.warning;
        // XXX: quick fix for the terminal
        cleanWarning = cleanWarning
            .replace("<i>","")
            .replace("</i>","")
            .replace("<br />", "")
            .replace("<i>","`")
            .replace("</i>","`")
            .replace("<i>","`")
            .replace("<i>","`")
            .replace("</i>","`")
            .replace("</i>","`");

        console.log("warning:\n", cleanWarning);
      });
    });
  });
};

module.exports = staticAnalysis;
