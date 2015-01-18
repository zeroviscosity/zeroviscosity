var fs = require('fs'),
    _ = require('lodash'),
    moment = require('moment'),
    site = {
        title: '',
        description: '',
        url: '',
        twitter: ''
    },
    og = {
        images: [],
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
    categories = [],
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

            pages.draft = _.sortBy(gob.pages.filter(function(page) {
                return !page.published;
            }), 'created');
            pages.draft.reverse();

            pages.published = _.sortBy(gob.pages.filter(function(page) {
                return page.published;
            }), 'created');
            pages.published.reverse();

            categories = gob.categories;

            gob.posts.forEach(function(post) {
                post.date = formatDate(post.created);
            });

            posts.draft = _.sortBy(gob.posts.filter(function(post) {
                return !post.published;
            }), 'created');
            posts.draft.reverse();

            posts.published = _.sortBy(gob.posts.filter(function(post) {
                return post.published;
            }), 'created');
            posts.published.reverse();
            
            og.images = [site.url + '/img/og-1.png', site.url + '/img/og-2.png'];
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
    return moment(isoDate).format("MMMM Do, YYYY");
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

goblet.index = function(req, res) {
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
        categories: categories,
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

goblet.category = function(req, res, next) {
    var idx = _.findIndex(categories, function(c) {
            return c.slug === req.params.slug;
        }),
        category, url, title, ps;
    
    if (idx > -1) {
        category = categories[idx];
        url = site.url + '/category/' + category.slug;
        title = [site.title, category.title].join(': ');
        ps = posts.published.filter(function(p) {
            return p.category === idx;
        });
        res.render('category', {
            title: title,
            description: category.subtitle,
            categories: categories,
            category: category,
            url: url,
            posts: ps,
            pages: pages.published,
            og: {
                images: og.images,
                title: title,
                description: category.subtitle,
                url: url,
                siteName: og.title
            },
            tw: {
                site: site.twitter,
                creator: site.twitter
            }
        }); 
    } else {
        res.status(404);
        next();
    }   
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
                categories: categories,
                page: page,
                pages: pages.published,
                og: {
                    images: og.images,
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
        category, url, title;
    
    if (post) {
        category = categories[post.category];
        url = site.url + '/' + category.slug + '/' + slug;
        title = [site.title, category.title, post.title].join(': ');
        res.render('posts/' + category.slug + '/' + slug, {
            title: title,
            description: post.subtitle,
            url: url,
            category: category,
            categories: categories,
            pages: pages.published,
            post: post,
            og: {
                images: og.images,
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
        res.status(404);
        next();
    }
};

goblet.error = function(req, res) {
    var code = res.statusCode,
        message = (code === 404) ? 'Not Found' : 'Internal Server Error';
    
    res.render('errors/' + code, {
        title: site.title + ': ' + code + ' ' + message,
        description: site.description,
        url: site.url,
        categories: categories,
        pages: pages.published
    });
};

