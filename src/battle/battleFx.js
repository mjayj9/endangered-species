// ============================================================
// 전투 연출(FX) 레이어 (Phase 4.5)
//  - 전투 로직(데미지 계산/턴 순서/승패)은 전혀 건드리지 않는다.
//  - 여기서는 "보여주는 방식"만 담당: 공격 모션(lunge/투사체), 피격 반응
//    (플래시·넉백·파티클), 히트스톱, 화면 셰이크, 데미지 팝, HP/MP 바 트윈, 턴 배너.
//  - battleScene 이 만든 전투 컨텍스트 B와 combatant 객체에 시각 상태를 얹어 쓴다.
// ============================================================

import { game } from '../core/game.js';
import { playSound } from '../core/audio.js';

// 전투 시작 시 FX 상태를 B에 부착
export function attachFx(B) {
    B.projectiles = [];   // 날아가는 투사체
    B.particles = [];     // 타격 스파크/파편
    B.fxQueue = [];        // 지연 실행(임팩트 타이밍) 큐
    B.hitstop = 0;         // 히트스톱(프레임): >0이면 전체 정지
    B.shake = 0;           // 전투 화면 흔들림 강도
    B.banner = null;       // { text, timer }
    B.actionToken = 0;     // 액션 식별(공격 모션 1회 보장용)
    B.lungedToken = -1;

    // 데미지 리포트(피격) — battleCommands 가 호출. 로직은 이미 hp를 깎았고, 여기선 연출만.
    B.reportHit = (target, amount, crit = false) => scheduleImpact(B, target, amount, crit, 'damage');
    B.reportHeal = (target, amount) => scheduleImpact(B, target, amount, false, 'heal');
    B.reportBuff = (actor) => { actor.flash = 1; actor.flashColor = '#38bdf8'; spawnSparks(B, actor, false, '#7dd3fc'); };

    // 데미지 텍스트(팝) — 레벨업 등 일반 텍스트도 재사용
    B.addFloater = (c, text, color) => {
        B.floaters.push({ fx: c.fx, fy: c.fy - 0.05, text, color, timer: 55, pop: 0, big: false });
    };
}

// combatant 에 시각 상태 필드 초기화
export function initCombatantFx(c, ranged) {
    c.ox = 0; c.oy = 0;             // 렌더 오프셋(넉백/lunge)
    c.flash = 0; c.flashColor = '#ffffff';
    c.displayHp = c.hp; c.displayMp = c.mp; // 바 트윈용 표시값
    c.hpReveal = true;
    c.ranged = ranged;             // 원거리(투사체) 여부
}

function center(c) {
    const w = game.canvas.width, h = game.canvas.height;
    return { x: c.fx * w + c.ox, y: c.fy * h + c.oy };
}

function dirTo(from, to) {
    const dx = (to.fx - from.fx), dy = (to.fy - from.fy);
    const len = Math.hypot(dx, dy) || 1;
    return { x: dx / len, y: dy / len };
}

// 액션당 1회: 공격자 lunge(근접) 또는 시전 반동(원거리)
function attackerMotionOnce(B, attacker, target) {
    if (!attacker || B.lungedToken === B.actionToken) return;
    B.lungedToken = B.actionToken;
    const d = dirTo(attacker, target);
    if (attacker.ranged) {
        attacker.ox -= d.x * 8; attacker.oy -= d.y * 8; // 살짝 뒤로 반동
    } else {
        attacker.ox += d.x * 24; attacker.oy += d.y * 24; // 대상 쪽으로 튀어나갔다 복귀(스프링)
    }
}

// 피격/회복 임팩트 예약 (근접=지연, 원거리=투사체 도착 시)
function scheduleImpact(B, target, amount, crit, kind) {
    const attacker = B.current;
    attackerMotionOnce(B, attacker, target);

    const fire = () => doImpact(B, attacker, target, amount, crit, kind);

    if (kind === 'damage' && attacker && attacker.ranged) {
        spawnProjectile(B, attacker, target, fire, crit);
        target.hpReveal = false;
    } else if (kind === 'damage') {
        target.hpReveal = false;
        B.fxQueue.push({ delay: 7, fn: fire }); // 근접 apex 타이밍
    } else {
        // 회복: 잠깐의 반짝임 후 반영
        target.hpReveal = false;
        B.fxQueue.push({ delay: 4, fn: fire });
    }
}

function doImpact(B, attacker, target, amount, crit, kind) {
    if (kind === 'heal') {
        target.flash = 0.8; target.flashColor = '#34d399';
        target.oy -= 8; // 살짝 떠오름
        spawnSparks(B, target, false, '#6ee7b7');
        pushFloater(B, target, `+${amount}`, '#34d399', false);
        target.hpReveal = true;
        playSound('heal');
        return;
    }

    // 데미지
    target.flash = 1; target.flashColor = crit ? '#fde047' : '#ffffff';
    const d = attacker ? dirTo(attacker, target) : { x: 1, y: 0 };
    target.ox += d.x * (crit ? 20 : 13);
    target.oy += d.y * (crit ? 20 : 13);
    spawnSparks(B, target, crit, crit ? '#fde047' : '#ffe08a');
    pushFloater(B, target, `${amount}`, crit ? '#f87171' : '#fecaca', crit);
    target.hpReveal = true;

    B.hitstop = Math.max(B.hitstop, crit ? 8 : 5);
    if (crit) B.shake = Math.max(B.shake, 8);
    else B.shake = Math.max(B.shake, 3);
    playSound('hit');
}

function pushFloater(B, c, text, color, big) {
    B.floaters.push({ fx: c.fx, fy: c.fy - 0.06, text, color, timer: big ? 62 : 52, pop: 0, big });
}

function spawnProjectile(B, from, to, onArrive, crit) {
    const a = center(from), b = center(to);
    B.projectiles.push({
        x: a.x, y: a.y, x0: a.x, y0: a.y, tx: b.x, ty: b.y,
        t: 0, dur: 14, color: from.color || '#a7f3d0', crit, onArrive,
    });
}

function spawnSparks(B, c, crit, color) {
    const p = center(c);
    const n = crit ? 14 : 8;
    for (let i = 0; i < n; i++) {
        const ang = Math.random() * Math.PI * 2;
        const sp = (crit ? 3.5 : 2.2) + Math.random() * 2.5;
        B.particles.push({
            x: p.x, y: p.y,
            vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 1,
            life: 18 + Math.random() * 10, max: 28,
            color, size: 1.5 + Math.random() * (crit ? 3 : 2),
        });
    }
    // 베인 자국(슬래시) 한 줄
    B.particles.push({ slash: true, x: p.x, y: p.y, life: 12, max: 12, color: crit ? '#fef9c3' : '#e2e8f0' });
}

// 배너 표시
export function spawnBanner(B, text) {
    B.banner = { text, timer: 40 };
}

// 프레임 갱신. 히트스톱이면 true(전체 정지) 반환.
export function updateFx(B) {
    if (B.hitstop > 0) { B.hitstop--; return true; }

    if (B.shake > 0) { B.shake *= 0.86; if (B.shake < 0.3) B.shake = 0; }
    if (B.banner) { B.banner.timer--; if (B.banner.timer <= 0) B.banner = null; }

    const all = [...B.allies, ...B.enemies, ...(B.bench || [])];
    all.forEach((c) => {
        c.ox += (0 - c.ox) * 0.22; c.oy += (0 - c.oy) * 0.22;
        if (Math.abs(c.ox) < 0.3) c.ox = 0;
        if (Math.abs(c.oy) < 0.3) c.oy = 0;
        if (c.flash > 0) c.flash = Math.max(0, c.flash - 0.1);
        if (c.hpReveal) c.displayHp += (c.hp - c.displayHp) * 0.2;
        c.displayMp += (c.mp - c.displayMp) * 0.2;
        if (Math.abs(c.displayHp - c.hp) < 0.5) c.displayHp = c.hp;
        if (Math.abs(c.displayMp - c.mp) < 0.5) c.displayMp = c.mp;
    });

    // 투사체 진행
    B.projectiles.forEach((p) => { p.t++; });
    B.projectiles = B.projectiles.filter((p) => {
        if (p.t >= p.dur) { p.onArrive && p.onArrive(); return false; }
        return true;
    });

    // 지연 임팩트
    B.fxQueue.forEach((q) => q.delay--);
    const ready = B.fxQueue.filter((q) => q.delay <= 0);
    B.fxQueue = B.fxQueue.filter((q) => q.delay > 0);
    ready.forEach((q) => q.fn());

    // 파티클
    B.particles.forEach((pt) => {
        if (pt.slash) { pt.life--; return; }
        pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.16; pt.vx *= 0.98; pt.life--;
    });
    B.particles = B.particles.filter((pt) => pt.life > 0);

    // 플로터(팝) 타이머
    B.floaters.forEach((f) => { f.timer--; if (f.pop < 1) f.pop = Math.min(1, f.pop + 0.18); });
    B.floaters = B.floaters.filter((f) => f.timer > 0);

    return false;
}

// 연출 즉시 스킵(클릭/스페이스) — 남은 임팩트/투사체를 즉시 반영
export function skipFx(B) {
    B.projectiles.forEach((p) => p.onArrive && p.onArrive());
    B.projectiles = [];
    const q = B.fxQueue; B.fxQueue = [];
    q.forEach((x) => x.fn());
    B.hitstop = 0;
    [...B.allies, ...B.enemies].forEach((c) => {
        c.displayHp = c.hp; c.displayMp = c.mp; c.ox = 0; c.oy = 0;
    });
    B.banner = null;
}

// 투사체 렌더 (combatant/floater 는 battleScene 이 직접 그림)
export function drawProjectiles(B, ctx) {
    B.projectiles.forEach((p) => {
        const k = p.t / p.dur;
        const x = p.x0 + (p.tx - p.x0) * k;
        const y = p.y0 + (p.ty - p.y0) * k;
        ctx.save();
        // 꼬리
        ctx.strokeStyle = p.color; ctx.globalAlpha = 0.5; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x - (p.tx - p.x0) / p.dur * 4, y - (p.ty - p.y0) / p.dur * 4);
        ctx.lineTo(x, y); ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(x, y, p.crit ? 7 : 5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    });
}

export function drawParticles(B, ctx) {
    B.particles.forEach((pt) => {
        if (pt.slash) {
            const a = pt.life / pt.max;
            ctx.save();
            ctx.globalAlpha = a;
            ctx.strokeStyle = pt.color; ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 20 * (1 - a) + 8, -0.9, 0.9);
            ctx.stroke();
            ctx.restore();
            return;
        }
        ctx.save();
        ctx.globalAlpha = Math.min(1, pt.life / 14);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}
