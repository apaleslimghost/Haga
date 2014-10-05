var fs         = require('fs');
var flatten    = require('flat').flatten;
var path       = require('path');
var mkdirp     = require('mkdirp');
var xtend      = require('xtend');
var objMap     = require('obj-map');
var asyncEach  = require('async-each');
var promptFor  = require('prompt-for');
var handlebars = require('handlebars');
var asyncEarlyError = require('async-early-error');

var testScaf = {
	prompt: ['name'],
	files: {
		'Makefile': 'lol',
		'test': {
			'bar.js': 'baz'
		}
	}
};

function getScaffold(name) {
	return testScaf;
}

function dynKey(key, value) {
	var obj = {};
	obj[key] = value;
	return obj;
}

function scaffoldToPaths(folder, scaffoldFiles) {
	return flatten(dynKey(folder, scaffoldFiles), {delimiter: '/'})
}

function mkdirs(dirs, cb) {
	asyncEach(dirs, mkdirp, cb);
}

function scaffold(folder, template, cb) {
	var scaf  = getScaffold(template);
	var files = scaffoldToPaths('foo', getScaffold().files);
	var dirs  = Object.keys(files).map(path.dirname);

	var handleError = asyncEarlyError(cb);

	promptFor(scaf.prompt, {color: 'cyan'}, handleError(function(answers) {
		mkdirs(dirs, handleError(function() {
			var templated = objMap(files, function(file, template) {
				return handlebars.compile(template)(xtend(answers, {file: file}));
			});

			objMap.async(templated, fs.writeFile, cb);
		}));
	}));
}

module.exports = scaffold;

