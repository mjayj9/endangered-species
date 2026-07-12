// ============================================================
// 턴제 전투 씬 (Phase 2)
//  - 파티(주인공 + 임시 펫) vs 필드 몬스터의 스피드 기반 턴제 전투.
//  - 커맨드: 공격 / 스킬 / 아이템 / 방어 / 교체 / 도망.
//  - 승리 → 경험치·골드 획득(임시), 패배 → 마을(시작 지점) 귀환 HP 1 부활.
//  - 주인공만 직접 커맨드를 고르고, 펫/적은 자동 행동한다(Phase 4에서 펫 조작 확장 여지).
// ============================================================

import { game } from '../core/game.js';
import { playSound } from '../core/audio.js';
import { clearKeys } from '../core/input.js';
import { applyReturnCooldown } from '../world/encounter.js';
import { drawStatBar } from '../render/primitives.js';

import { Combatant } from './Combatant.js';
import { ITEMS } from '../data/items.js';
import { MONSTERS } from '../data/monsters.js';

import { basicAttack, useSkill, useItem, defend, tryFlee } from './battleCommands.js';
import { effectiveStats, addItem } from '../systems/inventory.js';
import { gainHeroExp, gainPetExp } from '../systems/leveling.js';
import { learnedActiveSkillIds } from '../systems/skillTree.js';
import { recordKill } from '../systems/quests.js';
import { attachFx, initCombatantFx, updateFx, skipFx, spawnBanner, drawProjectiles, drawParticles } from './battleFx.js';

// 원거리(투사체) 직업/펫 여부 — 근접(leo/taro)은 lunge, 원거리(aria/lumi/펫)는 투사체
const RANGED_HERO = { aria: true, lumi: true, leo: false, taro: false };

const THEME_BG = {
    forest: ['#14532d', '#052e16'],
    desert: ['#b45309', '#78350f'],
    snow: ['#64748b', '#1e293b'],
    swamp: ['#581c87', '#2e1065'],
};

let B = null; // 현재 전투 컨텍스트

// ------------------------------------------------------------
// 전투 시작
// ------------------------------------------------------------
export function startBattle(enemySprite) {
    const hero = game.player;

    // 아군: 주인공(장비 보너스 포함 최종 스탯) + 활성 펫. 벤치 펫은 교체로 투입.
    const eff = effectiveStats(hero);
    const heroC = new Combatant({
        name: hero.name, emoji: hero.emoji, color: hero.color, side: 'ally', isPlayer: true,
        maxHp: eff.maxHp, hp: Math.min(hero.hp, eff.maxHp), maxMp: eff.maxMp, mp: Math.min(hero.mp, eff.maxMp),
        atk: eff.atk, def: eff.def, spd: eff.spd,
        skillIds: learnedActiveSkillIds(hero), ref: hero,
    });

    // 출전 펫(active) → 아군, 대기 펫 → 교체 후보
    const activePets = game.pets.filter((p) => p.active).map((p) => petToCombatant(p));
    const benchPets = game.pets.filter((p) => !p.active).map((p) => petToCombatant(p));

    // 적: 접촉한 몬스터 + 확률적으로 1마리 추가(최대 3)
    const enemies = [spriteToCombatant(enemySprite)];
    if (Math.random() < 0.4) enemies.push(dataToCombatant(MONSTERS.sludge));

    B = {
        allies: [heroC, ...activePets],
        bench: benchPets,
        enemies,
        order: [],
        turnIdx: 0,
        phase: 'intro',
        current: null,
        wait: 0,
        flash: 1,
        floaters: [],
        log: '',
        sourceEnemy: enemySprite,
        outcome: null,

        msg(text) {
            this.log = text;
            const el = document.getElementById('battle-log');
            if (el) el.innerText = text;
        },
    };

    // 연출(FX) 레이어 부착 + combatant 시각 상태 초기화
    attachFx(B);
    B.allies.forEach((c) => initCombatantFx(c, c.isPlayer ? !!RANGED_HERO[hero.heroKey] : true));
    B.bench.forEach((c) => initCombatantFx(c, true));
    B.enemies.forEach((c) => initCombatantFx(c, false));

    layoutSlots();
    game.scene = 'battle';
    playSound('skill');
    clearKeys();

    document.getElementById('battle-ui').classList.remove('hidden');
    B.msg(`야생의 ${enemies.map((e) => e.name).join(', ')}이(가) 나타났다!`);
    clearMenu();

    // 연출 스킵(스페이스/클릭)
    window.addEventListener('keydown', onSkipKey);
    game.viewport?.addEventListener('click', onSkipClick);
}

// 연출 스킵: 입력 대기(command/target) 중에는 무시
function onSkipKey(e) {
    if (e.code === 'Space') { e.preventDefault(); doSkip(); }
}
function onSkipClick(e) {
    // 커맨드 메뉴 버튼 클릭은 스킵으로 취급하지 않음
    if (e.target.closest('#battle-menu')) return;
    doSkip();
}
function doSkip() {
    if (!B || B.phase === 'command' || B.phase === 'target') return;
    skipFx(B);
    if (B.wait > 1) B.wait = 1;
}

function petToCombatant(p) {
    return new Combatant({
        name: p.name, emoji: p.emoji, color: p.color, side: 'ally', isPlayer: false,
        maxHp: p.stats.maxHp, hp: p.stats.hp, maxMp: p.stats.maxMp, mp: p.stats.mp,
        atk: p.stats.atk, def: p.stats.def, spd: p.stats.spd,
        skillIds: [...p.skills], ref: p,
    });
}

function spriteToCombatant(sprite) {
    const s = sprite.data.stats;
    const c = new Combatant({
        name: sprite.data.name, emoji: sprite.data.emoji, color: sprite.data.color, side: 'enemy',
        maxHp: s.maxHp, hp: s.hp, atk: s.atk, def: s.def, spd: s.spd,
    });
    c.reward = { exp: sprite.data.exp || 0, gold: sprite.data.gold || 0 };
    c.drops = sprite.data.drops || [];
    c.monsterId = sprite.data.id;
    return c;
}

function dataToCombatant(data) {
    const c = spriteToCombatant({ data });
    return c;
}

// 아군/적 화면 슬롯 위치를 화면 비율(fx, fy)로 배치
function layoutSlots() {
    assign(B.allies, 0.24);
    assign(B.enemies, 0.74);
    function assign(list, fx) {
        const n = list.length;
        list.forEach((c, i) => {
            c.fx = fx;
            c.fy = n === 1 ? 0.5 : 0.34 + (0.32 / (n - 1)) * i;
        });
    }
}

// ------------------------------------------------------------
// 업데이트 (프레임 루프)
// ------------------------------------------------------------
export function updateBattle() {
    if (!B) return;

    // 진입 화면 플래시 감쇄(연출 정지와 무관하게)
    if (B.flash > 0) B.flash = Math.max(0, B.flash - 0.05);

    // FX 갱신 — 히트스톱 중이면 전체 정지(때리는 순간의 무게감)
    if (updateFx(B)) return;

    switch (B.phase) {
        case 'intro':
            if (B.flash <= 0) { B.wait = 40; B.phase = 'startRound'; }
            break;
        case 'startRound':
            if (--B.wait <= 0) startRound();
            break;
        case 'autoTurn':
            if (--B.wait <= 0) autoAct();
            break;
        case 'resolve':
            if (--B.wait <= 0) advanceTurn();
            break;
        case 'result':
            if (--B.wait <= 0) finishBattle();
            break;
        // 'command' / 'target': 플레이어 입력 대기(HTML 메뉴)
    }
}

function startRound() {
    // 스피드 내림차순 턴 순서
    B.order = [...B.allies, ...B.enemies].filter((c) => c.alive).sort((a, b) => b.spd - a.spd);
    B.turnIdx = 0;
    nextTurn();
}

function nextTurn() {
    // 종료 판정
    if (!B.enemies.some((e) => e.alive)) return beginResult('victory');
    if (!B.allies.some((a) => a.alive)) return beginResult('defeat');

    if (B.turnIdx >= B.order.length) return startRound(); // 새 라운드

    const actor = B.order[B.turnIdx];
    if (!actor || !actor.alive) { B.turnIdx++; return nextTurn(); }

    actor.defending = false; // 자신의 턴이 오면 지난 방어 태세 해제
    B.current = actor;
    spawnBanner(B, `${actor.name}의 턴!`);

    if (actor.isPlayer) {
        B.phase = 'command';
        B.msg(`${actor.name}의 턴 — 커맨드를 선택하세요`);
        renderRootMenu();
    } else {
        B.phase = 'autoTurn';
        B.wait = 40; // 배너를 잠깐 보여준 뒤 자동 행동
        clearMenu();
    }
}

// 펫/적 자동 행동
function autoAct() {
    const actor = B.current;
    if (actor.side === 'enemy') {
        const targets = B.allies.filter((a) => a.alive);
        const target = targets[Math.floor(Math.random() * targets.length)];
        B.msg(basicAttack(B, actor, target)); // 타격음은 임팩트 시점(battleFx)에서 재생
    } else {
        // 펫: 보유 스킬 중 하나를 상황에 맞게 사용
        petAutoAct(actor);
    }
    afterAction();
}

// 펫 AI: 힐 스킬은 다친 아군이 있을 때만, 그 외엔 공격 스킬 사용
function petAutoAct(actor) {
    const aliveA = B.allies.filter((a) => a.alive);
    const aliveE = B.enemies.filter((e) => e.alive);
    const hurt = aliveA.filter((a) => a.hp < a.maxHp * 0.6).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp);

    const skills = actor.skills;
    const healSkills = skills.filter((s) => s.type === 'heal');
    const atkSkills = skills.filter((s) => s.type !== 'heal');

    // 다친 아군이 있고 힐 스킬 보유 → 힐
    if (hurt.length && healSkills.length) {
        const sk = healSkills[0];
        const targets = sk.target === 'allyAll' ? aliveA : [hurt[0]];
        B.msg(useSkill(B, actor, sk, targets));
        return;
    }
    // 공격 스킬 무작위 사용
    const sk = atkSkills[Math.floor(Math.random() * atkSkills.length)];
    if (!sk) { B.msg(basicAttack(B, actor, aliveE[Math.floor(Math.random() * aliveE.length)])); return; }
    const targets = sk.target === 'enemyAll' ? aliveE : [aliveE[Math.floor(Math.random() * aliveE.length)]];
    B.msg(useSkill(B, actor, sk, targets));
}

// 플레이어/자동 행동 후 공통 처리
function afterAction() {
    clearMenu(); // 남은 커맨드 버튼 제거 → 결과 대기 중 잘못된 클릭 방지
    B.actionToken++; // 다음 액션의 공격 모션 1회 보장
    B.phase = 'resolve';
    B.wait = 48;
}

function advanceTurn() {
    B.turnIdx++;
    nextTurn();
}

// ------------------------------------------------------------
// 결과 처리
// ------------------------------------------------------------
function beginResult(outcome) {
    B.outcome = outcome;
    B.phase = 'result';
    B.wait = 100;
    clearMenu();

    if (outcome === 'victory') {
        playSound('correct');

        // 전투 중 hp/mp 를 먼저 원본에 반영(레벨업 전회복이 덮어쓸 수 있음)
        const heroC = B.allies.find((a) => a.isPlayer);
        if (heroC) { game.player.hp = heroC.hp; game.player.mp = heroC.mp; }

        const reward = B.enemies.reduce(
            (acc, e) => ({ exp: acc.exp + (e.reward?.exp || 0), gold: acc.gold + (e.reward?.gold || 0) }),
            { exp: 0, gold: 0 }
        );
        game.gold += reward.gold;

        // 주인공 경험치/레벨업
        const lvMsgs = gainHeroExp(game.player, reward.exp);

        // 전투 참여 펫 경험치 (B.allies 의 펫 원본에 지급, 중복 제거)
        const petRefs = new Set();
        B.allies.filter((a) => !a.isPlayer && a.ref).forEach((a) => petRefs.add(a.ref));
        petRefs.forEach((p) => gainPetExp(p, reward.exp));

        // 퀘스트 처치 카운트 기록
        B.enemies.forEach((e) => { if (e.monsterId) recordKill(e.monsterId); });

        // 아이템 드롭
        const drops = [];
        B.enemies.forEach((e) => {
            (e.drops || []).forEach((d) => {
                if (Math.random() < d.chance) { addItem(d.itemId, 1); drops.push(ITEMS[d.itemId].name); }
            });
        });

        let msg = `승리! 경험치 +${reward.exp}, 골드 +${reward.gold}`;
        if (drops.length) msg += ` · 획득: ${drops.join(', ')}`;
        if (lvMsgs.length) { msg += ` · ${lvMsgs[lvMsgs.length - 1]}`; B.addFloater(heroC, 'LEVEL UP!', '#facc15'); }
        B.msg(msg);
    } else {
        playSound('wrong');
        B.msg('파티가 쓰러졌다... 마을로 귀환합니다.');
    }
}

function finishBattle() {
    window.removeEventListener('keydown', onSkipKey);
    game.viewport?.removeEventListener('click', onSkipClick);
    document.getElementById('battle-ui').classList.add('hidden');
    clearMenu();
    const heroC = B.allies.find((a) => a.isPlayer);

    if (B.outcome === 'victory') {
        // hp/mp 는 beginResult 에서 이미 반영(레벨업 전회복 포함). 처치 몬스터 제거.
        game.monsters = game.monsters.filter((m) => m !== B.sourceEnemy);
    } else if (B.outcome === 'flee') {
        // 도망: 전투 중 입은 피해를 유지
        if (heroC) { game.player.hp = heroC.hp; game.player.mp = heroC.mp; }
        applyReturnCooldown(B.sourceEnemy);
    } else if (B.outcome === 'defeat') {
        // 마을(시작 지점) 귀환 + HP 1 부활
        game.player.hp = 1;
        game.player.x = game.map.spawn.x;
        game.player.y = game.map.spawn.y;
        game.monsters.forEach((m) => applyReturnCooldown(m));
    }

    playSound('jump');
    clearKeys();
    game.scene = 'overworld';
    B = null;
}

// ------------------------------------------------------------
// 플레이어 커맨드 (HTML 메뉴에서 호출)
// ------------------------------------------------------------
const aliveEnemies = () => B.enemies.filter((e) => e.alive);
const aliveAllies = () => B.allies.filter((a) => a.alive);

function playerAttack() {
    const enemies = aliveEnemies();
    pickTarget(enemies, (t) => {
        B.msg(basicAttack(B, B.current, t)); // 타격음은 임팩트 시점에서
        afterAction();
    });
}

function playerSkill(skill) {
    const actor = B.current;
    if (actor.mp < skill.mpCost) { B.msg('MP가 부족합니다!'); return; }
    playSound('skill');

    if (skill.target === 'enemy') {
        pickTarget(aliveEnemies(), (t) => { B.msg(useSkill(B, actor, skill, [t])); afterAction(); });
    } else if (skill.target === 'enemyAll') {
        B.msg(useSkill(B, actor, skill, aliveEnemies())); afterAction();
    } else if (skill.target === 'allyOne') {
        pickTarget(aliveAllies(), (t) => { B.msg(useSkill(B, actor, skill, [t])); afterAction(); });
    } else if (skill.target === 'allyAll') {
        B.msg(useSkill(B, actor, skill, aliveAllies())); afterAction();
    } else { // self
        B.msg(useSkill(B, actor, skill, [actor])); afterAction();
    }
}

function playerItem(itemId) {
    const targets = aliveAllies();
    pickTarget(targets, (t) => { B.msg(useItem(B, B.current, itemId, t)); afterAction(); });
}

function playerDefend() {
    playSound('jump');
    B.msg(defend(B, B.current));
    afterAction();
}

function playerSwap(benchIdx) {
    // 현재 행동 주체(주인공)는 전장에 남고, 활성 펫 1명 ↔ 벤치 펫 교체
    const activePetIdx = B.allies.findIndex((a) => !a.isPlayer && a.alive);
    const incoming = B.bench[benchIdx];
    playSound('jump');

    if (activePetIdx === -1) {
        // 활성 펫이 없으면 벤치 펫을 새로 투입
        B.bench.splice(benchIdx, 1);
        B.allies.push(incoming);
    } else {
        const outgoing = B.allies[activePetIdx];
        B.allies[activePetIdx] = incoming;
        B.bench[benchIdx] = outgoing;
    }
    layoutSlots();
    B.msg(`${incoming.name}(으)로 교체!`);
    afterAction();
}

function playerFlee() {
    if (tryFlee()) {
        B.outcome = 'flee';
        B.msg('무사히 도망쳤다!');
        B.phase = 'result';
        B.wait = 50;
        clearMenu();
    } else {
        B.msg('도망치지 못했다!');
        afterAction(); // 턴 소모
    }
}

// ------------------------------------------------------------
// 커맨드 메뉴 UI (HTML)
// ------------------------------------------------------------
function menuEl() { return document.getElementById('battle-menu'); }
function clearMenu() { const m = menuEl(); if (m) m.innerHTML = ''; }

function makeBtn(label, onClick, disabled = false) {
    const b = document.createElement('button');
    b.className = 'rpg-btn' + (disabled ? ' rpg-btn--off' : '');
    b.innerText = label;
    b.disabled = disabled;
    if (!disabled) b.onclick = onClick;
    return b;
}

function renderRootMenu() {
    const m = menuEl();
    m.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-3 gap-1.5';

    grid.appendChild(makeBtn('⚔️ 공격', playerAttack));
    grid.appendChild(makeBtn('✨ 스킬', renderSkillMenu, B.current.skills.length === 0));
    grid.appendChild(makeBtn('🧪 아이템', renderItemMenu, !hasAnyItem()));
    grid.appendChild(makeBtn('🛡️ 방어', playerDefend));
    grid.appendChild(makeBtn('🔄 교체', renderSwapMenu, B.bench.length === 0));
    grid.appendChild(makeBtn('🏃 도망', playerFlee));
    m.appendChild(grid);
}

function renderSkillMenu() {
    const m = menuEl();
    m.innerHTML = '';
    const list = document.createElement('div');
    list.className = 'flex flex-col gap-1.5';
    B.current.skills.forEach((sk) => {
        const disabled = B.current.mp < sk.mpCost;
        list.appendChild(makeBtn(`${sk.name}  (MP ${sk.mpCost})`, () => playerSkill(sk), disabled));
    });
    list.appendChild(makeBtn('◀ 뒤로', renderRootMenu));
    m.appendChild(list);
}

function renderItemMenu() {
    const m = menuEl();
    m.innerHTML = '';
    const list = document.createElement('div');
    list.className = 'flex flex-col gap-1.5';
    // 소비 아이템만 노출 (장비는 game.bag 이라 전투 아이템 커맨드에 뜨지 않음)
    consumableIds().forEach((id) => {
        const count = game.inventory[id] || 0;
        list.appendChild(makeBtn(`${ITEMS[id].emoji} ${ITEMS[id].name}  x${count}`, () => playerItem(id), count <= 0));
    });
    list.appendChild(makeBtn('◀ 뒤로', renderRootMenu));
    m.appendChild(list);
}

// 보유 중인 소비 아이템 id 목록
function consumableIds() {
    return Object.keys(game.inventory).filter((id) => ITEMS[id]?.category === 'consumable');
}

function renderSwapMenu() {
    const m = menuEl();
    m.innerHTML = '';
    const list = document.createElement('div');
    list.className = 'flex flex-col gap-1.5';
    B.bench.forEach((p, i) => {
        list.appendChild(makeBtn(`${p.emoji} ${p.name} 투입`, () => playerSwap(i)));
    });
    list.appendChild(makeBtn('◀ 뒤로', renderRootMenu));
    m.appendChild(list);
}

// 대상 선택: 후보가 1명이면 자동, 여러 명이면 버튼 목록
function pickTarget(candidates, onPick) {
    if (candidates.length === 1) return onPick(candidates[0]);
    B.phase = 'target';
    const m = menuEl();
    m.innerHTML = '';
    const list = document.createElement('div');
    list.className = 'flex flex-col gap-1.5';
    B.msg('대상을 선택하세요');
    candidates.forEach((c) => {
        list.appendChild(makeBtn(`🎯 ${c.name}  (HP ${Math.round(c.hp)})`, () => { B.phase = 'command'; onPick(c); }));
    });
    list.appendChild(makeBtn('◀ 취소', () => { B.phase = 'command'; renderRootMenu(); }));
    m.appendChild(list);
}

function hasAnyItem() {
    return consumableIds().some((id) => (game.inventory[id] || 0) > 0);
}

// ------------------------------------------------------------
// 렌더링
// ------------------------------------------------------------
export function renderBattle(ctx) {
    if (!B) return;
    const w = game.canvas.width, h = game.canvas.height;
    const theme = game.map?.theme || 'forest';

    // 화면 셰이크 적용(전투 전체)
    ctx.save();
    if (B.shake > 0) {
        ctx.translate((Math.random() - 0.5) * B.shake, (Math.random() - 0.5) * B.shake);
    }

    drawBattleBg(ctx, w, h, theme);

    drawGroup(ctx, B.allies, w, h, true);
    drawGroup(ctx, B.enemies, w, h, false);

    // 투사체 + 타격 파티클
    drawProjectiles(B, ctx);
    drawParticles(B, ctx);

    // 현재 턴 표시 화살표
    if (B.current && B.current.alive && (B.phase === 'command' || B.phase === 'target')) {
        const px = B.current.fx * w + B.current.ox, py = B.current.fy * h + B.current.oy;
        ctx.fillStyle = '#facc15';
        ctx.font = "bold 18px 'Jua', sans-serif";
        ctx.textAlign = 'center';
        ctx.fillText('▼', px, py - 52 + Math.sin(Date.now() * 0.008) * 3);
    }

    // 데미지/회복 플로터 (통통 튀는 팝)
    B.floaters.forEach((f) => {
        const px = f.fx * w, py = f.fy * h - (55 - f.timer) * 0.7;
        const pop = f.pop < 1 ? 1.4 - 0.4 * f.pop : 1; // 등장 시 크게 → 정상
        const size = (f.big ? 26 : 18) * (0.6 + 0.4 * Math.min(1, f.pop * 2)) * pop;
        ctx.save();
        ctx.globalAlpha = Math.min(1, f.timer / 24);
        ctx.fillStyle = f.color;
        ctx.strokeStyle = 'rgba(0,0,0,0.7)';
        ctx.lineWidth = 3;
        ctx.font = `900 ${size}px 'Jua', sans-serif`;
        ctx.textAlign = 'center';
        ctx.strokeText(f.text, px, py);
        ctx.fillText(f.text, px, py);
        ctx.restore();
    });

    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';
    ctx.restore(); // 셰이크 해제

    // 턴 배너 (셰이크 영향 제외)
    if (B.banner) {
        const t = B.banner.timer;
        const a = Math.min(1, t / 10) * Math.min(1, (40 - t) / 6 + 0.3);
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, a));
        ctx.fillStyle = 'rgba(2,6,23,0.82)';
        ctx.fillRect(0, h * 0.4, w, 44);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(0, h * 0.4, w, 3);
        ctx.fillRect(0, h * 0.4 + 41, w, 3);
        ctx.fillStyle = '#fff';
        ctx.font = "900 22px 'Jua', sans-serif";
        ctx.textAlign = 'center';
        ctx.fillText(B.banner.text, w / 2, h * 0.4 + 30);
        ctx.textAlign = 'start';
        ctx.restore();
    }

    // 진입 플래시
    if (B.flash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${B.flash})`;
        ctx.fillRect(0, 0, w, h);
    }
}

// 지역 테마 배경 (그라디언트 + 은은한 장식 + 바닥 단 + 비네트)
function drawBattleBg(ctx, w, h, theme) {
    const [c1, c2] = THEME_BG[theme] || THEME_BG.forest;
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, c1); bg.addColorStop(1, c2);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const now = Date.now();
    ctx.save();
    if (theme === 'forest') {
        // 나무 실루엣
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        for (let i = 0; i < 6; i++) {
            const x = (i + 0.5) * w / 6;
            ctx.beginPath();
            ctx.moveTo(x - 34, h * 0.72); ctx.lineTo(x, h * 0.30); ctx.lineTo(x + 34, h * 0.72);
            ctx.fill();
        }
        // 떠다니는 잎
        ctx.fillStyle = 'rgba(134,239,172,0.35)';
        for (let i = 0; i < 12; i++) {
            const x = (i * 97 + (now * 0.02)) % w;
            const y = (i * 53 + Math.sin(now * 0.001 + i) * 20) % (h * 0.6) + 20;
            ctx.beginPath(); ctx.ellipse(x, y, 3, 1.6, i, 0, Math.PI * 2); ctx.fill();
        }
    } else if (theme === 'desert') {
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(w * (0.2 + i * 0.3), h * 0.72, w * 0.35, 60, 0, Math.PI, 0); ctx.fill(); }
        ctx.fillStyle = 'rgba(253,224,71,0.25)'; ctx.beginPath(); ctx.arc(w * 0.8, h * 0.2, 40, 0, Math.PI * 2); ctx.fill();
    } else if (theme === 'snow') {
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        for (let i = 0; i < 30; i++) {
            const x = (i * 71 + now * 0.03) % w;
            const y = (i * 37 + now * 0.06) % h;
            ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill();
        }
    } else if (theme === 'swamp') {
        ctx.fillStyle = 'rgba(126,34,206,0.3)';
        for (let i = 0; i < 10; i++) {
            const x = (i * 113 + 40) % w;
            const y = h * 0.7 - ((now * 0.03 + i * 40) % (h * 0.5));
            ctx.beginPath(); ctx.arc(x, y, 3 + (i % 3), 0, Math.PI * 2); ctx.fill();
        }
    }
    ctx.restore();

    // 바닥 단
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(w * 0.28, h * 0.66, w * 0.22, 26, 0, 0, Math.PI * 2);
    ctx.ellipse(w * 0.74, h * 0.56, w * 0.20, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // 비네트
    const vg = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
}

function drawGroup(ctx, list, w, h, isAlly) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    list.forEach((c) => {
        const px = c.fx * w + c.ox, py = c.fy * h + c.oy;
        const dead = !c.alive && c.displayHp <= 1;
        ctx.save();
        if (dead) ctx.globalAlpha = 0.3;

        // 그림자 (오프셋 절반만 따라감)
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(c.fx * w + c.ox * 0.5, c.fy * h + 30, 28, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // 방어 태세 링
        if (c.defending && c.alive) {
            ctx.strokeStyle = 'rgba(56,189,248,0.8)';
            ctx.lineWidth = 3;
            ctx.setLineDash([6, 4]);
            ctx.lineDashOffset = Date.now() * 0.02;
            ctx.beginPath();
            ctx.arc(px, py, 34, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // 캐릭터 이모지 (피격 시 살짝 커짐)
        const scale = 1 + c.flash * 0.14;
        ctx.save();
        ctx.translate(px, py);
        ctx.scale(scale, scale);
        ctx.font = '48px sans-serif';
        ctx.fillText(c.emoji, 0, 0);
        ctx.restore();

        // 피격/회복 플래시 오버레이
        if (c.flash > 0) {
            ctx.save();
            ctx.globalAlpha = c.flash * 0.55;
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = c.flashColor;
            ctx.beginPath();
            ctx.arc(px, py, 26, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // 이름
        ctx.fillStyle = isAlly ? c.color : '#fecaca';
        ctx.font = "bold 12px 'Nanum Gothic'";
        ctx.fillText(c.name, px, py + 44);
        ctx.restore();

        // HP/MP 바 (트윈된 표시값 사용)
        drawStatBar(ctx, px - 32, py - 44, 64, 6, c.displayHp / c.maxHp, '#ef4444');
        if (isAlly && c.maxMp > 0) {
            drawStatBar(ctx, px - 32, py - 36, 64, 4, c.displayMp / c.maxMp, '#38bdf8');
        }
        ctx.fillStyle = '#e2e8f0';
        ctx.font = "bold 9px 'Nanum Gothic'";
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.max(0, Math.round(c.displayHp))}/${c.maxHp}`, px, py - 48);
    });
    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';
}
