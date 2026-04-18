import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'public', 'assets', 'hero.jpg');
const buffer = Buffer.alloc(10);
const fd = fs.openSync(filePath, 'r');
fs.readSync(fd, buffer, 0, 10, 0);
fs.closeSync(fd);

console.log('First 10 bytes (hex):', buffer.toString('hex'));
