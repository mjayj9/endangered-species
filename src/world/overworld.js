// ============================================================
// 오버월드(필드) 씬 — 에메랄드 숲 평원
//  - 잔디 텍스처, 숲 장식(나무/연못/피크닉/벤치), 몬스터, 플레이어 렌더.
//  - 기존 3d.html 의 grassSpeckles / drawEnvironmentDeco 느낌을 이식.
// ============================================================

import { game } from '../core/game.js';
import { Enemy } from '../entities/Enemy.js';
import { Npc } from '../entities/Npc.js';
import { Chest } from '../entities/Chest.js';
import { Trap } from '../entities/Trap.js';
import { Portal } from '../entities/Portal.js';
import { BossGate } from '../entities/BossGate.js';
import { MONSTERS } from '../data/monsters.js';
import { MAPS } from '../data/maps.js';
import { drawPrettyTree2D } from '../render/primitives.js';
import { checkEncounters } from './encounter.js';
import { keys } from '../core/input.js';
import { transition } from '../render/transition.js';
import { saveGame } from '../core/saveSystem.js';

let grassSpeckles = [];
let npcs = [];
let chests = [];
let traps = [];
let portals = [];
let bossGate = null;

// 맵 이동(오버월드 ↔ 던전/최종장). 포탈이 전환 연출 중간에 호출한다.
export function travelTo(mapId, spawnPoint) {
    const map = MAPS[mapId];
    if (!map) return;
    game.map = map;
    const sp = spawnPoint || map.spawn;
    game.player.x = sp.x; game.player.y = sp.y;
    game.player.vx = 0; game.player.vy = 0;
    game.pets.forEach((p) => { p._fx = null; }); // 팔로워 위치 리셋
    game._inVillage = false;
    initOverworld();
    game.scene = 'overworld';
    saveGame();
}

// 현재 맵 기준으로 필드 초기화 (잔디 얼룩 패턴 + 몬스터/NPC/상자 배치)
export function initOverworld() {
    const map = game.map;

    // 잔디 얼룩 고정 패턴 (매 프레임 랜덤이면 깜빡이므로 최초 1회만 생성)
    grassSpeckles = [];
    const count = Math.floor((map.width * map.height) / 8000);
    for (let i = 0; i < count; i++) {
        grassSpeckles.push({
            x: Math.random() * map.width,
            y: Math.random() * map.height,
            r: 3 + Math.random() * 6,
            dark: Math.random() < 0.55,
        });
    }

    // 몬스터 스폰
    game.monsters = map.monsterSpawns.map((sp) => {
        const data = MONSTERS[sp.monsterId];
        return new Enemy(data, sp.x, sp.y);
    });

    // NPC / 보물상자 / 구조 덫 / 포탈 / 보스 관문 스폰
    npcs = (map.npcs || []).map((d) => new Npc(d));
    chests = (map.chests || []).map((d) => new Chest(d));
    traps = (map.traps || []).map((d) => new Trap(d));
    portals = (map.portals || []).map((d) => new Portal(d));
    bossGate = map.bossGate ? new BossGate(map.bossGate) : null;
}

export function updateOverworld() {
    // 메뉴/상점 오버레이 또는 화면 전환 중이면 필드 갱신 정지(배경은 계속 렌더)
    if (game.overlay !== 'none' || transition.active) return;

    const { player, camera, canvas, map } = game;

    player.update(keys, map);
    camera.follow(player, canvas, map.width, map.height);

    game.monsters.forEach((m) => m.update());
    updateFollowers();

    // 던전 보스방 장벽: 부하가 남아 있으면 최심부 진입 차단
    if (map.bossWallX && game.monsters.length > 0 && player.x > map.bossWallX - 24) {
        player.x = map.bossWallX - 24;
    }

    // 마을(시작 지점 부근) 진입 시 자동저장 (마을 맵에서만)
    if (!map.dungeon) {
        const nearVillage = Math.hypot(player.x - map.spawn.x, player.y - map.spawn.y) < 220;
        if (nearVillage && !game._inVillage) { game._inVillage = true; saveGame(); }
        else if (!nearVillage && game._inVillage) { game._inVillage = false; }
    }

    // E 상호작용: 가장 가까운 NPC/상자 (범위 내) 발동
    if (keys.e) {
        const target = nearestInteractable(player);
        if (target) {
            keys.e = false; // 한 번만 발동
            target.interact();
        }
    }

    // 몬스터 접촉 → 전투 씬 진입 트리거
    checkEncounters();
}

// 출전 펫이 주인공을 졸졸 따라다니는 팔로워 위치/애니메이션 갱신
const DIR_VEC = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
function updateFollowers() {
    const hero = game.player;
    const back = DIR_VEC[hero.facingDir] || DIR_VEC.down;
    const active = game.pets.filter((p) => p.active);
    active.forEach((p, i) => {
        if (p._fx == null) { p._fx = hero.x; p._fy = hero.y; p._flip = false; }
        const tx = hero.x - back.x * (30 * (i + 1)) + (i % 2 ? 14 : -14);
        const ty = hero.y - back.y * (30 * (i + 1)) + 8;
        const dx = tx - p._fx, dy = ty - p._fy;
        p._fx += dx * 0.15; p._fy += dy * 0.15;
        p._moving = Math.hypot(dx, dy) > 1.5;
        p._walkT = (p._walkT || 0) + (p._moving ? 0.3 : 0.05);
        if (dx < -0.4) p._flip = true; else if (dx > 0.4) p._flip = false;
    });
}

function drawFollowers(ctx, camera) {
    const camX = camera.x, camY = camera.y;
    game.pets.filter((p) => p.active).forEach((p) => {
        if (p._fx == null) return;
        const px = p._fx - camX, py = p._fy - camY;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.ellipse(px, py + 10, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        const bob = p._moving ? Math.abs(Math.sin(p._walkT)) * 3 : Math.sin(p._walkT) * 0.6;
        ctx.save();
        ctx.translate(px, py - bob);
        if (p._flip) ctx.scale(-1, 1);
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
    });
    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';
}

// 상호작용 범위 안에서 가장 가까운 NPC/상자/덫/포탈/보스관문 반환
function nearestInteractable(player) {
    let best = null, bestDist = Infinity;
    const list = [...npcs, ...chests, ...traps, ...portals];
    if (bossGate) list.push(bossGate);
    for (const o of list) {
        if (o.opened) continue; // 이미 연 상자 / 구출한 덫 / 격파한 보스
        const d = Math.hypot(player.x - o.x, player.y - o.y);
        if (d < o.interactRange && d < bestDist) { best = o; bestDist = d; }
    }
    return best;
}

export function renderOverworld(ctx) {
    const { camera, map } = game;
    const camX = camera.x, camY = camera.y;

    // 잔디 기본 배경
    ctx.fillStyle = map.ground;
    ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);

    // 잔디 얼룩 텍스처
    grassSpeckles.forEach((s) => {
        const sx = s.x - camX, sy = s.y - camY;
        if (sx < -20 || sx > game.canvas.width + 20 || sy < -20 || sy > game.canvas.height + 20) return;
        ctx.fillStyle = s.dark ? 'rgba(16, 120, 80, 0.10)' : 'rgba(220, 255, 220, 0.12)';
        ctx.beginPath();
        ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
        ctx.fill();
    });

    drawDeco(ctx, camX, camY);

    // 던전 테마: 삭막한 분위기 오버레이(숲이 아닌 맵)
    if (map.theme && map.theme !== 'forest') {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.28)';
        ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
        drawDungeonFloor(ctx, camX, camY, map);
    }

    // 보스방 장벽 (부하 미소탕 시)
    if (map.bossWallX && game.monsters.length > 0) {
        const bx = map.bossWallX - camX;
        ctx.save();
        ctx.strokeStyle = 'rgba(239,68,68,0.7)';
        ctx.lineWidth = 5;
        ctx.setLineDash([14, 10]);
        ctx.lineDashOffset = -Date.now() * 0.03;
        ctx.beginPath();
        ctx.moveTo(bx, 0); ctx.lineTo(bx, game.canvas.height);
        ctx.stroke();
        ctx.restore();
    }

    // 포탈/보스관문 → NPC/상자/덫 → 몬스터 → 플레이어 순
    portals.forEach((p) => p.draw(ctx, camera, game.player));
    if (bossGate) bossGate.draw(ctx, camera, game.player);
    npcs.forEach((n) => n.draw(ctx, camera, game.player));
    chests.forEach((c) => c.draw(ctx, camera, game.player));
    traps.forEach((t) => t.draw(ctx, camera, game.player));
    game.monsters.forEach((m) => m.draw(ctx, camera));
    drawFollowers(ctx, camera);
    game.player.draw(ctx, camera);

    // 던전 안내 HUD (남은 부하 수)
    if (map.dungeon) {
        ctx.save();
        ctx.fillStyle = 'rgba(2,6,23,0.7)';
        ctx.fillRect(8, 8, 210, 26);
        ctx.fillStyle = '#fca5a5';
        ctx.font = "bold 12px 'Nanum Gothic'";
        const remain = game.monsters.length;
        ctx.fillText(remain > 0 ? `남은 부하: ${remain} — 모두 처치 시 보스방 개방` : '보스방 개방! 최심부로 진입하라', 16, 26);
        ctx.restore();
    }
}

// 던전 바닥 타일 격자(테마별 삭막한 인공 느낌)
function drawDungeonFloor(ctx, camX, camY, map) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 1;
    const size = 80;
    const ox = -(camX % size), oy = -(camY % size);
    for (let x = ox; x < game.canvas.width; x += size) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, game.canvas.height); ctx.stroke();
    }
    for (let y = oy; y < game.canvas.height; y += size) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(game.canvas.width, y); ctx.stroke();
    }
    ctx.restore();
}

// 숲 장식 렌더 (연못 → 피크닉/벤치 → 나무)
function drawDeco(ctx, camX, camY) {
    const d = game.map.deco;

    // 푸른 연못 호수 (백사장 테두리 + 그라데이션)
    if (d.pond) {
        const { x, y, r } = d.pond;
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.arc(x - camX, y - camY, r + 12, 0, Math.PI * 2);
        ctx.fill();

        const pondGrad = ctx.createRadialGradient(
            x - camX - 25, y - camY - 25, 5,
            x - camX, y - camY, r
        );
        pondGrad.addColorStop(0, '#e0f7ff');
        pondGrad.addColorStop(0.6, '#bae6fd');
        pondGrad.addColorStop(1, '#7dd3fc');
        ctx.fillStyle = pondGrad;
        ctx.beginPath();
        ctx.arc(x - camX, y - camY, r, 0, Math.PI * 2);
        ctx.fill();

        // 수련잎 데코
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(x - camX - 50, y - camY - 30, 8, 0, Math.PI * 2);
        ctx.arc(x - camX + 20, y - camY + 30, 10, 0, Math.PI * 2);
        ctx.fill();
    }

    // 체크무늬 분홍 피크닉 시트 + 바구니
    if (d.picnic) {
        const { x, y } = d.picnic;
        ctx.fillStyle = '#fbcfe8';
        ctx.fillRect(x - camX, y - camY, 45, 45);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        for (let i = 10; i < 45; i += 10) {
            ctx.beginPath();
            ctx.moveTo(x - camX + i, y - camY);
            ctx.lineTo(x - camX + i, y - camY + 45);
            ctx.stroke();
        }
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x - camX + 15, y - camY + 12, 14, 14);
    }

    // 나무 그네 벤치
    if (d.bench) {
        const { x, y } = d.bench;
        ctx.fillStyle = '#d97706';
        ctx.fillRect(x - camX, y - camY, 4, 30);
        ctx.fillRect(x - camX + 40, y - camY, 4, 30);
        ctx.fillRect(x - camX, y - camY, 44, 4);
        ctx.fillStyle = '#7c2d12';
        ctx.fillRect(x - camX + 8, y - camY + 22, 28, 4);
    }

    // 정원수들 (충돌 obstacle 과 좌표 일치)
    (d.trees || []).forEach((t) => drawPrettyTree2D(ctx, t.x, t.y, t.color, camX, camY));
}
