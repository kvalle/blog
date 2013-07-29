# Continuations og CPS

Programmeringspråk. For en verden full av merkelige og fantastiske idéer og konsepter.
I dag har jeg lyst til å skrive litt om noen konsepter jeg lærte om da jeg var på [Lambda Jam](http://lambdajam.com/)-konferansen i Chicago i sommer. Det skal handle om *continuations*, programmeringspråkenes svar på save games, og litt om hvordan en ved hjelp av disse kan transformere programmer på måter som bevarer korrekthet men kan endre kjøreegenskaperne.

## Vi starter enkelt

Vi starter med et meget velkjent eksempel for alle som noen sinne har lest om (funksjonelle) programmeringspråk på internett: Factorial!

```
> (define factorial
      (lambda (n)
          (if (= n 0) 
              1
              (* n (factorial (- n 1))))))
> (factorial 5)
120
```

Dette er den naïve implementasjonen av factorial. Den fungerer greit for små input, men sprenger raskt stacken hvis vi forsøker å regne factorial av store tall.

Ofte kan vi løse det ved å lage en ekvivalent implementasjon som er tail-rekursiv. Et eksempel på en slik implementasjon under.

> TODO: Fiks eksempelet så det faktisk fungerer.

```scheme
(define factorial-iter
  (lambda (n acc)
    (if (= n 0) 
        acc
        (factorial-iter (- n 1) (* n acc)))))

(define factorial
  (lambda (n)
    (factorial-iter n 0)))

(factorial 5) ; => 120
```

Dette er et eksempel på "correctness preserving program transformation" (?)

Omskrivingen over fungerer bra, men er ikke mulig å gjøre i alle tilfeller, og det kan ofte være vanskelig å finne frem til en tail-rekursiv algoritme for problemet vi holder på med. 

Heldigvis finnes det løsninger! Men da må vi først se litt på *continuations*.

## Continuations — noen ordforklaringer

Continuations er, kort fortalt, en abstrakt representasjon av kontrolltilstanden (control state) i et program. En continuation realiserer programtilstanden ved å representere tilstanden i eksekveringen av programmet på et gitt tidspunkt som en datastruktur som kan aksesseres gjennom programmeringspråket, i stedet for å være bortgjemt i språkets runtime. Dette er svært nyttig for å realisere en rekke mekanismer, slik som for eksempel exceptions og generatorer.

Begrepet *current continuation* refererer til den continuation som, fra perspektivet av et kjørende program, representerer programmets nåværende tilstand.

Når en diskuterer programmeringspråk brukes termen *continuations* også ofte for å referere til *førsteklasses continuations*. Et språk med denne egenskapen inneholder mekanismer for å lagre programtilstanden, og for å eventuelt returnere til denne på et senere tidspunkt.

Å programmere i et språk med continuations er som å programmere med en [TARDIS](http://en.wikipedia.org/wiki/Tardis). De gir en full kontroll over utførelsesrekkefølgen til instruksjoner. Du kan hoppe til funksjonen som gjorde kallet til funksjonen du er i, eller inn i en funksjon som alt har returnert, eller til et helt annet sted i programmet.

## Dette høres litt vel magisk ut, gi meg noen eksempler!

Scheme var det første språket som hadde full støtte for continuations, og burde derfor være et passende språk for eksemplene våre. (Hvis du trenger hjelp med syntaksen, grip tak i den nærmeste personen med skjegg lenger enn 5 cm, eller en vilkårlig #ITHipster.)

La oss starte med følgende eksempel.

```scheme
(define the-continuation #f)

(define (next n)
    (call/cc (lambda (k) (set! the-continuation k)))
    (set! n (+ n 1))
    n)
```

Her definerer vi to ting. Først en variabel som skal holde på vår første continuation. Deretter funksjonen `next` som, hver gang den kalles, tar inn et parameter `n`, inkrementerer dette, og returnerer det inkrementerte argumentet.

```scheme
> (next 41)
42
> (next 41)
42
```

Men i tillegg til å returnere den inkrementerte verdien gjør `next` én ting til. La oss ta en nærmere titt på linjen

```scheme
(call/cc (lambda (k) (set! the-continuation k)))
```

Først har vi et kall til funksjonen `call/cc` (som står for *call with current continuation*). `call/cc` tar en funksjon som argument, og kaller denne funksjonen med en continuation som representerer nåværende tilstand i programmet. Siden vi her mater `call/cc` et lambda-uttrykk settes altså `k` til nåværende continuation, og vi lagrer denne i variabelen `the-continuation` som er definert utenfor funksjonen.

Funksjonen `next` sørger dermed for å lagre tilstanden i koden på punktet rett før `n` inkrementeres. Funksjonen `next` utfører altså to oppgaver: a) å inkrementere og returnere input, og b) å lagre en continuation i den ytre variablen `the-continuation`. 

## Okay, men hvordan virker det egentlig? 

> TODO

## Kult nok, men er dette bare en sånn Lisp-greie?

Scheme var kanskje det første språket med førsteklasses continuations, men mange har siden fulgt etter. Ta for eksempel Haskells [Continuation Monad](http://hackage.haskell.org/packages/archive/mtl/2.0.1.0/doc/html/Control-Monad-Cont.html), Perl med [Coro](http://search.cpan.org/~mlehmann/Coro-6.31/Coro/State.pm), Rubys [callcc](http://www.ruby-doc.org/core-1.9.3/Continuation.html), eller Scalas [Responder](http://www.scala-lang.org/api/current/index.html#scala.Responder). Ja, det finnes til og med [Java-biblioteker](http://lightwolf.sourceforge.net/index.html) for continuations.

I tillegg er det fullt mulig å implementere `call/cc` manuelt i ethvert språk som har støtte for closures. Og hvorfor bruke et bibliotek eller noe innebygget når en kan lage det selv! 

## CPS

Nå som vi vet hva continuations er, la oss ta en ny titt på factorial, eksempelet vi innledet med.

> TODO

## Et lite forbehold

Vi har sett at continuations lar oss gjøre ganske imponerende ting med programmer. Vær dog på vakt — continuations er funksjoners svar på GOTO, med de problemene det kan føre med seg: De gjør det enkelt å skrive kode det er vanskelig å følge, og som kan være svært vanskelig å resonere rundt. Programmereren tvinges til å overholde invarianter i kontrollflyten for hånd, noe som lett fører til problemer. Avansert kode inneholder gjerne avanserte feil!

Continuations gjør det noen ganger enkelt å implementere avanserte og nyttige konstruksjoner og mekanismer, men er ikke noe selv hardcore fans ønsker å forholde seg til direkte altfor ofte.

Er det kult? Ja. Burde du løpe og ta continutaions i bruk i prosjektet? Vel, ikke med mindre du *virkelig* vet hva du driver med.

---

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


