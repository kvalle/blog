# Blogging with Jekyll & Git

Yeah, so I finally created a blog. 
I have been meaning to do this for some time now, but never really got around to it.
The reason for that -- I think -- is at least partly because I find the mass of CMSs and blog engines out there genuinely unappealing.
I have tested a few from time to time, and found them too complex for my needs, giving me too little control, and/or forcing me to work through web interfaces i didn't like.
That changed, however, when I was introduced to <a href="https://github.com/mojombo/jekyll/wiki">Jekyll</a>.

Jekyll is, according to the documentation, a _simple, blog aware, static site generator_, which means it can generate static HTML pages based on a few templates and some text files.
This post outlines my experiences using Jekyll to set up this simple site.

## The Jekyll Setup

The blog rests upon a fairly vanilla Jekyll, and since there already exist a hundred blog posts about how to install and get started with Jekyll, I won't go into that here.Embedding GitHub gists with Jekyll
My only deviation from default Jekyll was that I wanted to show previews rather than the full posts on the front page, and that I wanted somewhat better support for categories.

For the category support I found some <a href="https://github.com/josegonzalez/josediazgonzalez.com/tree/master/_plugins">plugins</a> that solved my problems.
The <a href="https://github.com/josegonzalez/josediazgonzalez.com/blob/a1aadff451241bb5430a0e3665dc04cbdade221d/_plugins/category.rb">category.rb</a> plugin can be used to automatically generate index pages per category, each listing all posts associated with that category.
To iterate over the available categories -- and much more -- use the <a href="https://github.com/josegonzalez/josediazgonzalez.com/blob/a1aadff451241bb5430a0e3665dc04cbdade221d/_plugins/iterator.rb">iterator.rb</a> plugin.

To create post previews to show on the front page, I wrote the following simple plugin.

```ruby
require 'nokogiri'

module Liquid

    module ExtendedFilters

        def html_first_par(text)
            doc = Nokogiri::HTML::DocumentFragment.parse text
            p = doc.xpath('.//p')[0]
        end
        
        def preview(text, delimiter = '<!-- end preview -->')
            if text.index(delimiter) != nil
                text.split(delimiter)[0]
            else
                html_first_par(text)
            end
        end
    end
    
    Liquid::Template.register_filter(ExtendedFilters)

end
```

All it does is to add two additional filters for use with liquid.
The `html_first_par` filter extracts the first paragraph from a piece of HTML.
The `preview` filter looks for the occurrence of a HTML comment in the post, which indicate where the preview ends. 
If it finds no such comment, it simply uses the first filter to extract the first paragraph and shows it instead.

In my <a href="/index.html">index.html</a>, the `preview` filter is used as in the following (somewhat simplified) example.

```
{% for post in paginator.posts %}
    <h1><a href="{{ post.url }}">{{ post.title }}</a></h1>
    {{ post.content | preview }}
    <a href="{{ post.url }}">Read More</a>
{% endfor %}
```

## Publishing

I initially wanted to host the site directly on GitHub, since their <a href="http://pages.github.com/">GitHub Pages</a> feature makes this really easy. 
All you need to do is:

1. Create and push to a repository named `username.github.com`
2. Commit and push a file named `CNAME` holding your domain name
3. Point your domain to `username.github.com`

Once you then push content to GitHub, it will then automatically run Jekyll, generate your site, and publish it at `username.github.com`.
Voila, you are up and running!

And in most cases this would be enough. There is a problem, however, if you have written any custom plugins to use with your Jekyll templates.
Due to security restrictions, <a href="https://github.com/mojombo/jekyll/issues/325">plugins are disabled</a> when GitHub runs Jekyll on your site.
GitHub can still be used, but then the site must be generated locally and the resulting HTML pushed to the Git repository.

Alternatively, the site can be hosted elsewhere, which is what I ended up doing.
The choice fell on VPS hosting from <a href="http://www.linode.com/index.cfm">linode.com</a>.

The setup here is slightly more elaborate than with GitHub pages. 
After installing the essentials such as git and a webserver, all we need to do is make Git run Jekyll automatically.
This can be done by adding the following simple post-receive hook in the server repository:

```bash
#!/bin/sh
GIT_WORK_TREE=/path/to/blog git checkout -f
cd /path/to/blog
rm -rf _site/
jekyll --no-auto
```


## Code Highlight

Jekyll offers easy code highlighting out of the box, as long as you install <a href="http://pygments.org/">Pygments</a>.

    {% raw %}
    {% highlight ruby %}
    code goes here
    {% endhighlight %}
    {% endraw %}

This will add appropriate CSS classes to the keywords in your code snippet.
The default color scheme can be generated using the following command:

    pygmentize -S default -f html > css/pygments.css

You can of course also change `ruby` to one of the other <a href="http://pygments.org/languages/">languages supported by Pygments</a>.


## Final Tips

Finally, here are a few other things that can be useful when using Jekyll.

*   To display liquid samples without them being parsed, surround with `{% literal %}` and `{% endliteral %}` tags.
*   Running Jekyll as a server continuously watching for changes and rebuilding is a great way to view the state of your site while working. 
    However,  the `--auto` option may also hide errors from you. 
    If Jekyll fails while building the site, you'll be looking at the last working version -- not an error message!
*   For additional ideas on how to use Jekyll, have a look at the extensive <a href="https://github.com/mojombo/jekyll/wiki/Sites">list of sites</a> that are already using it.

