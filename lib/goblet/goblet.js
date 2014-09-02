var fs = require('fs'),
    _ = require('lodash'),
    site = {
        title: '',
        url: ''
    },
    og = {
        image: '',
        title: '',
        url: '',
        siteName: ''
    },
    path = null,
    pages = [],
    posts = [],
    watcher = null,
    goblet = module.exports = {};

function update(callback) {
    console.log('Update detected: goblet.json...');
    fs.readFile(path, 'utf8', function(err, data) {
        try {
            var g = JSON.parse(data);
            site = g.site;
            pages = g.pages;
            posts = g.posts;

            _.each(posts, function(post) {
                post.date = formatDate(post.created);
            });

            og.image = site.url + '/img/logo-0-120.png';
            og.title = site.title;
            og.url = site.url;
            og.siteName = site.title;

            console.log('Update complete.');
            if (_.isFunction(callback)) callback();
        } catch(e) {
            console.error('Could not parse goblet.json', e);
        }
    });
}

function find(entries, slug) {
    var matches = entries.filter(function(entry) { 
        return entry.slug === slug;
    });
    
    if (matches.length) {
        return matches[0];
    } else {
        return null;
    }
}

function formatDate(isoDate) {
    return isoDate.substr(0, 10);
}

goblet.init = function(_path, callback) {
    path = _path;
    if (!watcher) {
        watcher = fs.watchFile(path, function(curr, prev) {
            update();
        });
    }
    update(function() {
        callback();
    });
};

goblet.main = function(req, res) {
    var tag = (req.query.tag) ? req.query.tag.toLowerCase() : '',
        ps = (tag) ? posts.filter(function(post) {
            return post.tags.map(function(tag) {
                return tag.toLowerCase();
            }).indexOf(tag) > -1;
        }) : posts;
    
    res.render('index', {
        title: site.title,
        url: site.url,
        pages: pages,
        posts: ps,
        tag: req.query.tag,
        og: og
    });
};

goblet.pages = function(process, callback) {
    _.each(pages, function(page) {
        var path = '/' + page.slug,
            url = site.url + path;

        process(path, function(req, res) {
            res.render('pages/' + page.slug, {
                title: [site.title, page.title].join(': '),
                url: url,
                page: page,
                pages: pages,
                og: {
                    image: og.image,
                    title: page.title,
                    url: url,
                    siteName: og.title
                }
            });
        });
    });

    if (_.isFunction(callback)) callback(pages);
};

goblet.post = function(req, res, next) {
    var slug = req.params.slug,
        post = find(posts, slug),
        url;
    
    if (post) {
        url = site.url + '/post/' + slug;
        res.render('posts/' + slug, {
            title: [site.title, post.title].join(': '),
            url: url,
            post: post,
            pages: pages,
            og: {
                image: og.image,
                title: post.title,
                url: url,
                siteName: og.title
            }
        }); 
    } else {
        res.status = 404;
        next();
    }
};

