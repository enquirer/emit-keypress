import { exec } from 'child_process';
import { emitKeypress } from '../index';

//
// Example of pasting text without using "paste" mode
//

// let start = Date.now();
const escapeText = (text: string) => text.replace(/([ \n\t\f\r'$%])/g, '\\$1');
const unescapeText = (text: string) => text.replace(/\\([ \n\t\f\r'$%])/g, '$1');

const clipboardCopy = (text: string) => {
  exec(`echo '${escapeText(text)}' | pbcopy`);
};

emitKeypress({
  bufferTimeout: 50,
  onKeypress: async (input, key, close) => {
    // console.log({ input, key, duration: Date.now() - start });
    // start = Date.now();

    if (key.pasted) {
      clipboardCopy(input);
      // console.log(input);
      // console.log('copied to clipboard');
      const files = unescapeText(input).split(/(?<!\\)\s+/).filter(Boolean);
      console.log(files);
      console.log('dropped', files.length, 'files');
    }

    if (input === '\x03' || input === '\r') {
      close();
    }
  }
});
