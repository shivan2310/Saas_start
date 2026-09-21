const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('.next')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(process.cwd());

files.forEach(file => {
  const originalContent = fs.readFileSync(file, 'utf8');
  let newContent = originalContent
    .replace(/@\/components\/ui\/Button/g, '@/components/ui/button')
    .replace(/export \* from "\.\/Button"/g, 'export * from "./button"')
    .replace(/import \{ Button \} from "\.\/Button"/g, 'import { Button } from "./button"');
    
  if (originalContent !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated', file);
  }
});
