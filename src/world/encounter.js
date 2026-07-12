// ============================================================
// 인카운터(전투 진입) 로직
//  - 플레이어와 필드 몬스터가 접촉하면 전투 씬으로 전환한다.
//  - Phase 1: 전환 연출 + 빈 전투 화면(placeholder)까지만.
// ============================================================

import { game } from '../core/game.js';
import { startBattle } from '../battle/battleScene.js';
import { spawnText } from '../ui/damageText.js';
import { playSound } from '../core/audio.js';

const ENCOUNTER_DIST = 26; // 접촉 판정 거리
const RETURN_COOLDOWN = 90; // 전투 복귀 후 재접촉 무시(프레임)

export function checkEncounters() {
    const p = game.player;

    for (const m of game.monsters) {
        if (m.cooldown > 0) continue;
        const dist = Math.hypot(p.x - m.x, p.y - m.y);
        if (dist < ENCOUNTER_DIST + m.radius) {
            playSound('hit');
            game.camera.addShake(10);
            spawnText(m.x, m.y - 10, '⚔️ 전투 발생!', '#facc15');
            startBattle(m);
            return; // 한 프레임에 하나만 처리
        }
    }
}

// 전투에서 돌아왔을 때 몬스터가 곧바로 다시 트리거되지 않도록 쿨다운 부여
export function applyReturnCooldown(enemy) {
    if (enemy) enemy.cooldown = RETURN_COOLDOWN;
}
