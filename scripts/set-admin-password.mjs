#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const envPath = path.resolve(process.cwd(), '.env');

function promptHidden(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const stdin = process.stdin;
    process.stdout.write(query);

    if (stdin.isTTY) {
      stdin.setRawMode(true);
      stdin.resume();
      let input = '';
      const onData = (char) => {
        const c = char.toString('utf8');
        if (c === '\n' || c === '\r' || c === '\u0004') {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener('data', onData);
          process.stdout.write('\n');
          rl.close();
          resolve(input);
        } else if (c === '\u0003') {
          process.exit(1);
        } else if (c === '\u007f' || c === '\b') {
          if (input.length > 0) {
            input = input.slice(0, -1);
            process.stdout.write('\b \b');
          }
        } else {
          input += c;
          process.stdout.write('*');
        }
      };
      stdin.on('data', onData);
    } else {
      rl.question('', (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

async function main() {
  let password = process.argv[2];

  if (!password) {
    password = await promptHidden('Enter new Master Administrator password: ');
    if (!password || password.trim().length < 4) {
      console.error('[!] Password must be at least 4 characters.');
      process.exit(1);
    }
    const confirm = await promptHidden('Confirm new Master Administrator password: ');
    if (password !== confirm) {
      console.error('[!] Passwords do not match.');
      process.exit(1);
    }
  }

  const saltRounds = 10;
  const hash = bcrypt.hashSync(password, saltRounds);

  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Update or insert ADMIN_PASSWORD_HASH
  if (envContent.includes('ADMIN_PASSWORD_HASH=')) {
    envContent = envContent.replace(/ADMIN_PASSWORD_HASH=[^\r\n]*/g, () => `ADMIN_PASSWORD_HASH="${hash}"`);
  } else {
    envContent += `\n# --- Admin Role Elevation Security ---\nADMIN_PASSWORD_HASH="${hash}"\n`;
  }

  // Ensure ADMIN_JWT_SECRET exists
  if (!envContent.includes('ADMIN_JWT_SECRET=')) {
    const randomSecret = crypto.randomBytes(32).toString('hex');
    envContent += `ADMIN_JWT_SECRET="${randomSecret}"\n`;
  }

  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('[✓] Master Administrator password hash generated and saved to .env securely.');
}

main().catch((err) => {
  console.error('[!] Error setting admin password:', err.message);
  process.exit(1);
});
