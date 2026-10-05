import type { GuideCopy, GuideSlug } from '@/content/schema';

export const guides: Record<GuideSlug, GuideCopy> = {
  'how-to-create-a-qr-code': {
    title: 'Come creare un codice QR gratis – Guida passo passo',
    description: 'Scopri come creare un codice QR in meno di un minuto: scegli il tipo, aggiungi il contenuto, progettalo, provalo e stampalo. Gratis e senza registrazione per i codici statici.',
    h1: 'Come creare un codice QR',
    name: 'Creare un codice QR',
    intro: 'Creare un codice QR richiede meno di un minuto. Crearne uno che si legga sempre, sia bello e funzioni ancora tra un anno richiede qualche scelta in più. Questa guida le copre entrambe.',
    sections: [
      {
        heading: '1. Decidi: statico o dinamico',
        body: [
          'Un codice statico memorizza il contenuto nel motivo. Funziona per sempre e offline, ma non si può modificare né monitorare. Usalo per Wi-Fi, schede contatto e link che non cambieranno mai.',
          'Un codice dinamico memorizza un link breve che controlli tu. Puoi cambiare la destinazione dopo la stampa e vedere ogni scansione. Usalo per tutto ciò che stampi in quantità o usi nel marketing.',
        ],
      },
      {
        heading: '2. Scegli il tipo',
        body: [
          'Scegli cosa deve succedere alla scansione: aprire un sito, collegarsi al Wi-Fi, salvare un contatto, mostrare un menu, riprodurre un video. Il tipo giusto dà alle persone esattamente ciò che si aspettano.',
        ],
      },
      {
        heading: '3. Aggiungi il contenuto',
        body: [
          'Inserisci il link, i dati della rete o il testo. Sii breve: meno contenuto significa un motivo più semplice, letto più in fretta. Nei codici dinamici il motivo resta semplice qualunque sia la destinazione.',
        ],
      },
      {
        heading: '4. Progettalo',
        body: [
          'Scegli colori, stile del motivo, forme degli angoli, un logo e una cornice con un invito all’azione come «Scansiona per il menu». Mantieni il codice scuro su sfondo chiaro, con un buon contrasto.',
          'Tieni d’occhio il punteggio di leggibilità: segnala contrasto basso, loghi troppo grandi e margini mancanti prima della stampa.',
        ],
      },
      {
        heading: '5. Provalo e stampalo',
        body: [
          'Scansiona il codice con almeno due telefoni, un iPhone e un Android, dalla distanza reale d’uso. Scarica SVG o PDF per la stampa, così resta nitido a qualsiasi dimensione.',
        ],
      },
    ],
    faqs: [
      { q: 'Creare un codice QR è gratis?', a: 'Sì. Su QR ALTRIX ogni funzione è gratis, compresi codici dinamici e statistiche.' },
      { q: 'Serve un account?', a: 'Non per i codici statici. Per i dinamici serve un account gratuito per modificarli e monitorarli.' },
      { q: 'Quale formato di file scarico?', a: 'PNG per schermi e documenti; SVG, PDF o EPS per la stampa professionale.' },
    ],
  },
  'static-vs-dynamic-qr-codes': {
    title: 'Codici QR statici vs dinamici – Differenze e quando usarli',
    description: 'Codice QR statico o dinamico? Scopri come funzionano, quale si modifica e si monitora, quale scade e quale scegliere per menu, confezioni, Wi-Fi e pubblicità.',
    h1: 'Codici QR statici vs dinamici',
    name: 'Statico vs dinamico',
    intro: 'Ogni codice QR è statico o dinamico. La differenza decide se puoi cambiarlo dopo la stampa, se puoi contarne le scansioni e — su molte piattaforme — se smette di funzionare alla fine di una prova.',
    sections: [
      {
        heading: 'Come funziona un codice QR statico',
        body: [
          'Il contenuto — un link, una password Wi-Fi, un contatto — è codificato direttamente nei quadratini bianchi e neri. Alla scansione non si consulta nulla, quindi funziona offline e per sempre.',
          'Il rovescio: non puoi cambiarlo e nessuno può contarne le scansioni. Un refuso significa ristampare.',
        ],
      },
      {
        heading: 'Come funziona un codice QR dinamico',
        body: [
          'Il motivo contiene un link breve. Alla scansione, il server del link registra la scansione e reindirizza alla destinazione che hai impostato. Cambia la destinazione e ogni copia stampata la segue.',
          'Poiché il link è breve, il motivo resta semplice e si legge facilmente anche stampato piccolo.',
        ],
      },
      {
        heading: 'I codici QR dinamici scadono?',
        body: [
          'Non dovrebbero, ma su molti servizi succede: i piani gratuiti spesso limitano a pochi codici dinamici o li disattivano dopo una prova, e il codice stampato smette di funzionare.',
          'Su QR ALTRIX i codici dinamici sono gratis e illimitati e funzionano finché non li metti in pausa o li elimini.',
        ],
      },
      {
        heading: 'Quale usare?',
        body: [
          'Statico: Wi-Fi, contatti vCard, testo semplice e link che sei sicuro non cambieranno mai.',
          'Dinamico: menu, confezioni, poster, biglietti da visita, campagne — tutto ciò che si stampa in quantità o di cui vuoi misurare i risultati.',
        ],
      },
    ],
    faqs: [
      { q: 'Posso trasformare un codice statico in dinamico?', a: 'No, il motivo è diverso. Crea un codice dinamico e sostituisci quello stampato.' },
      { q: 'I codici dinamici sono più lenti da leggere?', a: 'Il reindirizzamento aggiunge una frazione di secondo; il motivo più semplice spesso li rende più rapidi da leggere.' },
      { q: 'I codici dinamici raccolgono dati personali?', a: 'Su QR ALTRIX registrano paese, dispositivo e dati simili, con gli indirizzi IP salvati solo come hash con sale.' },
    ],
  },
  'qr-code-size-for-print': {
    title: 'Dimensioni del codice QR per la stampa – Minimo e distanza di lettura',
    description: 'Quanto deve essere grande un codice QR? Dimensioni minime per biglietti, volantini, poster e cartelli, la regola 10:1 e consigli su zona di rispetto e risoluzione.',
    h1: 'Dimensioni del codice QR per la stampa',
    name: 'Guida alle dimensioni di stampa',
    intro: 'Un codice QR troppo piccolo è la causa più comune di una tiratura fallita. La dimensione giusta dipende dalla distanza di scansione e da quanti dati contiene il codice.',
    sections: [
      {
        heading: 'La regola 10:1',
        body: [
          'Una buona regola pratica: il codice deve misurare almeno un decimo della distanza di scansione. Scansionato da 30 cm, fallo di 3 cm; da 2 metri, di 20 cm.',
        ],
      },
      {
        heading: 'Dimensioni minime per supporto',
        body: [
          'Biglietti da visita ed etichette: almeno 2 × 2 cm.',
          'Volantini, menu e segnatavolo: 3–4 cm.',
          'Poster visti da qualche metro: 10–20 cm.',
          'Striscioni e insegne: scala con la distanza seguendo la regola 10:1.',
        ],
      },
      {
        heading: 'Rispetta la zona di rispetto',
        body: [
          'Lascia un margine vuoto intorno al codice di circa quattro moduli (i quadratini). Testi o grafiche a contatto col codice sono una causa frequente di scansioni fallite.',
        ],
      },
      {
        heading: 'Usa file vettoriali',
        body: [
          'Scarica SVG, PDF o EPS per la stampa. I file vettoriali restano perfettamente nitidi a qualsiasi dimensione, mentre un PNG ingrandito può sfocarsi.',
          'I codici dinamici hanno meno moduli, quindi restano leggibili in piccolo dove un lungo link statico non lo sarebbe.',
        ],
      },
    ],
    faqs: [
      { q: 'Qual è il codice QR più piccolo che funziona?', a: 'Circa 2 × 2 cm per scansioni ravvicinate, se il codice contiene pochi dati ed è stampato nitido.' },
      { q: 'Un logo cambia la dimensione minima?', a: 'Un logo copre alcuni moduli; tienilo sotto un quarto del codice e alza la correzione d’errore a Q o H.' },
      { q: 'Che risoluzione deve avere un PNG?', a: 'Per la stampa preferisci il vettoriale. Se devi usare PNG, esporta almeno a 1000 px per stampe piccole e di più per quelle grandi.' },
    ],
  },
  'qr-code-design-best-practices': {
    title: 'Buone pratiche di design dei codici QR – Colori, loghi e cornici',
    description: 'Progetta codici QR belli e leggibili: regole di contrasto, dimensione del logo, colori e sfumature, cornici e inviti all’azione, e come provarli prima della stampa.',
    h1: 'Buone pratiche di design dei codici QR',
    name: 'Buone pratiche di design',
    intro: 'Un codice QR con il tuo marchio riceve più scansioni di uno anonimo — purché i telefoni riescano ancora a leggerlo. Queste regole tengono il tuo design dalla parte giusta della linea.',
    sections: [
      {
        heading: 'Prima di tutto il contrasto',
        body: [
          'I lettori hanno bisogno di un motivo scuro su sfondo chiaro. Punta a un rapporto di contrasto di almeno 4:1 ed evita i codici invertiti (chiaro su scuro) se non li hai provati su molti telefoni.',
        ],
      },
      {
        heading: 'Loghi: piccoli e centrati',
        body: [
          'Un logo copre parte del codice. La correzione d’errore QR può ricostruire la parte mancante, ma solo fino a un certo punto: tieni il logo sotto il 25% circa del codice e usa il livello di correzione Q o H.',
        ],
      },
      {
        heading: 'Colori e sfumature',
        body: [
          'I colori del marchio funzionano se sono abbastanza scuri. Le sfumature vanno bene quando entrambi gli estremi sono scuri. Motivi pastello, gialli e grigio chiaro sono quelli che falliscono più spesso.',
        ],
      },
      {
        heading: 'Aggiungi una cornice e un invito all’azione',
        body: [
          'Spiega perché scansionare: «Scansiona per il menu», «Ottieni il 10% di sconto», «Collegati al nostro Wi-Fi». I codici con un invito chiaro vengono scansionati molto più di quelli spogli.',
        ],
      },
      {
        heading: 'Prova prima di stampare',
        body: [
          'Usa il controllo di leggibilità, poi scansiona una prova di stampa con un iPhone e un Android alla dimensione e distanza reali.',
        ],
      },
    ],
    faqs: [
      { q: 'Un codice QR può essere di qualsiasi colore?', a: 'Sì, purché il motivo sia chiaramente più scuro dello sfondo.' },
      { q: 'I motivi arrotondati o a punti si leggono?', a: 'Sì, i telefoni moderni li leggono bene; mantieni ben definiti i quadrati agli angoli.' },
      { q: 'Cos’è il punteggio di leggibilità?', a: 'Un controllo nell’editor che segnala contrasto basso, loghi troppo grandi e altri rischi prima del download.' },
    ],
  },
};
