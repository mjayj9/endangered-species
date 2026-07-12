// ============================================================
// 전투 씬 (Phase 1: placeholder)
//  - 몬스터 접촉 시 진입하는 "빈 전투 화면"만 구현한다.
//  - 아무 키 / 버튼으로 오버월드에 복귀한다.
//  - 실제 턴제 전투(커맨드/턴 순서/데미지)는 Phase 2에서 이 모듈을 확장한다.
// ============================================================

import { game } from '../core/game.js';
import { playSound } from '../core/audio.js';
import { clearKeys } from '../core/input.js';
import { applyReturnCooldown } from '../world/encounter.js';
import { shadeColor } from '../render/primitives.js';

let currentEnemy = null;
let enterFlash = 0;       // 진입 순간 화이트 플래시(0~1)
let startTime = 0;        // 입력 가드용
const INPUT_GUARD_MS = 450;

// 지역 테마별 전투 배경 색 (Phase 6에서 지역이 늘면 여기에 추가)
const THEME_BG = {
    forest: ['#14532d', '#052e16'],
    desert: ['#b45309', '#78350f'],
    snow: ['#64748b', '#1e293b'],
    swamp: ['#581c87', '#2e1065'],
};

export function startBattle(enemy) {
    currentEnemy = enemy;
    game.pendingBattle = enemy;
    game.scene = 'battle';
    enterFlash = 1;
    startTime = performance.now();

    playSound('skill');
    clearKeys();

    // 안내 오버레이 표시 + 복귀 버튼 연결
    document.getElementById('battle-hint').classList.remove('hidden');
    const btn = document.getElementById('battle-return-btn');
    btn.onclick = tryEnd;

    // 아무 키로 복귀 (입력 가드 경과 후)
    window.addEventListener('keydown', tryEnd);
}

function tryEnd() {
    if (performance.now() - startTime < INPUT_GUARD_MS) return;
    endBattle();
}

function endBattle() {
    window.removeEventListener('keydown', tryEnd);
    document.getElementById('battle-hint').classList.add('hidden');
    document.getElementById('battle-return-btn').onclick = null;

    applyReturnCooldown(currentEnemy);
    currentEnemy = null;
    game.pendingBattle = null;

    playSound('jump');
    clearKeys();
    game.scene = 'overworld';
}

export function updateBattle() {
    if (enterFlash > 0) enterFlash = Math.max(0, enterFlash - 0.05);
}

export function renderBattle(ctx) {
    const w = game.canvas.width, h = game.canvas.height;
    const theme = game.map?.theme || 'forest';
    const [c1, c2] = THEME_BG[theme] || THEME_BG.forest;

    // 지역 테마 그라데이션 배경
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, c1);
    bg.addColorStop(1, c2);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // 바닥 단
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, h * 0.72, w, h * 0.28);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 아군(주인공) — 좌하단
    const hero = game.player;
    if (hero) {
        ctx.font = '64px sans-serif';
        ctx.fillText(hero.emoji, w * 0.28, h * 0.62);
        ctx.fillStyle = hero.color;
        ctx.font = "bold 14px 'Nanum Gothic'";
        ctx.fillText(hero.name, w * 0.28, h * 0.78);
    }

    // 적 — 우상단
    if (currentEnemy) {
        ctx.font = '64px sans-serif';
        ctx.fillText(currentEnemy.emoji, w * 0.72, h * 0.4);
        ctx.fillStyle = '#fca5a5';
        ctx.font = "bold 14px 'Nanum Gothic'";
        ctx.fillText(currentEnemy.name, w * 0.72, h * 0.56);
    }

    // VS
    ctx.fillStyle = '#facc15';
    ctx.font = "900 40px 'Jua', sans-serif";
    ctx.fillText('VS', w * 0.5, h * 0.46);

    // 안내 문구
    ctx.fillStyle = shadeColor('#e2e8f0', 0);
    ctx.font = "bold 15px 'Jua', sans-serif";
    ctx.fillText('턴제 전투 씬 (Phase 2 예정)', w * 0.5, h * 0.16);

    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';

    // 진입 플래시
    if (enterFlash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${enterFlash})`;
        ctx.fillRect(0, 0, w, h);
    }
}
