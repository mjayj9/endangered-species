// ============================================================
// 상단 HUD 갱신 (골드 / HP / 레벨 / 현재 구역)
//  - HP 최대치는 장비 보너스를 포함한 최종 스탯 기준으로 표시.
// ============================================================

import { game } from '../core/game.js';
import { effectiveStats } from '../systems/inventory.js';

export function updateHud() {
    const goldEl = document.getElementById('ui-gold');
    const hpText = document.getElementById('ui-hp');
    const hpBar = document.getElementById('ui-hp-bar');
    const zoneEl = document.getElementById('ui-zone');
    const lvEl = document.getElementById('ui-level');

    if (goldEl) goldEl.innerText = game.gold;

    const p = game.player;
    if (p && hpText && hpBar) {
        const maxHp = effectiveStats(p).maxHp;
        hpText.innerText = `${Math.max(0, Math.round(p.hp))}/${maxHp}`;
        hpBar.style.width = `${Math.max(0, Math.min(100, (p.hp / maxHp) * 100))}%`;
    }
    if (lvEl && p) lvEl.innerText = `Lv.${p.level}`;
    if (zoneEl && game.map) zoneEl.innerText = game.map.name;
}
