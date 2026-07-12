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
import { createPet, STARTER_PETS } from './data/pets.js';
import { STARTER_INVENTORY, STARTER_EQUIPMENT } from './data/items.js';
import { grantRootSkill } from './systems/skillTree.js';

import { Hero } from './entities/Hero.js';
import { Camera } from './world/camera.js';
import { initOverworld, updateOverworld, renderOverworld } from './world/overworld.js';
import { updateBattle, renderBattle } from './battle/battleScene.js';

import { renderCharSelect } from './ui/charSelect.js';
import { updateHud } from './ui/hud.js';
import { updateDamageTexts } from './ui/damageText.js';
import { toggleMenu, closeMenu } from './ui/menu.js';
import { closeShop } from './ui/shop.js';
import { updateTransition, renderTransition } from './render/transition.js';
import { startDialogue } from './ui/dialogue.js';
import { registerAnimal } from './systems/encyclopedia.js';

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

    // 주인공 생성 + 루트 스킬 자동 습득
    game.player = new Hero(CLASSES[key]);
    grantRootSkill(game.player);

    // 시작 맵 로드
    game.map = MAPS[START_MAP];
    game.player.x = game.map.spawn.x;
    game.player.y = game.map.spawn.y;

    // 보유 펫 초기화 (레벨/경험치/스킬을 가진 펫 인스턴스)
    game.pets = STARTER_PETS.map((sp) => {
        const p = createPet(sp.id);
        p.active = sp.active;
        return p;
    });
    // 시작 펫은 도감에 자동 등록
    game.encyclopedia = [];
    game.pets.forEach((p) => registerAnimal(p.id));
    // 퀘스트/플래그 초기화
    game.quests = {}; game.questProgress = {}; game.flags = {};

    // 인벤토리/장비 초기화
    game.inventory = { ...STARTER_INVENTORY };
    game.bag = [...STARTER_EQUIPMENT];
    game.equipped = { weapon: null, armor: null, accessory: null };
    game.overlay = 'none';

    // 카메라 + 필드 초기화
    game.camera = new Camera();
    initOverworld();

    document.getElementById('char-select-screen').classList.add('hidden');
    game.scene = 'overworld';

    // 오프닝 대화(여행을 떠나는 동기 설명) 자동 재생
    startDialogue('intro');
}

// --- 메인 루프 ---
function gameLoop() {
    requestAnimationFrame(gameLoop);
    const ctx = game.ctx;
    if (!ctx) return;

    // 1) 업데이트
    updateTransition();
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

    // 2.5) 화면 전환 연출 (씬 위에 덮어 그림)
    renderTransition(ctx, game.canvas.width, game.canvas.height);

    // 3) HUD / 떠오르는 텍스트
    if (game.scene !== 'charSelect') {
        updateHud();
        if (game.camera) updateDamageTexts(game.camera);
    }
}

// --- 메뉴/상점 오버레이 입력 (Tab 토글 / Esc 닫기 / HUD 버튼) ---
function initOverlayControls() {
    document.getElementById('ui-menu-btn')?.addEventListener('click', () => {
        if (game.scene === 'overworld') toggleMenu();
    });
    document.getElementById('menu-close')?.addEventListener('click', closeMenu);
    document.getElementById('shop-close')?.addEventListener('click', closeShop);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            if (game.scene === 'overworld' && game.overlay !== 'shop') toggleMenu();
        } else if (e.key === 'Escape') {
            if (game.overlay === 'menu') closeMenu();
            else if (game.overlay === 'shop') closeShop();
        }
    });
}

// --- 부팅 ---
function boot() {
    setupCanvas();
    initInput(() => game.scene);
    initOverlayControls();
    renderCharSelect(selectCharacter);
    gameLoop();
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    boot();
} else {
    window.addEventListener('DOMContentLoaded', boot);
}
