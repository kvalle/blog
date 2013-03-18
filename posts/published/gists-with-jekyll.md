---
title: Embedding GitHub gists with Jekyll
date: 2012-01-03
description: "When writing blog posts with Jekyll, Firefox would choke on the HTML. This is how you fix it."
---

# Embedding GitHub gists with Jekyll

> Update: Since writing this post, I've started using the [Gist Tag for Jekyll](http://brandontilley.com/2011/01/30/gist-tag-for-jekyll.html) by Brandon Tilley.
> This is a plugin for Jekyll which solves the problem mentioned below, and provides additional goodies like caching and `<noscript>` tags for RSS readers.*

The title of this post roughly corresponds to one of my many search queries from when I was writing my last blog post.
I was embedding some code as a [GitHub gist](https://gist.github.com/), and suddenly everything I wrote beneath the gist disappeared from the post.
Viewing the HTML source I could see perfectly well that everything was there, but Firefox would for some reason not render it.

After quite a while of debugging and searching for answers, I found the problem.
It would seem that [Maruku](https://github.com/nex3/maruku), the Markdown interpreter used by Jekyll, minimizes empty HTML tags. 
Thus, my

```html
<script src="..."></script>
```

was transformed into

```html
<script src="..." />
```

Self closing tags is a [known issue](http://stackoverflow.com/questions/69913/why-dont-self-closing-script-tags-work) with Firefox, and the problem also occurred when I viewed the page in Chrome.

The solution is deceptively simple.
By adding some content between the `script` tags--a JavaScript comment or a space for example--Maruku no longer views them as empty, and no minimization is performed.
