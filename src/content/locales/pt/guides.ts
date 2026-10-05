import type { GuideCopy, GuideSlug } from '@/content/schema';

export const guides: Record<GuideSlug, GuideCopy> = {
  'how-to-create-a-qr-code': {
    title: 'Como criar um QR Code grátis – Guia passo a passo',
    description: 'Aprenda a criar um QR code em menos de um minuto: escolha o tipo, adicione o conteúdo, crie o design, teste e imprima. Grátis e sem cadastro para códigos estáticos.',
    h1: 'Como criar um QR code',
    name: 'Como criar um QR code',
    intro: 'Criar um QR code leva menos de um minuto. Criar um que sempre funcione, fique bonito e continue funcionando daqui a um ano exige mais algumas decisões. Este guia passa pelas duas coisas.',
    sections: [
      {
        heading: '1. Decida: estático ou dinâmico',
        body: [
          'Um código estático guarda o conteúdo no padrão. Funciona para sempre e offline, mas não pode ser editado nem rastreado. Use para Wi-Fi, cartões de contato e links que nunca vão mudar.',
          'Um código dinâmico guarda um link curto que você controla. Você muda o destino depois de imprimir e vê cada leitura. Use para tudo que for impresso em quantidade ou usado em marketing.',
        ],
      },
      {
        heading: '2. Escolha o tipo',
        body: [
          'Escolha o que deve acontecer na leitura: abrir um site, entrar no Wi-Fi, salvar um contato, mostrar um cardápio, tocar um vídeo. O tipo certo faz as pessoas receberem exatamente o que esperam.',
        ],
      },
      {
        heading: '3. Adicione o conteúdo',
        body: [
          'Digite o link, os dados da rede ou o texto. Seja breve: menos conteúdo significa um padrão mais simples, lido mais rápido. Nos códigos dinâmicos o padrão continua simples seja qual for o destino.',
        ],
      },
      {
        heading: '4. Crie o design',
        body: [
          'Escolha cores, estilo do padrão, formato dos cantos, um logo e uma moldura com chamada para ação como “Leia para ver o cardápio”. Mantenha o código escuro sobre fundo claro, com bom contraste.',
          'Acompanhe a nota de segurança de leitura: ela avisa sobre contraste baixo, logo grande demais e margens faltando antes de você imprimir.',
        ],
      },
      {
        heading: '5. Teste e imprima',
        body: [
          'Leia o código com pelo menos dois celulares, um iPhone e um Android, na distância em que as pessoas vão usar. Baixe SVG ou PDF para impressão, para ficar nítido em qualquer tamanho.',
        ],
      },
    ],
    faqs: [
      { q: 'Criar um QR code é grátis?', a: 'Sim. No QR ALTRIX todos os recursos são grátis, incluindo códigos dinâmicos e análises.' },
      { q: 'Preciso de conta?', a: 'Não para códigos estáticos. Códigos dinâmicos precisam de uma conta grátis para você editar e acompanhar.' },
      { q: 'Qual formato de arquivo devo baixar?', a: 'PNG para telas e documentos; SVG, PDF ou EPS para impressão profissional.' },
    ],
  },
  'static-vs-dynamic-qr-codes': {
    title: 'QR Code estático vs dinâmico – Diferenças e quando usar cada um',
    description: 'QR code estático ou dinâmico? Veja como cada um funciona, qual pode ser editado e rastreado, qual expira e qual escolher para cardápios, embalagens, Wi-Fi e anúncios.',
    h1: 'QR codes estáticos vs dinâmicos',
    name: 'Estático vs dinâmico',
    intro: 'Todo QR code é estático ou dinâmico. A diferença decide se você pode mudá-lo depois de imprimir, se pode contar as leituras e — em muitas plataformas — se ele para de funcionar quando um teste termina.',
    sections: [
      {
        heading: 'Como funciona um QR code estático',
        body: [
          'O conteúdo — um link, uma senha de Wi-Fi, um contato — é codificado direto nos quadrados pretos e brancos. Nada é consultado na leitura, então funciona offline e para sempre.',
          'O outro lado: você não pode mudá-lo e ninguém consegue contar as leituras. Um erro de digitação significa reimprimir.',
        ],
      },
      {
        heading: 'Como funciona um QR code dinâmico',
        body: [
          'O padrão contém um link curto. Na leitura, o servidor do link registra o acesso e redireciona para o destino que você definiu. Mude o destino e todas as cópias impressas acompanham.',
          'Como o link é curto, o padrão continua simples e é lido com facilidade mesmo impresso pequeno.',
        ],
      },
      {
        heading: 'QR codes dinâmicos expiram?',
        body: [
          'Não deveriam, mas em muitos serviços expiram: planos gratuitos costumam limitar você a poucos códigos dinâmicos ou desativá-los depois de um teste, e o código impresso para de funcionar.',
          'No QR ALTRIX, códigos dinâmicos são grátis e ilimitados e funcionam até você pausar ou excluir.',
        ],
      },
      {
        heading: 'Qual você deve usar?',
        body: [
          'Estático: Wi-Fi, contatos vCard, texto simples e links que você tem certeza de que nunca vão mudar.',
          'Dinâmico: cardápios, embalagens, pôsteres, cartões de visita, campanhas — tudo que for impresso em quantidade ou em que você queira medir resultados.',
        ],
      },
    ],
    faqs: [
      { q: 'Posso transformar um código estático em dinâmico?', a: 'Não, o padrão é diferente. Crie um código dinâmico e troque o impresso.' },
      { q: 'Códigos dinâmicos demoram mais para ler?', a: 'O redirecionamento adiciona uma fração de segundo; o padrão mais simples muitas vezes faz a leitura ser mais rápida.' },
      { q: 'Códigos dinâmicos coletam dados pessoais?', a: 'No QR ALTRIX eles registram país, aparelho e dados parecidos, com os endereços IP guardados apenas como hash com salt.' },
    ],
  },
  'qr-code-size-for-print': {
    title: 'Tamanho do QR Code para impressão – Mínimo e distância de leitura',
    description: 'Qual deve ser o tamanho de um QR code? Tamanhos mínimos para cartões, folhetos, pôsteres e placas, a regra 10:1 e dicas de zona de silêncio e resolução.',
    h1: 'Tamanho do QR code para impressão',
    name: 'Guia de tamanho de impressão',
    intro: 'Um QR code pequeno demais é o motivo mais comum de uma tiragem dar errado. O tamanho certo depende da distância de leitura e de quantos dados o código tem.',
    sections: [
      {
        heading: 'A regra 10:1',
        body: [
          'Uma boa regra prática: o código deve ter pelo menos um décimo da distância de leitura. Lido a 30 cm, faça com 3 cm; a 2 metros, com 20 cm.',
        ],
      },
      {
        heading: 'Tamanhos mínimos por material',
        body: [
          'Cartões de visita e etiquetas: pelo menos 2 × 2 cm.',
          'Folhetos, cardápios e displays de mesa: 3–4 cm.',
          'Pôsteres vistos a alguns metros: 10–20 cm.',
          'Faixas e letreiros de fachada: aumente com a distância pela regra 10:1.',
        ],
      },
      {
        heading: 'Respeite a zona de silêncio',
        body: [
          'Deixe uma margem vazia ao redor do código — cerca de quatro módulos (os quadradinhos) de largura. Textos ou imagens encostados no código são causa comum de leituras falhas.',
        ],
      },
      {
        heading: 'Use arquivos vetoriais',
        body: [
          'Baixe SVG, PDF ou EPS para impressão. Arquivos vetoriais ficam perfeitos em qualquer tamanho, enquanto um PNG ampliado pode ficar borrado.',
          'Códigos dinâmicos têm menos módulos, então continuam legíveis em tamanhos pequenos em que um link estático longo não seria.',
        ],
      },
    ],
    faqs: [
      { q: 'Qual o menor QR code que funciona?', a: 'Cerca de 2 × 2 cm para leitura de perto, se o código tiver poucos dados e for impresso com nitidez.' },
      { q: 'Um logo muda o tamanho mínimo?', a: 'Um logo esconde alguns módulos; mantenha-o abaixo de um quarto do código e aumente a correção de erros para Q ou H.' },
      { q: 'Qual resolução o PNG deve ter?', a: 'Para impressão, prefira vetor. Se precisar usar PNG, exporte com pelo menos 1000 px para impressões pequenas e mais para as grandes.' },
    ],
  },
  'qr-code-design-best-practices': {
    title: 'Boas práticas de design de QR Code – Cores, logos e molduras',
    description: 'Crie QR codes bonitos que continuam funcionando: regras de contraste, tamanho do logo, cores e degradês, molduras e chamadas para ação, e como testar antes de imprimir.',
    h1: 'Boas práticas de design de QR code',
    name: 'Boas práticas de design',
    intro: 'Um QR code com a sua marca recebe mais leituras que um comum — desde que os celulares consigam lê-lo. Estas regras mantêm seu design do lado certo dessa linha.',
    sections: [
      {
        heading: 'Contraste em primeiro lugar',
        body: [
          'Leitores precisam de um padrão escuro sobre fundo claro. Busque um contraste de pelo menos 4:1 e evite códigos invertidos (claro no escuro), a menos que tenha testado em muitos celulares.',
        ],
      },
      {
        heading: 'Logos: pequenos e centralizados',
        body: [
          'Um logo cobre parte do código. A correção de erros do QR reconstrói o que falta, mas só até certo ponto: mantenha o logo abaixo de cerca de 25% do código e use correção de erros nível Q ou H.',
        ],
      },
      {
        heading: 'Cores e degradês',
        body: [
          'Cores da marca funcionam bem se forem escuras o bastante. Degradês funcionam quando as duas pontas são escuras. Padrões pastel, amarelos e cinza-claro são os que mais falham.',
        ],
      },
      {
        heading: 'Adicione moldura e chamada para ação',
        body: [
          'Diga por que ler: “Leia para ver o cardápio”, “Ganhe 10% de desconto”, “Entre no nosso Wi-Fi”. Códigos com uma chamada clara são lidos muito mais que códigos sem nada.',
        ],
      },
      {
        heading: 'Teste antes de imprimir',
        body: [
          'Use a verificação de segurança de leitura e depois leia uma prova impressa com um iPhone e um Android no tamanho e na distância reais.',
        ],
      },
    ],
    faqs: [
      { q: 'Um QR code pode ter qualquer cor?', a: 'Sim, desde que o padrão seja claramente mais escuro que o fundo.' },
      { q: 'Padrões arredondados ou de pontos funcionam?', a: 'Sim, celulares modernos leem bem; mantenha os quadrados dos cantos bem definidos.' },
      { q: 'O que é a nota de segurança de leitura?', a: 'Uma verificação do editor que avisa sobre contraste baixo, logos grandes demais e outros riscos antes do download.' },
    ],
  },
};
