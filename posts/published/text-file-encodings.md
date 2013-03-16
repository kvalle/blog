---
layout: post
categories: 
    - text encoding
    - file
    - iconv
    - command line
date: 2011-10-31
title: Changing the Encoding of a Text File
published: true
---

Today I was faced with the follwing task: given a directory of files of various and unknown encodings, convert them all to UTF-8.
This post shows how to easily solve this problem using the two useful commands `file` and `iconv`.

The problem consists of two parts: first, determine the current encoding of each of the files, and then convert them from their current encoding to UTF-8.

## Step 1 -- detect encodings

`file` is a very useful command for easily determining type information of files.

A simple example shows typical information `file` extracts from a text file.

    $ file test.txt
    test.txt: ISO-8859 English text, with very long lines, with CRLF line terminators

To print only the needed information we add a few more options, as follows.

    $ file -b --mime-encoding test.txt
    iso-8859-1
    
`--mime-encoding` specifies that only the encoding part should be printed, and `-b` (brief) ommits the name of the file from the output.

## Step 2 -- convert files

Once the current encoding of a file has been determined, the `iconv` command can be used to convert its encoding.

The following will print the contents of `test.txt` to `stdout` as UTF-8.

    $ iconv -f iso-8859-1 -t utf-8 test.txt
    
Using the `-o` option, the output can also be redirected back to the file.

    $ iconv -f iso-8859-1 -t utf-8 test.txt -o test.txt

## Putting it all together

By putting the two steps together, we can easily convert all text files within a folder.
The following script reads all `txt`files within the current folder, determine their current encoding, and tries to convert them to UTF-8.

{% highlight bash %}
#!/bin/sh

TO='utf-8'

for i in *.txt
do
    FROM=$(file -b --mime-encoding $i)
    iconv -f $FROM -t $TO $i -o $i
done
{% endhighlight %}
    
<!-- end preview -->

