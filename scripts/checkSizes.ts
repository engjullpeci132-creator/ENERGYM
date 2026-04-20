import fs from 'fs';
const dir = 'src/assets/images';
fs.readdirSync(dir).forEach(f => console.log(f, fs.statSync(dir+'/'+f).size));
