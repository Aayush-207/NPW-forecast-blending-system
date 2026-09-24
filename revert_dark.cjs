const fs = require('fs');

// 1. Tailwind Config
let tw = fs.readFileSync('tailwind.config.js', 'utf8');
tw = tw.replace(/obsidian: \"#F8FAFC\".*/, 'obsidian: \"#0f172a\", // slate-900');
tw = tw.replace(/\"midnight-slate\": \"#FFFFFF\".*/, '\"midnight-slate\": \"#1e293b\", // slate-800');
tw = tw.replace(/\"frosted-slate\": \"#F1F5F9\".*/, '\"frosted-slate\": \"#334155\", // slate-700');
tw = tw.replace(/\"slate-border\": \"#E2E8F0\".*/, '\"slate-border\": \"#475569\", // slate-600');
tw = tw.replace(/\"monsoon-cyan\": \"#2563EB\".*/, '\"monsoon-cyan\": \"#38bdf8\", // sky-400');
tw = tw.replace(/\"atlantic-blue\": \"#0369A1\".*/, '\"atlantic-blue\": \"#2563eb\", // blue-600');
tw = tw.replace(/\"quantum-violet\": \"#4F46E5\".*/, '\"quantum-violet\": \"#8b5cf6\", // violet-500');
tw = tw.replace(/\"neural-emerald\": \"#059669\".*/, '\"neural-emerald\": \"#10b981\", // emerald-500');
tw = tw.replace(/\"amber-alert\": \"#D97706\".*/, '\"amber-alert\": \"#f59e0b\", // amber-500');
tw = tw.replace(/\"crimson-hazard\": \"#DC2626\".*/, '\"crimson-hazard\": \"#ef4444\", // red-500');
fs.writeFileSync('tailwind.config.js', tw);

// 2. index.css
let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace(/text-slate-800/g, 'text-slate-200');
css = css.replace(/text-slate-900/g, 'text-slate-100');
css = css.replace(/text-slate-700/g, 'text-slate-300');
css = css.replace(/bg-white/g, 'bg-midnight-slate');
css = css.replace(/bg-slate-50/g, 'bg-obsidian');
css = css.replace(/bg-slate-300/g, 'bg-slate-700');
css = css.replace(/bg-slate-400/g, 'bg-slate-600');
css = css.replace(/hover:text-slate-900/g, 'hover:text-slate-100');
css = css.replace(/border-white\\\/5/g, 'border-slate-border/50');
css = css.replace(/shadow-sm/g, 'shadow-xl');
fs.writeFileSync('src/index.css', css);

// 3. MainMap.tsx
let map = fs.readFileSync('src/components/map/MainMap.tsx', 'utf8');
map = map.replace(/alidade_smooth\//g, 'alidade_smooth_dark/');
map = map.replace(/from-slate-50/g, 'from-obsidian/60');
map = map.replace(/bg-white\\\/95/g, 'bg-obsidian/95');
map = map.replace(/bg-slate-50/g, 'bg-frosted-slate/50');
map = map.replace(/text-slate-800/g, 'text-slate-100');
fs.writeFileSync('src/components/map/MainMap.tsx', map);

// 4. WeightEngineDrawer.tsx
let w = fs.readFileSync('src/components/inspector/WeightEngineDrawer.tsx', 'utf8');
w = w.replace(/bg-slate-50/g, 'bg-midnight-slate/50');
w = w.replace(/bg-white\\\/90/g, 'bg-midnight-slate/90');
w = w.replace(/bg-white/g, 'bg-frosted-slate/50');
w = w.replace(/text-slate-800/g, 'text-slate-200');
w = w.replace(/text-slate-900/g, 'text-slate-100');
w = w.replace(/text-slate-700/g, 'text-slate-300');
fs.writeFileSync('src/components/inspector/WeightEngineDrawer.tsx', w);

// 5. AnalyticsDrawer.tsx
let a = fs.readFileSync('src/components/analytics/AnalyticsDrawer.tsx', 'utf8');
a = a.replace(/bg-slate-50/g, 'bg-obsidian');
a = a.replace(/bg-white/g, 'bg-midnight-slate/50');
a = a.replace(/text-slate-800/g, 'text-slate-100');
a = a.replace(/text-slate-900/g, 'text-slate-50');
a = a.replace(/border-slate-100/g, 'border-slate-border');
a = a.replace(/fill: \"#64748B\"/g, 'fill: \"#94A3B8\"');
fs.writeFileSync('src/components/analytics/AnalyticsDrawer.tsx', a);

// 6. Header.tsx
let h = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');
h = h.replace(/bg-white\\\/90/g, 'bg-midnight-slate/90');
h = h.replace(/text-slate-800/g, 'text-slate-200');
h = h.replace(/text-slate-900/g, 'text-slate-100');
h = h.replace(/text-slate-700/g, 'text-slate-300');
fs.writeFileSync('src/components/layout/Header.tsx', h);

console.log('Done');
