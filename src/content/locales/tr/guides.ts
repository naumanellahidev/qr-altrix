import type { GuideCopy, GuideSlug } from '@/content/schema';

export const guides: Record<GuideSlug, GuideCopy> = {
  'how-to-create-a-qr-code': {
    title: 'Ücretsiz QR Kod Nasıl Oluşturulur – Adım Adım Rehber',
    description: 'Bir dakikadan kısa sürede QR kod oluşturmayı öğrenin: türü seçin, içeriği ekleyin, tasarlayın, test edin ve basın. Ücretsiz, statik kodlar için kayıt gerekmez.',
    h1: 'QR kod nasıl oluşturulur',
    name: 'QR kod nasıl oluşturulur',
    intro: 'Bir QR kod oluşturmak bir dakikadan kısa sürer. Her zaman okunan, iyi görünen ve bir yıl sonra hâlâ çalışan bir kod yapmak ise birkaç ek karar gerektirir. Bu rehber ikisini de anlatır.',
    sections: [
      {
        heading: '1. Karar verin: statik mi dinamik mi',
        body: [
          'Statik kod, içeriği desenin içinde saklar. Sonsuza dek ve çevrimdışı çalışır, ancak düzenlenemez ya da takip edilemez. Wi-Fi, kişi kartları ve asla değişmeyecek bağlantılar için kullanın.',
          'Dinamik kod, kontrol ettiğiniz kısa bir bağlantıyı saklar. Baskıdan sonra hedefi değiştirebilir ve her taramayı görebilirsiniz. Çok sayıda basılan ya da pazarlamada kullanılan her şey için kullanın.',
        ],
      },
      {
        heading: '2. Türü seçin',
        body: [
          'Tarandığında ne olacağını seçin: bir web sitesi açmak, Wi-Fi’a bağlanmak, kişi kaydetmek, menü göstermek, video oynatmak. Doğru tür, insanların tam olarak bekledikleri şeyi almasını sağlar.',
        ],
      },
      {
        heading: '3. İçeriği ekleyin',
        body: [
          'Bağlantıyı, ağ bilgilerini ya da metni girin. Kısa tutun: daha az içerik, daha hızlı okunan daha sade bir desen demektir. Dinamik kodlarda desen, hedef ne olursa olsun sade kalır.',
        ],
      },
      {
        heading: '4. Tasarlayın',
        body: [
          'Renkleri, desen stilini, köşe şekillerini, logoyu ve “Menü için tarayın” gibi bir harekete geçirici mesaj içeren çerçeveyi seçin. Kodu açık bir zemin üzerinde koyu ve güçlü kontrastlı tutun.',
          'Tarama güvenliği puanına dikkat edin: basmadan önce düşük kontrast, fazla büyük logo ve yetersiz kenar boşluğu konusunda uyarır.',
        ],
      },
      {
        heading: '5. Test edin ve basın',
        body: [
          'Kodu biri iPhone, biri Android olmak üzere en az iki telefonla, insanların kullanacağı mesafeden tarayın. Her boyutta keskin kalması için baskıya SVG ya da PDF indirin.',
        ],
      },
    ],
    faqs: [
      { q: 'QR kod oluşturmak ücretsiz mi?', a: 'Evet. QR ALTRIX’te dinamik kodlar ve analitik dahil her özellik ücretsizdir.' },
      { q: 'Hesap gerekir mi?', a: 'Statik kodlar için gerekmez. Dinamik kodların düzenlenebilmesi ve takip edilebilmesi için ücretsiz bir hesap gerekir.' },
      { q: 'Hangi dosya formatını indirmeliyim?', a: 'Ekranlar ve belgeler için PNG; profesyonel baskı için SVG, PDF ya da EPS.' },
    ],
  },
  'static-vs-dynamic-qr-codes': {
    title: 'Statik ve Dinamik QR Kodlar – Farklar ve Ne Zaman Kullanılır',
    description: 'Statik mi dinamik mi QR kod? Her birinin nasıl çalıştığını, hangisinin düzenlenip takip edilebildiğini, hangisinin süresinin dolduğunu ve menü, ambalaj, Wi-Fi ve reklamlara hangisinin uygun olduğunu öğrenin.',
    h1: 'Statik ve dinamik QR kodlar',
    name: 'Statik ve dinamik',
    intro: 'Her QR kod ya statik ya da dinamiktir. Aradaki fark, baskıdan sonra onu değiştirip değiştiremeyeceğinizi, taramaları sayıp sayamayacağınızı ve — birçok platformda — deneme bittiğinde kodun durup durmayacağını belirler.',
    sections: [
      {
        heading: 'Statik QR kodlar nasıl çalışır',
        body: [
          'İçerik — bağlantı, Wi-Fi şifresi, kişi — doğrudan siyah beyaz karelere kodlanır. Tarandığında hiçbir şey sorgulanmaz, bu yüzden çevrimdışı ve sonsuza dek çalışır.',
          'Dezavantajı: onu değiştiremezsiniz ve kimse taramalarını sayamaz. Bir yazım hatası yeniden baskı demektir.',
        ],
      },
      {
        heading: 'Dinamik QR kodlar nasıl çalışır',
        body: [
          'Desen kısa bir bağlantı içerir. Tarandığında bağlantı sunucusu taramayı kaydeder ve belirlediğiniz hedefe yönlendirir. Hedefi değiştirin, basılı her kopya da değişsin.',
          'Bağlantı kısa olduğu için desen, küçük basılsa bile sade ve kolay okunur kalır.',
        ],
      },
      {
        heading: 'Dinamik QR kodların süresi dolar mı?',
        body: [
          'Dolmamalı, ama birçok hizmette dolar: ücretsiz planlar sizi çoğu zaman birkaç dinamik kodla sınırlar ya da deneme sonrasında devre dışı bırakır ve basılı kodlar çalışmayı bırakır.',
          'QR ALTRIX’te dinamik kodlar ücretsiz ve sınırsızdır; siz duraklatana ya da silene kadar çalışmaya devam eder.',
        ],
      },
      {
        heading: 'Hangisini kullanmalısınız?',
        body: [
          'Statik: Wi-Fi, vCard kişileri, düz metin ve asla değişmeyeceğinden emin olduğunuz bağlantılar.',
          'Dinamik: menüler, ambalajlar, afişler, kartvizitler, kampanyalar — çok sayıda basılan ya da sonuçlarını ölçmek istediğiniz her şey.',
        ],
      },
    ],
    faqs: [
      { q: 'Statik bir kodu dinamiğe dönüştürebilir miyim?', a: 'Hayır, desenler farklıdır. Dinamik bir kod oluşturun ve basılı olanı değiştirin.' },
      { q: 'Dinamik kodlar daha yavaş mı okunur?', a: 'Yönlendirme saniyenin küçük bir kesrini ekler; daha sade desen ise çoğu zaman daha hızlı okunmasını sağlar.' },
      { q: 'Dinamik kodlar kişisel veri topluyor mu?', a: 'QR ALTRIX’te ülke, cihaz ve benzeri bilgileri kaydeder; IP adresleri yalnızca tuzlanmış hash olarak saklanır.' },
    ],
  },
  'qr-code-size-for-print': {
    title: 'Baskı İçin QR Kod Boyutu – Minimum Boyutlar ve Tarama Mesafesi',
    description: 'Bir QR kod ne kadar büyük olmalı? Kartvizit, broşür, afiş ve tabelalar için minimum boyutlar, 10:1 kuralı ve sessiz alan ile çözünürlük ipuçları.',
    h1: 'Baskı için QR kod boyutu',
    name: 'Baskı boyutu rehberi',
    intro: 'Fazla küçük bir QR kod, başarısız baskıların en yaygın nedenidir. Doğru boyut, tarama mesafesine ve kodun içindeki veri miktarına bağlıdır.',
    sections: [
      {
        heading: '10:1 kuralı',
        body: [
          'İyi bir başlangıç noktası: kod, tarama mesafesinin en az onda biri olmalı. 30 cm’den taranıyorsa 3 cm; 2 metreden taranıyorsa 20 cm yapın.',
        ],
      },
      {
        heading: 'Ortama göre minimum boyutlar',
        body: [
          'Kartvizitler ve etiketler: en az 2 × 2 cm.',
          'Broşürler, menüler ve masa kartları: 3–4 cm.',
          'Birkaç metreden görülen afişler: 10–20 cm.',
          'Pankartlar ve bina tabelaları: 10:1 kuralıyla mesafeye göre ayarlayın.',
        ],
      },
      {
        heading: 'Sessiz alanı koruyun',
        body: [
          'Kodun etrafında yaklaşık dört modül (küçük kare) genişliğinde boş alan bırakın. Koda yapışık metin ya da grafikler okuma hatalarının yaygın bir nedenidir.',
        ],
      },
      {
        heading: 'Vektör dosya kullanın',
        body: [
          'Baskı için SVG, PDF ya da EPS indirin. Vektör dosyalar her boyutta kusursuz keskin kalır; büyütülmüş PNG’ler ise bulanıklaşabilir.',
          'Dinamik kodların daha az modülü vardır; bu yüzden uzun statik bağlantıların ulaşamayacağı küçük boyutlarda bile okunur kalırlar.',
        ],
      },
    ],
    faqs: [
      { q: 'Çalışan en küçük QR kod boyutu nedir?', a: 'Veri az ve baskı keskinse, yakın tarama için yaklaşık 2 × 2 cm.' },
      { q: 'Logo minimum boyutu değiştirir mi?', a: 'Logo bazı modülleri kapatır; kodun dörtte birinin altında tutun ve hata düzeltmeyi Q ya da H’ye yükseltin.' },
      { q: 'PNG için hangi çözünürlük gerekir?', a: 'Baskıda vektörü tercih edin. PNG zorunluysa küçük baskılar için en az 1000 px, büyükler için daha fazla dışa aktarın.' },
    ],
  },
  'qr-code-design-best-practices': {
    title: 'QR Kod Tasarımında En İyi Uygulamalar – Renkler, Logolar ve Çerçeveler',
    description: 'Göze çarpan ve yine de okunan QR kodlar tasarlayın: kontrast kuralları, logo boyutu, renkler ve gradyanlar, çerçeveler ve harekete geçirici mesajlar, baskıdan önce nasıl test edilir.',
    h1: 'QR kod tasarımında en iyi uygulamalar',
    name: 'Tasarım için en iyi uygulamalar',
    intro: 'Markalı QR kodlar sade kodlardan daha çok taranır — telefonlar onları okuyabildiği sürece. Bu kurallar tasarımınızı güvenli tarafta tutar.',
    sections: [
      {
        heading: 'Önce kontrast',
        body: [
          'Okuyucular açık bir zemin üzerinde koyu bir desen ister. En az 4:1 kontrast oranını hedefleyin ve çok sayıda telefonda test etmediyseniz ters kodlardan (koyu üzerine açık) kaçının.',
        ],
      },
      {
        heading: 'Logo: küçük ve ortada',
        body: [
          'Logo kodun bir kısmını kapatır. QR hata düzeltmesi eksik kısımları kurtarabilir ama bir sınırı vardır: logoyu kodun yaklaşık %25’inin altında tutun ve Q ya da H düzeltme seviyesini kullanın.',
        ],
      },
      {
        heading: 'Renkler ve gradyanlar',
        body: [
          'Marka renkleri yeterince koyuysa güvenlidir. Gradyanlar her iki ucu da koyuysa uygundur. Pastel, sarı ve açık gri desenler en sık başarısız olanlardır.',
        ],
      },
      {
        heading: 'Çerçeve ve harekete geçirici mesaj ekleyin',
        body: [
          'İnsanlara neden taramaları gerektiğini söyleyin: “Menü için tarayın”, “%10 indirim kazanın”, “Wi-Fi’ımıza bağlanın”. Net bir mesajı olan kodlar, sade kodlardan çok daha fazla taranır.',
        ],
      },
      {
        heading: 'Basmadan önce test edin',
        body: [
          'Tarama güvenliği kontrolünü kullanın, ardından bir test baskısını gerçek boyut ve mesafede iPhone ve Android ile tarayın.',
        ],
      },
    ],
    faqs: [
      { q: 'QR kod herhangi bir renkte olabilir mi?', a: 'Evet, desen zeminden belirgin şekilde daha koyu olduğu sürece.' },
      { q: 'Yuvarlak ya da noktalı desenler okunur mu?', a: 'Evet, modern telefonlar bunları sorunsuz okur; köşe karelerini net tutun.' },
      { q: 'Tarama güvenliği puanı nedir?', a: 'Editördeki, indirmeden önce düşük kontrast, fazla büyük logo ve diğer riskler konusunda uyaran bir kontrol.' },
    ],
  },
};
