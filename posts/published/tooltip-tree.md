---
layout: post
categories: 
    - tooltip
    - command line
date: 2012-05-16
title: "Tooltip: the tree command"
published: true
---

From time to time, I need to describe a directory structure to someone.
I may be for a README file or some other type of documentation, a presentation, or simply in a discussion on IRC.

On such occations, I find the `tree` command very useful.
To use it, simply navigate to the parent of the root folder in the directory tree in question, and issue the command with the root directory name as first parameter.

    $ cd /parent/folder
    $ tree root
    root
    ├── foo
    │   ├── bar
    │   └── baz
    └── test
        ├── file1
        └── file2

The output is utf-8 encoded, and may be colorized depending on your shell configuration. 
It is also easy to have the output in ASCII, by using the `--charset` option.

    $ tree root --charset ascii
    root
    |-- foo
    |   |-- bar
    |   `-- baz
    `-- test
        |-- file1
        `-- file2
