// echo "at g (.next/server/chunks/9073.js:1:6362) " | npx ts-node tools/sourcemap.ts  9073.js

import { promises as fs } from 'fs';
import { SourceMapConsumer } from 'source-map';

/**
 * Reads the entire content from the standard input stream.
 * @returns A promise that resolves with the stdin content as a string.
 */
async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
      let chunk;
      while ((chunk = process.stdin.read()) !== null) {
        data += chunk;
      }
    });
    process.stdin.on('end', () => {
      resolve(data);
    });
    process.stdin.on('error', reject);
  });
}

/**
 * Extracts the Base64-encoded source map from a JS file's content.
 * @param fileContent The content of the compiled JavaScript file.
 * @returns The raw JSON string of the source map.
 */
function extractSourceMap(fileContent: string): string {
  const regex = /\/\/# sourceMappingURL=data:application\/json(?:;charset=utf-8)?;base64,([A-Za-z0-9+/=]+)/;
  const match = fileContent.match(regex);

  if (!match || !match[1]) {
    throw new Error('Inline source map not found or is malformed in the JS file.');
  }

  const base64Data = match[1];
  const jsonString = Buffer.from(base64Data, 'base64').toString('utf8');
  return jsonString;
}

async function main() {
  // 1. Get the JS file path from the first command-line argument.
  const compiledJsFile = process.argv[2];
  if (!compiledJsFile) {
    console.error('Error: Please provide the path to the compiled JS file as an argument.');
    console.error('Usage: cat stacktrace.log | npx ts-node decode.ts <path-to-js-file>');
    process.exit(1);
  }

  try {
    // 2. Read the stack trace from stdin.
    const minifiedStackTrace = await readStdin();
    const compiledJsContent = await fs.readFile(compiledJsFile, 'utf8');

    // Find and decode the inline source map from the file's content.
    const rawSourceMapJson = extractSourceMap(compiledJsContent);
    const consumer = await new SourceMapConsumer(rawSourceMapJson);

    console.log('--- Minified Stack Trace ---');
    console.log(minifiedStackTrace.trim());
    console.log('\n--- Decoded Stack Trace ---');

    const stackLineRegex = /:(\d+):(\d+)/;

    for (const line of minifiedStackTrace.trim().split('\n')) {
      const match = line.match(stackLineRegex);

      if (match) {
        const [, lineStr, colStr] = match;
        const originalPosition = consumer.originalPositionFor({
          line: parseInt(lineStr, 10),
          column: parseInt(colStr, 10),
        });

        const { source, line: origLine, column: origCol, name } = originalPosition;
        const functionName = name ? ` (as ${name})` : '';
        const decodedLine = ` -> at ${source}:${origLine}:${origCol}${functionName}`;

        console.log(line);
        console.log(decodedLine);
      } else {
        console.log(line);
      }
    }

    consumer.destroy();
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

main();
