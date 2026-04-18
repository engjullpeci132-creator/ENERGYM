import fs from 'fs';
import path from 'path';

const assetsDir = path.join(process.cwd(), 'public', 'assets');

if (!fs.existsSync(assetsDir)) {
  console.log('Assets directory does not exist');
} else {
  const files = fs.readdirSync(assetsDir);
  console.log(`Found ${files.length} files in assets:`);
  files.forEach(file => {
    const stats = fs.statSync(path.join(assetsDir, file));
    console.log(`${file}: ${stats.size} bytes`);
  });
}
