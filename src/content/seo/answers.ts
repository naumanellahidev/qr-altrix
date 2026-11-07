import type { SeoDoc } from '@/content/seo/types';

/** Quick-answer pages, part 1: basics, scanning, design and troubleshooting. */
export const ANSWERS: SeoDoc[] = [
  // ---------------------------------------------------------------- basics
  {
    slug: 'what-is-a-qr-code',
    cat: 'basics',
    title: 'What Is a QR Code and How Does It Work?',
    description: "What a QR code is, what the squares mean, how a phone reads one and what it can store: a plain-English explanation with examples.",
    h1: 'What is a QR code and how does it work?',
    name: 'What is a QR code?',
    answer: "A QR code is a square, two-dimensional barcode that stores text, usually a web link. A phone camera reads the black and white squares, decodes the text and offers to open it. QR codes were invented in 1994 by Denso Wave in Japan, are defined by the ISO/IEC 18004 standard and are free for anyone to create and use.",
    sections: [
      {
        h: 'What the squares mean',
        p: [
          "Every QR code is a grid of small squares called modules. A dark module is a 1 and a light module is a 0, so the grid is simply binary data laid out in two dimensions. That is why a QR code holds far more than a striped barcode, which only stores data in one direction.",
          'Some parts of the grid are not data at all. They help the camera find and straighten the code before it reads anything:',
        ],
        list: [
          'Three large squares in the corners (finder patterns) tell the scanner where the code is and which way up it is.',
          'Smaller alignment squares correct for a code printed on a curve or photographed at an angle.',
          'Dotted timing lines between the corners give the scanner the size of each module.',
          'Format information records the error-correction level and the mask pattern used.',
          'A blank margin around the code, the quiet zone, separates it from everything else on the page.',
        ],
      },
      {
        h: 'How a phone reads it',
        p: [
          "The camera finds the three corner squares, works out the grid size, reads each module as dark or light, removes the mask and decodes the bytes. Built-in error correction (Reed-Solomon codes) lets it rebuild the content even if part of the code is dirty, scratched or covered by a logo. The whole process takes a fraction of a second.",
          "The scanner then looks at what the text is. A web address is offered as a link, a WIFI: string joins a network, a vCard saves a contact. You can read any code from an image with the free [online QR code scanner](/tools/qr-code-scanner).",
        ],
      },
      {
        h: 'What a QR code can store',
        p: [
          "The largest QR code (version 40, 177 by 177 modules) holds up to 7,089 digits or 2,953 bytes of text at the lowest error-correction level. In practice most codes hold a short link, because short content makes a simpler pattern that scans faster. See [how much data a QR code can hold](/answers/how-much-data-can-a-qr-code-hold).",
          "Common contents are website links, [Wi-Fi logins](/qr-code-generator/wifi), [contact cards](/qr-code-generator/vcard), [menus](/qr-code-generator/restaurant-menu), [PDFs](/qr-code-generator/pdf) and payment details.",
        ],
      },
    ],
    faqs: [
      { q: 'What does QR stand for?', a: 'Quick Response. The name comes from its original purpose: fast scanning of car parts in Japanese factories.' },
      { q: 'Is it free to make a QR code?', a: 'Yes. The QR code standard is free to use and you can [create a QR code for free](/#generator) on QR ALTRIX, including dynamic codes.' },
      { q: 'Does a QR code need internet?', a: 'Reading the code does not. Opening a link inside it does. A Wi-Fi, text or contact code works fully offline.' },
    ],
  },
  {
    slug: 'what-does-qr-stand-for',
    cat: 'basics',
    title: 'What Does QR Stand For in QR Code?',
    description: 'QR stands for Quick Response. Learn where the name comes from, who invented the QR code, and why it was designed to be read so fast.',
    h1: 'What does QR stand for?',
    name: 'What does QR stand for?',
    answer: 'QR stands for “Quick Response”. Denso Wave, a Toyota group company, invented the QR code in 1994 to track car parts, and named it for how fast scanners could read it compared with ordinary barcodes. “QR Code” is a registered trademark of Denso Wave, which chose not to enforce its patent so that anyone can use the format for free.',
    sections: [
      {
        h: 'Why “quick response”?',
        p: [
          'Factory workers at the time scanned several barcodes per box of parts. Masahiro Hara and his team at Denso Wave designed a code that holds more information and can be read from any angle, which made scanning much faster. The three corner squares, which let a reader find the code instantly in any orientation, are the main reason for the speed.',
        ],
      },
      {
        h: 'From factories to phones',
        p: [
          'QR codes became an international standard (ISO/IEC 18004) in 2000. They spread to marketing in Japan in the 2000s, and became universal once phone cameras began reading them without a separate app: iPhone from iOS 11 in 2017, and most Android phones through the camera or Google Lens.',
          'Today the same format carries links, [Wi-Fi passwords](/qr-code-for/wifi-password), payments, boarding passes and [restaurant menus](/qr-code-for/restaurant-menu).',
        ],
      },
    ],
    faqs: [
      { q: 'Who invented the QR code?', a: 'Masahiro Hara and his team at Denso Wave, Japan, in 1994.' },
      { q: 'Do I have to pay to use QR codes?', a: 'No. Denso Wave does not charge for using the format. If you print the words “QR Code”, its trademark guidance asks you to note that it is a registered trademark of Denso Wave.' },
    ],
  },
  {
    slug: 'qr-code-vs-barcode',
    cat: 'basics',
    title: 'QR Code vs Barcode – Differences and Which Is Better',
    description: 'QR code vs barcode: how much each holds, how they are scanned, and which to use for products, inventory, payments and marketing.',
    h1: 'QR code vs barcode: what is the difference?',
    name: 'QR code vs barcode',
    answer: 'A barcode stores a short number in one direction (vertical lines); a QR code stores up to a few thousand characters in two directions (a grid of squares). Barcodes like UPC and EAN hold about 12–13 digits and need a laser or barcode scanner. QR codes hold links and text, have built-in error correction and can be read by any phone camera.',
    sections: [
      {
        h: 'Side by side',
        list: [
          'Data: UPC/EAN barcodes hold 12–13 digits; a QR code holds up to 7,089 digits or 2,953 bytes.',
          'Direction: barcodes are read across one line; QR codes in two dimensions and from any angle.',
          'Damage: a QR code can be read with up to 7–30% of it damaged, depending on the error-correction level; a barcode with a damaged line often fails.',
          'Readers: barcodes need a checkout scanner; QR codes are read by the camera of almost every smartphone.',
          'Space: a QR code holds more in less space, so it suits small labels.',
        ],
      },
      {
        h: 'Which is better for inventory and products?',
        p: [
          'For retail checkout, the barcode is still the standard, because every till reads it. That is changing: the GS1 “Sunrise 2027” programme asks US retailers to accept 2D codes at the point of sale by the end of 2027, using the [GS1 Digital Link](/qr-code-generator/gs1-digital-link) format, which works as a product number for the till and a web page for shoppers.',
          'For your own stock, tools and equipment, QR codes are usually better: they can hold a link to a record, and any phone becomes a scanner. See [how to use QR codes for inventory](/guides/qr-code-inventory-management).',
        ],
      },
      {
        h: 'Which is better for marketing?',
        p: [
          'Only QR codes make sense for marketing: customers can scan them with their phone. Use a [dynamic QR code](/answers/what-is-a-dynamic-qr-code) so you can change the destination and count scans.',
        ],
      },
    ],
    faqs: [
      { q: 'Is a QR code a type of barcode?', a: 'Yes. It is a two-dimensional (2D) matrix barcode, while UPC and EAN are one-dimensional (linear) barcodes.' },
      { q: 'Can a phone scan a normal barcode?', a: 'Not with the camera app on most phones; you need a barcode-scanning app. QR codes are read natively.' },
      { q: 'Can a QR code replace a barcode on a product?', a: 'Increasingly, yes: a GS1 Digital Link QR code carries the product number for checkout and a link for shoppers.' },
    ],
  },
  {
    slug: 'how-much-data-can-a-qr-code-hold',
    cat: 'basics',
    title: 'How Much Data Can a QR Code Hold? (Character Limit)',
    description: 'QR code character limits: 7,089 digits, 4,296 letters or 2,953 bytes at most, and why shorter content scans better. Full capacity explained.',
    h1: 'How much data can a QR code hold?',
    name: 'QR code character limit',
    answer: 'The largest QR code (version 40) holds up to 7,089 numeric digits, 4,296 alphanumeric characters (capital letters, digits and a few symbols) or 2,953 bytes of text, at the lowest error-correction level (L). At the highest level (H) those limits fall to 3,057 digits, 1,852 characters and 1,273 bytes. A QR code cannot store an image, video or file itself, only text such as a link to one.',
    sections: [
      {
        h: 'Why you should not fill a QR code',
        p: [
          'More data means more modules. A version 40 code is a 177 × 177 grid; printed at a normal size each square is tiny, so phones struggle to read it, especially in poor light. A short link makes a version 2–4 code (25 to 33 modules across) that scans instantly even when printed small.',
          'This is the main advantage of a [dynamic QR code](/answers/what-is-a-dynamic-qr-code): the code only holds a short link, so the pattern stays simple no matter how long the real destination is.',
        ],
      },
      {
        h: 'How to store more than a QR code can hold',
        list: [
          'Long documents: upload them and link to them with a [PDF QR code](/qr-code-generator/pdf).',
          'Photos: use an [image gallery QR code](/qr-code-generator/image-gallery).',
          'Video and audio: use a [video](/qr-code-generator/video) or [MP3](/qr-code-generator/mp3) QR code.',
          'Several links: use a [link-in-bio page](/qr-code-generator/link-in-bio).',
        ],
      },
    ],
    faqs: [
      { q: 'Can a QR code hold a picture?', a: 'No. It holds text only; a picture QR code holds a link to the picture. See [can a QR code store an image](/answers/can-a-qr-code-store-an-image).' },
      { q: 'How many characters is too many?', a: 'For printed codes, try to stay under about 100 characters. Beyond 300 the code becomes dense and harder to scan from a distance.' },
    ],
  },
  {
    slug: 'can-a-qr-code-store-an-image',
    cat: 'basics',
    title: 'Can a QR Code Store an Image, Video or File?',
    description: 'A QR code cannot hold a photo, video or file directly, only text. Here is how image, video and PDF QR codes really work, and how to make one.',
    h1: 'Can a QR code store an image, video or file?',
    name: 'Can a QR code store an image?',
    answer: 'Not directly. A QR code stores at most about 3 KB of text, which is far too small for a photo, video or PDF. An “image QR code” stores a link to the image, which is kept on a server. When someone scans it, the phone opens that link and shows the picture, video or document.',
    sections: [
      {
        h: 'How image and video QR codes work',
        p: [
          'You upload the file, the service stores it and gives it a web address, and the QR code holds that address. On QR ALTRIX the file opens on a fast, mobile-friendly page, and because it is a dynamic code you can replace the file later without reprinting.',
        ],
        steps: [
          'Choose [image gallery](/qr-code-generator/image-gallery), [video](/qr-code-generator/video), [PDF](/qr-code-generator/pdf) or [MP3](/qr-code-generator/mp3).',
          'Upload your file (or paste a YouTube link for video).',
          'Design the code and download it as PNG, SVG or PDF.',
        ],
      },
      {
        h: 'What about a picture inside the QR code?',
        p: [
          'You can place a small logo in the centre of a QR code; error correction rebuilds the covered modules. That is decoration, not stored data. See [how big a logo can be](/answers/qr-code-logo-size).',
        ],
      },
    ],
    faqs: [
      { q: 'Does the image stay online forever?', a: 'On QR ALTRIX it stays as long as you keep the code. Deleting the code removes the hosted page.' },
      { q: 'Can I store a short text without internet?', a: 'Yes. A [text QR code](/qr-code-generator/text) keeps the words in the pattern and works offline.' },
    ],
  },
  {
    slug: 'do-qr-codes-need-internet',
    cat: 'basics',
    title: 'Do QR Codes Need Internet to Work?',
    description: 'Scanning a QR code needs no internet, but opening a link does. See which QR code types work offline and which need a connection.',
    h1: 'Do QR codes need internet to work?',
    name: 'Do QR codes need internet?',
    answer: 'Reading a QR code never needs internet: the camera decodes it on the phone. What happens next may. A link, menu, PDF or video needs a connection to open. Wi-Fi, contact (vCard), text, phone, SMS, email and calendar codes keep everything in the pattern and work completely offline.',
    sections: [
      {
        h: 'Codes that work offline',
        list: [
          '[Wi-Fi](/qr-code-generator/wifi): joins the network (that is the point).',
          '[vCard contact](/qr-code-generator/vcard): saves a contact.',
          '[Plain text](/qr-code-generator/text): shows the words.',
          '[Phone call](/qr-code-generator/phone-call), [SMS](/qr-code-generator/sms) and [email](/qr-code-generator/email): open the dialler or a ready message (sending still needs a network).',
          '[Calendar event](/qr-code-generator/calendar-event): adds the event.',
        ],
      },
      {
        h: 'Codes that need a connection',
        p: [
          'Website links and every dynamic code need the internet, because the phone has to reach the server. Dynamic codes go through a short link so that the destination can be changed and scans counted.',
          'If your audience may have weak signal, such as in a basement venue or on a ship, put a [Wi-Fi QR code](/qr-code-for/wifi-password) first, or use an offline type.',
        ],
      },
    ],
    faqs: [
      { q: 'Does the QR code generator need internet?', a: 'Yes to load the site; after that, static codes are drawn in your browser.' },
      { q: 'Can I scan a QR code in airplane mode?', a: 'Yes. The camera still decodes it; only links will fail to open until you are online.' },
    ],
  },
  {
    slug: 'how-many-times-can-a-qr-code-be-scanned',
    cat: 'basics',
    title: 'How Many Times Can a QR Code Be Scanned?',
    description: 'A QR code can be scanned an unlimited number of times. Learn when scan limits apply, which generators cap scans, and how to set your own limit.',
    h1: 'How many times can a QR code be scanned?',
    name: 'Is there a scan limit?',
    answer: 'There is no limit. A QR code is just a printed pattern, so it can be scanned millions of times by any number of people. A static code will work as long as the print survives. A dynamic code works as long as the service that runs its short link keeps it active, which is where some paid generators add scan caps. QR ALTRIX has no scan cap.',
    sections: [
      {
        h: 'Where scan limits come from',
        p: [
          'Some QR services limit free dynamic codes to a number of scans a month and stop redirecting when you go over. The printed code itself is not used up; the service simply refuses to forward it.',
          'On QR ALTRIX dynamic codes are unlimited and free. You can choose to set your own limit, for example for a one-time coupon: open the code, set a scan limit, and the code shows a notice once it is reached.',
        ],
      },
      {
        h: 'Can a QR code be used only once?',
        p: [
          'The pattern cannot know whether it has been scanned, so a static code can never be single-use. A dynamic code with a scan limit of 1 can, though anyone who saw the code first can still use that one scan. For tickets and vouchers, give each person their own code using the [bulk QR code generator](/tools/bulk-qr-code-generator).',
        ],
      },
    ],
    faqs: [
      { q: 'Do QR codes wear out?', a: 'Only physically: faded ink, scratches or sunlight damage. Error correction tolerates some of that.' },
      { q: 'Can I see how many times my code was scanned?', a: 'Yes, with a dynamic code. See [can you track a QR code](/answers/can-you-track-a-qr-code).' },
    ],
  },
  {
    slug: 'can-qr-codes-be-reused',
    cat: 'basics',
    title: 'Can QR Codes Be Reused or Changed After Printing?',
    description: 'Can you reuse a QR code or change where it goes after printing? Static codes cannot change; dynamic codes can. Here is how to edit a QR code.',
    h1: 'Can a QR code be reused or changed after printing?',
    name: 'Can I edit a QR code after printing?',
    answer: 'Only if it is a dynamic QR code. A static code stores its content in the pattern itself, so changing it means making and printing a new code. A dynamic code stores a short link that you control; change the destination in your dashboard and every printed copy goes to the new page instantly, with no reprint.',
    sections: [
      {
        h: 'How to edit a dynamic QR code',
        steps: [
          'Sign in to QR ALTRIX and open the code from your dashboard.',
          'Change the destination: a new URL, a new PDF, an updated menu.',
          'Save. The next scan goes to the new content.',
        ],
        p: ['The printed pattern never changes, so you can reuse the same sticker, sign or packaging for a new campaign each season.'],
      },
      {
        h: 'I printed a static code with a mistake. Now what?',
        p: [
          'If the static code holds a link to a website you control, set up a redirect on your website from the wrong address to the right one. Otherwise the only fix is a new code. For anything you print in quantity, start with a [dynamic code](/qr-code-generator/dynamic-url) next time.',
        ],
      },
    ],
    faqs: [
      { q: 'Can I change a QR code from a website to a PDF?', a: 'Yes, with a dynamic code. The type of content can change as well as the address.' },
      { q: 'Is editing free?', a: 'Yes. Editing dynamic codes is free and unlimited on QR ALTRIX.' },
      { q: 'How do I know if my code is static or dynamic?', a: 'Scan it. If it opens a short link from a QR service before your page, it is dynamic. See [static vs dynamic QR codes](/guides/static-vs-dynamic-qr-codes).' },
    ],
  },

  // ---------------------------------------------------------------- scanning
  {
    slug: 'how-to-scan-a-qr-code-on-iphone',
    cat: 'scanning',
    title: 'How to Scan a QR Code on iPhone (Camera & Code Scanner)',
    description: 'Scan a QR code on iPhone with the Camera app, the Code Scanner in Control Center, or from a photo or screenshot. Fixes when it does not work.',
    h1: 'How to scan a QR code on iPhone',
    name: 'Scan on iPhone',
    answer: 'Open the Camera app, point it at the QR code and hold steady for a second. A yellow link appears on screen; tap it to open. No app is needed on iOS 11 or later. You can also use the Code Scanner in Control Center, or long-press a QR code in a photo or screenshot to open it.',
    sections: [
      {
        h: 'Three ways to scan on iPhone',
        steps: [
          'Camera app: point the rear camera at the code. Tap the yellow banner or button that appears.',
          'Code Scanner: open Control Center and tap the QR icon (add it in Settings › Control Center if it is missing). It opens the code in a quick viewer.',
          'Photos and screenshots: open the image in Photos, then tap the QR indicator or long-press the code to open the link.',
        ],
      },
      {
        h: 'If the iPhone camera does not scan',
        list: [
          'Open Settings › Camera and check that QR code scanning (Scan QR Codes, or Show Detected Codes on recent iOS) is switched on.',
          'Move back: the whole code, including its white border, must fit in the frame.',
          'Clean the lens and add light; very dark or very shiny prints are hard to read.',
          'If the screen says “No usable data found”, the code holds something iOS cannot act on; read it with the [online QR scanner](/tools/qr-code-scanner) to see the raw content.',
        ],
        p: ['More fixes: [why is my QR code not scanning](/answers/why-is-my-qr-code-not-scanning).'],
      },
    ],
    faqs: [
      { q: 'Do I need an app to scan QR codes on iPhone?', a: 'No. The built-in Camera app has read QR codes since iOS 11.' },
      { q: 'How do I scan a QR code that is on my iPhone screen?', a: 'Take a screenshot, open it in Photos and long-press the code. See [scan a QR code on your own screen](/answers/how-to-scan-a-qr-code-on-your-phone-screen).' },
      { q: 'Can iPhone join Wi-Fi from a QR code?', a: 'Yes. Scanning a [Wi-Fi QR code](/qr-code-generator/wifi) shows a “Join network” prompt.' },
    ],
  },
  {
    slug: 'how-to-scan-a-qr-code-on-android',
    cat: 'scanning',
    title: 'How to Scan a QR Code on Android (Samsung, Pixel & More)',
    description: 'Scan QR codes on any Android phone with the camera, Google Lens or the quick settings scanner, including Samsung Galaxy and Pixel. Plus fixes.',
    h1: 'How to scan a QR code on Android',
    name: 'Scan on Android',
    answer: 'Open the camera and point it at the QR code; on most Android phones a link appears to tap. If nothing happens, use Google Lens (in the Google app, the camera app or the search bar) or the “Scan QR code” tile in Quick Settings. Samsung Galaxy phones read QR codes in the Camera app when “Scan QR codes” is on in camera settings.',
    sections: [
      {
        h: 'Ways to scan on Android',
        list: [
          'Camera app: most phones from the last few years detect codes automatically.',
          'Google Lens: tap the Lens icon in the Google search bar or Google app and point it at the code.',
          'Quick Settings: swipe down twice and look for a “Scan QR code” tile (add it via the pencil icon).',
          'Samsung: Camera › Settings › Scan QR codes. Samsung Internet also has a built-in scanner.',
          'From a screenshot: open it in Google Photos and tap Lens.',
        ],
      },
      {
        h: 'If Android will not scan',
        list: [
          'Hold the phone 15–30 cm away so the whole code is in view, then move slowly closer.',
          'Tap the screen to focus, and make sure the lens is clean.',
          'Light-on-dark (inverted) codes are not read by every phone. [Can a QR code be inverted?](/answers/can-a-qr-code-be-inverted)',
          'Try the [online QR scanner](/tools/qr-code-scanner) on a photo of the code.',
        ],
      },
    ],
    faqs: [
      { q: 'Do I need to download a QR app on Android?', a: 'Usually not. The camera or Google Lens reads QR codes on almost every phone in use today.' },
      { q: 'How do I share my Wi-Fi as a QR code on Android?', a: 'Settings › Network › Wi-Fi › tap your network › Share. Android shows a QR code after you confirm your identity.' },
    ],
  },
  {
    slug: 'how-to-scan-a-qr-code-on-your-phone-screen',
    cat: 'scanning',
    title: 'How to Scan a QR Code on Your Own Phone Screen',
    description: 'Got a QR code in an email, WhatsApp or screenshot on your phone? Here is how to scan it on the same phone with iPhone, Android or online.',
    h1: 'How to scan a QR code that is on your phone screen',
    name: 'Scan a code on your own screen',
    answer: "Take a screenshot (or save the image), then let the phone read the picture. On iPhone, open the screenshot in Photos and long-press the code. On Android, open it in Google Photos and tap Lens. On any device, upload the image to an online QR code scanner, which reads it in the browser.",
    sections: [
      {
        h: 'Step by step',
        steps: [
          'Screenshot the QR code, or long-press the image and save it.',
          'iPhone: open Photos, tap the screenshot, then long-press the code or tap the QR indicator.',
          'Android: open Google Photos, tap the screenshot, tap Lens, then tap the link.',
          'Anywhere: drop the screenshot into the [online QR code scanner](/tools/qr-code-scanner). The image is decoded in your browser and never uploaded.',
        ],
      },
      {
        h: 'Before you open it',
        p: [
          'A QR code in an unexpected email or text is a common scam (quishing). Check where the link goes before you tap it, and never type a password on a page you reached from a QR code. See [how to tell if a QR code is safe](/answers/is-it-safe-to-scan-a-qr-code).',
        ],
      },
    ],
    faqs: [
      { q: 'Can I scan a QR code on a computer screen?', a: 'Yes, point your phone at the screen. To read it on the computer itself, use the [online scanner](/tools/qr-code-scanner).' },
      { q: 'Can WhatsApp scan a QR code from the gallery?', a: "WhatsApp's own scanner is for WhatsApp contacts and linking devices; use Photos, Lens or an online scanner for other codes." },
    ],
  },
  {
    slug: 'how-to-scan-a-qr-code-on-a-laptop',
    cat: 'scanning',
    title: 'How to Scan a QR Code on a Laptop or PC (Windows & Mac)',
    description: 'Scan a QR code on Windows or Mac: with the webcam, from a screenshot, or free in the browser with no app. Step-by-step for PC and laptop.',
    h1: 'How to scan a QR code on a laptop or PC',
    name: 'Scan on a laptop or PC',
    answer: 'Save the QR code as an image (or take a screenshot), then open a browser-based QR scanner and drop the image in. It works on Windows, Mac, Linux and Chromebook with no software. If the code is on paper, take a photo with your phone, or use the Windows Camera app, which has a QR mode, and your webcam.',
    sections: [
      {
        h: 'From a screenshot (any computer)',
        steps: [
          'Windows: press Win + Shift + S and select the code. Mac: press Cmd + Shift + 4.',
          'Open the [online QR code scanner](/tools/qr-code-scanner).',
          'Paste (Ctrl/Cmd + V) or drop the screenshot. The content appears with buttons to open or copy it.',
        ],
      },
      {
        h: 'With a webcam',
        p: [
          'On Windows 10 and 11 the built-in Camera app can read QR codes: open Camera, switch to the barcode/QR mode if offered, and hold the code to the webcam. On a Mac, take a photo of the code with Photo Booth and drop it into the scanner. Webcams have fixed focus, so hold the code 20–40 cm away and keep it flat.',
        ],
      },
    ],
    faqs: [
      { q: 'Is the online scanner safe?', a: 'The QR ALTRIX scanner decodes the image inside your browser; the picture is not uploaded.' },
      { q: 'Can Google Chrome scan QR codes?', a: 'Chrome can create QR codes for a page; to read one from an image, use Google Lens in Chrome (right-click an image › Search with Google Lens) or the [online scanner](/tools/qr-code-scanner).' },
    ],
  },
  {
    slug: 'how-far-away-can-a-qr-code-be-scanned',
    cat: 'scanning',
    title: 'How Far Away Can a QR Code Be Scanned? (Distance Rule)',
    description: 'Use the 10:1 rule: a QR code scans from about ten times its width. Sizes for posters, signs, banners and billboards, with a quick table.',
    h1: 'How far away can a QR code be scanned?',
    name: 'Scanning distance',
    answer: 'A good rule of thumb is 10 to 1: a QR code can be scanned from about ten times its width. A 2.5 cm (1 inch) code reads from about 25 cm, a 10 cm code from about 1 metre and a 30 cm code from about 3 metres. Fewer modules (a shorter link) and strong contrast make scanning from a distance easier.',
    sections: [
      {
        h: 'Sizes for common distances',
        list: [
          'Business card, product label (held in hand, 15–25 cm): 2–2.5 cm wide.',
          'Flyer, menu, table tent (30–50 cm): 3–5 cm.',
          'Poster on a wall (1–2 m): 10–20 cm.',
          'Window sign or banner (3–5 m): 30–50 cm.',
          'Billboard or stage screen (10 m+): 1 m or more, and test on site.',
        ],
      },
      {
        h: 'What changes the distance',
        p: [
          'The rule assumes a simple code. A code holding a long URL has more, smaller modules and needs to be larger. A [dynamic QR code](/answers/what-is-a-dynamic-qr-code) keeps the pattern simple. Lighting, glossy lamination, viewing angle and older phone cameras all reduce the distance.',
          'For a full printing checklist, see the [QR code size guide for print](/guides/qr-code-size-for-print).',
        ],
      },
    ],
    faqs: [
      { q: 'What is the minimum QR code size?', a: 'About 2 × 2 cm (0.8 in) for something held in the hand. See [minimum QR code size](/answers/minimum-qr-code-size).' },
      { q: 'Does a bigger QR code scan faster?', a: 'Up to a point. It must still fit in the camera frame from where people stand.' },
    ],
  },

  // ---------------------------------------------------------------- design
  {
    slug: 'minimum-qr-code-size',
    cat: 'design',
    title: 'Minimum QR Code Size for Print (cm, Inches & Pixels)',
    description: 'The minimum QR code size is about 2 × 2 cm (0.8 in) for print held in the hand. Sizes for cards, labels, posters and screens, in cm and pixels.',
    h1: 'What is the minimum size for a QR code?',
    name: 'Minimum QR code size',
    answer: 'For print that people hold in their hand, make a QR code at least 2 × 2 cm (about 0.8 × 0.8 inches), plus a white margin around it. Smaller codes can work if they hold very little data, but many phones struggle below 1.5 cm. For anything read from further away, use the 10:1 rule: the code should be about one tenth of the scanning distance.',
    sections: [
      {
        h: 'Recommended sizes',
        list: [
          'Business card: 2–2.5 cm (0.8–1 in).',
          'Product packaging and labels: 2–3 cm.',
          'Flyers, menus and brochures: 3–5 cm.',
          'Posters: 10 cm or more.',
          'On screen: at least 150 × 150 px displayed; export at 1000 px or more so it stays sharp.',
        ],
      },
      {
        h: 'Do not forget the quiet zone',
        p: [
          'The standard asks for a blank margin four modules wide around the code. Text, borders or a busy background touching the code is one of the most common reasons printed codes fail. See [what is the QR code quiet zone](/answers/qr-code-quiet-zone).',
        ],
      },
      {
        h: 'Pixels and file formats',
        p: [
          'Pixel size matters only for screens and for printing raster files. For print, download SVG, PDF or EPS: they are vector files and stay sharp at any size. If you must use PNG, export at least 300 pixels per inch of print size, so 1,200 px for a 10 cm code. QR ALTRIX exports up to 4096 px. More in [QR code size in pixels](/answers/qr-code-size-in-pixels).',
        ],
      },
    ],
    faqs: [
      { q: 'Can a QR code be 1 cm?', a: 'Sometimes, if it holds a very short link and is printed sharply, but test it on several phones first. 2 cm is the safe minimum.' },
      { q: 'What is the standard QR code size?', a: 'There is no single standard size; the ISO standard defines the grid, not the printed size. Size it for the scanning distance.' },
    ],
  },
  {
    slug: 'qr-code-size-in-pixels',
    cat: 'design',
    title: 'QR Code Size in Pixels – Best Resolution for Print & Web',
    description: 'What pixel size should a QR code be? Recommended resolutions for websites, email, social posts and print, and why SVG beats PNG for printing.',
    h1: 'What size in pixels should a QR code be?',
    name: 'QR code size in pixels',
    answer: 'For screens, a QR code should be displayed at 150–300 pixels wide; for printing, export it at 300 pixels per inch of the final size (for example 600 px for a 2-inch code), or better, download a vector SVG or PDF that has no pixels at all. Use a whole-number scale so each module is the same number of pixels and edges stay crisp.',
    sections: [
      {
        h: 'Recommended exports',
        list: [
          'Website or email: 300–600 px PNG, shown at 150–300 px.',
          'Social media post or slide: 1000 px PNG.',
          'Print up to 10 cm: 1200 px PNG, or SVG/PDF.',
          'Large print (posters, banners, vehicles): SVG, PDF or EPS only.',
        ],
      },
      {
        h: 'Why blurry QR codes fail',
        p: [
          'When a small PNG is stretched, the edges between modules blur and the scanner cannot tell dark from light. Vector files describe each module as a shape, so a print shop can enlarge them indefinitely. QR ALTRIX exports PNG, JPEG and WebP up to 4096 px and vector SVG, PDF and EPS.',
        ],
      },
    ],
    faqs: [
      { q: 'Is JPEG OK for QR codes?', a: 'It works, but JPEG compression can smudge edges. PNG or SVG is better.' },
      { q: 'What DPI should a QR code be?', a: 'At least 300 DPI at the printed size, or use a vector format.' },
    ],
  },
  {
    slug: 'qr-code-quiet-zone',
    cat: 'design',
    title: 'What Is the QR Code Quiet Zone? (Margin Explained)',
    description: 'The quiet zone is the blank margin around a QR code, four modules wide by the standard. Why it matters and how to keep it when you design.',
    h1: 'What is the QR code quiet zone?',
    name: 'Quiet zone (margin)',
    answer: 'The quiet zone is the empty margin around a QR code. The ISO/IEC 18004 standard asks for a border four modules wide (four of the code’s small squares) on every side, in the background colour. It lets the scanner see where the code ends. Text, borders or busy backgrounds touching the code are a frequent reason a printed QR code will not scan.',
    sections: [
      {
        h: 'How to keep the quiet zone',
        list: [
          'Leave the default margin on when you download.',
          'Do not crop the white edge off the image in your design software.',
          'Keep text, photos and frame lines out of the margin.',
          'On a coloured or photo background, put the code on a light panel that includes the margin.',
        ],
      },
      {
        h: 'Can the margin be smaller?',
        p: [
          'Many phones read codes with a two-module margin, but not all, and the failure is silent: some people just give up. QR ALTRIX’s scan-safety score warns when the margin is too small. More design rules in [QR code design best practices](/guides/qr-code-design-best-practices).',
        ],
      },
    ],
    faqs: [
      { q: 'Does the frame count as quiet zone?', a: 'No. A frame with a call to action should sit outside the quiet zone, with clear space between it and the code.' },
    ],
  },
  {
    slug: 'can-a-qr-code-be-any-color',
    cat: 'design',
    title: 'Can a QR Code Be Any Color? Colour Rules That Scan',
    description: 'QR codes can be coloured, as long as the code is dark on a light background with strong contrast. Colour rules, examples and what to avoid.',
    h1: 'Can a QR code be any colour?',
    name: 'Coloured QR codes',
    answer: 'Yes, a QR code can be almost any colour as long as the modules are clearly darker than the background. Dark blue, green, purple, red or brown on white or a pale tint all scan well. Avoid light colours such as yellow, pastel or light grey for the code, low contrast pairs, and busy photo backgrounds.',
    sections: [
      {
        h: 'Colour rules that work',
        list: [
          'Dark code, light background. Phones look for contrast, not black specifically.',
          'Aim for a big difference in brightness: if the colours look similar in a black-and-white photo, they will not scan.',
          'Gradients are fine if every part of the code stays dark.',
          'Keep the three corner squares solid and dark; you can colour them as an accent.',
          'Transparent backgrounds only work when printed on a light surface.',
        ],
      },
      {
        h: 'Test before printing',
        p: [
          'The QR ALTRIX designer shows a scan-safety score as you choose colours, logos and shapes, and warns about weak contrast. Always print a test copy on the real material, because colours look different on paper than on screen. See [can you print a QR code in colour](/answers/can-you-print-a-qr-code-in-color).',
        ],
      },
    ],
    faqs: [
      { q: 'Can a QR code be red?', a: 'Dark red on white scans well. Bright red is lighter than it looks to a camera; test it.' },
      { q: 'Can a QR code be white on black?', a: 'Sometimes. See [can a QR code be inverted](/answers/can-a-qr-code-be-inverted).' },
    ],
  },
  {
    slug: 'can-a-qr-code-be-inverted',
    cat: 'design',
    title: 'Can a QR Code Be Inverted (White on Black)?',
    description: 'Inverted QR codes (light on dark) are allowed by the 2015 standard but not every scanner reads them. When they work, and the safer option.',
    h1: 'Can a QR code be inverted (white on black)?',
    name: 'Inverted QR codes',
    answer: 'It can, but it is risky. The 2015 edition of the QR code standard lets readers support reversed (light-on-dark) codes, and the iPhone camera and many Android phones read them, but some scanner apps and older phones do not. If your design is dark, place a normal dark-on-light code on a light panel instead.',
    sections: [
      {
        h: 'Why the safe choice is dark on light',
        p: [
          'Scanners were designed for dark modules on a light background. An inverted code that works on your phone may fail on a visitor’s phone with a different app, and you will never know. A white rounded panel with a dark code on a dark poster looks deliberate and scans everywhere.',
          'If you do invert, keep high contrast, keep a dark quiet zone around the code and test it on several iPhone and Android devices. QR ALTRIX offers inversion but shows a warning in the scan-safety score.',
        ],
      },
    ],
    faqs: [
      { q: 'Does the iPhone read inverted QR codes?', a: 'Recent iPhones generally do, but do not rely on it for your whole audience.' },
    ],
  },
  {
    slug: 'can-you-print-a-qr-code-in-color',
    cat: 'design',
    title: 'Can You Print a QR Code in Colour? Printing Tips',
    description: 'Yes, QR codes can be printed in colour. Which colours scan, CMYK and Pantone tips, paper and finish choices, and how to test before a print run.',
    h1: 'Can you print a QR code in colour?',
    name: 'Printing in colour',
    answer: 'Yes. Coloured QR codes print and scan fine when the code is a dark colour on a light background. Use a vector file (SVG, PDF or EPS) so the edges stay sharp, check contrast in CMYK rather than on screen, avoid glossy or reflective finishes behind the code, and print a proof to test on several phones before the full run.',
    sections: [
      {
        h: 'Print checklist',
        list: [
          'File: vector SVG, PDF or EPS from the generator, not a screenshot.',
          'Colour: dark code, light background; screen colours often print lighter.',
          'Size: at least 2 × 2 cm, more for distance. See [minimum QR code size](/answers/minimum-qr-code-size).',
          'Margin: keep the quiet zone clear.',
          'Finish: matte is safer than gloss or foil; avoid metallic inks for the modules.',
          'Proof: scan the printed proof with an iPhone and an Android phone.',
        ],
      },
      {
        h: 'Printing many codes',
        p: [
          'For numbered tickets, labels or name badges, the [bulk QR code generator](/tools/bulk-qr-code-generator) creates hundreds of codes from a spreadsheet and downloads them as a ZIP, ready for a print shop.',
        ],
      },
    ],
    faqs: [
      { q: 'Can I print a QR code on a black-and-white printer?', a: 'Yes. Black on white is the most reliable QR code there is.' },
      { q: 'Can I print a QR code on fabric or a T-shirt?', a: 'Yes, at a larger size (8 cm+) with a flat, non-stretch area, and test after washing.' },
    ],
  },
  {
    slug: 'qr-code-logo-size',
    cat: 'design',
    title: 'How Big Can a Logo Be in a QR Code?',
    description: 'A logo should cover no more than about 20–25% of a QR code, with high error correction and clear corners. How to add a logo that still scans.',
    h1: 'How big can a logo be in a QR code?',
    name: 'Logo size',
    answer: 'Keep the logo to about 20–25% of the code’s area (roughly a third of its width at most), place it in the centre, and use error correction level H, which can rebuild up to 30% of a damaged code. Never cover the three corner squares or the edges. A logo on a small plain background panel scans better than one that cuts into the pattern.',
    sections: [
      {
        h: 'How a logo fits without breaking the code',
        p: [
          'QR codes repeat their data with Reed-Solomon error correction. Covering the centre with a logo is, to the scanner, damage it can repair, as long as the damage stays below what the error-correction level allows. Level H allows the most; level L, the least.',
        ],
        list: [
          'Error correction H (30%) when you add a logo.',
          'Logo no wider than about a third of the code.',
          'Corners, timing lines and the quiet zone untouched.',
          'Simple, high-contrast logo; avoid thin lines.',
        ],
      },
      {
        h: 'Add a logo in QR ALTRIX',
        p: [
          'Upload your logo or pick one of 16 built-in icons. The designer raises error correction automatically and the scan-safety score warns if the logo is too large. [Create a QR code with a logo](/guides/how-to-make-a-qr-code-with-a-logo).',
        ],
      },
    ],
    faqs: [
      { q: 'Does a logo make the QR code bigger?', a: 'Higher error correction adds modules, so the grid is a little denser. Keep the content short to compensate.' },
      { q: 'Which logo file is best?', a: 'A square PNG or SVG with a transparent or white background.' },
    ],
  },
  {
    slug: 'qr-code-error-correction-levels',
    cat: 'design',
    title: 'QR Code Error Correction Levels L, M, Q, H Explained',
    description: 'QR codes have four error correction levels: L 7%, M 15%, Q 25% and H 30%. What each means and which to choose for print, logos and outdoor use.',
    h1: 'QR code error correction levels explained',
    name: 'Error correction levels',
    answer: 'Error correction lets a scanner read a QR code even when part of it is dirty, damaged or covered. There are four levels: L recovers about 7% of the code, M about 15%, Q about 25% and H about 30%. Higher levels are more robust but make the pattern denser. Use M for most codes and H when you add a logo or print outdoors.',
    sections: [
      {
        h: 'Which level to choose',
        list: [
          'L (7%): screens and clean, protected prints where a small, simple pattern matters most.',
          'M (15%): the usual default for flyers, cards and packaging.',
          'Q (25%): rough surfaces, industrial labels, outdoor signs.',
          'H (30%): codes with a logo, or anything likely to be scratched or partly covered.',
        ],
      },
      {
        h: 'The trade-off',
        p: [
          'Error correction is extra data. The same link at level H needs more modules than at level L, so either the code gets bigger or each square gets smaller. Short content leaves room for high error correction without making the code hard to scan. QR ALTRIX lets you choose the level and raises it when you add a logo.',
        ],
      },
    ],
    faqs: [
      { q: 'Does error correction make a QR code scan faster?', a: 'Not faster, but more reliably when the code is damaged, dirty or partly covered.' },
    ],
  },

  // ---------------------------------------------------------------- trouble
  {
    slug: 'why-is-my-qr-code-not-scanning',
    cat: 'trouble',
    title: 'QR Code Not Scanning? 12 Causes and How to Fix Them',
    description: 'Why a QR code will not scan, and how to fix it: size, contrast, margin, blur, inverted colours, too much data, broken links and expired codes.',
    h1: 'Why is my QR code not scanning?',
    name: 'QR code not scanning',
    answer: 'Most QR codes fail for one of five reasons: they are printed too small, have too little contrast, have text or a border touching them (no quiet zone), are blurry from a low-resolution file, or hold too much data. If the code scans but the page does not open, the link is broken or the code has expired on the service that made it.',
    sections: [
      {
        h: 'The code is not detected at all',
        list: [
          'Too small for the distance: use the [10:1 rule](/answers/how-far-away-can-a-qr-code-be-scanned).',
          'Low contrast: light colours, or a code on a photo. Use a dark code on a light background.',
          'No quiet zone: keep a clear margin. [Quiet zone explained](/answers/qr-code-quiet-zone).',
          'Blurry: a stretched PNG or screenshot. Re-export as SVG or PDF.',
          'Too dense: a long URL or text. Use a [dynamic code](/qr-code-generator/dynamic-url) for a short pattern.',
          'Inverted colours or a reflective finish.',
          'Logo too big or covering a corner square. [Logo size rules](/answers/qr-code-logo-size).',
          'Printed on a curve, fold or crease.',
        ],
      },
      {
        h: 'The code scans but nothing useful happens',
        list: [
          'Typo in the link: a static code keeps the mistake forever.',
          'The website is down or the page was moved.',
          'The QR service deactivated the code after a trial: see [QR code expired](/answers/qr-code-expired-how-to-fix).',
          'The phone shows “No usable data found”: the content is in a format the phone does not recognise.',
        ],
      },
      {
        h: 'Quick test',
        p: [
          'Upload a photo or the original file to the [online QR code scanner](/tools/qr-code-scanner). If it reads, the problem is the print or the phone; if it does not, the code itself needs redesigning.',
        ],
      },
    ],
    faqs: [
      { q: 'Why does my QR code work on one phone but not another?', a: 'Phones use different decoders. Borderline codes (small, low contrast, inverted) read on some and fail on others. Make the code more robust.' },
      { q: 'Why does a QR code not work when printed?', a: 'See [QR code not working when printed](/answers/qr-code-not-working-when-printed).' },
    ],
  },
  {
    slug: 'qr-code-not-working-when-printed',
    cat: 'trouble',
    title: 'QR Code Works on Screen but Not When Printed? Fixes',
    description: 'Your QR code scans on screen but fails on paper? Usual causes: low resolution, colour shift, size, margin, glossy finish. Fix it before reprinting.',
    h1: 'QR code works on screen but not when printed',
    name: 'Not working when printed',
    answer: 'A code that scans on screen but not on paper is usually printed too small, from a low-resolution image, in a colour that printed lighter than expected, or with the margin cropped. Glossy lamination and curved surfaces also cause glare and distortion. Download a vector file (SVG or PDF), keep a dark-on-light design and the quiet zone, and print at least 2 × 2 cm.',
    sections: [
      {
        h: 'Fix checklist',
        steps: [
          'Download the code again as SVG or PDF and send that to the printer.',
          'Make it bigger: at least 2 cm, or one tenth of the scanning distance.',
          'Check the colours in CMYK; darken the code if needed.',
          'Restore the white margin on all four sides.',
          'Avoid gloss, foil and textured paper behind the code.',
          'Print a proof and scan it with two different phones.',
        ],
      },
      {
        h: 'Already printed thousands?',
        p: [
          'If the code was dynamic and only the destination is wrong, just change it in the dashboard. If the print itself cannot be scanned, a sticker with a corrected code over the old one is the cheapest fix. More causes in [why is my QR code not scanning](/answers/why-is-my-qr-code-not-scanning).',
        ],
      },
    ],
    faqs: [
      { q: 'Can a printer ruin a QR code?', a: 'Yes: ink spread on absorbent paper can merge small modules. Use a larger size on uncoated paper.' },
    ],
  },
  {
    slug: 'qr-code-not-working-on-iphone',
    cat: 'trouble',
    title: 'QR Code Not Working on iPhone? How to Fix It',
    description: 'iPhone camera will not scan a QR code? Turn on QR scanning, use Code Scanner, fix “No usable data found” and check the code itself.',
    h1: 'QR code not working on iPhone',
    name: 'Not working on iPhone',
    answer: 'First check that QR scanning is on in Settings › Camera (the switch is called Scan QR Codes, or Show Detected Codes on recent iOS versions). Then try the Code Scanner in Control Center, which reads codes the camera misses. If the iPhone says “No usable data found”, the code holds content iOS cannot open, such as an unusual format; read it with an online scanner to see what is inside.',
    sections: [
      {
        h: 'Fixes to try',
        list: [
          'Turn on QR detection in Camera settings.',
          'Use the rear camera, not the selfie camera, and the 1× lens.',
          'Step back so the whole code and its margin are in the frame.',
          'Clean the lens; add light or remove glare.',
          'Update iOS; older versions read fewer code variants.',
          'Restart the Camera app or the phone.',
        ],
      },
      {
        h: 'When the problem is the code',
        p: [
          'If other phones fail too, the code is the problem: too small, low contrast, inverted or blurry. See the full list in [why is my QR code not scanning](/answers/why-is-my-qr-code-not-scanning), or make a new one with the [free QR code generator](/#generator), which checks scan safety before you download.',
        ],
      },
    ],
    faqs: [
      { q: 'What does “No usable data found” mean?', a: 'The iPhone decoded the code but does not know what to do with its content. The code may hold plain text in an unusual encoding or a format iOS does not support.' },
      { q: 'Why does the iPhone open the link in an app?', a: 'If the link belongs to an app you have installed (Instagram, YouTube), iOS opens it in that app.' },
    ],
  },
  {
    slug: 'qr-code-expired-how-to-fix',
    cat: 'trouble',
    title: 'QR Code Expired? Why It Happened and How to Fix It',
    description: 'A printed QR code that says expired or inactive was deactivated by the service that made it. How to fix it, and how to avoid it next time.',
    h1: 'QR code expired: why it happened and how to fix it',
    name: 'QR code expired',
    answer: 'The pattern of a QR code cannot expire. When a code shows “expired”, “inactive” or a sign-up page, it was a dynamic code whose short link belongs to a QR service, and that service stopped forwarding it, usually because a free trial or subscription ended. To fix it, renew with that service or ask it to redirect; otherwise replace the code with a new one.',
    sections: [
      {
        h: 'How to fix an expired code',
        steps: [
          'Scan the code and note the domain of the short link it opens: that tells you which service made it.',
          'Log in to that service. Renewing the plan usually reactivates the same code.',
          'If you cannot or do not want to pay, create a new dynamic code on a service with no expiry and cover the old code with a sticker or reprint.',
          'If the code is static and points to your own website, it never expired; check that the page still exists.',
        ],
      },
      {
        h: 'How to never have this problem again',
        p: [
          'Use a static code for content that never changes, and a dynamic code from a service that does not tie codes to a paid plan. On QR ALTRIX dynamic codes are free and do not expire; they keep working until you pause or delete them. Compare services with the [best free QR code generator checklist](/best-free-qr-code-generator).',
          'If you print large volumes, you can also use your own domain for the short links, so the code points to an address you control.',
        ],
      },
    ],
    faqs: [
      { q: 'Do QR codes expire?', a: 'Static codes never do. Dynamic codes can, depending on the service. See [do QR codes expire](/answers/do-qr-codes-expire).' },
      { q: 'Can I get my old expired code back without paying?', a: 'Only the service that owns the short link can reactivate it.' },
    ],
  },
];
