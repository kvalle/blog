#!/usr/bin/env node

var fs = require('fs'),
    marked = require('marked'),
    path = require('path'),
    yaml_front = require('yaml-front-matter'),
    _ = require('underscore'),
    q = require('promised-io'),
    colorize = require('colorize');

var published_path = './posts/published';
var public_path = './public';
var posts_path = public_path + '/posts';

var post_template = _.template(fs.readFileSync('templates/post.html', 'utf-8'));
var index_template = _.template(fs.readFileSync('templates/index.html', 'utf-8'));

function success(filename) {
    var message = colorize.ansify('#green[\u2713] Processed %s')
    console.log(message, filename)
}

function failure(filename, error) {
    var message = colorize.ansify('#red[\u2717] Processing of %s failed.\n  %s')
    console.log(message, filename, error)
}

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
        try {
            var meta = parse(data);
        } catch (err) {
            failure(filename, err);
            return false;
        }
        meta['from_path'] = published_path+'/'+filename;
        var base = path.basename(filename, '.md');
        meta['to_path'] = posts_path+'/'+base+'.html';
        meta['title'] = meta.title || base.replace(/-/g, " ");
        meta['href'] = '/posts/'+base+'.html'

        fs.writeFile(meta.to_path, post_template({markdown : meta['markdown']}), function(err) {
            if (err) throw err;
            success(filename);
        });

        delete meta.markdown
        delete meta.__content
        return meta;
    }
}

function error(filename) {
    return function(err) {
        failure(filename, err);
        return false
    }
}

var files = fs.readdirSync(published_path);
var posts = []

for (var i=0; i<files.length; i++) {
    var filename = files[i];
    var promise = q.execute(fs.readFile, published_path+'/'+filename, 'utf-8');
    posts[i] = q.whenPromise(promise, process(filename), error(filename));
}

q.all(posts).then(function(posts) {
    posts = posts.filter(function (p) {return p})
    //console.log(posts);
    var html = index_template({blogposts : posts})
    var path = public_path+'/index.html'
    fs.writeFile(path, html, function(err) {
        if (err) throw err;
        success(path);
    });
})
