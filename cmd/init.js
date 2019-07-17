// ----------------------------------------------------------------------------

// npm
const fs = require('graceful-fs')

// ----------------------------------------------------------------------------
// setup

const layout = [
  'doctype html',
  'html(lang="en")',
  '',
  '  head',
  '    meta(charset="utf-8")',
  '    meta(http-equiv="X-UA-Compatible" content="IE=edge")',
  '    meta(name="viewport" content="width=device-width, initial-scale=1")',
  '    meta(name="description" content="The easy way to create a lovely blog")',
  '    meta(name="author" content=cfg.author)',
  '    link(rel="icon" href="/favicon.ico")',
  '',
  '    title= self.title || cfg.title',
  '',
  '  body(style="margin:0;padding:0;")',
  '    nav(style="background-color:#ddd;padding:8px;")',
  '      a(style="margin:0 8px;" href="/") Home',
  '      a(style="margin:0 8px;" href="/blog/") Blog',
  '      a(style="margin:0 8px;" href="/blog/archive.html") Archive',
  '      a(style="margin:0 8px;" href="/about.html") About',
  '',
  '    div(style="padding:16px;")',
  '      h1= self.title',
  '      block content',
  '',
  '    footer(style="text-align:center;border-top:2px solid #ccc;background-color:#eee;padding:16px;") &copy; #{cfg.domain} 2019',
  '',
].join('\n')

const index = [
  'extends layout',
  '',
  'block content',
  '  for post in self.posts.slice.reverse().slice(0, 10)',
  '    h2= post.title',
  '    | !{post.html}',
  '    p= post.published.toISOString()',
  '',
].join('\n')

const post = [
  'extends layout',
  '',
  'block content',
  '  h2= self.title',
  '  p Author: #{self.author}',
  '  | !{self.html}',
  '  p= self.published.toISOString()',
  '',
].join('\n')

const archive = [
  'extends layout',
  '',
  'block content',
  '  ul',
  '    for post in self.posts.slice().reverse()',
  '      li',
  '        a(href=`${post.name}.html`) #{post.title}',
  '        |',
  '        | (',
  '        span= post.published.toISOString()',
  '        | )',
  '',
].join('\n')

const page = [
  'extends layout',
  '',
  'block content',
  '  | !{self.html}',
  '',
].join('\n')

const content = [
  '{"type":"page","published": "1970-01-01T00:00:00.000Z"}',
  '---',
  '# Welcome to Seagull #',
  '',
  'Congatulations! You have built your first **Seagull** website.',
  '',
  'See the [Seagull Rocks](https://seagull.rocks) website for more info.',
  '',
].join('\n')

const about = [
  '{"type":"page","published": "1970-01-01T00:00:00.000Z"}',
  '---',
  '# About #',
  '',
  'Seagull is a static site generator.',
  '',
  'It looks like you\'re already doing well so far. :)',
  '',
].join('\n')

const first = [
  '{"type":"post","title":"First Post","published": "1971-01-01T12:13:14.000Z"}',
  '---',
  'This is your __first__ post!',
  '',
].join('\n')

const second = [
  '{"type":"post","title":"Second Post","published": "1971-01-02T15:16:17.000Z"}',
  '---',
  '* a list',
  '* of three',
  '* items',
  '',
].join('\n')

// ----------------------------------------------------------------------------
// init

function init(args) {
  fs.writeFileSync('config.json', '{"title":"Example","domain":"example.com"}', 'utf8')
  fs.mkdirSync('content', { recursive: true })
  fs.mkdirSync('content/blog', { recursive: true })
  fs.mkdirSync('files', { recursive: true })
  fs.mkdirSync('html', { recursive: true })
  fs.mkdirSync('views', { recursive: true })

  // now add some content
  fs.writeFileSync('views/layout.pug', layout, 'utf8')
  fs.writeFileSync('views/index.pug', index, 'utf8')
  fs.writeFileSync('views/post.pug', post, 'utf8')
  fs.writeFileSync('views/archive.pug', archive, 'utf8')
  fs.writeFileSync('views/page.pug', page, 'utf8')

  // add some views
  fs.writeFileSync('content/index.md', content, 'utf8')
  fs.writeFileSync('content/about.md', about, 'utf8')
  fs.writeFileSync('content/blog/first-post.md', first, 'utf8')
  fs.writeFileSync('content/blog/second-post.md', second, 'utf8')

  console.log('')
  console.log('Success. Now run:')
  console.log('')
  console.log('  $ seagull build')
  console.log('')
  console.log('Then take a look inside your `html/` directory.')
  console.log('')
}

// ----------------------------------------------------------------------------

module.exports = init

// ----------------------------------------------------------------------------
