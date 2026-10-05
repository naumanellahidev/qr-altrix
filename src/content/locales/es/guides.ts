import type { GuideCopy, GuideSlug } from '@/content/schema';

export const guides: Record<GuideSlug, GuideCopy> = {
  'how-to-create-a-qr-code': {
    title: 'Cómo crear un código QR gratis – Guía paso a paso',
    description: 'Aprende a crear un código QR en menos de un minuto: elige el tipo, añade tu contenido, diséñalo, pruébalo e imprímelo. Gratis y sin registro para códigos estáticos.',
    h1: 'Cómo crear un código QR',
    name: 'Cómo crear un código QR',
    intro: 'Crear un código QR lleva menos de un minuto. Crear uno que se escanee siempre, se vea bien y siga funcionando dentro de un año exige unas cuantas decisiones más. Esta guía recorre ambas cosas.',
    sections: [
      {
        heading: '1. Decide: estático o dinámico',
        body: [
          'Un código estático guarda el contenido en el patrón. Funciona para siempre y sin conexión, pero no se puede editar ni medir. Úsalo para Wi-Fi, tarjetas de contacto y enlaces que nunca cambiarán.',
          'Un código dinámico guarda un enlace corto que tú controlas. Puedes cambiar el destino después de imprimir y ver cada escaneo. Úsalo para todo lo que se imprima en cantidad o se use en marketing.',
        ],
      },
      {
        heading: '2. Elige el tipo',
        body: [
          'Elige qué debe pasar cuando alguien escanea: abrir una web, conectarse al Wi-Fi, guardar un contacto, mostrar un menú, reproducir un vídeo. Elegir bien el tipo hace que la gente obtenga justo lo que espera.',
        ],
      },
      {
        heading: '3. Añade tu contenido',
        body: [
          'Introduce el enlace, los datos de la red o el texto. Sé breve: menos contenido significa un patrón más simple que se escanea antes. En los códigos dinámicos el patrón sigue siendo simple sea cual sea el destino.',
        ],
      },
      {
        heading: '4. Diséñalo',
        body: [
          'Elige colores, un estilo de patrón, formas de esquina, un logo y un marco con una llamada a la acción como «Escanea para ver la carta». Mantén el código oscuro sobre fondo claro, con buen contraste.',
          'Vigila la puntuación de escaneo: avisa de bajo contraste, logos demasiado grandes y márgenes insuficientes antes de imprimir.',
        ],
      },
      {
        heading: '5. Pruébalo e imprímelo',
        body: [
          'Escanea el código con al menos dos móviles, un iPhone y un Android, desde la distancia a la que lo usará la gente. Descarga SVG o PDF para imprimir y que se vea nítido a cualquier tamaño.',
        ],
      },
    ],
    faqs: [
      { q: '¿Crear un código QR es gratis?', a: 'Sí. En QR ALTRIX todas las funciones son gratis, incluidos los códigos dinámicos y las analíticas.' },
      { q: '¿Necesito una cuenta?', a: 'No para los códigos estáticos. Los dinámicos necesitan una cuenta gratuita para poder editarlos y medirlos.' },
      { q: '¿Qué formato de archivo descargo?', a: 'PNG para pantallas y documentos; SVG, PDF o EPS para imprenta profesional.' },
    ],
  },
  'static-vs-dynamic-qr-codes': {
    title: 'Códigos QR estáticos vs dinámicos – Diferencias y cuándo usar cada uno',
    description: '¿Código QR estático o dinámico? Descubre cómo funciona cada uno, cuál se edita y se mide, cuál caduca y cuál elegir para menús, envases, Wi-Fi y anuncios.',
    h1: 'Códigos QR estáticos vs dinámicos',
    name: 'Estático vs dinámico',
    intro: 'Todo código QR es estático o dinámico. La diferencia decide si puedes cambiarlo después de imprimir, si puedes contar los escaneos y, en muchas plataformas, si deja de funcionar cuando termina una prueba.',
    sections: [
      {
        heading: 'Cómo funciona un código QR estático',
        body: [
          'El contenido (un enlace, una contraseña de Wi-Fi, un contacto) se codifica directamente en los cuadrados blancos y negros. No se consulta nada al escanear, así que funciona sin conexión y para siempre.',
          'La otra cara: no puedes cambiarlo y nadie puede contar sus escaneos. Una errata obliga a reimprimir.',
        ],
      },
      {
        heading: 'Cómo funciona un código QR dinámico',
        body: [
          'El patrón contiene un enlace corto. Al escanearlo, el servidor del enlace registra el escaneo y redirige al destino que hayas definido. Cambia el destino y todas las copias impresas lo siguen.',
          'Como el enlace es corto, el patrón sigue siendo simple y se escanea con facilidad incluso impreso pequeño.',
        ],
      },
      {
        heading: '¿Caducan los códigos QR dinámicos?',
        body: [
          'No deberían, pero en muchos servicios caducan: los planes gratuitos suelen limitarte a unos pocos códigos dinámicos o los desactivan tras una prueba, y el código impreso deja de funcionar.',
          'En QR ALTRIX los códigos dinámicos son gratis e ilimitados y siguen funcionando hasta que los pausas o eliminas.',
        ],
      },
      {
        heading: '¿Cuál deberías usar?',
        body: [
          'Estático: Wi-Fi, contactos vCard, texto simple y enlaces que estás seguro de que nunca cambiarán.',
          'Dinámico: menús, envases, pósteres, tarjetas de visita, campañas; todo lo que se imprima en cantidad o donde quieras medir resultados.',
        ],
      },
    ],
    faqs: [
      { q: '¿Puedo convertir un código estático en dinámico?', a: 'No, el patrón es distinto. Crea un código dinámico y sustituye el impreso.' },
      { q: '¿Los códigos dinámicos tardan más en escanearse?', a: 'La redirección añade una fracción de segundo; el patrón más simple a menudo hace que se lean antes.' },
      { q: '¿Los códigos dinámicos recogen datos personales?', a: 'En QR ALTRIX registran país, dispositivo y datos similares, y las direcciones IP se guardan solo como hash con sal.' },
    ],
  },
  'qr-code-size-for-print': {
    title: 'Tamaño de un código QR para imprimir – Mínimo y distancia de escaneo',
    description: '¿Qué tamaño debe tener un código QR? Tamaños mínimos para tarjetas, folletos, pósteres y carteles, la regla 10:1 y consejos de zona de silencio y resolución.',
    h1: 'Tamaño de un código QR para imprimir',
    name: 'Guía de tamaños de impresión',
    intro: 'Un código QR demasiado pequeño es la causa más habitual de que falle una tirada. El tamaño correcto depende de la distancia desde la que se escaneará y de cuántos datos contiene el código.',
    sections: [
      {
        heading: 'La regla 10:1',
        body: [
          'Una buena regla práctica: el código debe medir al menos una décima parte de la distancia de escaneo. Escaneado a 30 cm, hazlo de 3 cm; a 2 metros, de 20 cm.',
        ],
      },
      {
        heading: 'Tamaños mínimos por soporte',
        body: [
          'Tarjetas de visita y etiquetas: al menos 2 × 2 cm.',
          'Folletos, cartas y expositores de mesa: 3–4 cm.',
          'Pósteres vistos a unos metros: 10–20 cm.',
          'Pancartas y rótulos de edificios: escala con la distancia siguiendo la regla 10:1.',
        ],
      },
      {
        heading: 'Respeta la zona de silencio',
        body: [
          'Deja un margen vacío alrededor del código de unos cuatro módulos (los cuadraditos) de ancho. Los textos o gráficos pegados al código son una causa habitual de escaneos fallidos.',
        ],
      },
      {
        heading: 'Usa archivos vectoriales',
        body: [
          'Descarga SVG, PDF o EPS para imprimir. Los archivos vectoriales se ven perfectos a cualquier tamaño, mientras que un PNG ampliado puede verse borroso.',
          'Los códigos dinámicos tienen menos módulos, así que siguen siendo legibles en tamaños pequeños donde un enlace estático largo no lo sería.',
        ],
      },
    ],
    faqs: [
      { q: '¿Cuál es el código QR más pequeño que funciona?', a: 'Unos 2 × 2 cm para escanear de cerca, si el código contiene pocos datos y se imprime nítido.' },
      { q: '¿Un logo cambia el tamaño mínimo?', a: 'Un logo oculta algunos módulos; mantenlo por debajo de una cuarta parte del código y sube la corrección de errores a Q o H.' },
      { q: '¿Qué resolución debe tener un PNG?', a: 'Para imprimir, mejor vectorial. Si tienes que usar PNG, expórtalo a 1000 px como mínimo para impresiones pequeñas y a más para las grandes.' },
    ],
  },
  'qr-code-design-best-practices': {
    title: 'Buenas prácticas de diseño de códigos QR – Colores, logos y marcos',
    description: 'Diseña códigos QR que luzcan y se sigan escaneando: reglas de contraste, tamaño del logo, colores y degradados, marcos y llamadas a la acción, y cómo probar antes de imprimir.',
    h1: 'Buenas prácticas de diseño de códigos QR',
    name: 'Buenas prácticas de diseño',
    intro: 'Un código QR con tu marca recibe más escaneos que uno plano, siempre que los móviles puedan leerlo. Estas reglas mantienen tu diseño en el lado correcto de esa línea.',
    sections: [
      {
        heading: 'Primero, el contraste',
        body: [
          'Los lectores necesitan un patrón oscuro sobre un fondo claro. Busca una relación de contraste de al menos 4:1 y evita los códigos invertidos (claro sobre oscuro) salvo que los hayas probado en muchos móviles.',
        ],
      },
      {
        heading: 'Logos: pequeños y centrados',
        body: [
          'Un logo tapa parte del código. La corrección de errores QR puede reconstruir lo que falta, pero solo hasta cierto punto: mantén el logo por debajo del 25 % del código y usa el nivel de corrección Q o H.',
        ],
      },
      {
        heading: 'Colores y degradados',
        body: [
          'Los colores de marca funcionan bien si son lo bastante oscuros. Los degradados están bien cuando ambos extremos son oscuros. Los patrones pastel, amarillos y gris claro son los que más fallan.',
        ],
      },
      {
        heading: 'Añade un marco y una llamada a la acción',
        body: [
          'Di por qué escanear: «Escanea para ver la carta», «Consigue un 10 % de descuento», «Conéctate a nuestro Wi-Fi». Los códigos con una llamada a la acción clara se escanean mucho más que los códigos sin más.',
        ],
      },
      {
        heading: 'Prueba antes de imprimir',
        body: [
          'Usa la comprobación de escaneo y luego escanea una prueba impresa con un iPhone y un Android al tamaño y la distancia reales.',
        ],
      },
    ],
    faqs: [
      { q: '¿Un código QR puede ser de cualquier color?', a: 'Sí, siempre que el patrón sea claramente más oscuro que el fondo.' },
      { q: '¿Se escanean los patrones redondeados o de puntos?', a: 'Sí, los móviles modernos los leen bien; mantén bien definidos los cuadrados de las esquinas.' },
      { q: '¿Qué es la puntuación de escaneo?', a: 'Una comprobación del editor que avisa de bajo contraste, logos demasiado grandes y otros riesgos antes de descargar.' },
    ],
  },
};
