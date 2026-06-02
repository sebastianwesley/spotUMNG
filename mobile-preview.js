import { spawn } from 'child_process';
import os from 'os';
import qrcode from 'qrcode-terminal';

// Find local IP address
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      const family = typeof net.family === 'string' ? net.family : `IPv${net.family}`;
      if (family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
}

const localIp = getLocalIp();
const PORT = 8080; // Matches vite.config.ts

// 1. Start Vite dev server
const viteProcess = spawn('npx', ['vite'], {
  shell: true
});

viteProcess.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output);
});

viteProcess.stderr.on('data', (data) => {
  process.stderr.write(data.toString());
});

// 2. Start Localtunnel for public link
const ltProcess = spawn('npx', ['-y', 'localtunnel', '--port', PORT.toString()], {
  shell: true
});

let ltUrl = '';
ltProcess.stdout.on('data', (data) => {
  const output = data.toString();
  // Localtunnel output format: "your url is: https://xxxx.loca.lt"
  const match = output.match(/your url is:\s+(https:\/\/[^\s]+)/i);
  if (match) {
    ltUrl = match[1].trim();
    printLinks();
  }
});

ltProcess.stderr.on('data', (data) => {
  // Silence or print error
});

function printLinks() {
  console.log('\n======================================================');
  console.log('📱 MOBILE PREVIEW LINKS GENERATED SUCCESSFULLY!');
  console.log('======================================================\n');

  if (localIp) {
    const localUrl = `http://${localIp}:${PORT}`;
    console.log(`1. LOCAL WI-FI LINK (Fastest & Secure):`);
    console.log(`   👉 ${localUrl}`);
    console.log('   (Scan the QR code below; must be on the same Wi-Fi network)\n');
    qrcode.generate(localUrl, { small: true });
    console.log('------------------------------------------------------\n');
  }

  if (ltUrl) {
    console.log(`2. PUBLIC INTERNET LINK (Works anywhere, e.g., Mobile Data):`);
    console.log(`   👉 ${ltUrl}`);
    console.log('   (Scan the QR code below; works over any internet connection)\n');
    qrcode.generate(ltUrl, { small: true });
    console.log('======================================================\n');
  }
  
  console.log('Press Ctrl+C to stop the preview server and tunnel.\n');
}

// Clean up child processes on exit
process.on('SIGINT', () => {
  viteProcess.kill();
  ltProcess.kill();
  process.exit();
});

process.on('exit', () => {
  viteProcess.kill();
  ltProcess.kill();
});
