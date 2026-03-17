import { readFileSync } from 'fs';

const content = readFileSync('./lib/questions.ts', 'utf8');

const matches = content.match(/options:\s*\[([^\]]+)\]/g);

if (matches) {
  matches.forEach(m => {
    const opts = m.replace('options:', '').trim().slice(1, -1).split(',').map(s => s.trim().replace(/^"|"$/g, ''));
    opts.forEach(opt => {
      if (opt.length > 24) {
        console.log(`TOO LONG (${opt.length} chars): "${opt}"`);
      }
    });
  });
}
