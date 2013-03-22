---
date: 2011-12-27
title: Writing Grinder Test Scripts in Java
description: "Although Grinder supports writing test scripts in Python, sometimes you want or need to do things in Java."
---

# Writing Grinder Test Scripts in Java

I've recently been doing quite a bit of performance testing, and my most important tool for this has been [The Grinder](http://grinder.sourceforge.net/) — an open source, lightweight load testing framework.

Although itself written in Java, Grinder uses Jython (and as of version 3.6 also Closure) for its test scripting engine.
Python is a great language, and naturally suited for writing this kind of tests.
However, on this particular project we didn't want to introduce another language just for this, and thus sought to do as much of the testing as possible from Java.

Unfortunately, Grinder does not seem to support writing test scripts in Java.
Since we found no way around doing some of the scripting in Jython, we decided to create a small proxy script working as a bridge between Grinder and our tests.
What we ended up with was the following.

```python
from net.grinder.plugin.http import HTTPRequest
from net.grinder.script.Grinder import grinder
 
def load_class(class_name):
    m = __import__(class_name)
    for comp in class_name.split('.')[1:]:
        m = getattr(m, comp)
    return m
 
test_runner = load_class(grinder.getProperties().getProperty('java_test_runner'))
 
class TestRunner:
 
    def __init__(self):
        self.runner = test_runner(HTTPRequest())
     
    def __call__(self):
        self.runner.call()
```

The script loads our Java implementation of the TestRunner, and wraps it as a standard Jython TestRunner just like Grinder expects.
The name of the Java class is specified along with everything else in the grinder properties file.

```
java_test_runner = my.java.package.MyTestRunner
 
grinder.script = grinder.py
grinder.runs = 10
grinder.threads = 2
# etc
```

A simple implementation of the Java version of the TestRunner might then look something like the following.

```java
package my.java.package;
 
import net.grinder.plugin.http.HTTPRequest;
import net.grinder.script.NotWrappableTypeException;
import net.grinder.script.Test;
 
public class MyTestRunner {
 
    private HTTPRequest test;
     
    public JavaTestRunner(HTTPRequest req) throws NotWrappableTypeException {
        this.test = (HTTPRequest) new Test(100, "http test").wrap(req);
    }
     
    public void call() throws Exception {
        this.test.GET("http://google.com");
        this.test.GET("http://nytimes.com");
    }
}
```

You might notice that we are passing the `HTTPRequest` objects from Jython to Java.
This is because initializing them in Java resulted in `NoClassDefFoundError`s, while there were no problems creating them from within the Jython script.

