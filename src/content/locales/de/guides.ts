import type { GuideCopy, GuideSlug } from '@/content/schema';

export const guides: Record<GuideSlug, GuideCopy> = {
  'how-to-create-a-qr-code': {
    title: 'QR-Code kostenlos erstellen – Schritt-für-Schritt-Anleitung',
    description: 'So erstellen Sie einen QR-Code in unter einer Minute: Typ wählen, Inhalt hinzufügen, gestalten, testen und drucken. Kostenlos, ohne Anmeldung für statische Codes.',
    h1: 'So erstellen Sie einen QR-Code',
    name: 'QR-Code erstellen',
    intro: 'Einen QR-Code zu erstellen dauert unter einer Minute. Einen, der jedes Mal scannt, gut aussieht und in einem Jahr noch funktioniert, braucht ein paar Entscheidungen mehr. Dieser Ratgeber zeigt beides.',
    sections: [
      {
        heading: '1. Entscheiden: statisch oder dynamisch',
        body: [
          'Ein statischer Code speichert den Inhalt im Muster. Er funktioniert für immer und offline, lässt sich aber weder ändern noch auswerten. Nutzen Sie ihn für WLAN, Kontaktkarten und Links, die sich nie ändern.',
          'Ein dynamischer Code speichert einen Kurzlink, den Sie steuern. Sie ändern das Ziel nach dem Druck und sehen jeden Scan. Nutzen Sie ihn für alles, was in Mengen gedruckt oder im Marketing eingesetzt wird.',
        ],
      },
      {
        heading: '2. Typ wählen',
        body: [
          'Legen Sie fest, was beim Scannen passieren soll: Website öffnen, WLAN verbinden, Kontakt speichern, Speisekarte zeigen, Video abspielen. Der richtige Typ sorgt dafür, dass Menschen genau das bekommen, was sie erwarten.',
        ],
      },
      {
        heading: '3. Inhalt hinzufügen',
        body: [
          'Geben Sie Link, Netzwerkdaten oder Text ein. Fassen Sie sich kurz: Weniger Inhalt bedeutet ein einfacheres Muster, das schneller scannt. Bei dynamischen Codes bleibt das Muster unabhängig vom Ziel einfach.',
        ],
      },
      {
        heading: '4. Gestalten',
        body: [
          'Wählen Sie Farben, Musterstil, Eckformen, ein Logo und einen Rahmen mit Handlungsaufforderung wie „Scannen für die Speisekarte“. Halten Sie den Code dunkel auf hellem Grund mit starkem Kontrast.',
          'Achten Sie auf den Scan-Sicherheitswert: Er warnt vor geringem Kontrast, zu großen Logos und fehlenden Rändern, bevor Sie drucken.',
        ],
      },
      {
        heading: '5. Testen und drucken',
        body: [
          'Scannen Sie den Code mit mindestens zwei Handys, einem iPhone und einem Android, aus dem Abstand, den Menschen tatsächlich haben. Laden Sie für den Druck SVG oder PDF herunter, damit er in jeder Größe scharf bleibt.',
        ],
      },
    ],
    faqs: [
      { q: 'Ist das Erstellen eines QR-Codes kostenlos?', a: 'Ja. Bei QR ALTRIX ist jede Funktion kostenlos, inklusive dynamischer Codes und Statistiken.' },
      { q: 'Brauche ich ein Konto?', a: 'Für statische Codes nicht. Für dynamische Codes brauchen Sie ein kostenloses Konto, um sie zu ändern und auszuwerten.' },
      { q: 'Welches Dateiformat sollte ich herunterladen?', a: 'PNG für Bildschirme und Dokumente; SVG, PDF oder EPS für professionellen Druck.' },
    ],
  },
  'static-vs-dynamic-qr-codes': {
    title: 'Statische vs. dynamische QR-Codes – Unterschiede und Einsatz',
    description: 'Statischer oder dynamischer QR-Code? Wie beide funktionieren, welcher änderbar und auswertbar ist, welcher abläuft und welcher zu Speisekarte, Verpackung, WLAN und Werbung passt.',
    h1: 'Statische vs. dynamische QR-Codes',
    name: 'Statisch vs. dynamisch',
    intro: 'Jeder QR-Code ist entweder statisch oder dynamisch. Der Unterschied entscheidet, ob Sie ihn nach dem Druck ändern können, ob Sie Scans zählen können und – bei vielen Anbietern –, ob er nach einer Testphase aufhört zu funktionieren.',
    sections: [
      {
        heading: 'So funktioniert ein statischer QR-Code',
        body: [
          'Der Inhalt – ein Link, ein WLAN-Passwort, ein Kontakt – ist direkt in den schwarzen und weißen Quadraten kodiert. Beim Scannen wird nichts abgefragt, daher funktioniert er offline und für immer.',
          'Die Kehrseite: Sie können ihn nicht ändern, und niemand kann seine Scans zählen. Ein Tippfehler bedeutet Neudruck.',
        ],
      },
      {
        heading: 'So funktioniert ein dynamischer QR-Code',
        body: [
          'Das Muster enthält einen Kurzlink. Beim Scannen erfasst der Link-Server den Scan und leitet zum festgelegten Ziel weiter. Ändern Sie das Ziel, und jedes gedruckte Exemplar folgt.',
          'Weil der Link kurz ist, bleibt das Muster einfach und scannt auch klein gedruckt problemlos.',
        ],
      },
      {
        heading: 'Laufen dynamische QR-Codes ab?',
        body: [
          'Eigentlich sollten sie nicht, bei vielen Diensten tun sie es aber: Gratispläne begrenzen oft auf eine Handvoll dynamischer Codes oder deaktivieren sie nach der Testphase – und der gedruckte Code funktioniert nicht mehr.',
          'Bei QR ALTRIX sind dynamische Codes kostenlos und unbegrenzt und funktionieren, bis Sie sie pausieren oder löschen.',
        ],
      },
      {
        heading: 'Welchen sollten Sie nutzen?',
        body: [
          'Statisch: WLAN, vCard-Kontakte, einfacher Text und Links, die sich garantiert nie ändern.',
          'Dynamisch: Speisekarten, Verpackungen, Plakate, Visitenkarten, Kampagnen – alles, was in Mengen gedruckt wird oder dessen Erfolg Sie messen wollen.',
        ],
      },
    ],
    faqs: [
      { q: 'Kann ich einen statischen Code in einen dynamischen umwandeln?', a: 'Nein, das Muster ist ein anderes. Erstellen Sie einen dynamischen Code und ersetzen Sie den gedruckten.' },
      { q: 'Scannen dynamische Codes langsamer?', a: 'Die Weiterleitung kostet einen Sekundenbruchteil; das einfachere Muster macht sie oft sogar schneller lesbar.' },
      { q: 'Erfassen dynamische Codes personenbezogene Daten?', a: 'Bei QR ALTRIX erfassen sie Land, Gerät und Ähnliches; IP-Adressen werden nur als gesalzener Hash gespeichert.' },
    ],
  },
  'qr-code-size-for-print': {
    title: 'QR-Code-Größe für den Druck – Mindestgröße und Scanabstand',
    description: 'Wie groß muss ein QR-Code sein? Mindestgrößen für Visitenkarten, Flyer, Plakate und Schilder, die 10:1-Regel sowie Tipps zu Ruhezone und Auflösung.',
    h1: 'QR-Code-Größe für den Druck',
    name: 'Druckgrößen-Ratgeber',
    intro: 'Ein zu kleiner QR-Code ist der häufigste Grund, warum eine Auflage scheitert. Die richtige Größe hängt davon ab, aus welcher Entfernung gescannt wird und wie viele Daten der Code enthält.',
    sections: [
      {
        heading: 'Die 10:1-Regel',
        body: [
          'Eine gute Faustregel: Der Code sollte mindestens ein Zehntel des Scanabstands groß sein. Aus 30 cm gescannt also 3 cm; aus 2 Metern 20 cm.',
        ],
      },
      {
        heading: 'Mindestgrößen nach Material',
        body: [
          'Visitenkarten und Etiketten: mindestens 2 × 2 cm.',
          'Flyer, Speisekarten und Tischaufsteller: 3–4 cm.',
          'Plakate, die aus einigen Metern gesehen werden: 10–20 cm.',
          'Banner und Gebäudeschilder: mit der 10:1-Regel an den Abstand anpassen.',
        ],
      },
      {
        heading: 'Halten Sie die Ruhezone frei',
        body: [
          'Lassen Sie rund um den Code einen leeren Rand von etwa vier Modulen (den kleinen Quadraten). Text oder Grafik, die den Code berühren, sind eine häufige Ursache für Fehlscans.',
        ],
      },
      {
        heading: 'Nutzen Sie Vektordateien',
        body: [
          'Laden Sie für den Druck SVG, PDF oder EPS herunter. Vektordateien bleiben in jeder Größe gestochen scharf, ein vergrößertes PNG kann unscharf werden.',
          'Dynamische Codes haben weniger Module und bleiben daher auch klein lesbar, wo ein langer statischer Link es nicht wäre.',
        ],
      },
    ],
    faqs: [
      { q: 'Was ist der kleinste QR-Code, der funktioniert?', a: 'Etwa 2 × 2 cm für Nahscans, wenn der Code wenige Daten enthält und scharf gedruckt ist.' },
      { q: 'Ändert ein Logo die Mindestgröße?', a: 'Ein Logo verdeckt einige Module; halten Sie es unter einem Viertel des Codes und erhöhen Sie die Fehlerkorrektur auf Q oder H.' },
      { q: 'Welche Auflösung sollte ein PNG haben?', a: 'Für den Druck lieber Vektor. Wenn es PNG sein muss, exportieren Sie mindestens 1000 px für kleine und mehr für große Drucke.' },
    ],
  },
  'qr-code-design-best-practices': {
    title: 'QR-Code-Design: Best Practices – Farben, Logos und Rahmen',
    description: 'Gestalten Sie QR-Codes, die gut aussehen und trotzdem scannen: Kontrastregeln, Logogröße, Farben und Verläufe, Rahmen und Handlungsaufforderungen sowie Tests vor dem Druck.',
    h1: 'Best Practices für QR-Code-Design',
    name: 'Design-Best-Practices',
    intro: 'Ein gebrandeter QR-Code wird häufiger gescannt als ein schlichter – solange Handys ihn noch lesen können. Diese Regeln halten Ihr Design auf der richtigen Seite dieser Grenze.',
    sections: [
      {
        heading: 'Kontrast zuerst',
        body: [
          'Scanner brauchen ein dunkles Muster auf hellem Grund. Zielen Sie auf ein Kontrastverhältnis von mindestens 4:1 und vermeiden Sie invertierte Codes (hell auf dunkel), wenn Sie sie nicht auf vielen Handys getestet haben.',
        ],
      },
      {
        heading: 'Logos: klein und mittig',
        body: [
          'Ein Logo verdeckt einen Teil des Codes. Die QR-Fehlerkorrektur kann das Fehlende rekonstruieren, aber nur bis zu einem Punkt: Halten Sie das Logo unter etwa 25 % des Codes und nutzen Sie Fehlerkorrekturstufe Q oder H.',
        ],
      },
      {
        heading: 'Farben und Verläufe',
        body: [
          'Markenfarben funktionieren, wenn sie dunkel genug sind. Verläufe sind in Ordnung, wenn beide Enden dunkel sind. Pastellmuster, Gelb und Hellgrau scheitern am häufigsten.',
        ],
      },
      {
        heading: 'Rahmen und Handlungsaufforderung',
        body: [
          'Sagen Sie, warum man scannen soll: „Scannen für die Speisekarte“, „10 % Rabatt sichern“, „Mit unserem WLAN verbinden“. Codes mit klarer Aufforderung werden deutlich öfter gescannt als nackte Codes.',
        ],
      },
      {
        heading: 'Vor dem Druck testen',
        body: [
          'Nutzen Sie die Scan-Sicherheitsprüfung und scannen Sie dann einen Probedruck mit iPhone und Android in echter Größe und echtem Abstand.',
        ],
      },
    ],
    faqs: [
      { q: 'Kann ein QR-Code jede Farbe haben?', a: 'Ja, solange das Muster deutlich dunkler ist als der Hintergrund.' },
      { q: 'Scannen abgerundete oder gepunktete Muster?', a: 'Ja, moderne Handys lesen sie gut; die Eckquadrate sollten klar erkennbar bleiben.' },
      { q: 'Was ist der Scan-Sicherheitswert?', a: 'Eine Prüfung im Editor, die vor geringem Kontrast, zu großen Logos und anderen Risiken warnt, bevor Sie herunterladen.' },
    ],
  },
};
