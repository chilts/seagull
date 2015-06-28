# Seagull #

Static site generators - always 'unopinionated'. Well this one is opinionated. ie. it has a standard set of
functionality and it does it well.

Make some posts, make some pages or other types of page, run this program and you've got a static site.

## Layout ##

```
├── config.json
├── content
├── files
├── html
└── views
```

Stick some Markdown files with extension `*.md`into content (and set the `type` in the front matter to be 'page' or
'post') For front matter, put some JSON at the top of the file and end it with a newline, three dashes and another
newline:

```
{
  "title": "First Post",
  "published": "2015-06-05T03:11:41.849Z",
  "type": "post"
}
---
## First Post ##

This is the content.
```

## Future Posts ##

To publish a page or post in the future, just set the `published` date to be in the future. Note: of course, seagull can't
publish this automatically since it is a static site generator, so you'll have to re-generate and push your content when
necessary. Perhaps set up a cron somewhere to do this regularly.

## Draft Posts ##

For a post to be considered draft, set `published` in the front matter to false.

```
{
  ...
  "published": false,
  ...
}
```

## Other Page Types ##

The only type of page that is special is the `post` type, since they are used to generate lots of blog specific pages (such as the archive, pageified pages, categories, tags and author pages.

If you use any other type than `post`, then it is rendered as a normal page but using the view named after it. For
example, if you have a page of type `recipe`, then the `views/recipe.jade` file is rendered. If you have a type `page`
(remember, `page` is not special), then the `views/page.jade` is rendered.

For example, let's make a page type of `map` called `wellington.md`:

```
{
  "type": "map",
  "lon": -41.2889,
  "lat": 174.7772
}
---
Welcome to the Middle of Middle Earth.
```

Then a view called `views/map.jade` is rendered. You can of course render it anyway you like, perhaps extend the same layout as other pages or a completely different one. You may also wish to render the content too.

Other ideas for diffferent page types:

* image
* gallery
* recipe

## ChangeLog ##

* 2015-06-29: v0.8.3, v0.8.4
  * Various fixes
  * Now deals with an empty site better
* 2015-06-29: v0.8.2
  * Make seagull.js be executable using "/usr/bin/env node"
* 2015-06-29: v0.8.1
  * Add seagull.js as a bin in package.json
* 2015-06-29: v0.8.0
  * Refactored everything
  * Views are easier to manage/load
  * Create and render the archive pages
  * Quit if a view doesn't exist
  * Create and render category pages
  * Create and render tag pages
  * Create and render author pages
  * Create Atom feeds
  * Create RSS feeds
  * Create and render pagified indexes e.g. page-1, page-2, etc
  * Add a sitemap which consists of all posts and other page types
  * Various fixes
* 2015-06-07: v0.3.0
  * Added the ability to render the main /index.html file
* 2015-06-07: v0.2.0
  * Merge all content into '/content/' instead of '/pages/' and '/posts/'
* 2015-06-06: v0.1.0
  * Initial release
  * Render *.html files for all pages and all posts

(Ends)
