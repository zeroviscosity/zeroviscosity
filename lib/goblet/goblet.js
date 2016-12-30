const fs = require('fs');
const _ = require('lodash');
const moment = require('moment');
const site = {
  title: '',
  description: '',
  url: '',
  twitter: ''
};
const og = {
  images: [],
  title: '',
  description: '',
  url: '',
  siteName: ''
};
const pages = {
  draft: [],
  published: []
};
const posts = {
  draft: [],
  published: []
};
const goblet = module.exports = {};

let categories = [];
let path = null;
let watcher = null;

function update(callback) {
  console.log('Update detected: goblet.json...');
  fs.readFile(path, 'utf8', (err, data) => {
    try {
      const gob = JSON.parse(data);

      site.title = gob.site.title;
      site.description = gob.site.description;
      site.url = gob.site.url;
      site.twitter = gob.site.twitter;

      pages.draft = _.sortBy(gob.pages.filter((page) => {
        return !page.published;
      }), 'created');
      pages.draft.reverse();

      pages.published = _.sortBy(gob.pages.filter((page) => {
        return page.published;
      }), 'created');
      pages.published.reverse();

      categories = gob.categories;

      gob.posts.forEach((post) => {
        post.date = formatDate(post.created);
      });

      posts.draft = _.sortBy(gob.posts.filter((post) => {
        return !post.published;
      }), 'created');
      posts.draft.reverse();

      posts.published = _.sortBy(gob.posts.filter((post) => {
        return post.published;
      }), 'created');
      posts.published.reverse();

      og.images = [`${site.url}/img/og-1.png`, `${site.url}/img/og-2.png`];
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
  const matches = entries.filter((entry) => {
    return entry.slug === slug;
  });

  if (matches.length) {
    return matches[0];
  }
  return null;
}

function formatDate(isoDate) {
  return moment(isoDate).format('MMMM Do, YYYY');
}

goblet.init = (_path, callback) => {
  path = _path;
  if (!watcher) {
    watcher = fs.watchFile(path, () => {
      update();
    });
  }
  update(callback);
};

goblet.index = (req, res) => {
  var tag = (req.query.tag) ? req.query.tag.toLowerCase() : '',
    ps = (tag) ? posts.published.filter((post) => {
      return post.tags.map((tag) => {
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

goblet.category = (req, res, next) => {
  const idx = _.findIndex(categories, (c) => {
    return c.slug === req.params.slug;
  });

  if (idx > -1) {
    const category = categories[idx];
    const url = `${site.url}/category/${category.slug}`;
    const title = [site.title, category.title].join(': ');
    const ps = posts.published.filter((p) => {
      return p.category === idx;
    });
    ps.reverse();
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

goblet.pages = (process, callback) => {
  pages.published.forEach((page) => {
    const path = `/${page.slug}`;
    const title = [site.title, page.title].join(': ');
    const url = site.url + path;

    process(path, (req, res) => {
      res.render(`pages/${page.slug}`, {
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

  if (_.isFunction(callback)) {
    callback(pages);
  }
};

goblet.post = (req, res, next) => {
  const slug = req.params.slug;
  const post = find(posts.published, slug);

  if (post) {
    const category = categories[post.category];
    const url = `${site.url}/${category.slug}/${slug}`;
    const title = [site.title, category.title, post.title].join(': ');
    res.render(`posts/${category.slug}/${slug}`, {
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

goblet.error = (req, res) => {
  const code = res.statusCode;
  const message = (code === 404) ? 'Not Found' : 'Internal Server Error';

  res.render(`errors/${code}`, {
    title: `${site.title}: ${code} ${message}`,
    description: site.description,
    url: site.url,
    categories: categories,
    pages: pages.published
  });
};

