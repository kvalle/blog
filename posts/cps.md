# Continuations og CPS

Programmering—for en verden full av merkelige og fantastiske idéer og konsepter.
I dag har jeg lyst til å skrive litt om noe jeg lærte om da jeg var på [Lambda Jam](http://lambdajam.com/)-konferansen i Chicago i sommer. 
Der var jeg blant annet på en [workshop om program transformations](http://lambdajam.com/sessions#amin) med William Byrd og Nada Amin.
Denne bloggposten omhandler noe av det aller mest grunnleggende vi gikk igjennom der.
Det skal handle om *continuation passing style* (CPS) en måte å skrive om programmer slik at de blir fryktelig vanskelige å lese, men får noen morsomme egenskaper. 
Dette blir teoretisk, for de aller fleste fullstendig unyttig, og forhåpentlig ganske artig (i alle fall for noen spesielt interesserte).

## Vi starter enkelt

Vi starter med et meget velkjent eksempel<sup>[1](#footnote-1)</sup> for alle som noensinne har lest om (funksjonelle) programmeringspråk på internett: Factorial!

```scheme
> (define (factorial n)
    (if (= n 0) 
        1
        (* n (factorial (- n 1)))))
> (factorial 5)
120
```

Dette er den naive implementasjonen av factorial. La oss ta en titt:

```scheme
> (trace factorial)
> (factorial 5)
|(factorial 5)
| (factorial 4)
| |(factorial 3)
| | (factorial 2)
| | |(factorial 1)
| | | (factorial 0)
| | | 1
| | |1
| | 2
| |6
| 24
|120
120
```

Kall-stacken vokser for hvert rekursive kall. Dette fungerer greit for små input, men sprenger raskt stacken hvis vi forsøker å regne factorial av store tall.

Ofte kan vi løse det ved å lage en ekvivalent implementasjon som er tail-rekursiv, gjerne ved hjelp av en hjelpe-funksjon. I tail-kall-optimaliserte språk vil dette løse problemet. Et eksempel på en slik implementasjon vises under.

```scheme
> (define (factorial-iter n acc)
    (if (= n 0)
        acc
        (factorial-iter (- n 1) (* n acc))))
> (define (factorial n)
    (factorial-iter n 1))
> (factorial 5)
120
```

Igjen, la oss se på hvordan kall-stacken vokser:

```scheme
> (trace factorial-iter)
> (trace factorial)
> (factorial 5)
|(factorial 5)
|(factorial-iter 5 1)
|(factorial-iter 4 5)
|(factorial-iter 3 20)
|(factorial-iter 2 60)
|(factorial-iter 1 120)
|(factorial-iter 0 120)
|120
120
```

Som vi ser, kall-stacken øker aldri! Selv ikke kallet til `factorial-iter`, som også er et tail-kall, har noen effekt. 

Denne omskrivingen fungerer bra. Dessverre kan det i mange tilfeller være svært vanskelig å komme opp med en ekvivalent tail-rekursiv algoritme for problemet en løser. Men fortvil ikke, det finnes en generell løsning for hvordan en kan oppnå dette. La oss først ta et par steg tilbake for å forstå et konsept vi vil få bruk for — *continuations*.


## Continuations

For å forstå continuations er det lurt å begynne enkelt. La oss starte med den kanskje enkleste funksjonen du vil se i dag: funksjonen som plusser én til sitt input.

```scheme
(define (inc n)
  (+ n 1))
```

Det er en implisitt egenskap ved denne funksjonen som vi er så vant til at du antagelig ikke engang tenker over det: stedet verdien `n + 1` returneres til. En av hovedidéene bak continuations er å gjøre denne egenskapen eksplisitt.

Vi kan gjøre dette ved å, i stedet for å *returnere*, la verdien *fortsette* ved å sende den videre som argument til en annen funksjon<sup>[2](#footnote-2)</sup> — en continuation — som vi tar inn som et ekstra parameter i funksjonen.

```scheme
(define (inc n k)
  (k (+ n 1)))
```

Funksjonen `k` retpresenterer "arbeidet som gjenstår etter at funksjonen er ferdig". (Valget av av bokstven "k" om variabelnavn her er ikke tilfeldig — det er en vanlig konvensjon for å representere continuation-argumenter.)

En måte å tenke på continuations er som [lambda-abstraksjoner over hull i koden](https://github.com/namin/lambdajam/blob/master/cps-work.scm). Ta for eksempel følgende utrykk: 

```scheme
(+ 1 (- 2 (+ 3 4)))
``` 

Vi ønsker å lage en continuation som representerer arbeidet som gjenstår etter at vi har regnet ut `(+ 3 4)`. Dette kan vi gjør ved å bytte `(+ 3 4)` med en variabel, for eksempel `HULL`, og pakke alt inn i en lambda-funksjon som tar inn denne variabelen.

```scheme
(lambda (HULL) 
  (+ 1 (- 2 HULL)))
```

Denne funksjonen representerer nå evalueringen som vil gjøres etter at 3 og 4 er lagt sammen.

## Continuation Passing Style

Denne idéen om å ta en *continuation* — stedet evalueringen skal fortsette — som et ekstra argument danner grunnlaget for en programmeringstil som kalles *Continuation Passing Style* eller CPS.

Programmering i CPS følger disse reglene:

1. Alle funksjonssignaturer får et ekstra parameter
1. Funksjoner returnerer ikke, men sender i stedet "returverdien" videre til som argument til dette ekstra parameteret.

**Eksempel: `add-double`**

La oss ta for oss et enkelt eksempel. Vi begynner med følgende funksjon, `add-double`, som simpelthen returnerer det dobbelte av summen av sine to argumenter.

```scheme
> (define (add-double x y)
    (* 2 (+ x y)))
> (add-double 2 3)
10
```

Denne funksjonen kan skrives om som følger, for å følge continuation passing style.

```scheme
(define (add-double& x y k)
  (+& x y (lambda (xy)
      (*& 2 xy k))))
```

Legg merke til at vi først legger sammen `x` and `y`, som er det innerste uttrykket i den normale `add-double`-funksjonen. Resultatet av dette sendes til en `lambda`-continuation, som i sin tur multipliserer veriden med 2, før den "returnerer" ved å sende det endelige resultatet til `k`, continuation som ble sendt inn til `add-double&`.

Vi ser også at vi ikke har kunnet bruke de vanlige versjonene av `+` and `*`, ettersom disse ikke er i CPS. I stedet har vi definert nye varianter som følger:

```scheme
(define (*& x y k)
  (k (* x y)))

(define (+& x y k)
  (k (+ x y)))
```

For å testen `add-double` sender vi en passende lambda-funksjon inn som continuation, slik at vi får fatt på resultatet. Her kommer identitetfunksjonen greit med.

```scheme
> (add-double& 2 3 (lambda (x) x))
10
```

**Fremgangsmåte**

La oss ta et annet eksempel, og se på stegene en må følge for å konvertere et program i "direct style" over til CPS.

Eksempelet vi tar for oss er Pythagoras formel for å regne ut hypothenus. Her er først vanlig kode, som ikke er CPS. Vi har 2 funksjoner: `square` for å regne ut `x * x`, og `hypo` som regner ut hypothenus gitt lengde av to katet.


```scheme
(define (square x) (* x x))

(define (hypo a b)
  (sqrt (+ (square a)
     (square b))))
```

I Scheme er denne formen for `define` syntaktisk sukker for følgende definisjon med lambda-uttrykk. Vi skriver om til dette, så det er tydeligere hva vi har å jobbe med.

```scheme
(define square
  (lambda (x)
    (* x x)))

(define hypo
  (lambda (a b)
    (sqrt (+ (square a)
       (square b)))))
```

La oss starte med å konvertere `square` til CPS og kalle denne `square/k`. For å gjøre dette benytter vi en regel.

> Alle lambda-uttrykk skal utvides med et ekstra argument, før en fortsetter å prosessere funksjonskroppen til lambdaen.
> 
>    `(lambda (x ...) ...) => (lambda (x ... k) ...^)`

Vi vet altså at løsningen må være noe á la følgende:

```scheme
(define square/k
  (lambda (x k)
    NOE))
```

Vi vet også alt at resultatet av funksjonen sendes videre til `k`, så løsningen må bli:

```scheme
(define square/k
  (lambda (x k)
    (k (* x x))))
```

Dette gikk foreløpig ganske greit! Vi gyver løs på `hypo/k`.

Igjen vet vi, basert på regelen over, at løsningen må ha form som følger.

```scheme
(define hypo/k
  (lambda (a b k)
    NOE))
```

Det neste vi må gjøre er å finne det første uttrykket som kan evalueres. I dette tilfellet kan det være enten `(square a)` eller `(square b)`, ettersom evaluerings-rekkefølgen til argumenter ikke er spesifisert i Scheme. Det er opp til oss å velge, og dermed avgjøre eksekveringsrekkefølgen. La oss bestemme at `(square a)` evalueres først.

Vi husker å benytte den CPS-ifiserte `square/k`, og må derfor sende inn en continuation som siste argument, der vi skal implementere resten av koden. Variabelen vi sender inn `a2` representerer resultatet av føste del, kvadratet av `a`.

```scheme
(define hypo/k
  (lambda (a b k)
    (square/k a (lambda (a2) 
      NOE))))
```

Vi vet nå at det neste vi må evaluere er `(square b)`, så vi gjentar og gjør det samme med denne som vi nettopp gjorde for `(square a)`.

```scheme
(define hypo/k
  (lambda (a b k)
    (square/k a (lambda (a2) 
      (square/k b (lambda (b2)
        NOE))))))
```

Begge argumentene til `+` er nå evaluert og vi kan derfor kalle denne. Vi bruker den CPS-ifiserte varianten `+&` som vi definerte tidligere.

```scheme
(define hypo/k
  (lambda (a b k)
    (square/k a (lambda (a2) 
      (square/k b (lambda (b2)
        (+& a2 b2 (lambda (a2-plus-b2)
              NOE))))))))
```

Alt som nå gjenstår er å ta kvadratroten for å få det endelige resultatet. Vi gjør dette, og sender samtidig verdien til `k`, `hypo/k` sin continuation.

```scheme
(define hypo/k
  (lambda (a b k)
    (square/k a (lambda (a2) 
      (square/k b (lambda (b2)
        (+& a2 b2 (lambda (a2-plus-b2)
              (k (sqrt a2-plus-b2))))))))))
```

Da er vi i mål! Og testing av funksjonene viser at alt fortsatt fungerer som før:

```scheme
> (hypo 3 4)
5
> (hypo/k 3 4 (lambda (x) x))
5
```

## Egenskaper

> TODO: Point out properties that CPS gives you (and properties of other transformations as well, as we cover them): all serious calls are tail calls, all arguments to calls are simple, fix order of evaluation.

Denne måten å programmere på gjøre en rekke ting eksplisitt, som vanligvis er implisitt i såkalt "direkte stil", den vanlige måten å programmere på. Et eksempel, nevnt over, er at det nå er eksplisitt hvor funksjonen "returnerer". Andre ting er rekkefølgen argumenter evalueres, som bestemmes av rekkefølgen på continuations, og [tail-calls](http://en.wikipedia.org/wiki/Tail_call), som nå består av å kalle en funksjon med den samme continuation en fikk inn, uendret.

Kode i CPS har også den egenskapen at koden "vrenges" inn-ut, ettersom det er de innerste uttrykkene som må evalueres først.


**Alt er tail-calls**

Som vi så innledningsvis var den andre implementasjonen av factorial langt bedre for høye inputverdier ettersom den benyttet tail-rekursive funksjonskall, og dermed unngikk å sprenge stacken.

Det interessante med kode skrevet i CPS er at, ettersom det aldri er noen implisitte continuations, er alle kall tail-kall! Dette betyr at det er mulig å mekanisk konvertere et hvert program til et annet som har samme oppførsel, men som er tail-rekursivt. Dette er en teknikk som brukes i mange kompilatorer.

<!-- https://en.wikipedia.org/wiki/Continuation-passing_style#CPS_and_tail_calls -->

## Vi vender tilbake til `factorial`

La oss ta en ny titt på det innldende eksempelet, og se hva vi kan få til med CPS. Vi starter med den opprinnelige funksjonen, definert med eksplisitt lambda, og legger til det ekstra argumentet `k`.

```scheme
(define factorial
  (lambda (n k)
    (if (= n 0) 
        1
        (* n (factorial (- n 1))))))
```

Vi tar denne gangen en litt mer pragmatisk tilnærming. Så langt har vi benyttet CPS-reglene på *alle* uttrykk i programmene. Dette er strengt tatt ikke nødvendig for *enkle uttrykk*, dvs uttrykk vi vet vil returnere umiddelbart.

Tidligere ville vi startet med å lage en continuation over `(= n 0)`, men siden vi vet at dette er et enkelt uttrykk lar vi det stå som det gjør.

Det er derimot slik at enkle uttrykk vi ikke vet hvorvidt vil bli evaluert — uttrykk vi risikerer å "returnere" — skal pakkes inn i et kall til `k` som tidligere. Vi gjør dette, og er ferdig med "then"-grenen av `if`-uttrykket:

```scheme
(define factorial
  (lambda (n k)
    (if (= n 0) 
        (k 1)
        (* n (factorial (- n 1))))))
```

Det neste uttrykket som kan utføres er `(- n 1)`. Også dette er et enkelt uttrykk, og vi lar det være som det er. Det rekursive kallet til `factorial` er derimot definitivt ikke et enkelt uttrykk. Vi bytter "else"-grenen ut med en continuation over dette kallet.

```scheme
(define factorial/k
  (lambda (n k)
    (if (= n 0)
        (k 1)
        (factorial/k (- n 1) (lambda (fac-n-minus-1)
                                (* n fac-n-minus-1))))))
```

Til sist må vi huske å kalle `k` i stedet for å returnere direkte:

```scheme
(define factorial/k
  (lambda (n k)
    (if (= n 0)
        (k 1)
        (factorial/k (- n 1) (lambda (fac-n-minus-1)
                                (k (* n fac-n-minus-1)))))))
```

Voilà, vi har CPSet factorial! For å sjekke at det fungerer tracer vi et kall, og ser på stacken.

```scheme
> (trace factorial/k)
(factorial/k)
> (factorial/k 5 (lambda (x) x))
|(factorial/k 5 #<procedure>)
|(factorial/k 4 #<procedure>)
|(factorial/k 3 #<procedure>)
|(factorial/k 2 #<procedure>)
|(factorial/k 1 #<procedure>)
|(factorial/k 0 #<procedure>)
|120
120
```

Sannelig, stacken oppfører seg som den alternative tail-rekursive algoritmen vi så på tidligere. Men denne gangen har vi ved hjelp av CPS fått denne oppførselen uten å endre på hvordan algoritmen fungerer.

Og for de som måtte lure på hvordan koden ville sett ut dersom vi ikke hadde vært pragmatiske og latt de enkle uttrykkene være i fred, her er en fullstendig CPSet versjon, der `*&`, `-&` og `=&` er CPS-varianter av de samme operatorene.

```scheme
> (define factorial/k
    (lambda (n k)
      (=& n 0 (lambda (is-zero)
                (if is-zero 
                    (k 1)
                    (-& n 1 (lambda (n-minus-1) 
                              (factorial/k n-minus-1 (lambda (fact-n-minus-1)
                                                        (*& n fact-n-minus-1 k))))))))))
> (factorial/k 5 (lambda (x) x))
120
```

## Et siste eksempel

TODO: Fibonacci-eksempelet

<https://cgi.soic.indiana.edu/~c311/doku.php?id=cps-refresher>

## Oppsummering

Vi har sett at Continuation Passing Style er en måte å programmere på som gir den resulterende koden noen helt spesifikke, og ofte ettertraktede, egenskaper. Koden får en helt eksplisitt evalueringsrekkefølge, ettersom vi ikke returnerer til noen implisitte continuations er alle kall tail-calls, og alle argumenter er enkle uttrykk.

I noen eksempler så vi hvordan det å bruke CPS som en generell taktikk for tvinge tail-calls førte til at programmer eksekverte med konstant størrelse på kall-stacken. Det skal også bemerkes at CPS alene ikke vil hjelpe oss med dette i språk som ikke er optimalisert for tail-kall. I slike språk kan en bruke teknikker som [trampolining][wiki-trampolining] sammen med CPS for å oppnå tilsvarende resultater.

[wiki-trampolining]: https://en.wikipedia.org/wiki/Trampoline_(computers)#High_level_programming

Prosessen med å konvertere programmer krever også en hel del konsentrasjon, og det er lett å gjøre feil. Koden "vrenges" inn-ut, og kan lett bli tung å lese. Dette er ikke en teknikk som brukes manuelt av mange programmerere, men i langt større grad av kompilatorer og liknende. Det er likevel morsomt å vite at en har muligheten dersom behovet skulle oppstå, og det er en viktig transformasjon å kjenne hvis en har lyst til å lære om kompilering av høynivå språk.


**Fotnoter**

1. <a id="footnote-1"></a>Eksemplene i denne bloggposten er kun testet i [Petite Scheme](http://www.scheme.com/petitechezscheme.html), men bruker ikke noen spesielle features, og burde fungere i de fleste scheme-interpreters. Kanskje med unntak av `trace`.
2. <a id="footnote-2"></a>Merk at selv om (lambda-)funksjoner med ett argument er brukt for å representere continuations i disse eksemplene, så betyr ikke dette at lambdaer er den eneste mulige representasjonen. Continuation som konsept er ikke knyttet til noen enkelt representasjon.
