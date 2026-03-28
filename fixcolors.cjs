const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = [...walk('app'), ...walk('components')];
let changedFiles = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const og = content;
  
  content = content.replace(/text-indigo-[4567]00/g, 'text-brand-primary')
                   .replace(/bg-indigo-[56]00/g, 'bg-brand-primary')
                   .replace(/bg-indigo-700/g, 'bg-brand-primary-light')
                   .replace(/border-indigo-[4567]00/g, 'border-brand-primary')
                   .replace(/ring-indigo-[4567]00/g, 'ring-brand-primary')
                   .replace(/focus:ring-indigo-[4567]00/g, 'focus:ring-brand-primary')
                   .replace(/focus:border-indigo-[4567]00/g, 'focus:border-brand-primary')
                   .replace(/hover:bg-indigo-[567]00/g, 'hover:bg-brand-primary/90')
                   .replace(/hover:text-indigo-[567]00/g, 'hover:text-brand-primary')
                   .replace(/hover:border-indigo-[567]00/g, 'hover:border-brand-primary')
                   .replace(/accent-indigo-[567]00/g, 'accent-brand-primary')
                   .replace(/text-blue-[4567]00/g, 'text-brand-primary')
                   .replace(/bg-blue-[567]00/g, 'bg-brand-primary')
                   .replace(/border-blue-[4567]00/g, 'border-brand-primary')
                   .replace(/hover:bg-blue-[567]00/g, 'hover:bg-brand-primary/90')
                   .replace(/hover:text-blue-[567]00/g, 'hover:text-brand-primary')
                   .replace(/bg-indigo-50/g, 'bg-brand-primary/5')
                   .replace(/bg-indigo-100/g, 'bg-brand-primary/10')
                   .replace(/dark:text-indigo-[34]00/g, 'dark:text-brand-primary')
                   .replace(/dark:bg-indigo-[89]00/g, 'dark:bg-brand-primary/10')
                   .replace(/dark:bg-indigo-[89]50/g, 'dark:bg-brand-primary/10')
                   .replace(/dark:border-indigo-[456]00/g, 'dark:border-brand-primary/30')
                   .replace(/dark:hover:bg-indigo-[89]00/g, 'dark:hover:bg-brand-primary/20')
                   .replace(/dark:hover:bg-indigo-[89]50/g, 'dark:hover:bg-brand-primary/20')
                   .replace(/fill-indigo-[4567]00/g, 'fill-brand-primary');

  if (content !== og) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
  }
}
console.log('Updated ' + changedFiles + ' files with brand colors.');
