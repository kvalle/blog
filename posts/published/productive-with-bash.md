---
layout: post
categories: 
    - command line
    - bash
date: 2012-11-30
title: Make your life easier in Bash
published: false
---

# Make your life easier in Bash

Most of us use Bash more or less every day.
Even if you develop on Windows you are probably using Cygwin, and chances are you deploy your code to a Unix server.

Bash might, arguably, not be the best shell out there, but it has one great strength — it is installed as default almost everywhere!
This makes it the one shell it really pays off to be proficient in.
In this blog post I'll outline some of the features of Bash that have made my day-to-day work in the command line much more productive.

Note that the focus here is on working with the actual command line, not writing bash scripts.
We won't use any complicated comands, just look at the standad basic features available which you might not be using to the fullest.

Learn the keyboard shortcuts
----------------------------

The first, and probably most important, thing you can do to improve your Bash skills is to learn the most most useful shortcut.

Some people choose to swith Bash to use the *vi editing mode* (you can do this by typing `set -o vi`), but I prefer to keep the defaults Emacs mode since that is the standard and thus what most people use.

This list is by no means exhaustive, but should cover most of the keyboard shortcuts you'll be likely to use.
Lets start with the most basic ones:

- `Tab` to autocomplete commands and file/folder names.
- `Ctrl` + `p` to move back through the command history, same as `↑`.
- `Ctrl` + `n` to move back forwards again, like `↓`.

Next, some keys for moving the cursor about on the command line.

- `Ctrl` + `a` to move to the beginning of the line.
- `Ctrl` + `e` to move to the end of the line.
- `Ctrl` + `f` to move the cursor forward one character. Same as `→`.
- `Ctrl` + `b` to move the cursor backward one character. Same as `←`.
- `Alt` + `f` or `Esc` + `f` to move cursor forward one word.
- `Alt` + `b` or `Esc` + `b` to move cursor backward one word.

And once you get the cursor where you need to go, you can use the following commands to edit.

- `Ctrl` + `u` to clear the line of everything before the cursor.
- `Ctrl` + `k` to clear everything after the cursor.
- `Ctrl` + `w` to delete the word before the cursor.
- `Ctrl` + `y` to paste (yank) anything cut by the above.
- `Ctrl` + `h` to to delete last character. Same as `Backspace`.
- `Esc` + `.` to "paste" in the last argument to the last command you entered.
- `Ctrl` + `t` to swap the last two characters before the cursor.
- `Esc` + `t` to swap the last two words before the cursor.

Other:

- `Esc` + `?` to present list of autocomplete options at any point. Like doing a double `Tab`.
- `Ctrl` + `l` to clear the screen. Same as the `clear` command.
- `Ctrl` + `r` to search through previously used commands.
- `Ctrl` + `c` to send the SIGINT (kill) signal to the current process.
- `Ctrl` + `z` to send the current process to the background.
- `Ctrl` + `d` to exit the shell. Same as the `exit` command.

And perhaps the most important of them all:

- `Ctrl` + `_` to undo.

And in case you really want do dig into how this works — the Bash hotkey support is based on the `readline` command, which has an extensive man page:

	$ man readline


The "magic" variables
--------------------------

Bash has a lot of [special variables](http://tldp.org/LDP/abs/html/refcards.html#AEN22165) which names are so arcane, they may seem more like magic incantations when first encountered.
Although they won't win prizes for readability any time soon, they are very useful in scripts. and a couple of them can at times be useful at the command line as well.

#### Getting the PID with `$!`

`$!` will get you the PID (process identifier) of the last process you sent to the bacground.
This can, for example, be useful should you want to keep the PID around to make it easier to kill your process should you need to later.

	$ java -jar myapp.jar &
	[3] 3398
	$ echo $! > myapp.pid

Then, sometime much later:

	$ cat myapp.pid 
	3398
	$ kill 3398 

#### Checking return code with `$?`

Sometimes it isn't obvious if the last command executed was successful or not.
In such cases, use `$?` to check the return code (errno) of the last returning process.

	$ cat nonexisting-file.txt
	$ echo $?
	1

Any value above 0 here means, of course, that there was an error executing the last command.

Move around!
------------

One of the most used commands is probably `cd`.
It's pretty simple — give it an argument and you change your current working directory.
But what a lot of people don't know is that the `cd` command accepts the argument `-`, which basically means *go back to where I just were*.

	$ cd /folder/with/a/very/long/path
	$ cd /somewhere/else
	$ cd -
	/folder/with/a/very/long/path

Another litle trick is worth knowing about the `cd` command is the `-P` option.
This will take you to the physical location when following symbolic links.

	$ pwd
	/home/kjetil
	$ ls -l | grep logs
	lrwxrwxrwx  1 kjetil kjetil    18 2012-11-04 13:53 logs -> /var/www/test-domain/logs
	$ cd -P logs
	$ pwd
	/var/www/test-domain/logs

Had we not used the `-P` option, we would have appeared to be somewhere else.
Lets go back and have a look:

	$ cd -
	/home/kjetil
	$ cd logs
	$ pwd
	/home/kjetil/logs

Be many places at once
----------------------

*TODO*

To take this even further, learn to use the `pushd` and `popd` builtin commands.

	$ help pushd && help popd


Master your history (expansion)
-------------------------------

Every command you run in bash is recorded. 
It is stored in `~/.bash_history` by default, and can be listed by using the `history` command.

As mentioned among the keybord shortcuts above, it is possible to bring up previous commands by using the arrow keys or `Ctrl` + `p`/`n`.
You can also search through the history using `Ctrl` + `r`, then simply typing your search.
To step back and forward between search hits, Press `Ctrl` + `r` again to go further back, or `Ctrl` + `s` to search forwards.

This is just the top of the iceberg, however. 
Bash's support for [history expansion](http://www.gnu.org/software/bash/manual/bash.html#History-Interaction) provides a simple but powerful shorthand syntax for retrieving and reusing the past.

The operator you use to make history expansions is the `!`, and the general syntax is like this: `!line:column`, where `line` and `column` is some number or special character, or left out entirely. 
To understand what the two refer to, we need to look at the output from the `history` command.
Here is an example of what such a call could look like:

	$ history
	    1  git satus
	    2  vim foo bar baz
	    3  git add foo
	    4  git commit -m "added foo"
	    5  git commit -m "added bar and baz"
	    6  cd ..
	  ...
	 3410  pwd
	 3411  cd foo/bar
	 3412  history

The value of `line` corresponds to a given line in the output from `history`, i.e. the number in the first column.
The value of `column` specifies one of the words of the command on that line, using a zero-based index starting with the command.
As an example, say we wanted to echo out the name of the folder we `cd`'ed into just before calling `history` above:

	$ echo !3411:1
	echo foo/bar
	foo/bar

You can also use negative numbers for `line`, which will refer to that number of lines from the end of the list, so the example above would be equivalent to `echo !-2:1`.

It is also possible to leave out one or the other of the values.
The default value of `line` is `-1`, i.e. the last command typed.
For `column`, the default behaviour is to retrieves all the words.

If you don't quite remember which line a particular command you just typed is at, you could also specify a search word for `line`.
The command `!git` would expand to your last call to `git`, while `!?foo` would expand to the last command in which `foo` was one of the arguments (or the command itself).

Since the most common case probably is to execute some variant of the previous command, there is also an alias for this, `!!`, which is simply shorthand for writing `!-1`.
This of course means that the punchline of [this fameous XKCD](http://xkcd.com/149/) could been written as `sudo !!` :)

History expansions are a lot more powerful than here is room to discuss here.
Especially [modifiers](http://www.gnu.org/software/bash/manual/bash.html#Modifiers), which lets you modify the commands you retrieve before they are expanded, adds a lot of power.
This is just a very quick overview.
It would be well worth your time to study [some examples](http://www.thegeekstuff.com/2011/08/bash-history-expansion/) and learn to use them.


Redirect Output
---------------

*TODO*

<!--
pipes

redirect stdout: $ do_something.sh > out.log
redirect stderr: $ do_something.sh 2> out.log
redirect both:   $ do_something.sh &> out.log

-->

Lists and Expansions
--------------------

List can be created by using the `{` and `}` characters.
By using lists you can have a command be executed on each of the items in the list.
Say we want to create three new files:

	$ touch {bar.txt,baz.txt,bax.txt}
	$ ls 
	bar.txt  bax.txt  baz.txt

In itself this isn't terribly useful (`touch` will actually do the same with spaces as commas and withouth braces).
However, the list notation also let you factor out common parts of the elements.
This is called *brace expansions*.

	$ touch ba{r,z,x}.txt
	$ ls
	bar.txt  bax.txt  baz.txt

This can, for example, be useful when passing long parameters such as paths to a command:

	$ rm /long/path/to/logs/{server,access,messages}.log

There is also a notation which let you specify ranges.

	$ echo {1..10}
	1 2 3 4 5 6 7 8 9 10
	$ echo {e..o}
	e f g h i j k l m n o
	$ echo {3..-4}
	3 2 1 0 -1 -2 -3 -4

And it is possible to specify step size like this:

	$ echo {1..10..2}
	1 3 5 7 9
	$ echo {z..a..5}
	z u p k f a

And they can even be nested and concatinated in ways too complex to possibly be useful:

	$ echo {1..6..2}{a{x,y},b}
	1ax 1ay 1b 3ax 3ay 3b 5ax 5ay 5b


Do things in sequence
---------------------

Sometimes you need to several things in sequence, things that could take a long time.
Instead of waiting for the first command to finish, then type in the next, it is convenient to tell bash to do the things in sequence.

One way to do this is to use the semicolon operator to separate commands on a single line.

    $ ./configure; make; make install

This tells bash to first run `./configure`, wait until it's done, then run `make`, and then finally run `make install`.

This is fine in some situations, but perhaps not the best thing to do in this particular example.
What would happen if `./configure` failed? Why, then the next two commands would likely fail as well.
Instead we can ue the `&&` operator to make bash run commands in sequence if, and only if, the previous command completed with a return code of 0, i.e. without errors.

    $ ./configure && make && make install 


Use Controll Structures
-----------------------

Configure Your Shell
--------------------

Everything we have discussed up to now is vanilla out-of-the-box bash, and thus available anywhere you go.
But inn all likelihood you'll find yourself doing the bulk of your work at your own local shell, and as such it can be a good idea to make it as comfortable as possible.

To configure bash, you edit the `.bashrc` file in your home folder.

	$ vim ~/.bashrc

Anything you put in here will be executed each time you start bash.
What to put here will depend on your preferences, and this is likely a file that will grow over the years.

One of the commands typically used within `.bashrc` is `alias`.
It lets you give new more concise names to commands you find your self repeating often.
Some examples:

	alias ll='ls -lh'
	alias la='ls -lAh'
	alias c=clear
	alias mvncip='mvn clean install -Pintegrationtests'
	alias gief='sudo apt-get install'

For inspiration on how to customzie *your* bash, have a look at the [myriad of dotfiles-repositories on GitHub](https://github.com/search?q=dotfiles).

Wrapup
------

*TODO*

That's it. 
Hope you you found some of the tips useful, and that they will make your life a bit easier.

<!-- 
More: 
http://www.hypexr.org/bash_tutorial.php 

history expansion: 
-->
