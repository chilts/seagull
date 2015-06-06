# Seagull #

Static site generators - always 'unopinionated'. Well this one is opinionated. ie. it has a standard set of
functionality and it does it well.

Make some posts, make some pages, run this program and you've got a static site.

## Layout ##

```
├── config.json
├── files
├── html
├── content
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

## ChangeLog ##

* 2015-06-07: v0.3.0
  * Added the ability to render the main /index.html file
* 2015-06-07: v0.2.0
  * Merge all content into '/content/' instead of '/pages/' and '/posts/'
* 2015-06-06: v0.1.0
  * Initial release
  * Render *.html files for all pages and all posts

(Ends)
