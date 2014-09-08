var fs = require('fs'),
    _ = require('lodash'),
    site = {
        title: '',
        description: '',
        url: '',
        twitter: ''
    },
    og = {
        image: '',
        title: '',
        description: '',
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
            site.twitter = gob.site.twitter;

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
            og.description = site.description;
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
        og: og,
        tw: {
            site: site.twitter,
            creator: site.twitter
        }
    });
};

goblet.pages = function(process, callback) {
    pages.published.forEach(function(page) {
        var path = '/' + page.slug,
            title = [site.title, page.title].join(': '),
            url = site.url + path;
        
        process(path, function(req, res) {
            res.render('pages/' + page.slug, {
                title: title,
                description: site.description,
                url: url,
                page: page,
                pages: pages.published,
                og: {
                    image: og.image,
                    title: title,
                    description: site.description,
                    url: url,
                    siteName: og.title
                },
                tw: {
                    site: site.twitter,
                    creator: page.twitter || site.twitter
                }

            });
        });
    });

    if (_.isFunction(callback)) callback(pages);
};

goblet.post = function(req, res, next) {
    var slug = req.params.slug,
        post = find(posts.published, slug),
        url, title;
    
    if (post) {
        url = site.url + '/post/' + slug;
        title = [site.title, post.title].join(': ');
        res.render('posts/' + slug, {
            title: title,
            description: post.subtitle,
            url: url,
            post: post,
            pages: pages.published,
            og: {
                image: og.image,
                title: title,
                description: post.subtitle,
                url: url,
                siteName: og.title
            },
            tw: {
                site: site.twitter,
                creator: post.twitter || site.twitter
            }
        }); 
    } else {
        res.status = 404;
        next();
    }
};

