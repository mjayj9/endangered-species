// ============================================================
// 필드 몬스터 스프라이트 (오버월드 표시용)
//  - 원점 주변을 느리게 배회한다(간단 Idle patrol).
//  - 플레이어와 접촉하면 encounter 가 전투 씬을 트리거한다.
//  - Phase 1은 스프라이트 + 접촉 판정까지. 실제 턴제 전투는 Phase 2.
// ============================================================

import { drawShadedBlock, drawStatBar } from '../render/primitives.js';

export class Enemy {
    // data: data/monsters.js 의 몬스터 정의
    constructor(data, x, y) {
        this.data = data;
        this.emoji = data.emoji;
        this.color = data.color;
        this.name = data.name;

        this.x = x; this.y = y;
        this.originX = x; this.originY = y;
        this.radius = 18;
        this.idleAngle = Math.random() * Math.PI * 2;

        // 전투 직후 재접촉으로 곧바로 다시 전투로 들어가는 것을 막는 쿨다운(frame)
        this.cooldown = 0;
    }

    update() {
        if (this.cooldown > 0) this.cooldown--;

        // 원점 주변을 아주 느리게 서성임
        this.idleAngle += 0.01;
        this.x += Math.cos(this.idleAngle) * 0.4;
        this.y += Math.sin(this.idleAngle) * 0.4;
    }

    draw(ctx, camera) {
        const camX = camera.x, camY = camera.y;
        ctx.save();

        // 그림자
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(this.x - camX, this.y - camY + 14, 12, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // 몸통 블록 + 이모지
        drawShadedBlock(ctx, this.x - camX - 12, this.y - camY - 6, 24, 22, this.color, 4);
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, this.x - camX, this.y - camY + 4);
        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';

        // 이름표
        ctx.fillStyle = '#e2e8f0';
        ctx.font = "bold 9px 'Nanum Gothic'";
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.x - camX, this.y - camY - 18);
        ctx.textAlign = 'start';

        ctx.restore();
    }
}
