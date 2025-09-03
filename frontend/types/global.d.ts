declare module 'pdf-parse' {
  interface PDFData {
    text: string;
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
  }
  
  function pdf(buffer: Buffer): Promise<PDFData>;
  export = pdf;
}

declare module 'mammoth' {
  interface ExtractResult {
    value: string;
    messages: any[];
  }
  
  interface MammothOptions {
    buffer?: Buffer;
    path?: string;
  }
  
  export function extractRawText(options: MammothOptions): Promise<ExtractResult>;
}

declare module 'standardwebhooks' {
  export class Webhook {
    constructor(secret: string);
    verify(payload: string, headers: Record<string, string>): void;
  }
}
