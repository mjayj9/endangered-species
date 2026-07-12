// ============================================================
// 화면 전환 연출 (Phase 4.5)
//  - 오버월드 → 전투 진입 시 뚝 끊기지 않도록 셔터/플래시 전환을 얹는다.
//  - 중간(half) 시점에 onMid()를 호출해 실제 씬 전환(startBattle)을 수행.
//  - main 루프가 매 프레임 update/render 한다.
// ============================================================

export const transition = {
    active: false,
    t: 0,
    dur: 34,
    half: false,
    onMid: null,
};

export function startTransition(onMid, dur = 34) {
    transition.active = true;
    transition.t = 0;
    transition.dur = dur;
    transition.half = false;
    transition.onMid = onMid || null;
}

export function updateTransition() {
    if (!transition.active) return;
    transition.t++;
    if (!transition.half && transition.t >= transition.dur / 2) {
        transition.half = true;
        if (transition.onMid) transition.onMid();
    }
    if (transition.t >= transition.dur) transition.active = false;
}

export function renderTransition(ctx, w, h) {
    if (!transition.active) return;
    const p = transition.t / transition.dur;

    // 위/아래 셔터 (중앙으로 닫혔다 열림)
    const cover = p < 0.5 ? p * 2 : (1 - p) * 2; // 0 → 1 → 0
    const barH = (h / 2) * cover;
    ctx.save();
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, w, barH);
    ctx.fillRect(0, h - barH, w, barH);

    // 셔터 가장자리 하이라이트
    ctx.fillStyle = 'rgba(250,204,21,0.85)';
    if (barH > 1) {
        ctx.fillRect(0, barH - 2, w, 2);
        ctx.fillRect(0, h - barH, w, 2);
    }

    // 진입 스피드 라인 (첫 절반)
    if (p < 0.5) {
        ctx.strokeStyle = `rgba(255,255,255,${0.15 * (1 - p * 2)})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const y = (i / 8) * h;
            ctx.beginPath();
            ctx.moveTo(w, y);
            ctx.lineTo(w * (1 - p * 1.6), y + 20);
            ctx.stroke();
        }
    }

    // 중앙 플래시
    const flash = Math.max(0, 1 - Math.abs(p - 0.5) / 0.12);
    if (flash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${flash * 0.85})`;
        ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
}
