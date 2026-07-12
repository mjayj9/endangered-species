// ============================================================
// 진입점 + 게임 상태 머신
//  - 씬(charSelect → overworld → battle)을 관리하고 메인 루프를 돌린다.
//  - Phase 1 범위: 캐릭터 선택 → 오버월드(WASD 이동/카메라/에메랄드 숲) →
//    몬스터 접촉 시 전투 씬 진입(placeholder) → 오버월드 복귀.
// ============================================================

import { game } from './core/game.js';
import { initInput } from './core/input.js';
import { playSound } from './core/audio.js';

import { CLASSES } from './data/classes.js';
import { MAPS, START_MAP } from './data/maps.js';

import { Hero } from './entities/Hero.js';
import { Camera } from './world/camera.js';
import { initOverworld, updateOverworld, renderOverworld } from './world/overworld.js';
import { updateBattle, renderBattle } from './battle/battleScene.js';

import { renderCharSelect } from './ui/charSelect.js';
import { updateHud } from './ui/hud.js';
import { updateDamageTexts } from './ui/damageText.js';

// --- 캔버스 셋업 ---
function setupCanvas() {
    game.canvas = document.getElementById('gameCanvas');
    game.ctx = game.canvas.getContext('2d');
    game.viewport = document.getElementById('game-viewport');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    const container = document.getElementById('canvas-container');
    if (!container || !game.canvas) return;
    game.canvas.width = container.clientWidth || 960;
    game.canvas.height = container.clientHeight || 540;
}

// --- 캐릭터 선택 → 오버월드 시작 ---
function selectCharacter(key) {
    game.heroKey = key;
    playSound('correct');

    // 주인공 생성
    game.player = new Hero(CLASSES[key]);

    // 시작 맵 로드
    game.map = MAPS[START_MAP];
    game.player.x = game.map.spawn.x;
    game.player.y = game.map.spawn.y;

    // 카메라 + 필드 초기화
    game.camera = new Camera();
    initOverworld();

    document.getElementById('char-select-screen').classList.add('hidden');
    game.scene = 'overworld';
}

// --- 메인 루프 ---
function gameLoop() {
    requestAnimationFrame(gameLoop);
    const ctx = game.ctx;
    if (!ctx) return;

    // 1) 업데이트
    if (game.scene === 'overworld') {
        updateOverworld();
    } else if (game.scene === 'battle') {
        updateBattle();
    }

    // 2) 렌더
    ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
    ctx.save();
    if (game.camera && game.scene === 'overworld') game.camera.applyShake(ctx);

    if (game.scene === 'overworld') {
        renderOverworld(ctx);
    } else if (game.scene === 'battle') {
        renderBattle(ctx);
    }
    ctx.restore();

    // 3) HUD / 떠오르는 텍스트
    if (game.scene !== 'charSelect') {
        updateHud();
        if (game.camera) updateDamageTexts(game.camera);
    }
}

// --- 부팅 ---
function boot() {
    setupCanvas();
    initInput(() => game.scene);
    renderCharSelect(selectCharacter);
    gameLoop();
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    boot();
} else {
    window.addEventListener('DOMContentLoaded', boot);
}
