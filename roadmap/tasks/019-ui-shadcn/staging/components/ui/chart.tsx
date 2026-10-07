// Wrapper do shadcn/ui sobre o Recharts: cores por config (variáveis CSS), tooltip e legenda no visual do app.
import * as React from 'react';
import * as RechartsPrimitive from 'recharts';
import { cn } from '@/lib/utils';

export type ChartConfig = Record<string, { label?: React.ReactNode; icon?: React.ComponentType; color?: string }>;

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);
function useChart() {
  const ctx = React.useContext(ChartContext);
  if (!ctx) throw new Error('useChart precisa estar dentro de <ChartContainer />');
  return ctx;
}

function ChartContainer({ id, className, children, config, ...props }: React.ComponentProps<'div'> & {
  config: ChartConfig; children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children'];
}) {
  const uid = React.useId();
  const chartId = `chart-${id || uid.replace(/:/g, '')}`;
  return (
    <ChartContext.Provider value={{ config }}>
      <div data-slot="chart" data-chart={chartId}
        className={cn("[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-surface]:outline-hidden", className)}
        {...props}>
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const vars = Object.entries(config).filter(([, c]) => c.color).map(([k, c]) => `  --color-${k}: ${c.color};`).join('\n');
  if (!vars) return null;
  return <style dangerouslySetInnerHTML={{ __html: `[data-chart=${id}] {\n${vars}\n}` }} />;
}

const ChartTooltip = RechartsPrimitive.Tooltip;

type TooltipItem = { name?: string | number; value?: number | string; dataKey?: string | number; color?: string; payload?: Record<string, unknown> };
function ChartTooltipContent({ active, payload, label, className, hideLabel = false, labelFormatter, valueFormatter, indicator = 'dot' }: {
  active?: boolean; payload?: TooltipItem[]; label?: React.ReactNode; className?: string; hideLabel?: boolean;
  labelFormatter?: (label: React.ReactNode, payload: TooltipItem[]) => React.ReactNode;
  valueFormatter?: (value: number | string, name: string) => React.ReactNode;
  indicator?: 'dot' | 'line';
}) {
  const { config } = useChart();
  if (!active || !payload?.length) return null;
  return (
    <div className={cn('border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl', className)}>
      {!hideLabel && <div className="font-medium">{labelFormatter ? labelFormatter(label, payload) : label}</div>}
      <div className="grid gap-1.5">
        {payload.map((item, i) => {
          const key = String(item.dataKey ?? item.name ?? i);
          const conf = config[key];
          const color = item.color ?? `var(--color-${key})`;
          return (
            <div key={key} className="flex w-full items-center gap-2">
              <div className={cn('shrink-0 rounded-[2px]', indicator === 'dot' ? 'size-2.5' : 'h-2.5 w-1')} style={{ background: color }} />
              <span className="text-muted-foreground">{conf?.label ?? item.name}</span>
              <span className="text-foreground ml-auto font-mono font-medium tabular-nums">
                {item.value != null ? (valueFormatter ? valueFormatter(item.value, key) : typeof item.value === 'number' ? item.value.toLocaleString('pt-BR') : item.value) : '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ChartLegend = RechartsPrimitive.Legend;
function ChartLegendContent({ payload, className }: { payload?: { value?: string; dataKey?: string | number; color?: string }[]; className?: string }) {
  const { config } = useChart();
  if (!payload?.length) return null;
  return (
    <div className={cn('flex items-center justify-center gap-4 pt-3', className)}>
      {payload.map((item) => {
        const key = String(item.dataKey ?? item.value);
        return (
          <div key={key} className="flex items-center gap-1.5">
            <div className="size-2 shrink-0 rounded-[2px]" style={{ background: item.color }} />
            {config[key]?.label ?? item.value}
          </div>
        );
      })}
    </div>
  );
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle };
