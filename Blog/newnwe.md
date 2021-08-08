---
category: Tech
creation_date: 2021-08-08
author: Suhas Kashyap
tags: []
title: NewNwe
description: dfasd
hero_image: ''

---
Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save gray-matter
```

## Heads up!

Please see the [changelog](CHANGELOG.md) to learn about breaking changes that were made in v3.0.

## What does this do?

<details>
<summary><strong>Run this example</strong></summary>

Add the HTML in the following example to `example.html`, then add the following code to `example.js` and run `$ node example` (without the `$`):

```js
const fs = require('fs');
const matter = require('gray-matter');
const str = fs.readFileSync('example.html', 'utf8');
console.log(matter(str));
```

</details>

Converts a string with front-matter, like this:

```handlebars
---
title: Hello
slug: home
---
<h1>Hello world!</h1>
```

Into an object like this:

```js
{
  content: '<h1>Hello world!</h1>',
  data: { 
    title: 'Hello', 
    slug: 'home' 
  }
}
```

<blockquote class="twitter-tweet"><p lang="en" dir="ltr"><a href="https://twitter.com/hashtag/CSS?src=hash&amp;ref_src=twsrc%5Etfw">#CSS</a> `:focus-visible`<br><br>Lets the browser decide whether or not to show focus<br><br>Video shows the difference between `:focus` and `:focus-visible` when Javascript is used to focus buttons after mouse interaction<br><br>tldr; <br>less concerns / better UX<br><br>Learn more <a href="https://t.co/XLbtVXyaa0">https://t.co/XLbtVXyaa0</a> <a href="https://t.co/BrRYd6VHGd">pic.twitter.com/BrRYd6VHGd</a></p>&mdash; Adam Argyle (@argyleink) <a href="https://twitter.com/argyleink/status/1423633958730747906?ref_src=twsrc%5Etfw">August 6, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## Why use gray-matter?

* **simple**: main function takes a string and returns an object
* **accurate**: better at catching and handling edge cases than front-matter parsers that rely on regex for parsing
* **fast**: faster than other front-matter parsers that use regex for parsing
* **flexible**: By default, gray-matter is capable of parsing [YAML](https://github.com/nodeca/js-yaml), [JSON](http://en.wikipedia.org/wiki/Json) and JavaScript front-matter. But other [engines](#optionsengines) may be added.
* **extensible**: Use [custom delimiters](#optionsdelimiters), or add support for [any language](#optionsengines), like [TOML](http://github.com/mojombo/toml), [CoffeeScript](http://coffeescript.org), or [CSON](https://github.com/bevry/cson)
* **battle-tested**: used by [assemble](https://git