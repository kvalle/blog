var fs = require('fs');
var marked = require('marked');
var path = require('path');
var yaml_front = require('yaml-front-matter');
var _ = require('underscore');
var q = require('promised-io');

var published_path = './posts/published';
var public_path = './public';
var posts_path = public_path + '/posts';

var post_template = _.template(fs.readFileSync('templates/post.html', 'utf-8'));
var index_template = _.template(fs.readFileSync('templates/index.html', 'utf-8'));

function parse(raw) {
	var meta = yaml_front.loadFront(raw);
	if (!meta) {
		meta = {'__content': raw};
	}
	meta['markdown'] = marked(meta.__content);
	return meta;
}

function process(filename) {
    return function(data) {
    	var meta = parse(data);
		meta['status'] = 'success';
        meta['from_path'] = published_path+'/'+filename;
        var base = path.basename(filename, '.md');
        meta['to_path'] = posts_path+'/'+base+'.html';
        meta['title'] = meta.title || base.replace(/-/g, " ");
        meta['href'] = '/posts/'+base+'.html'

		fs.writeFile(meta.to_path, post_template({markdown : meta['markdown']}), function(err) {
			if (err) throw err;
			console.log('Saved %s', meta.to_path);
		});

		delete meta.markdown
		delete meta.__content
	    return meta;
    }
}

function error(filename) {
    return function(data) {
        return {
            status: 'failed',
            from_path: published_path + '/' + filename,
        }
    }
}

var files = fs.readdirSync(published_path);
var data = []

for (var i=0; i<files.length; i++) {
    var filename = files[i];
    var promise = q.execute(fs.readFile, published_path+'/'+filename, 'utf-8');
    data[i] = q.whenPromise(promise, process(filename), error(filename));
}

q.all(data).then(function(data) {
	console.log(data);
	var html = index_template({blogposts : data})
	fs.writeFile(public_path+'/index.html', html, function(err) {
		if (err) throw err;
		console.log('Saved index.html');
	});
})
