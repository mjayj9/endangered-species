// ============================================================
// 렌더링 헬퍼 (기존 3d.html 의 비주얼 폴리싱 코드 이식)
//  - shadeColor / drawShadedBlock / drawStatBar / drawPrettyTree2D
//  - 카메라 오프셋(camX, camY)을 명시적 인자로 받도록 리팩터링.
// ============================================================

// 16진 색상 명암 조절
export function shadeColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const r = Math.min(255, Math.max(0, (num >> 16) + amt));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`;
}

// 위→아래 그라데이션 + 둥근 모서리 블록
export function drawShadedBlock(ctx, x, y, w, h, color, radius = 4) {
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, shadeColor(color, 22));
    grad.addColorStop(1, shadeColor(color, -18));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fill();
}

// 체력/상태 바
export function drawStatBar(ctx, x, y, w, h, ratio, color) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, h / 2);
    ctx.fill();

    const clamped = Math.max(0, Math.min(1, ratio));
    if (clamped > 0) {
        const grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, shadeColor(color, 30));
        grad.addColorStop(1, color);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, w * clamped, h, h / 2);
        ctx.fill();
    }
}

// 동화풍으로 겹쳐 그리는 2D 나무
export function drawPrettyTree2D(ctx, x, y, color, camX, camY) {
    ctx.save();

    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(x - camX, y - camY + 41, 20, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    const trunkGrad = ctx.createLinearGradient(x - camX - 5, 0, x - camX + 5, 0);
    trunkGrad.addColorStop(0, '#5c2a0a');
    trunkGrad.addColorStop(1, '#8a4a1c');
    ctx.fillStyle = trunkGrad;
    ctx.fillRect(x - camX - 5, y - camY, 10, 40);

    const foliageGrad = ctx.createRadialGradient(
        x - camX - 8, y - camY - 26, 4,
        x - camX, y - camY - 12, 34
    );
    foliageGrad.addColorStop(0, shadeColor(color, 30));
    foliageGrad.addColorStop(1, shadeColor(color, -12));
    ctx.fillStyle = foliageGrad;
    ctx.beginPath();
    ctx.arc(x - camX, y - camY - 15, 25, 0, Math.PI * 2);
    ctx.arc(x - camX - 15, y - camY - 5, 18, 0, Math.PI * 2);
    ctx.arc(x - camX + 15, y - camY - 5, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}
