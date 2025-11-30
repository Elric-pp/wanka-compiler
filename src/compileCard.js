import Vibrant from 'node-vibrant';
import path from 'node:path';
import { uploadToCos } from './upload.js';
import { generateCardText } from './openaiClient.js';

/**
 * 从图片提取主色等信息
 * @param {string} imagePath
 */
async function extractColors(imagePath) {
  const palette = await Vibrant.from(imagePath).getPalette();
  const vibrant = palette.Vibrant || palette.Muted || palette.DarkVibrant;
  const secondary = palette.LightVibrant || palette.LightMuted || palette.DarkMuted;

  const primaryRgb = vibrant?.getRgb?.() || [0, 0, 0];
  const secondaryRgb = secondary?.getRgb?.() || [255, 255, 255];

  const toHex = (rgb) => {
    const [r, g, b] = rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))));
    return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
  };

  const primary = toHex(primaryRgb);
  const secondaryHex = toHex(secondaryRgb);

  // 简单判断文字颜色：如果背景偏亮，用深色字，反之用白字
  const luminance = (primaryRgb[0] * 0.299 + primaryRgb[1] * 0.587 + primaryRgb[2] * 0.114) / 255;
  const textColor = luminance > 0.6 ? '#111111' : '#ffffff';

  return {
    primary,
    secondary: secondaryHex,
    text: textColor
  };
}

/**
 * 针对集换式卡牌模板的简单数值/稀有度规则
 * 仅在 template === 'tcg-basic' 时生效
 */
function normalizeTcgStats(raw) {
  const clamp = (v, min, max) => {
    if (typeof v !== 'number' || Number.isNaN(v)) return min;
    return Math.max(min, Math.min(max, v));
  };

  const attack = clamp(raw.attack, 0, 4000);
  const defense = clamp(raw.defense, 0, 4000);

  const allowedRarity = ['N', 'R', 'SR', 'SSR', 'UR'];
  let rarity = (raw.rarity || 'N').toUpperCase();

  if (!allowedRarity.includes(rarity)) {
    const power = Math.max(attack, defense);
    if (power < 800) rarity = 'N';
    else if (power < 1600) rarity = 'R';
    else if (power < 2500) rarity = 'SR';
    else if (power < 3200) rarity = 'SSR';
    else rarity = 'UR';
  }

  return { attack, defense, rarity };
}

/**
 * CardConfig Schema（示例）：
 * {
 *   id: string,
 *   image: { url: string, key: string },
 *   colors: { primary: string, secondary: string, text: string },
 *   text: { title: string, subtitle?: string, body: string },
 *   layout: { width: number, height: number, padding: number, align: 'left'|'center'|'right' },
 *   meta: {
 *     intent: string,
 *     createdAt: string,
 *     template: string,
 *     // 以下字段适用于集换式卡牌（TCG）风格
 *     name?: string,
 *     type?: string,
 *     rarity?: string,
 *     attack?: number,
 *     defense?: number,
 *     effect?: string,
 *     flavorText?: string
 *   }
 * }
 */

/**
 * 编译一张卡片：图片 + 意图 -> CardConfig
 * @param {Object} options
 * @param {string} options.imagePath 本地图片路径
 * @param {string} [options.intent] 卡片用途 / 主题描述
 * @param {Object} [options.layout] 自定义布局配置
 * @param {string} [options.template] 模板类型，例如 'default' | 'tcg-basic'
 * @returns {Promise<Object>} CardConfig
 */
export async function compileCard({ imagePath, intent, layout, template = 'default' }) {
  if (!imagePath) throw new Error('compileCard: imagePath is required');

  const defaultLayout = {
    width: 1080,
    height: 1920,
    padding: 64,
    align: 'center'
  };

  // 不同模板可以有不同的默认尺寸/排版，这里先给一个 TCG 风格示例
  if (template === 'tcg-basic') {
    defaultLayout.width = 744;   // 接近常见卡牌竖版比例
    defaultLayout.height = 1039;
    defaultLayout.padding = 48;
    defaultLayout.align = 'center';
  }

  const finalLayout = { ...defaultLayout, ...(layout || {}) };

  const colors = await extractColors(imagePath);

  const ext = path.extname(imagePath) || '.png';
  const key = `cards/${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
  const uploadResult = await uploadToCos({ filePath: imagePath, key });

  const text = await generateCardText({ intent, colors, template });

  let tcgStats = {
    attack: text.attack,
    defense: text.defense,
    rarity: text.rarity
  };

  if (template === 'tcg-basic') {
    tcgStats = normalizeTcgStats(text);
  }

  const cardConfig = {
    id: key,
    image: {
      url: uploadResult.url,
      key
    },
    colors,
    text,
    layout: finalLayout,
    meta: {
      intent: intent || '',
      createdAt: new Date().toISOString(),
      template,
      name: text.name,
      type: text.type,
      rarity: tcgStats.rarity,
      attack: tcgStats.attack,
      defense: tcgStats.defense,
      effect: text.effect,
      flavorText: text.flavorText
    }
  };

  return cardConfig;
}
