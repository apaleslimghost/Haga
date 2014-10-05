var fs         = require('fs');
var flatten    = require('flat').flatten;
var path       = require('path');
var mkdirp     = require('mkdirp');
var xtend      = require('xtend');
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

function objMap(obj, fn) {
	var out = {};
	for(var p in obj) if(obj.hasOwnProperty(p)) {
		out[p] = fn(p, obj[p], obj);
	}
	return out;
}

function asyncObjMap(obj, fn, cb) {
	var out = {}, l = Object.keys(obj).length, erred = false;
	for(var p in obj) {
		fn(p, obj[p], asyncEarlyError(function(e) {
			if(!erred) {
				erred = true;
				cb(e);
			}
		}, function(y) {
			out[p] = y;
			if(Object.keys(out).length === l) {
				cb(null, out);
			}
		}));
	}
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

			asyncObjMap(templated, fs.writeFile, cb);
		}));
	}));
}

scaffold('foo', 'bar', console.log);

