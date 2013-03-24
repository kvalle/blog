#!/usr/bin/env node

var fs = require('fs'),
    marked = require('marked'),
    path = require('path'),
    yaml_front = require('yaml-front-matter'),
    _ = require('underscore'),
    q = require('promised-io'),
    colorize = require('colorize'),
    highlight = require('highlight.js');

var published_path = './posts';
var public_path = './public';
var posts_path = public_path + '/posts';

var post_template = _.template(fs.readFileSync('templates/post.html', 'utf-8'));
var index_template = _.template(fs.readFileSync('templates/index.html', 'utf-8'));

marked.setOptions({
    langPrefix: "language-",
    highlight: function (code, lang) {
        if (lang) {
            try {
                return highlight.highlight (lang, code).value   
            } catch (ex) {
                warning("Had trouble with code block marked: " + lang);
            }
        }
        return code
    }
});

function success(filename) {
    var message = colorize.ansify('#green[\u2713] %s')
    console.log(message, filename)
}

function warning(warning) {
    var message = colorize.ansify('#yellow[\u2717] %s')
    console.log(message, warning)
}

function failure(filename, error) {
    var message = colorize.ansify('#red[\u203D] %s\n  \u21D2 %s')
    console.log(message, filename, error)
    return false;
}

function parse(raw, filename) {
    try {
        var meta = yaml_front.loadFront(raw);
    } catch (ex) {
        return failure(filename, "Could not parse front matter.");    
    }
    
    if (!meta) {
        return failure(filename, "Could not parse front matter.");
    }
    if (!meta.date) {
        return failure(filename, "No date specified.");
    }
    var base = path.basename(filename, '.md');
    try {
        meta['markdown'] = marked(meta.__content);
    } catch (ex) {
        return failure(filename, "Could not parse markdown.");
    }
    meta['date_string'] = meta.date.toDateString();
    meta['title'] = meta.title || title_from_filename(base);
    meta['href'] = meta.external || '/posts/'+base+'.html'
    if (meta.description) {
        meta['description'] = marked(meta.description);
    }

    return meta;
}

function title_from_filename(base) {
    title = base.replace(/-/g, " ");
    title = title[0].toUpperCase() + title.slice(1);
    return title;
}

function process(filename) {
    return function(data) {
        var meta = parse(data, filename);
        if (!meta) {
            return false;
        }

        var base = path.basename(filename, '.md');
        fs.writeFile(posts_path+'/'+base+'.html', post_template({post : meta}), function(err) {
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
        return failure(filename, err);
    }
}

var existing_files = fs.readdirSync(posts_path);
for (var i=0; i<existing_files.length; i++) {
    var html_file = posts_path + '/' + existing_files[i];
    if (path.extname(html_file) == ".html") {
        fs.unlinkSync(html_file);
    }
}

var md_files = fs.readdirSync(published_path);
var posts = []

for (var i=0; i<md_files.length; i++) {
    var filename = md_files[i];
    var promise = q.execute(fs.readFile, published_path+'/'+filename, 'utf-8');
    posts[i] = q.whenPromise(promise, process(filename), error(filename));
}

q.all(posts).then(function(posts) {
    posts = posts.filter(function (p) {return p});
    posts = posts.sort(function(p1, p2) {return (p2.date - p1.date)});
    var html = index_template({blogposts : posts})
    var path = public_path+'/index.html'
    fs.writeFile(path, html, function(err) {
        if (err) throw err;
        success("index.html");
    });
})
