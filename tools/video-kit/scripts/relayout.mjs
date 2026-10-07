// Recalcula cenas e eventos da timeline sem mexer no áudio (depois de editar events/scenes à mão).
// Uso: node tools/video-kit/scripts/relayout.mjs <pasta>
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { KIT, video, layout } from './lib.mjs';
const v = video(process.argv[2]);
layout(v.tl);
v.save();
console.log(`✓ ${v.tl.duration} s · ${v.tl.scenes.length} cenas · ${(v.tl.events || []).length} eventos`);
try { execFileSync(process.execPath, [join(KIT, '..', 'video', 'timeline.mjs'), 'check', v.dir], { stdio: 'inherit', cwd: join(KIT, '..', '..') }); } catch { /* pendências impressas */ }
