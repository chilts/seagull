# Seagull #

Static site generators - always 'unopinionated'. Well this one is opinionated. ie. it has a standard set of
functionality and it does it well.

Make some posts, make some pages, run this program and you've got a static site.

## Layout ##

```
├── config.json
├── files
├── html
├── pages
├── posts
└── views
```

Stick some Markdown `pages` and `posts` into those directories (make sure you give them the `*.md` extension. You can have 'front matter' if you want to - put some JSON at the top of the file and end it with a newline, three dashes and another newline:

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


(Ends)
