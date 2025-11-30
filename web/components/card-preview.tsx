import type { CSSProperties } from 'react';

interface CardPreviewProps {
  config: any;
}

export function CardPreview({ config }: CardPreviewProps) {
  if (!config) return null;

  const colors = config.colors || {};
  const meta = config.meta || {};
  const text = config.text || {};

  const cardStyle: CSSProperties = {
    width: 280,
    height: 400,
    borderRadius: 18,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    background: `linear-gradient(145deg, ${colors.primary || '#020617'}, ${colors.secondary || '#1d4ed8'})`,
    color: colors.text || '#f9fafb',
    boxShadow: '0 20px 40px rgba(15,23,42,0.9)'
  };

  return (
    <div style={cardStyle} className="overflow-hidden">
      <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wide text-slate-200/80">
        <span className="font-semibold">{meta.name || text.title || '未命名卡牌'}</span>
        {meta.rarity && (
          <span className="rounded-full bg-slate-900/40 px-2 py-0.5 text-[9px] font-semibold text-amber-300">
            {meta.rarity}
          </span>
        )}
      </div>

      <div className="mb-2 flex-1 overflow-hidden rounded-lg bg-slate-900/40">
        {config.image?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={config.image.url}
            alt={text.title || meta.name || 'card image'}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[11px] text-slate-400">
            无图片，使用 image.url 以展示插画
          </div>
        )}
      </div>

      <div className="space-y-1 text-[11px] leading-snug">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <div className="text-[11px] font-semibold text-slate-50">
              {text.title || meta.name || '未命名卡牌'}
            </div>
            {text.subtitle && (
              <div className="text-[10px] text-slate-300">{text.subtitle}</div>
            )}
          </div>
          {(typeof meta.attack === 'number' || typeof meta.defense === 'number') && (
            <div className="rounded-md bg-slate-900/50 px-2 py-1 text-[9px] font-mono text-slate-200">
              ATK {meta.attack ?? '-'} / DEF {meta.defense ?? '-'}
            </div>
          )}
        </div>

        {meta.type && (
          <div className="text-[10px] text-slate-300">{meta.type}</div>
        )}

        {text.body && (
          <p className="mt-1 line-clamp-3 text-[10px] text-slate-200/90">{text.body}</p>
        )}
      </div>
    </div>
  );
}
