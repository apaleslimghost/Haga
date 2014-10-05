var flatten   = require('flat').flatten;
var path      = require('path');
var mkdirp    = require('mkdirp');
var asyncEach = require('async-each');

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

var files = scaffoldToPaths('foo', getScaffold().files);
asyncEach(Object.keys(files).map(path.dirname), mkdirp, console.log);
