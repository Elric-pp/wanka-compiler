"use client";

import { useState } from 'react';
import { CardPreview } from '../components/card-preview';
import { Edit3, Sparkles } from 'lucide-react';

const defaultConfig = {
  id: 'demo-card',
  image: {
    url: 'https://via.placeholder.com/400x560.png?text=WANKA',
    key: 'demo/card.png'
  },
  colors: {
    primary: '#0f172a',
    secondary: '#38bdf8',
    text: '#f9fafb'
  },
  text: {
    title: '火纹之心',
    subtitle: '炎系试作卡',
    body: '由 wanka-compiler 自动生成的演示卡片，你可以在右侧实时编辑。'
  },
  layout: {
    width: 744,
    height: 1039,
    padding: 48,
    align: 'center'
  },
  meta: {
    intent: '演示用 TCG 卡片',
    createdAt: new Date().toISOString(),
    template: 'tcg-basic',
    name: '火纹之心',
    type: '火属性怪兽',
    rarity: 'SR',
    attack: 1900,
    defense: 1200,
    effect: '对对手造成额外火焰伤害。',
    flavorText: '据说在无尽烈焰中锻造而成。'
  }
};

export default function HomePage() {
  const [configText, setConfigText] = useState(JSON.stringify(defaultConfig, null, 2));
  const [parsedConfig, setParsedConfig] = useState<any>(defaultConfig);
  const [error, setError] = useState<string | null>(null);

  function handleTextChange(value: string) {
    setConfigText(value);
    try {
      const parsed = JSON.parse(value);
      setParsedConfig(parsed);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'JSON 解析失败');
    }
  }

  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sky-400" />
            <div>
              <h1 className="text-sm font-semibold tracking-wide text-slate-50">
                wanka-compiler Editor
              </h1>
              <p className="text-xs text-slate-400">
                AI 玩卡编译器 · CardConfig 可视化编辑器
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-4 md:flex-row">
        <section className="flex w-full flex-1 flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
            <Edit3 className="h-4 w-4" />
            <span>编辑 CardConfig JSON</span>
          </div>
          <div className="relative h-[420px] w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-900/60">
            <textarea
              className="h-full w-full resize-none bg-transparent p-3 font-mono text-xs text-slate-100 outline-none"
              spellCheck={false}
              value={configText}
              onChange={(e) => handleTextChange(e.target.value)}
            />
            {error && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-red-950/80 px-3 py-1 text-[11px] text-red-200">
                JSON 解析错误：{error}
              </div>
            )}
          </div>
        </section>

        <section className="flex w-full flex-1 flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-300">
            <span>卡片预览</span>
          </div>
          <div className="flex flex-1 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 p-4">
            <CardPreview config={parsedConfig} />
          </div>
        </section>
      </div>
    </main>
  );
}
