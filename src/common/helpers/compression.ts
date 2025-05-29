import zlib from 'node:zlib';

import { promisify } from 'node:util';

export const brotliCompressAsync = promisify(zlib.brotliCompress);
export const brotliDecompressAsync = promisify(zlib.brotliDecompress);
