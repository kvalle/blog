# Learn the Bash command line essentials

As developers, most of us use Bash more or less every day.
Even if you develop on Windows you are probably using Cygwin, and chances are you deploy your code to a Unix server anyway.

Bash might arguably not be the best shell out there, but it has one great strength — it is installed as default almost everywhere!
This makes it the one shell it really pays off to be proficient in.
In this blog post I'll outline some of the features of Bash that have made my day-to-day work in the command line much more productive.

Note that the focus here is on working with *the actual command line*, not writing Bash scripts.
We won't use any complicated commands, just look at the standad basic features available which you might not be using to the fullest. There should hopefully be something here both for people sarting out working in the terminal as well as seasoned Bash veterans.

Lets start with one of the more fundamental concepts.

## Understand I/O redirection

If there is one single thing that, once you understand it, everything else will sort of magically fall into place, then that would be how redirection of inputs and outputs in Bash works.

Working with I/O in Bash is working with files.
In this context, consider files as either sources or sinks for data.
There are three files which you'll always have open by default: `stdin` (input from the keyboard), `stdout` (output to the screen) and `stderr` (error messages output to the screen). You can also open additional files, e.g. by reading from or writing to disk or opening a socket.

I/O redirection is nothing more than to capture output that would normally be sent to one file, and redirecting it to another.

### Pipes

The simplest form of I/O redirection is perhaps *piping*.
Using the pipe character (`|`) you can redirect the outputs from one command to be the inputs of another command.
What happens is that the `stdout` of the first process is pointed to the `stdin` of the next process, and so on.

Consider the following example:

    $ cat logfile | grep ERROR | sort

The first command, `cat`, reads the contents of a file and prints them to `stdout`.
We pipe the outputs, which means that `stdout` is now not the screen but `stdin` for the next command. 
Thus, `grep` reads the printed file as its inputs and filters those lines containing the word ERROR.
The filtered lines are then piped on to `sort` which reads and sort them before passing them on to `stdout`. At this point `stdout` actually refers to printing the content to the terminal.

### Redirect to file

Instead of having the final result of a series of commands printed to the screen, we can have it saved to disk.
To redirect `stdout` to a physical file, instead of another command like above, use the `>` character followed by a filename.

Say we wanted to save the names of the files in the current working directory.
The `ls` command reads the filenames and send them to `stdout`.
All we need to do is direct `stdout` to a file, like this:

    $ ls > filenames.txt

This will overwrite the file, or create one if it does not exist.
To just append to the file, we could have used double brackets instead.

    $ ls >> filenames.txt

### Redirect from file

TODO

### File descriptors

Every open file is assigned a file descriptor.
These descriptors are numbers the operating system assigns to open files, and can be considered a sort of simplified file pointer.
The descriptors 0, 1 and 2 refers to `stdin`, `stdout` and `stderr`, respectively.
The descriptors 3 through 9 remain for additional files opened.

> TODO: How is this useful?  
> <http://www.tldp.org/LDP/abs/html/io-redirection.html>  
> Something about default arguments to `>`.

## Learn the keyboard shortcuts

The second most important thing you can learn, in my belief, is actually something as simple as the keybindings.
This might sound boring, but it will most certainly give you bang for the bucks.

If you're an Emacs user, most of the bindings should already be familiar to you, since Bash by default is in *emacs-mode*.
Hardcore Vim users might wish to change to the *vi editing mode* (you can do this by typing `set -o vi`), but I prefer to learn the defaults since that is what most people will be using.

This list is by no means exhaustive, but should cover most of the keyboard shortcuts you'll be likely to use.
Lets start with the most basic ones:

 Keys          | Description
 ------------- | -------------
 `Tab`         | Autocomplete commands and file/folder names.
 `Ctrl` + `p`  | Move back through the command history, same as `↑`.
 `Ctrl` + `n`  | Move back forwards again, like `↓`.
 `Ctrl` + `a`  | Move to the beginning of the line.
 `Ctrl` + `e`  | Move to the end of the line.
 `Ctrl` + `f`  | Move the cursor forward one character. Same as `→`.
 `Ctrl` + `b`  | Move the cursor backward one character. Same as `←`.
 `Alt` + `f`   | Move cursor forward one word.
 `Alt` + `b`   | Move cursor backward one word.

And once you get the cursor where you need to go, you can use the following commands to edit.

 Keys          | Description
 ------------- | -------------
 `Ctrl` + `u`  | Clear the line of everything before the cursor.
 `Ctrl` + `k`  | Clear everything after the cursor.
 `Ctrl` + `w`  | Delete the word before the cursor.
 `Alt` + `d`   | Delete the word after the cursor.
 `Ctrl` + `y`  | Paste (yank) anything cut by the above.
 `Ctrl` + `h`  | Delete last character before cursor. (Same as `Backspace`.)
 `Ctrl` + `d`  | Delete next character after cursor.
 `Esc` + `.`   | "Paste" in the last argument to the last command you entered.
 `Ctrl` + `t`  | Swap the last two characters before the cursor.
 `Esc` + `t`   | Swap the last two words before the cursor.
 `Ctrl` + `_`  | Undo the last change.

And finally a few other useful bindings:

 Keys          | Description
 ------------- | -------------
 `Esc` + `?`   | Present list of autocomplete options at any point. Like doing a double `Tab`.
 `Ctrl` + `l`  | Clear the screen. Same as the `clear` command.
 `Ctrl` + `r`  | Search through previously used commands.
 `Ctrl` + `c`  | Send the SIGINT (kill) signal to the current process.
 `Ctrl` + `z`  | Send the current process to the background.
 `Ctrl` + `d`  | Exit the currently running command or the shell. Same as the `exit` command.


And in case you really want do dig into how this works — the Bash hotkey support is based on the `readline` command, which has an extensive man page:

    $ man readline


## The "magic" variables

Bash has a lot of [special variables](http://tldp.org/LDP/abs/html/refcards.html#AEN22165) which names are so arcane, they may seem more like magic incantations when first encountered.
Although they won't win prizes for readability any time soon, they are very useful in scripts, and a couple of them can at times be useful at the command line as well.

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

This might save you from some frustrating calls to `ps` figuring out which process to kill.

#### Checking return code with `$?`

Sometimes it isn't obvious if the last command executed was successful or not.
In such cases, use `$?` to check the return code (errno) of the last returning process.

    $ ./do-important-stuff > logfile 2>&1
    $ echo $?
    0

Any value above 0 here would, of course, indicate that the `do-important-stuff` command failed in some way.

## Move around!

One of the most used commands is probably `cd`.
It's pretty simple — give it an argument and you change your current working directory.
But what a lot of people don't know is that the `cd` command accepts the argument `-`, which basically means *go back to where I just were*.

    $ cd /folder/with/a/very/long/path
    $ cd /somewhere/else
    $ cd -
    /folder/with/a/very/long/path

Another neat little trick worth knowing about the `cd` command is the `-P` option.
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

### Be many places at once

*TODO*

To take this even further, learn to use the `pushd` and `popd` builtin commands.

    $ help pushd && help popd


## Remember the past

Every command you run in Bash is recorded. 
It is stored in `~/.bash_history` by default, and can be listed by using the `history` command.

As mentioned among the keybord shortcuts above, it is possible to bring up previous commands by using the arrow keys or `Ctrl` + `p`/`n`.
You can also search through the history using `Ctrl` + `r`, then simply typing your search.
To step back and forth between search hits, Press `Ctrl` + `r` again to go further back, or `Ctrl` + `s` to search forwards.

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
      ...  # skipping a few thousand lines
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
For `column`, the default behaviour is to retrieves all the words (but not the index/line).

If you don't quite remember which line a particular command you just typed is at, you could also specify a *search word* instead of a number for `line`.
The command `!git` would expand to your last call to `git`, while `!?foo` would expand to the last command in which `foo` was one of the arguments (or the command itself).

Since the most common case probably is to execute some variant of the previous command, there is also an alias for this, `!!`, which is simply shorthand for writing `!-1`.
This of course means that the punchline of [this fameous XKCD](http://xkcd.com/149/) could be rewritten as `sudo !!` :-)

History expansions are very powerful, and their full use goes a bit beyond the scope of this blogpost.
[Modifiers](http://www.gnu.org/software/bash/manual/bash.html#Modifiers), especially, which lets you modify the commands you retrieve before they are expanded, adds a lot of power.
It would be well worth your time to study [some examples](http://www.thegeekstuff.com/2011/08/bash-history-expansion/) and learn to use them.


## Lists and Expansions

List can be created by using the `{` and `}` characters.
By using lists you can have a command be executed on each of the items in the list.
Say we want to create three new files:

    $ touch {bar.txt,baz.txt,bax.txt}
    $ ls 
    bar.txt  bax.txt  baz.txt

In itself this isn't terribly useful (and `touch` would in this case actually do the same with each file listed as a separate argument).
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


## Do things in sequence

Sometimes you need to have several things done in sequence — things that each might take a long time to complete.
Instead of waiting for the first command to finish, then wait and type in the next, it is convenient to tell Bash to do the things in sequence.

One way to do this is to use the semicolon operator to separate commands on a single line.

    $ ./configure; make; make install

This tells Bash to first run `./configure`, wait until it's done, then run `make`, and then finally run `make install`.

This is fine in some situations, but perhaps not the best thing to do in this particular example.
What would happen if `./configure` failed? Why, then the next two commands would likely fail as well.
Instead we can ue the `&&` operator to make Bash run commands in sequence if, and only if, the previous command completed with a return code of 0, i.e. without errors.

    $ ./configure && make && make install 

### Use Controll Structures

Bash's controll structures are frequently used in scripts, but keep in mind that you can harness their power from the command line too — just use `;` where you would normally have a line break.

For loops are handy when working with files.
Say, for example, you need to roll some log files:

    $ for i in {10..1}; do mv $i.log $(($i+1)).log; done

It's of course also possible to work with files more directly, using [globbing][wikipedia-glob] or by iterating over the output from some command.

    $ for f in ls ~/important/documents; do cp $f ~/backup; echo "backed up $f"; done

While loops can be useful when you need to do something repeatedly for a while.

    $ while :; do ./run_tests.sh; sleep 10; done

[wikipedia-glob]: http://en.wikipedia.org/wiki/Glob_(programming)

## Configure Your Shell

Everything we have discussed up to now is vanilla out-of-the-box bash, and thus available anywhere you go.
But inn all likelihood you'll find yourself doing the bulk of your work at your own local shell, and as such it can be a good idea to make it as comfortable as possible.

To configure bash, edit the `.bashrc` file in your home folder.

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

## Wrapup

*TODO*

That's it. 
Hope you you found some of the tips useful, and that they will make your life a bit easier.

<!-- 
More: 
http://www.hypexr.org/bash_tutorial.php 

history expansion: 
-->
