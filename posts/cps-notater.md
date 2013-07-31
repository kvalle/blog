**Notater**

- <https://en.wikipedia.org/wiki/Continuation#First-class_continuations>  
- <http://lambda-the-ultimate.org/node/86>  
- <http://matt.might.net/articles/programming-with-continuations--exceptions-backtracking-search-threads-generators-coroutines/>  
- <http://idea-log.blogspot.com/2005/10/why-are-continuations-so-confusing-and.html>
- <http://www.jquigley.com/files/talks/continuations.pdf>
- <http://www.ps.uni-saarland.de/~duchier/python/continuations.html>
- <https://en.wikipedia.org/wiki/Continuation-passing_style>
- <https://github.com/namin/lambdajam>
- <https://github.com/namin/lambdajam/blob/master/cps-work.scm>

> Continuations are also used in models of computation including denotational semantics, the Actor model, process calculi, and lambda calculus. These models rely on programmers or semantics engineers to write mathematical functions in the so-called continuation-passing style. This means that each function consumes a function that represents the rest of the computation relative to this function call. To return a value, the function calls this "continuation function" with a return value; to abort the computation it returns a value.
>
> Functional programmers who write their programs in continuation-passing style gain the expressive power to manipulate the flow of control in arbitrary ways. The cost is that they must maintain the invariants of control and continuations by hand, which is a highly complex undertaking.
>
> <https://en.wikipedia.org/wiki/Continuation#First-class_continuations>

---

> So, to understand continuations, assuming you really understand closures, the next thing you have to do is abandon the idea of functions that automatically return to their caller, because that's a mental barrier which will trip you up repeatedly. Instead, think in terms of continuation-passing style, in which every function is called with an "extra" parameter, its continuation, and it calls that continuation when it's done. Remember, that continuation is just a closure, i.e. a procedure - there really isn't anything special about it that matters. When a function is done, it calls its continuation, which is just another function.
>
> Note that even imperative languages, like C or BASIC or Java, work like this, just in a very restricted form, in which the contination passed to every function is always a "return continuation", which invokes the continuation at the point of the call which invoked the function in question. In these continuation-challenged languages, the return continuation usually has limitations on what parameters it can take, i.e. how many or what kind of values it can "return". In a fully general continuation model, a continuation is just like any other procedure and can accept as many arguments of whatever type that any other procedure can accept.
>
> As for call/cc, it's easy: all it does is turn the current continuation - i.e. the continuation at the point in the program where call/cc is called - into a closure. There really isn't much more to it than that.
>
> The rest is figuring out what you can do with continuations, to which the answer is, anything that involves control flow: build threads, engines, coroutines, do goal-seeking, backtracking, etc. That's where some of the confusing stuff really starts, because once you start messing with control flow, it's easy to get confused. 
>
> <http://lambda-the-ultimate.org/node/86>



## Har du et litt mer avansert eksmpel?

Klart det. La oss se på denne noe mer avanserte (og like lite nyttige) generatoren, implementert på samme måte.

```scheme
(define next-fib #f)

(define (init-fib)
  (let* ((x 1) 
        (y 1) 
        (tmp #f))
    (call/cc (lambda (k) (set! next-fib k)))
    (set! tmp x)
    (set! x y)
    (set! y (+ x tmp))
    x))
```

Denne fibonacci-implementasjonen fungerer på følgende måte.

```scheme
> (init-fib)
1
> (next-fib)
2
> (next-fib)
3
> (next-fib)
5
> (next-fib)
8
> (next-fib)
13
```

Dette eksempelet viser også hvor viktig det er å holde tunga rett i munnen når en bruker continuations. For å få hentet ut de 5 første fibonacci-tallene kan det kanskje friste å skrive noe à la det følgende:

```
> (init-fib)
1
> (map next-fib (list 1 2 3 4 5))
2
```

Men vi ser at vi slett ikke får returnert en liste, slik en skulle tro, men bare ett enkelt fibonacci-tall tilbake. Grunnen til dette er at å kalle `next-fib` ikke er som å kalle en vanlig funksjon, men å flytte utførelsen av programmet til continuation som `next-fib` representerer, og på dette punktet hadde det ikke skjedd noe kall til `map`!



