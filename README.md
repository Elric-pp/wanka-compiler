# wanka-compiler

AI 玩卡编译器：将「图片 + 文案意图」**编译**成可直接使用的卡片配置，并将图片上传到腾讯云 COS。

- 使用 **OpenAI** 生成卡片文案和（可选）集换式卡牌字段
- 使用 **node-vibrant** 分析图片主色，生成配色方案
- 使用 **腾讯云 COS** 存储图片资源
- 输出统一的 **CardConfig JSON**，方便前端 / 小程序 / 活动后台直接消费

适配 **Node.js 18+（包含 22）**。

---

## 快速开始（Quick Start）

**1. 安装依赖**

```bash
npm install
```

**2. 配置环境变量**（根目录新建 `.env`）：

```env
# 腾讯云 COS
COS_SECRET_ID=xxx
COS_SECRET_KEY=xxx
COS_BUCKET=your-bucket-name
COS_REGION=ap-guangzhou

# OpenAI / 兼容服务
OPENAI_API_KEY=sk-xxx
OPENAI_BASE_URL=https://api.openai.com/v1   # 或自建网关地址
OPENAI_MODEL=gpt-4.1-mini                   # 或你的模型名称
```

环境变量一览：

| 变量名           | 必填 | 说明                                   |
| ---------------- | ---- | -------------------------------------- |
| `COS_SECRET_ID`  | 是   | 腾讯云访问密钥 SecretId                |
| `COS_SECRET_KEY` | 是   | 腾讯云访问密钥 SecretKey               |
| `COS_BUCKET`     | 是   | COS Bucket 名称                        |
| `COS_REGION`     | 是   | COS 区域，例如 `ap-guangzhou`         |
| `OPENAI_API_KEY` | 是   | OpenAI 或兼容接口的 API Key           |
| `OPENAI_BASE_URL`| 否   | OpenAI 兼容接口地址，默认官方地址     |
| `OPENAI_MODEL`   | 否   | 模型名称，默认 `gpt-4.1-mini`         |

**3. 运行一个最简单的编译示例**

```bash
node src/cli.js compile ./example/card.png --intent "生日祝福卡"
```

终端将输出一份 `CardConfig` JSON，其中包含：

- COS 上的图片 URL
- 自动分析的主色 / 副色 / 文字色
- AI 生成的标题 / 副标题 / 正文

---

## 核心概念：CardConfig

`wanka-compiler` 将输入（图片 + 意图）编译为一个统一的 `CardConfig`：

```ts
interface CardConfig {
  id: string;
  image: {
    url: string;    // 上传到 COS 后的访问 URL
    key: string;    // COS 对象键名
  };
  colors: {
    primary: string;   // 主色（hex）
    secondary: string; // 副色（hex）
    text: string;      // 文字颜色（hex）
  };
  text: {
    title: string;
    subtitle?: string;
    body: string;
  };
  layout: {
    width: number;
    height: number;
    padding: number;
    align: 'left' | 'center' | 'right';
  };
  meta: {
    intent: string;
    createdAt: string;
    template: string; // 使用的模板，例如 'default' | 'tcg-basic'
    // 以下字段主要用于集换式卡牌（TCG）风格
    name?: string;
    type?: string;      // 卡牌类型，例如 "火属性怪兽"、"魔法师" 等
    rarity?: string;    // 稀有度: N / R / SR / SSR / UR
    attack?: number;    // 攻击力
    defense?: number;   // 防御力
    effect?: string;    // 效果描述
    flavorText?: string;// 风味文本/背景故事
  };
}
```

---

## 命令行使用

### 普通卡片模式（default 模板）

最简单的方式是通过 CLI 调用编译器：

```bash
node src/cli.js compile ./example/card.png --intent "生日祝福卡"
```

输出包含：

- 自动分析图片主色 / 副色 + 推荐文字颜色
- 调用 OpenAI 生成标题 / 副标题 / 正文文案
- 上传图片到腾讯云 COS，得到图片 URL
- 最终在 stdout 输出 `CardConfig` JSON

### 集换式卡牌（TCG 风格）示例

```bash
node src/cli.js compile ./example/monster.png \
  --intent "火属性龙系怪兽，擅长范围攻击" \
  --template tcg-basic
```

输出的 `CardConfig.meta` 中会包含：

- `name`: 卡名
- `type`: 卡牌类型（如 "火属性怪兽"）
- `rarity`: 稀有度（N/R/SR/SSR/UR）
- `attack` / `defense`: 攻击力 / 防御力
- `effect`: 卡牌效果描述
- `flavorText`: 一两句背景故事/风味文本

---

## 作为库使用

你也可以在自己的 Node.js 代码中直接调用：

```js
import { compileCard } from './src/compileCard.js';

const config = await compileCard({
  imagePath: './example/card.png',
  intent: '火属性龙系怪兽',
  template: 'tcg-basic'
});

console.log(config.image.url);   // COS 上的图片地址
console.log(config.text.title);  // AI 生成的标题
console.log(config.meta.attack); // 攻击力
console.log(config.meta.effect); // 卡牌效果
```

---

## 文件结构

- `src/upload.js`：封装腾讯云 COS 上传逻辑
- `src/openaiClient.js`：封装 OpenAI 客户端和文案生成
- `src/compileCard.js`：核心编译逻辑（图片 -> 颜色 + 文案 + COS URL -> CardConfig）
- `src/cli.js`：命令行入口
- `package.json`：项目配置（name: `wanka-compiler`）

---

## 后续可以扩展的方向

- 支持更多卡片模板（社交分享图、海报、Banner 等）
- 批量编译：读取文件夹 / 配置文件，一次性生成多张卡片
- 插件化后端：支持更多存储、更多模型服务
- 集成到 Web / 小程序前端，实时预览卡片效果
