---
layout: post
categories: 
    - testing
    - grinder
    - java
    - jython
date: 2011-12-27
title: Writing Grinder Test Scripts in Java
published: true
---

I've recently been doing quite a bit of performance testing, and my most important tool for this has been [The Grinder](http://grinder.sourceforge.net/)--an open source, lightweight load testing framework.

Although itself written in Java, Grinder uses Jython (and as of version 3.6 also Closure) for its test scripting engine.
Python is a great language, and naturally suited for writing this kind of tests.
However, on this particular project we didn't want to introduce another language just for this, and thus sought to do as much of the testing as possible from Java.

Unfortunately, Grinder does not seem to support writing test scripts in Java.
Since we found no way around doing some of the scripting in Jython, we decided to create a small proxy script working as a bridge between Grinder and our tests.
What we ended up with was the following.

{% gist 1622421 grinder.py %}

<!-- end preview -->

The script loads our Java implementation of the TestRunner, and wraps it as a standard Jython TestRunner just like Grinder expects.
The name of the Java class is specified along with everything else in the grinder properties file.

{% gist 1622421 grinder.properties %}

A simple implementation of the Java version of the TestRunner might then look something like the following.

{% gist 1622421 MyTestRunner.java %}

You might notice that we are passing the `HTTPRequest` objects from Jython to Java.
This is because initializing them in Java resulted in `NoClassDefFoundError`s, while there were no problems creating them from within the Jython script.

