#!/usr/bin/env node

import { compileCard } from './compileCard.js';

function parseArgs(argv) {
  const [, , command, imagePath, ...rest] = argv;
  const options = {};

  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg === '--intent' && rest[i + 1]) {
      options.intent = rest[i + 1];
      i++;
    } else if (arg === '--template' && rest[i + 1]) {
      options.template = rest[i + 1];
      i++;
    }
  }

  return { command, imagePath, options };
}

async function main() {
  const { command, imagePath, options } = parseArgs(process.argv);

  if (!command || command === '--help' || command === '-h') {
    console.log(`wanka-compiler CLI\n\n用法:\n  node src/cli.js compile <imagePath> [--intent "火属性怪兽卡"] [--template tcg-basic]\n\n示例:\n  node src/cli.js compile ./card.png --intent "火属性龙系怪兽" --template tcg-basic\n`);
    process.exit(0);
  }

  if (command !== 'compile') {
    console.error(`未知命令: ${command}`);
    process.exit(1);
  }

  if (!imagePath) {
    console.error('缺少 imagePath 参数');
    process.exit(1);
  }

  try {
    const cardConfig = await compileCard({
      imagePath,
      intent: options.intent,
      template: options.template
    });
    console.log(JSON.stringify(cardConfig, null, 2));
  } catch (err) {
    console.error('编译卡片失败:', err.message || err);
    process.exit(1);
  }
}

main();
