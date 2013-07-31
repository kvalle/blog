# Gøy med continuations

TODO: intro

Det skal handle om *continuations*, programmeringspråkenes svar på save games.

## Noen ordforklaringer

Continuations er, kort fortalt, en abstrakt representasjon av kontrolltilstanden (control state) i et program. En continuation realiserer programtilstanden ved å representere tilstanden i eksekveringen av programmet på et gitt tidspunkt som en datastruktur som kan aksesseres gjennom programmeringspråket, i stedet for å være bortgjemt i språkets runtime. Dette er svært nyttig for å realisere en rekke mekanismer, slik som for eksempel exceptions og generatorer.

Begrepet *current continuation* refererer til den continuation som, fra perspektivet av et kjørende program, representerer programmets nåværende tilstand.

Når en diskuterer programmeringspråk brukes termen *continuations* også ofte for å referere til *førsteklasses continuations*. Et språk med denne egenskapen inneholder mekanismer for å lagre programtilstanden, og for å eventuelt returnere til denne på et senere tidspunkt. Det er denne typen vi skal leke oss med i denne bloggposten.

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

Først har vi et kall til funksjonen `call/cc` (som er kort for `call-with-current-continuation`). `call/cc` tar en funksjon som argument, og kaller denne funksjonen med en continuation som representerer nåværende tilstand i programmet. Siden vi her mater `call/cc` et lambda-uttrykk settes altså `k` til nåværende continuation, og vi lagrer denne i variabelen `the-continuation` som er definert utenfor funksjonen.

Funksjonen `next` sørger dermed for å lagre tilstanden i koden på punktet rett før `n` inkrementeres. Funksjonen `next` utfører altså to oppgaver: a) å inkrementere og returnere input, og b) å lagre en continuation i den ytre variablen `the-continuation`. 

Continuations representerer "arbeidet som gjenstår" på et gitt punkt i koden. For å fortsette dette arbeidet kan vi kalle dem som om de var helt vanlige funksjoner. Hva skjer så når vi kaller `the-continuation`?

```scheme
> (next 0)
1
> (the-continuation)
2
> (the-continuation)
3
```

Vi fortsetter å inkrementere og returnere den samme variabelen! Siden vi på punktet `the-continuation` ble lagret ikke enda hadde returnert fra funksjonen fortsetter vi å oppdatere den `n` i `next` sin closure. Vi hopper midt inn i `next`, opererer på den samme variabelen hver gang, før vi returnerer på nytt (og på nytt og på nytt)!

Her er litt mer eksempel på bruk, slik at det skal bli enklere å forstå hvordan alt henger sammen.

```scheme
> (next 0)
1
> (the-continuation)
2
> ; lagrer en kopi av the-continuation
  (define another-continuation the-continuation)
> (the-continuation)
3
> (another-continuation)
4
> (the-continuation)
5
> (next 0)
1
> (the-continuation)
2
> (another-continuation)
6
```

Legg merke til at både `the-continuation` og kopien vi lagrer i `another-continuation` opererer på samme continuation, og dermed inkrementerer samme `n`. Når vi kaller `next` "resetter" vi `the-continuation` med en ny continuation, mens `another-continuation` fremdeles jobber på samme som før.

## Alt er ikke så enkelt som det ser ut til

Fra eksempelet over kan det se ut til at `the-continuation` i eksempelet over  oppfører seg som en enkel [generator-funksjon][wikipedia-generator]. Men alt er ikke like rett frem som det ser ut til.

[wikipedia-generator]: http://en.wikipedia.org/wiki/Generator_(computer_programming)

Vurder funksjonen for et øyeblikk:

```scheme
(define (confusing-function)
  (the-continuation)
  "discombobulated")
```

Denne enkle funksjonen gjør et kall til `the-continuation` (og ignorerer tilsynelatende resultatet) før den returnerer strengen "discombobulated". La oss se på hva som skjer når vi bruker funksjonen.

```scheme
> (next 0)
1
> (confusing-function)
2
> (confusing-function)
3
```

Som vi ser, teksten returneres aldri! I stedet får vi tilbake resultatet fra kallet til `the-cointinuation`. Dette skjer fordi kallet til `the-continuation` slett ikke er et vanlig funksjonskall slik vi vanligvis tenker på dem. Vi har reist tilbake i tid til stedet der `the-continuation` ble satt:  I kallet til `(next 0)` — og kallet til `confusing-function` har ikke engang funnet sted enda.

## Kult nok, men er dette bare en sånn Lisp-greie?

Scheme var kanskje det første språket med førsteklasses continuations, men mange har siden fulgt etter. Ta for eksempel Haskells [Continuation Monad](http://hackage.haskell.org/packages/archive/mtl/2.0.1.0/doc/html/Control-Monad-Cont.html), Perl med [Coro](http://search.cpan.org/~mlehmann/Coro-6.31/Coro/State.pm), Rubys [callcc](http://www.ruby-doc.org/core-1.9.3/Continuation.html), eller Scalas [Responder](http://www.scala-lang.org/api/current/index.html#scala.Responder). Ja, det finnes til og med [Java-biblioteker](http://lightwolf.sourceforge.net/index.html) for continuations.

I tillegg er det fullt mulig å implementere `call/cc` manuelt i ethvert språk som har støtte for closures. Og hvorfor bruke et bibliotek eller noe innebygget når en kan lage det selv! 

## Et lite forbehold

Vi har sett at continuations lar oss gjøre ganske imponerende ting med programmer. Vær dog på vakt — continuations er funksjoners svar på GOTO, med de problemene det kan føre med seg: De gjør det enkelt å skrive kode det er vanskelig å følge, og som kan være svært vanskelig å resonere rundt. Programmereren tvinges til å overholde invarianter i kontrollflyten for hånd, noe som lett fører til problemer. Avansert kode inneholder gjerne avanserte feil!

Continuations gjør det noen ganger enkelt å implementere avanserte og nyttige konstruksjoner og mekanismer, men er ikke noe selv hardcore fans ønsker å forholde seg til direkte altfor ofte.

Er det kult? Ja. Burde du løpe og ta continutaions i bruk i prosjektet? Vel, ikke med mindre du *virkelig* vet hva du driver med.
