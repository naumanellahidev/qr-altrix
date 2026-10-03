declare module 'svg-to-pdfkit' {
  import type PDFDocument from 'pdfkit';

  interface SVGtoPDFOptions {
    width?: number;
    height?: number;
    preserveAspectRatio?: string;
    useCSS?: boolean;
    fontCallback?: (family: string, bold: boolean, italic: boolean) => string;
    assumePt?: boolean;
    [key: string]: unknown;
  }

  function SVGtoPDF(
    doc: PDFDocument,
    svg: string,
    x?: number,
    y?: number,
    options?: SVGtoPDFOptions,
  ): void;

  export = SVGtoPDF;
}
