#!/usr/bin/env node

// enables use of `require(path-to-yml-file)`
require('js-yaml'); 

var fs = require('fs'),
    marked = require('marked'),
    path = require('path'),
    _ = require('underscore'),
    colorize = require('colorize'),
    pygmentize = require('pygments').colorize,
    util = require('util'),
    promises = require("node-promise");
    
var published_path = './posts';
var public_path = './public';
var posts_path = public_path + '/posts';

var post_template = _.template(fs.readFileSync('templates/post.html', 'utf-8'));
var index_template = _.template(fs.readFileSync('templates/index.html', 'utf-8'));

var markedOptions = {
    highlight: function (code, lang, callback) {
        pygmentize(code, lang, 'html', function(data) {
            callback(null, data);
        });
    }
};

function success(filename) {
    console.log(colorize.ansify('#green[\u2713] %s'), filename)
}

function warning(warning) {
    console.log(colorize.ansify('#yellow[\u2717] %s'), warning)
}

function failure(filename, error) {
    console.log(colorize.ansify('#red[\u203D] %s\n  \u21D2 %s'), filename, error)
}

function title_from_filename(base) {
    title = base.replace(/-/g, " ");
    return title[0].toUpperCase() + title.slice(1);
}

function removeOldHtmlFiles() {
    fs.unlinkSync(public_path + '/index.html');
    _.each(fs.readdirSync(posts_path), function(file) {
        if (path.extname(file) == ".html") {
            fs.unlinkSync(posts_path + '/' + file);
        }
    });
}

function writePostAsHtml(post) {
    if (!post) {
        return;
    }
    var base = post.filename;
    var html = post_template({post : post});
    fs.writeFile(posts_path+'/'+base+'.html', html, function(err) {
        if (err) {
            failure(post.filename, err);
        } else {
            success(post.filename);
        }
    });
}

function listPostFilesSync() {
    var files = fs.readdirSync(published_path);
    files = _.filter(files, function(name) {
        return path.extname(name) == ".yml"
    });
    return _.map(files, function(name) {
        return path.basename(name, '.yml')
    })
}

function processPostData(metadata_file) {
    var promise = new promises.Promise();
    try {
        var post = require(published_path + '/' + metadata_file + ".yml");
    } catch (ex) {
        failure(metadata_file, "Could not parse metadata.");    
        promise.reject(false);
    }
    if (!post) {
        failure(metadata_file, "Metadata (yml) file empty.");
        promise.reject(false);
    }
    if (!post.date) {
        failure(metadata_file, "No date specified.");
        promise.reject(false);
    }
    
    post['filename'] = path.basename(metadata_file, '.yml');
    post['date_string'] = post.date.toDateString();
    post['title'] = post.title || title_from_filename(post.filename);
    post['href'] = post.external || '/posts/'+ post.filename +'.html'
    if (post.description) {
        post['description'] = marked(post.description);
    }

    if (!post.external) {
        var md_file = published_path + '/' + metadata_file + '.md';
        var text = fs.readFileSync(md_file, 'utf-8');
        marked(text, markedOptions, function(err, html) {
            if (err) {
                failure(posts.filename, err);
                promise.reject(false);
            }
            post['markdown'] = html;
            promise.resolve(post);
        });
    } else {
        //failure(post.filename, "later som om noe gikk galt her");
        promise.resolve(post);
    }

    return promise;
}

function createIndexPage(posts) {
    posts = _.filter(posts, _.identity);
    var sortedPosts = posts.sort(function(p1, p2) {return (p2.date - p1.date)});
    var html = index_template({blogposts : sortedPosts})
    var path = public_path+'/index.html'
    fs.writeFile(path, html, function(err) {
        if (err) throw err;
        success("index page");
    });
}

(function main() {
    removeOldHtmlFiles();
    var listOfPromises = _.map(listPostFilesSync(), function(filename) {
        return processPostData(filename);
    });
    var allPostsPromise = promises.all(listOfPromises);
    allPostsPromise.then(function(posts) {
        _.each(posts, writePostAsHtml);
        createIndexPage(posts);
    });
})();
