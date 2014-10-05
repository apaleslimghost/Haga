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

var appriseTemplate = curry(function appriseTemplate(data, file, template) {
	return handlebars.compile(template)(xtend(data, {file: file}));
});

function scaffold(files, data, cb) {
	var dirs = Object.keys(files).map(path.dirname);

	mkdirs(dirs, asyncEarlyError(cb, function() {
		objMap.async(
			objMap(files, appriseTemplate(data)),
			fs.writeFile,
			cb
		);
	}));
}

function haga(folder, template, cb) {
	var scaf  = getScaffold(template);
	var files = scaffoldToPaths(folder, scaf.files);

	promptFor(scaf.prompt, {color: 'cyan'}, asyncEarlyError(cb, function(answers) {
		scaffold(files, answers, cb);
	}));
}

module.exports = haga;

