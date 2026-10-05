import type { GuideCopy, GuideSlug } from '@/content/schema';

export const guides: Record<GuideSlug, GuideCopy> = {
  'how-to-create-a-qr-code': {
    title: 'Comment créer un QR code gratuitement – Guide étape par étape',
    description: 'Apprenez à créer un QR code en moins d’une minute : choisissez le type, ajoutez le contenu, concevez, testez et imprimez. Gratuit, sans inscription pour les codes statiques.',
    h1: 'Comment créer un QR code',
    name: 'Créer un QR code',
    intro: 'Créer un QR code prend moins d’une minute. En créer un qui se scanne à chaque fois, qui soit beau et qui marche encore dans un an demande quelques décisions de plus. Ce guide couvre les deux.',
    sections: [
      {
        heading: '1. Décidez : statique ou dynamique',
        body: [
          'Un code statique stocke le contenu dans le motif. Il fonctionne pour toujours et hors ligne, mais ne peut être ni modifié ni suivi. Utilisez-le pour le Wi-Fi, les fiches contact et les liens qui ne changeront jamais.',
          'Un code dynamique stocke un lien court que vous contrôlez. Vous changez la destination après impression et voyez chaque scan. Utilisez-le pour tout ce qui est imprimé en quantité ou sert au marketing.',
        ],
      },
      {
        heading: '2. Choisissez le type',
        body: [
          'Choisissez ce qui doit se passer au scan : ouvrir un site, rejoindre le Wi-Fi, enregistrer un contact, afficher un menu, lire une vidéo. Le bon type donne aux gens exactement ce qu’ils attendent.',
        ],
      },
      {
        heading: '3. Ajoutez votre contenu',
        body: [
          'Saisissez le lien, les informations du réseau ou le texte. Restez bref : moins de contenu donne un motif plus simple, scanné plus vite. Avec un code dynamique, le motif reste simple quelle que soit la destination.',
        ],
      },
      {
        heading: '4. Concevez-le',
        body: [
          'Choisissez couleurs, style de motif, forme des angles, logo et un cadre avec un appel à l’action comme « Scannez pour le menu ». Gardez un code foncé sur fond clair, bien contrasté.',
          'Surveillez le score de lisibilité : il signale un contraste faible, un logo trop grand ou des marges manquantes avant l’impression.',
        ],
      },
      {
        heading: '5. Testez et imprimez',
        body: [
          'Scannez le code avec au moins deux téléphones, un iPhone et un Android, à la distance réelle d’utilisation. Téléchargez en SVG ou PDF pour l’impression afin qu’il reste net à toute taille.',
        ],
      },
    ],
    faqs: [
      { q: 'Créer un QR code est-il gratuit ?', a: 'Oui. Sur QR ALTRIX, toutes les fonctionnalités sont gratuites, codes dynamiques et statistiques compris.' },
      { q: 'Faut-il un compte ?', a: 'Pas pour les codes statiques. Un compte gratuit est nécessaire pour les codes dynamiques afin de les modifier et de les suivre.' },
      { q: 'Quel format de fichier télécharger ?', a: 'PNG pour les écrans et documents ; SVG, PDF ou EPS pour l’impression professionnelle.' },
    ],
  },
  'static-vs-dynamic-qr-codes': {
    title: 'QR code statique ou dynamique – Différences et quand les utiliser',
    description: 'QR code statique ou dynamique ? Découvrez comment chacun fonctionne, lequel se modifie et se suit, lequel expire, et lequel choisir pour menus, emballages, Wi-Fi et publicité.',
    h1: 'QR codes statiques vs dynamiques',
    name: 'Statique vs dynamique',
    intro: 'Tout QR code est soit statique, soit dynamique. La différence détermine si vous pouvez le changer après impression, si vous pouvez compter les scans et — sur bien des plateformes — s’il cesse de fonctionner à la fin d’un essai.',
    sections: [
      {
        heading: 'Comment fonctionne un QR code statique',
        body: [
          'Le contenu — un lien, un mot de passe Wi-Fi, un contact — est encodé directement dans les carrés noirs et blancs. Rien n’est consulté au scan : il fonctionne hors ligne et pour toujours.',
          'Le revers : vous ne pouvez pas le changer et personne ne peut compter ses scans. Une coquille, et il faut réimprimer.',
        ],
      },
      {
        heading: 'Comment fonctionne un QR code dynamique',
        body: [
          'Le motif contient un lien court. Au scan, le serveur du lien enregistre le scan et redirige vers la destination que vous avez définie. Changez la destination et tous les exemplaires imprimés suivent.',
          'Comme le lien est court, le motif reste simple et se scanne facilement, même imprimé petit.',
        ],
      },
      {
        heading: 'Les QR codes dynamiques expirent-ils ?',
        body: [
          'Ils ne devraient pas, mais chez beaucoup de services, si : les offres gratuites limitent souvent à quelques codes dynamiques ou les désactivent après un essai, et le code imprimé cesse de fonctionner.',
          'Sur QR ALTRIX, les codes dynamiques sont gratuits, illimités et fonctionnent jusqu’à ce que vous les mettiez en pause ou les supprimiez.',
        ],
      },
      {
        heading: 'Lequel choisir ?',
        body: [
          'Statique : Wi-Fi, contacts vCard, texte brut et liens dont vous êtes sûr qu’ils ne changeront jamais.',
          'Dynamique : menus, emballages, affiches, cartes de visite, campagnes — tout ce qui est imprimé en quantité ou dont vous voulez mesurer les résultats.',
        ],
      },
    ],
    faqs: [
      { q: 'Peut-on transformer un code statique en code dynamique ?', a: 'Non, le motif est différent. Créez un code dynamique et remplacez l’imprimé.' },
      { q: 'Les codes dynamiques sont-ils plus lents à scanner ?', a: 'La redirection ajoute une fraction de seconde ; le motif plus simple les rend souvent plus rapides à lire.' },
      { q: 'Les codes dynamiques collectent-ils des données personnelles ?', a: 'Sur QR ALTRIX, ils enregistrent le pays, l’appareil et des informations similaires, les adresses IP n’étant stockées que sous forme de hachage salé.' },
    ],
  },
  'qr-code-size-for-print': {
    title: 'Taille d’un QR code pour l’impression – Minimum et distance de scan',
    description: 'Quelle taille pour un QR code ? Tailles minimales pour cartes de visite, flyers, affiches et panneaux, la règle du 10:1, et conseils de zone de silence et de résolution.',
    h1: 'Taille d’un QR code pour l’impression',
    name: 'Guide des tailles d’impression',
    intro: 'Un QR code trop petit est la première cause d’échec d’un tirage. La bonne taille dépend de la distance de scan et de la quantité de données que contient le code.',
    sections: [
      {
        heading: 'La règle du 10:1',
        body: [
          'Une bonne règle : le code doit mesurer au moins un dixième de la distance de scan. Scanné à 30 cm, faites-le de 3 cm ; à 2 mètres, de 20 cm.',
        ],
      },
      {
        heading: 'Tailles minimales par support',
        body: [
          'Cartes de visite et étiquettes : au moins 2 × 2 cm.',
          'Flyers, menus et chevalets : 3–4 cm.',
          'Affiches vues à quelques mètres : 10–20 cm.',
          'Banderoles et enseignes : adaptez à la distance avec la règle du 10:1.',
        ],
      },
      {
        heading: 'Respectez la zone de silence',
        body: [
          'Laissez une marge vide autour du code d’environ quatre modules (les petits carrés). Un texte ou un visuel collé au code est une cause fréquente d’échec de scan.',
        ],
      },
      {
        heading: 'Utilisez des fichiers vectoriels',
        body: [
          'Téléchargez en SVG, PDF ou EPS pour l’impression. Les fichiers vectoriels restent parfaitement nets à toute taille, alors qu’un PNG agrandi peut devenir flou.',
          'Les codes dynamiques ont moins de modules : ils restent lisibles en petit, là où un long lien statique ne le serait pas.',
        ],
      },
    ],
    faqs: [
      { q: 'Quel est le plus petit QR code qui fonctionne ?', a: 'Environ 2 × 2 cm pour un scan de près, si le code contient peu de données et est imprimé net.' },
      { q: 'Un logo change-t-il la taille minimale ?', a: 'Un logo masque des modules ; gardez-le sous un quart du code et montez la correction d’erreur à Q ou H.' },
      { q: 'Quelle résolution pour un PNG ?', a: 'Pour l’impression, préférez le vectoriel. Si vous devez utiliser un PNG, exportez au moins 1000 px pour les petits formats, davantage pour les grands.' },
    ],
  },
  'qr-code-design-best-practices': {
    title: 'Bonnes pratiques de design de QR code – Couleurs, logos et cadres',
    description: 'Concevez des QR codes beaux et lisibles : règles de contraste, taille du logo, couleurs et dégradés, cadres et appels à l’action, et comment tester avant d’imprimer.',
    h1: 'Bonnes pratiques de design de QR code',
    name: 'Bonnes pratiques de design',
    intro: 'Un QR code aux couleurs de votre marque est plus scanné qu’un code basique — tant que les téléphones peuvent le lire. Ces règles gardent votre design du bon côté de la ligne.',
    sections: [
      {
        heading: 'Le contraste d’abord',
        body: [
          'Les lecteurs ont besoin d’un motif foncé sur fond clair. Visez un rapport de contraste d’au moins 4:1 et évitez les codes inversés (clair sur foncé) sauf si vous les avez testés sur de nombreux téléphones.',
        ],
      },
      {
        heading: 'Logos : petits et centrés',
        body: [
          'Un logo masque une partie du code. La correction d’erreur QR reconstruit la partie manquante, mais jusqu’à un certain point : gardez le logo sous 25 % du code et utilisez le niveau de correction Q ou H.',
        ],
      },
      {
        heading: 'Couleurs et dégradés',
        body: [
          'Les couleurs de marque conviennent si elles sont assez foncées. Les dégradés fonctionnent quand les deux extrémités sont foncées. Les motifs pastel, jaunes et gris clair échouent le plus souvent.',
        ],
      },
      {
        heading: 'Ajoutez un cadre et un appel à l’action',
        body: [
          'Dites pourquoi scanner : « Scannez pour le menu », « -10 % sur votre commande », « Rejoignez notre Wi-Fi ». Un code avec un appel à l’action clair est bien plus scanné qu’un code nu.',
        ],
      },
      {
        heading: 'Testez avant d’imprimer',
        body: [
          'Utilisez le contrôle de lisibilité, puis scannez une épreuve imprimée avec un iPhone et un Android, à la taille et à la distance réelles.',
        ],
      },
    ],
    faqs: [
      { q: 'Un QR code peut-il être de n’importe quelle couleur ?', a: 'Oui, tant que le motif est nettement plus foncé que le fond.' },
      { q: 'Les motifs arrondis ou à points se scannent-ils ?', a: 'Oui, les téléphones récents les lisent bien ; gardez les carrés d’angle bien définis.' },
      { q: 'Qu’est-ce que le score de lisibilité ?', a: 'Un contrôle de l’éditeur qui signale un contraste faible, un logo trop grand et d’autres risques avant le téléchargement.' },
    ],
  },
};
