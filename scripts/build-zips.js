// scripts/build-zips.js - Zero-dependency ZIP builder using Node.js built-in zlib
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT_DIR = path.resolve(__dirname, '..');
const PROJECTS_JSON = path.join(ROOT_DIR, 'data', 'projects.json');
const ZIPS_DIR = path.join(ROOT_DIR, 'zips');

// Pure JS CRC32 calculation
const CRC_TABLE = new Int32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC_TABLE[i] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

// Create a valid standard PKZip archive from a list of files
function createZip(files) {
  const localHeaders = [];
  const centralHeaders = [];
  let offset = 0;

  for (const f of files) {
    const nameBuf = Buffer.from(f.name, 'utf8');
    const dataBuf = Buffer.isBuffer(f.data) ? f.data : Buffer.from(f.data, 'utf8');
    const crc = crc32(dataBuf);
    const compressed = zlib.deflateRawSync(dataBuf);

    // Local file header (30 bytes + name)
    const lh = Buffer.alloc(30 + nameBuf.length);
    lh.writeUInt32LE(0x04034b50, 0); // signature
    lh.writeUInt16LE(20, 4);         // version needed
    lh.writeUInt16LE(0, 6);          // flags
    lh.writeUInt16LE(8, 8);          // compression method: Deflate
    lh.writeUInt16LE(0, 10);         // time
    lh.writeUInt16LE(0, 12);         // date
    lh.writeUInt32LE(crc, 14);       // crc32
    lh.writeUInt32LE(compressed.length, 18); // compressed size
    lh.writeUInt32LE(dataBuf.length, 22);    // uncompressed size
    lh.writeUInt16LE(nameBuf.length, 26);    // name length
    lh.writeUInt16LE(0, 28);                 // extra len
    nameBuf.copy(lh, 30);

    localHeaders.push(lh);
    localHeaders.push(compressed);

    // Central directory header (46 bytes + name)
    const ch = Buffer.alloc(46 + nameBuf.length);
    ch.writeUInt32LE(0x02014b50, 0); // signature
    ch.writeUInt16LE(20, 4);         // version made by
    ch.writeUInt16LE(20, 6);         // version needed
    ch.writeUInt16LE(0, 8);          // flags
    ch.writeUInt16LE(8, 10);         // compression: Deflate
    ch.writeUInt16LE(0, 12);         // time
    ch.writeUInt16LE(0, 14);         // date
    ch.writeUInt32LE(crc, 16);       // crc32
    ch.writeUInt32LE(compressed.length, 20); // compressed size
    ch.writeUInt32LE(dataBuf.length, 24);    // uncompressed size
    ch.writeUInt16LE(nameBuf.length, 28);    // name len
    ch.writeUInt16LE(0, 30);                 // extra len
    ch.writeUInt16LE(0, 32);                 // comment len
    ch.writeUInt16LE(0, 34);                 // disk start
    ch.writeUInt16LE(0, 36);                 // internal attr
    ch.writeUInt32LE(0, 38);                 // external attr
    ch.writeUInt32LE(offset, 42);            // local header offset
    nameBuf.copy(ch, 46);

    centralHeaders.push(ch);
    offset += lh.length + compressed.length;
  }

  const centralDirOffset = offset;
  let centralDirSize = 0;
  for (const ch of centralHeaders) centralDirSize += ch.length;

  // End of central directory record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // signature
  eocd.writeUInt16LE(0, 4);          // disk num
  eocd.writeUInt16LE(0, 6);          // start disk
  eocd.writeUInt16LE(files.length, 8); // total entries on disk
  eocd.writeUInt16LE(files.length, 10); // total entries
  eocd.writeUInt32LE(centralDirSize, 12); // cd size
  eocd.writeUInt32LE(centralDirOffset, 16); // cd offset
  eocd.writeUInt16LE(0, 20);          // comment len

  return Buffer.concat([...localHeaders, ...centralHeaders, eocd]);
}

function buildZips() {
  console.log('📦 Barcha loyihalar ZIP arxivlarini yig\'ish boshlandi...');
  if (!fs.existsSync(ZIPS_DIR)) fs.mkdirSync(ZIPS_DIR, { recursive: true });

  const projects = JSON.parse(fs.readFileSync(PROJECTS_JSON, 'utf8'));
  let count = 0;

  for (const p of projects) {
    const projectDir = path.resolve(ROOT_DIR, p.demo ? path.dirname(p.demo) : `06. Loyihalar/${p.id}. ${p.title}`);
    if (!fs.existsSync(projectDir)) continue;

    const filesToInclude = [
      'index.html',
      'style.css',
      'script.js',
      'README.md',
      'LICENSE',
      'package.json'
    ];

    const files = [];
    for (const f of filesToInclude) {
      const fp = path.join(projectDir, f);
      if (fs.existsSync(fp)) {
        files.push({ name: f, data: fs.readFileSync(fp) });
      }
    }

    if (files.length > 0) {
      const zipBuf = createZip(files);
      const zipFileName = `${p.id}-${p.slug}.zip`;
      fs.writeFileSync(path.join(ZIPS_DIR, zipFileName), zipBuf);
      count++;
    }
  }

  console.log(`✅ Jami ${count} ta loyiha ZIP fayllari muvaffaqiyatli 'zips/' papkasiga yozildi!`);
}

buildZips();
