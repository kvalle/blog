var fs = require('fs');
var marked = require('marked');
var path = require('path');
var yaml_front = require('yaml-front-matter');
var _ = require('underscore');


var published_path = './posts/published';
var public_path = './public/posts';

function get_markdown(raw) {
	var data = yaml_front.loadFront(raw);
	if (data) {
		return marked(data['__content']);
	}
	return marked(raw);
}

function process_file(name) {
	console.log("processing file %s", name);
	fs.readFile(published_path+'/'+name, 'utf-8', function(err, data) {
		var markdown = get_markdown(data);
		var compiled = _.template("<html><head><title>Generated from md by js</title></head><body><%= markdown %></body></html>");
		var content = compiled({markdown : markdown});
		var html_file = path.basename(name, '.md')+'.html';
		var html_path = public_path+'/'+html_file;
		fs.writeFile(html_path, content, function(err) {
			if (err) throw err;
  			console.log('Saved %s', html_path);
		});
	});
}

function process_files(files) {
	for (var i=0; i<files.length; i++) {
		process_file(files[i]);
	}
}

// main

fs.readdir(published_path, function(err, files) {
	if (err) throw err;
	process_files(files);
});
