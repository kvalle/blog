# Continuations og CPS

Programmering—for en verden full av merkelige og fantastiske idéer og konsepter.
I dag har jeg lyst til å skrive litt om noe jeg lærte om da jeg var på [Lambda Jam](http://lambdajam.com/)-konferansen i Chicago i sommer. 
Der var jeg blant annet på en [workshop om Program Transformations](http://lambdajam.com/sessions#amin) med [William Byrd](https://twitter.com/webyrd) og [Nada Amin](https://twitter.com/nadamin).
Denne bloggposten omhandler noe av det aller mest grunnleggende vi gikk igjennom der.
Det skal handle om *continuation passing style* (CPS) en måte å skrive om programmer slik at de blir slitsomme å lese, men får noen fine egenskaper. 

Mer konkret skal vi se på hvordan vi med utgangspunkt i eksisterende kode kan skrive denne om slik at algoritmen bevares utendret, mens programmets behov for bruk av kall-stack elimineres.
Dette blir teoretisk, for de aller fleste fullstendig unyttig, og forhåpentlig ganske artig (i alle fall for noen spesielt interesserte).

## Vi starter enkelt

Vi starter med en meget velkjent funksjon<sup>[1](#footnote-1)</sup> for alle som har lest (funksjonelle) kodeekesmpler på internett: Factorial!

```scheme
> (define factorial 
    (lambda (n)
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

Kall-stacken vokser for hvert rekursive kall. Dette fungerer greit for små input, men vil sprenge stacken hvis vi forsøker å regne factorial av store tall.

Ofte kan vi lage en ekvivalent implementasjon som er tail-rekursiv, noe som (gitt at implementasjonen av språket en bruker er optimalisert for tail-kall) vil løse problemet. Et eksempel på en slik implementasjon vises under.

```scheme
> (define factorial-iter
    (lambda (n acc)
      (if (= n 0)
          acc
          (factorial-iter (- n 1) (* n acc)))))
> (define factorial 
    (lambda (n)
      (factorial-iter n 1)))
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

Dette er oppførselen vi ønsker — kallet til `factorial` klarer seg med én enkelt stack-frame uansett hvor stor input blir.
Men selv om denne omskrivingen fungerer bra er det dessverre slik at det i mange tilfeller være vanskelig å komme opp med en ekvivalent tail-rekursiv algoritme for problemet en har løst. 

Men fortvil ikke, det finnes en generell løsning for hvordan en kan oppnå dette. For å komme frem til denne, la oss først ta et par steg tilbake for å se på et konsept vi vil få bruk for.


## Continuations

For å forstå continuations er det lurt å begynne enkelt. La oss starte med den kanskje enkleste funksjonen du vil se i dag: Funksjonen som legger én til sitt input.

```scheme
(define (inc n)
  (+ n 1))
```

Det er en implisitt egenskap ved denne funksjonen som vi er så vant til at du antagelig ikke engang tenker over det: Stedet verdien `n + 1` returneres til. En av hovedidéene bak continuations er å gjøre denne egenskapen eksplisitt.

Vi kan gjøre dette ved å, i stedet for å *returnere*, la verdien *fortsette* ved å sende den videre som argument til en annen funksjon<sup>[2](#footnote-2)</sup> — en continuation — som vi tar inn som et ekstra parameter i funksjonen.

```scheme
(define (inc n k)
  (k (+ n 1)))
```

Funksjonen `k`<sup>[3](#footnote-3)</sup> retpresenterer "arbeidet som gjenstår etter at funksjonen er ferdig". Vi regner ut resultatet av funksjonen, og sender dette videre til resten av programmet. Tidligere ville "resten" vært hvor enn vi koden kallet til funksjonen ble foretatt, mens resten av det som skal gjøre nå er `k` sitt ansvar.

En måte å tenke på continuations er som [lambda-abstraksjoner over hull i koden](https://github.com/namin/lambdajam/blob/master/cps-work.scm). Ta for eksempel følgende utrykk: 

```scheme
> (+ 1 (- 2 (+ 3 4)))
-4
``` 

Vi ønsker å lage en continuation som representerer arbeidet som gjenstår etter at vi har regnet ut `(+ 3 4)`. Dette kan vi gjør ved å bytte `(+ 3 4)` med en variabel, for eksempel `HULL`, og pakke alt inn i en lambda-funksjon som tar inn denne variabelen.

```scheme
(lambda (HULL) 
  (+ 1 (- 2 HULL)))
```

Denne lambda-funksjonen er en continuation som representerer evalueringen som vil gjøres etter at 3 og 4 er lagt sammen. Hvis vi lager oss en variant av funksjonen `+` som forventer en continuation som argument kan vi kalle denne med lambdaen og se at utregningen fortsatt er den samme.

```scheme
> (define +&
    (lambda (x y k)
      (k (+ x y))))
> (+& 3 4 (lambda (HULL) 
    (+ 1 (- 2 HULL))))
-4
```

## Continuation Passing Style

Denne idéen om å ta en *continuation* — stedet evalueringen skal fortsette — som et ekstra argument danner grunnlaget for en programmeringstil som kalles *Continuation Passing Style* eller CPS.

Programmering i CPS følger disse reglene:

1. Alle funksjonssignaturer får et ekstra parameter
1. Funksjoner returnerer ikke, men sender i stedet "returverdien" videre ved å kalle denne ekstra parameteren med "returverdien" som argument.

**Eksempel: `add-double`**

La oss ta for oss et enkelt eksempel. Vi begynner med følgende funksjon, `add-double`, som simpelthen returnerer det dobbelte av summen av sine to argumenter.

```scheme
> (define add-double
    (lambda (x y)
      (* 2 (+ x y))))
> (add-double 2 3)
10
```

Denne funksjonen kan skrives om som følger, for å følge continuation passing style.

```scheme
(define add-double/k 
  (lambda (x y k)
    (+& x y (lambda (xy)
        (k (* 2 xy))))))
```

Legg merke til at vi først legger sammen `x` and `y`, som er det innerste uttrykket i den normale `add-double`-funksjonen. Resultatet av dette sendes til en `lambda`-continuation, som i sin tur multipliserer verdien med 2, før den "returnerer" ved å sende det endelige resultatet til `k`. Vi ser også at vi har måttet bruke `+&` som vi definerte over, for å kunne sende inn en ny continuation med arbeidet som gjenstår.

For å teste `add-double/k` sender vi inn en passende lambda-funksjon som continuation. For å få fatt på resultatet trenger vi en funksjon som kun returnerer argumentet — altså identitetfunksjonen. La oss definere denne som `empty-k`, slik at vi kan bruke den videre.

```scheme
> (define empty-k
    (lambda (x) x))
> (add-double/k 2 3 empty-k)
10
```

**Fremgangsmåte**

La oss gå igjennom et annet eksempel, og se på stegene en må følge for å konvertere et program som ikke bruker continuations over til CPS.

Eksempelet vi tar for oss er Pythagoras' formel for å regne ut hypotenus. Her er først den vanlige koden. Vi har funksjoner: en hjelpefunksjon `square` for å regne ut `x * x`, og `hypo` som regner ut hypotenusen gitt lengde av to kateter.


```scheme
(define square 
  (lambda (x) 
    (* x x)))

(define hypo 
  (lambda (a b)
    (sqrt (+ (square a)
       (square b)))))
```

La oss starte med å konvertere `square` til CPS og kalle denne `square/k`. For å gjøre dette benytter vi først følgende regel.

> Alle lambda-uttrykk skal utvides med et ekstra argument, før en fortsetter å transformere funksjonskroppen til lambdaen.
> 
> ```scheme
> (lambda (x ...) KROPP) => (lambda (x ... k) KROPP^)
> ```

Vi vet altså at løsningen må være noe à la følgende:

```scheme
(define square/k
  (lambda (x k)
    NOE))
```

Fra før vet vi at resultatet av funksjonen sendes inn til `k`, så løsningen må bli:

```scheme
(define square/k
  (lambda (x k)
     (k (* x x))))
```

Dette gikk greit! Vi gyver løs på `hypo/k`. Igjen vet vi, basert på regelen over, at løsningen må ha form som følger.

```scheme
(define hypo/k
  (lambda (a b k)
     NOE))
```

Det neste vi må gjøre er å finne det første uttrykket som kan evalueres. I dette tilfellet kan det være enten `(square a)` eller `(square b)`, ettersom evaluerings-rekkefølgen til argumenter ikke er spesifisert i Scheme. Det er opp til oss å velge, og dermed avgjøre eksekveringsrekkefølgen. La oss bestemme at `(square a)` evalueres først.

Regelen for å behandle kroppen til lambda-uttrykk blir noe slikt som:

> Identifiser første uttrykk som kan evalueres. Utfør dette og send en continuation-lambda som siste argument. Denne lambdaen skal inneholde transformasjonen av de resterende stegene.
> 
> ```scheme
> (f (g (h i))) => (h i (lambda (hi) (f (g hi))))
> ```

Reglen forteller oss at vi skal starte med å utføre utregningen av kvadratet av `a`. Vi gjør dette med `square/k` slik at vi kan sende inn en continuation-lambda. Parameteren `a-square` representerer verdien av utregningen så langt.

```scheme
(define hypo/k
  (lambda (a b k)
    (square/k a (lambda (a-square) 
                   NOE))))
```

Vi vet at det neste uttrykket vi må evaluere er `(square b)`, så dette er det første vi skal gjøre inne i continuation-funksjonen vi nettopp laget. Vi gjentar samme prosess som for `(square a)`.

```scheme
(define hypo/k
  (lambda (a b k)
    (square/k a (lambda (a-square) 
                  (square/k b (lambda (b-square)
                                NOE))))))
```

Begge argumentene til `+` er nå evaluert og vi kan derfor kalle denne. Vi bruker den CPS-ifiserte varianten `+&` som vi definerte tidligere.

```scheme
(define hypo/k
  (lambda (a b k)
    (square/k a (lambda (a-square) 
                  (square/k b (lambda (b-square)
                                (+& a-square b-square (lambda (a-square-plus-b-square)
                                                         NOE))))))))
```

Alt som nå gjenstår er å ta kvadratroten for å få det endelige resultatet. Vi gjør dette, og sender samtidig verdien til `k`, `hypo/k` sin continuation.

```scheme
(define hypo/k
  (lambda (a b k)
    (square/k a (lambda (a-square) 
                  (square/k b (lambda (b-square)
                                (+& a-square b-square (lambda (a-square-plus-b-square)
                                                        (k (sqrt a-square-plus-b-square))))))))))
```

Da er vi i mål! Og testing av funksjonene viser at alt fortsatt fungerer som før:

```scheme
> (hypo 3 4)
5
> (hypo/k 3 4 empty-k)
5
```

## Hva har vi oppnådd?

Denne måten å programmere på gir den resulterende koden en rekke fine egenskaper.
Den første, som vi diskuterte over, er at det alltid er fullstendig **eksplisitt hvor evalueringen fortsetter**.
Funksjoner trenger ingen implisitt kontekst der eksekveringen kan fortsette når en funksjon er ferdig med det den skal gjøre.

Dette gjør at vi ikke trenger å legge til kontekster på en kall-stack, ettersom **alle kall ender opp med å bli tail-calls**. Koden får derfor konstant stack-bruk (i språk-implementasjoner optimalisert for tail-kall).

En siste egenskap er at vi får en **fast definert rekkefølge for når uttrykk skal evalueres**. I mange språk, inkludert Scheme, er det slik at rekkefølgen for evaluering av argumenter til funksjonskall ikke er spesifisert. Gitt uttrykket `(foo (+ 1 2) (+ 3 4))` er det implementasjonsavhengig hvorvidt `(+ 1 2)` eller `(+ 3 4)` vil regnes ut først. Ved konvertering til CPS tvinges en til å ta stilling til dette. Både `(+& 1 2 (lambda (x) (+& 3 4 (lambda (y) (foo x y)))))` og `(+& 3 4 (lambda (x) (+& 1 2 (lambda (y) (foo x y)))))` er gyldig CPS og representerer de to ulike evalueringrekkefølgene.


## Vi vender tilbake til `factorial`

La oss ta en ny titt på det innldende eksempelet, og skriver gradvis `factorial` over til CPS. Vi starter med den opprinnelige funksjonen og legger til det ekstra argumentet `k`.

```scheme
(define factorial/k
  (lambda (n k)
    (if (= n 0) 
        1
        (* n (factorial (- n 1))))))
```

Vi tar denne gangen en litt mer pragmatisk tilnærming. Så langt har vi benyttet CPS-reglene på *alle* uttrykk i programmene. Vi har en ny regel vi kan bruke:

> *Enkle uttrykk* er uttrykk vi vet at vil returnere umiddelbart. Slike uttrykk kan få være som de er, men skal pakkes inn i kall til `k` dersom de står i fare for å evalueres som returverdi for funksjonen.

Tidligere ville vi startet med å lage en continuation over `(= n 0)`, predikatet i `if`-uttrykket vårt, men siden vi vet at dette er et enkelt uttrykk lar vi det stå i fred. Verdien `1` i "then"-grenen av `if`-en er også et enkelt uttrykk, men dette kan bli en returverdi fra funksjonen, så vi gjør et kall til `k`.

```scheme
(define factorial
  (lambda (n k)
    (if (= n 0) 
        (k 1)
        (* n (factorial (- n 1))))))
```

Vi har nå bare "else"-grenen av `if`-uttrykket igjen å transformere.

Det neste uttrykket som kan utføres er `(- n 1)`. Også dette er et enkelt uttrykk, og vi lar det være som det er. Det rekursive kallet til `factorial` er derimot definitivt ikke et enkelt uttrykk. Vi bytter "else"-grenen ut med en continuation over dette kallet.

```scheme
(define factorial/k
  (lambda (n k)
    (if (= n 0)
        (k 1)
        (factorial/k (- n 1) (lambda (fac-n-minus-1)
                                (* n fac-n-minus-1))))))
```

Alt som gjenstår nå er kallet til `*` — enda et enkelt uttrykk — så vi behøver bare å huske å kalle `k` i stedet for å returnere direkte:

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
> (factorial/k 5 empty-k)
|(factorial/k 5 #<procedure>)
|(factorial/k 4 #<procedure>)
|(factorial/k 3 #<procedure>)
|(factorial/k 2 #<procedure>)
|(factorial/k 1 #<procedure>)
|(factorial/k 0 #<procedure>)
|120
120
```

Som forventet, stacken oppfører seg som den alternative tail-rekursive algoritmen vi så på innledningsvis.
Men denne gangen har vi ved hjelp av CPS fått denne oppførselen uten å endre på hvordan algoritmen fungerer.

Og for de som måtte lure på hvordan koden ville sett ut dersom vi ikke hadde vært pragmatiske og latt de enkle uttrykkene være i fred: Her er en fullstendig CPSet versjon, der `*&`, `-&` og `=&` er CPS-varianter av de samme operatorene.

```scheme
> (define factorial/k
    (lambda (n k)
      (=& n 0 (lambda (is-zero)
                (if is-zero 
                    (k 1)
                    (-& n 1 (lambda (n-minus-1) 
                              (factorial/k n-minus-1 (lambda (fact-n-minus-1)
                                                       (*& n fact-n-minus-1 k))))))))))
> (factorial/k 5 empty-k)
120
```

## Et siste eksempel

La oss avslutte med et siste eksempel. 
I funksjoner der det gjøres flere rekursive kall er det ofte ikke like enkelt å finne en løsning som baserer seg på bruk av en akkumulator, slik vi kunne for factorial.

```scheme
(define fib
  (lambda (n)
    (cond
      [(zero? n) 1]
      [(= n 1) 1]
      [else (+ (fib (- n 1)) 
               (fib (- n 2)))])))
```

Funksjonen som regner ut det n-te fibonacci-tallet er vel kjent for de fleste.
Etter omskriving til CPS blir resultetet følgende:

```scheme
(define fib/k
  (lambda (n k)
    (cond
     [(zero? n) (k 1)]
     [(= n 1) (k 1)]
     [else (fib/k (- n 1) (lambda (fib-n-minus-1)
                             (fib/k (- n 2) (lambda (fib-n-minus-2)
                                               (k (+ fib-n-minus-1 fib-n-minus-2))))))])))
```

Klarer du å følge stegene vi har vært igjennom, og komme frem til den samme transformasjonen?

Vi har først lagt til argumentet `k`.
Deretter har vi pakket begge de første `cond`-grenene inn i kall til `k`, ettersom disse er enkle uttrykk som skal "returneres".
I den siste grenen må vi starte med det ene kallet til `fib/k`, og sende resultatet av dette videre til en continuation over resten av utregningen. Denne continuation inneholder et nytt kall til `fib/k` som vi igjen må sende videre.
I den innereste lambdaen, som er continuation for det andre rekursive kallet, har vi tilgjengelig verdiene for både "fib av n-1" og "fib av n-2", og kan derfor gjøre oss ferdige ved å legge disse sammen.

## Oppsummering

Vi har sett at Continuation Passing Style er en måte å programmere på som gir den resulterende koden noen helt spesifikke, og ofte ettertraktede, egenskaper. Koden får en helt eksplisitt evalueringsrekkefølge, ettersom vi ikke returnerer til noen implisitte continuations er alle kall tail-calls, og alle argumenter er enkle uttrykk.

I eksemplene så vi hvordan det å bruke CPS som en generell taktikk for tvinge tail-calls førte til at programmer kjøres med konstant størrelse på kall-stacken. Det skal også bemerkes at CPS alene ikke vil hjelpe oss med dette i språk som ikke er optimalisert for tail-kall. I slike språk kan en imidlertid bruke teknikker som [trampolining][wiki-trampolining] sammen med CPS for å oppnå tilsvarende resultater.

[wiki-trampolining]: https://en.wikipedia.org/wiki/Trampoline_(computers)#High_level_programming

Det er imidlertid ikke til å stikke under stol at den resulterende transformerte koden ikke er like konsis og lettlest som utgangspunktet. Koden "vrenges" på sett og vis inn-ut. Prosessen med å konvertere programmer krever også en hel del konsentrasjon, og det er lett å gjøre feil. 

Dette er ikke en teknikk som vanligvis brukes manuelt av mange programmerere, men i langt større grad vanlig å bruke som steg i kompilatorer og liknende. Det er likevel morsomt å vite at en har muligheten dersom behovet skulle oppstå, og det er en viktig transformasjon å kjenne til hvis en har lyst til å lære om kompilering av høynivå språk.


**Fotnoter**

1. <a id="footnote-1"></a>Eksemplene i denne bloggposten er kun testet i [Petite Scheme](http://www.scheme.com/petitechezscheme.html), men bruker ikke noen spesielle features, og burde fungere i de fleste scheme-interpreters. Kanskje med unntak av `trace`.
2. <a id="footnote-2"></a>Merk at selv om (lambda-)funksjoner med ett argument er brukt for å representere continuations i disse eksemplene, så betyr ikke dette at lambdaer er den eneste mulige representasjonen. Continuation som konsept er ikke knyttet til noen enkelt representasjon.
3. <a id="footnote-3"></a>Vi bruker `k` som variabelnavn for å representere continuation-argumentet i alle eksemplene. Dette er en vanlig konvensjon når en koder i CPS.
