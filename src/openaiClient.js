import OpenAI from 'openai';
import 'dotenv/config';

const {
  OPENAI_BASE_URL,
  OPENAI_API_KEY,
  OPENAI_MODEL
} = process.env;

if (!OPENAI_API_KEY) {
  console.warn('[openaiClient] OPENAI_API_KEY is not set');
}

export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  baseURL: OPENAI_BASE_URL || 'https://api.openai.com/v1'
});

/**
 * 生成卡片文案（支持 TCG 风格字段）
 * @param {Object} options
 * @param {string} options.intent 用户意图，比如 "生日祝福卡"、"产品宣传卡"、"火属性怪兽卡" 等
 * @param {Object} options.colors 从图片分析得到的主色信息
 * @param {string} [options.template] 模板类型，例如 'default' | 'tcg-basic'
 * @returns {Promise<Object>} 文案与卡牌字段
 */
export async function generateCardText({ intent, colors, template = 'default' }) {
  const model = OPENAI_MODEL || 'gpt-4.1-mini';

  const colorDesc = colors
    ? `主色: ${colors.primary}, 副色: ${colors.secondary || ''}, 文字色建议: ${colors.text || ''}`
    : '未提供颜色信息';

  const isTcg = template === 'tcg-basic';

  const prompt = [
    isTcg
      ? '你是一名集换式卡牌设计师，正在为一张集换式卡牌设计名字和效果。'
      : '你是一个资深视觉设计师兼文案，正在为一张卡片写文案。',
    `卡片用途 / 设定: ${intent || '通用卡片'}`,
    `颜色信息: ${colorDesc}`,
    isTcg
      ? '请根据设定，设计一张 TCG 怪兽/角色卡，给出：\n' +
        '1. name: 卡牌名称（中文，2~8 个字）\n' +
        '2. type: 卡牌类别，例如 "火属性怪兽"、"魔法师"、"陷阱卡" 等\n' +
        '3. rarity: 稀有度，例如 "N" | "R" | "SR" | "SSR" | "UR"\n' +
        '4. attack: 攻击力（整数，0~5000）\n' +
        '5. defense: 防御力（整数，0~5000）\n' +
        '6. effect: 效果描述，1~3 句，适合印在卡片说明区域\n' +
        '7. flavorText: 风味文本/背景故事，可选，1~2 句\n' +
        '同时再给出通用展示用的 title/subtitle/body，其中：\n' +
        '- title: 可与 name 一致或做轻微加工\n' +
        '- subtitle: 可以为空，也可以是类型 + 稀有度组合\n' +
        '- body: 适合用在宣传图上的一段文案。'
      : '请给出：\n' +
        '1. 简短、有记忆点的标题（不超过 15 个字）\n' +
        '2. 可选的副标题（可以为空）\n' +
        '3. 正文文案（1~3 句，适合放在卡片上）',
    '用 JSON 格式回答，不要包含任何多余说明。示例结构：',
    '{',
    '  "title": "...",',
    '  "subtitle": "...",',
    '  "body": "...",',
    '  "name": "...",',
    '  "type": "...",',
    '  "rarity": "R",',
    '  "attack": 1800,',
    '  "defense": 1200,',
    '  "effect": "...",',
    '  "flavorText": "..."',
    '}'
  ].join('\n');

  const res = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: '你输出的内容必须是合法 JSON 字符串，不要包含多余说明。' },
      { role: 'user', content: prompt }
    ]
  });

  const content = res.choices?.[0]?.message?.content || '{}';
  try {
    const parsed = JSON.parse(content);
    return {
      title: parsed.title || '',
      subtitle: parsed.subtitle || '',
      body: parsed.body || '',
      name: parsed.name || parsed.title || '',
      type: parsed.type || '',
      rarity: parsed.rarity || 'N',
      attack: typeof parsed.attack === 'number' ? parsed.attack : 0,
      defense: typeof parsed.defense === 'number' ? parsed.defense : 0,
      effect: parsed.effect || parsed.body || '',
      flavorText: parsed.flavorText || ''
    };
  } catch (e) {
    return {
      title: intent || 'AI 卡片',
      subtitle: '',
      body: content,
      name: intent || 'AI 卡片',
      type: '',
      rarity: 'N',
      attack: 0,
      defense: 0,
      effect: content,
      flavorText: ''
    };
  }
}
