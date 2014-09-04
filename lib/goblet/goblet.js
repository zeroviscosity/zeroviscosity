var fs = require('fs'),
    _ = require('lodash'),
    site = {
        title: '',
        description: '',
        url: ''
    },
    og = {
        image: '',
        title: '',
        url: '',
        siteName: ''
    },
    path = null,
    pages = {
        draft: [],
        published: []
    },
    posts = {
        draft: [],
        published: []
    },
    watcher = null,
    goblet = module.exports = {};

function update(callback) {
    console.log('Update detected: goblet.json...');
    fs.readFile(path, 'utf8', function(err, data) {
        try {
            var gob = JSON.parse(data);
            
            site.title = gob.site.title;
            site.description = gob.site.description;
            site.url = gob.site.url;

            pages.draft = gob.pages.filter(function(page) {
                return !page.published;
            });
            pages.published = gob.pages.filter(function(page) {
                return page.published;
            });

            gob.posts.forEach(function(post) {
                post.date = formatDate(post.created);
            });
            posts.draft = gob.posts.filter(function(post) {
                return !post.published;
            });
            posts.published = gob.posts.filter(function(post) {
                return post.published;
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
        ps = (tag) ? posts.published.filter(function(post) {
            return post.tags.map(function(tag) {
                return tag.toLowerCase();
            }).indexOf(tag) > -1;
        }) : posts.published;
    
    res.render('index', {
        title: site.title,
        description: site.description,
        url: site.url,
        pages: pages.published,
        posts: ps,
        tag: req.query.tag,
        og: og
    });
};

goblet.pages = function(process, callback) {
    pages.published.forEach(function(page) {
        var path = '/' + page.slug,
            url = site.url + path;
        
        process(path, function(req, res) {
            res.render('pages/' + page.slug, {
                title: [site.title, page.title].join(': '),
                description: site.description,
                url: url,
                page: page,
                pages: pages.published,
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
        post = find(posts.published, slug),
        url;
    
    if (post) {
        url = site.url + '/post/' + slug;
        res.render('posts/' + slug, {
            title: [site.title, post.title].join(': '),
            description: post.subtitle,
            url: url,
            post: post,
            pages: pages.published,
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

