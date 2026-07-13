// ============================================================
// 저장 시스템 (Phase 6 - 저장 파트)
//  - localStorage 자동저장 1슬롯. 게임 상태를 평범한 객체로 직렬화해 보관.
//  - 기존 게임 로직은 건드리지 않고, 트리거 지점에서 saveGame()만 호출한다.
//  - 불러오기(상태 복원)는 main.js 의 loadGame() 이 이 모듈의 readSave() 로 읽어 처리한다.
//    (Hero/Camera/맵 등 재구성은 main 이 담당 → 순환 import 방지)
// ============================================================

import { game } from './game.js';

const KEY = 'ecoGuardiansSave_v1';

export function hasSave() {
    try { return !!localStorage.getItem(KEY); } catch { return false; }
}

export function clearSave() {
    try { localStorage.removeItem(KEY); } catch { /* 무시 */ }
}

export function readSave() {
    try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}

// 현재 게임 상태 → localStorage 저장
export function saveGame() {
    if (!game.player || game.scene === 'charSelect') return; // 게임 시작 전에는 저장 안 함
    const p = game.player;
    const data = {
        v: 1,
        savedAt: Date.now(),
        heroKey: game.heroKey,
        mapId: game.map?.id,
        player: {
            level: p.level, exp: p.exp, sp: p.sp,
            hp: p.hp, mp: p.mp, maxHp: p.maxHp, maxMp: p.maxMp,
            atk: p.atk, def: p.def, spd: p.spd,
            x: p.x, y: p.y, facingDir: p.facingDir,
            learnedSkills: [...p.learnedSkills],
        },
        gold: game.gold,
        inventory: { ...game.inventory },
        bag: [...game.bag],
        equipped: { ...game.equipped },
        pets: game.pets.map((pt) => ({
            id: pt.id, level: pt.level, exp: pt.exp, active: pt.active,
            stats: { ...pt.stats }, skills: [...pt.skills],
        })),
        quests: { ...game.quests },
        questProgress: { ...game.questProgress },
        flags: { ...game.flags },
        encyclopedia: [...game.encyclopedia],
    };
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { console.warn('저장 실패:', e); }
}

// 요약(타이틀 '이어하기' 표시용)
export function saveSummary() {
    const d = readSave();
    if (!d) return null;
    return { heroKey: d.heroKey, level: d.player?.level ?? 1, mapId: d.mapId, savedAt: d.savedAt };
}

// 30초 주기 자동저장 + 탭 닫기 전 저장 (중복 등록 방지)
let autosaveId = null;
export function startAutosave() {
    if (autosaveId) return;
    autosaveId = setInterval(saveGame, 30000);
    window.addEventListener('beforeunload', saveGame);
}
