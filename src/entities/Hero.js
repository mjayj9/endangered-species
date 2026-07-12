// ============================================================
// 주인공(Hero) 엔티티
//  - 오버월드 WASD 이동 + 정적 오브젝트 충돌 + 월드 경계 처리.
//  - 4직업 도트 렌더링은 기존 3d.html 의 player.draw 를 이식.
//  - Phase 1: 실시간 액션 공격(J/K)은 제거. 이동/연출만 담당.
//    전투 스탯(hp/atk/def/spd, mp)은 Phase 2 턴제 전투에서 그대로 사용.
// ============================================================

import { drawShadedBlock, drawStatBar } from '../render/primitives.js';

export class Hero {
    constructor(classData) {
        this.heroKey = classData.key;
        this.name = classData.name;
        this.emoji = classData.emoji;
        this.color = classData.color;
        this.moveSpeed = classData.moveSpeed;

        // 전투용 스탯 (Phase 2에서 사용)
        const s = classData.stats;
        this.hp = s.hp; this.maxHp = s.maxHp;
        this.mp = s.mp; this.maxMp = s.maxMp;
        this.atk = s.atk; this.def = s.def; this.spd = s.spd;

        this.x = 0; this.y = 0;
        this.vx = 0; this.vy = 0;
        this.width = 36; this.height = 50;
        this.facingDir = 'down';

        // 경험치(레벨업은 Phase 3에서 구현)
        this.exp = 0;
        this.level = 1;
    }

    // keys: core/input 의 keys, map: 현재 맵 데이터
    update(keys, map) {
        let moveX = 0, moveY = 0;
        if (keys.w) { moveY = -1; this.facingDir = 'up'; }
        if (keys.s) { moveY = 1; this.facingDir = 'down'; }
        if (keys.a) { moveX = -1; this.facingDir = 'left'; }
        if (keys.d) { moveX = 1; this.facingDir = 'right'; }

        if (moveX !== 0 || moveY !== 0) {
            const len = Math.hypot(moveX, moveY);
            this.vx = (moveX / len) * this.moveSpeed;
            this.vy = (moveY / len) * this.moveSpeed;
        } else {
            this.vx = 0; this.vy = 0;
        }

        this.x += this.vx;
        this.y += this.vy;

        // 정적 오브젝트 충돌 (겹치면 바깥으로 밀어냄)
        for (const ob of map.obstacles) {
            const dx = this.x - ob.x;
            const dy = this.y - ob.y;
            const dist = Math.hypot(dx, dy);
            const minDist = ob.r + this.width / 2;
            if (dist < minDist && dist > 0) {
                const push = minDist - dist;
                this.x += (dx / dist) * push;
                this.y += (dy / dist) * push;
            }
        }

        // 월드 경계 고정
        this.x = Math.max(20, Math.min(this.x, map.width - 20));
        this.y = Math.max(20, Math.min(this.y, map.height - 20));
    }

    draw(ctx, camera) {
        const camX = camera.x, camY = camera.y;
        ctx.save();

        // 그림자
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(this.x - camX, this.y - camY + 12, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // 머리 (공용 베이스)
        const headGrad = ctx.createRadialGradient(
            this.x - camX - 3, this.y - camY - 13, 1,
            this.x - camX, this.y - camY - 10, 11
        );
        headGrad.addColorStop(0, '#fff7ed');
        headGrad.addColorStop(1, '#ffd9ae');
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(this.x - camX, this.y - camY - 10, 10, 0, Math.PI * 2);
        ctx.fill();

        // 직업별 머리장식 + 몸통
        if (this.heroKey === 'leo') {
            ctx.fillStyle = '#f97316';
            ctx.fillRect(this.x - camX - 11, this.y - camY - 21, 22, 10);
            ctx.fillStyle = '#ea580c';
            ctx.beginPath();
            ctx.moveTo(this.x - camX - 10, this.y - camY - 21);
            ctx.lineTo(this.x - camX - 14, this.y - camY - 28);
            ctx.lineTo(this.x - camX - 4, this.y - camY - 21);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(this.x - camX + 4, this.y - camY - 21);
            ctx.lineTo(this.x - camX + 14, this.y - camY - 28);
            ctx.lineTo(this.x - camX + 10, this.y - camY - 21);
            ctx.fill();
            drawShadedBlock(ctx, this.x - camX - 9, this.y - camY, 18, 18, '#475569');
            ctx.fillStyle = '#ea580c';
            ctx.fillRect(this.x - camX - 9, this.y - camY - 4, 18, 4);
        } else if (this.heroKey === 'aria') {
            ctx.fillStyle = '#78350f';
            ctx.fillRect(this.x - camX - 11, this.y - camY - 21, 22, 10);
            ctx.fillStyle = '#a16207';
            ctx.beginPath();
            ctx.arc(this.x - camX - 8, this.y - camY - 21, 5, 0, Math.PI * 2);
            ctx.arc(this.x - camX + 8, this.y - camY - 21, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffedd5';
            ctx.beginPath();
            ctx.arc(this.x - camX - 8, this.y - camY - 21, 2.5, 0, Math.PI * 2);
            ctx.arc(this.x - camX + 8, this.y - camY - 21, 2.5, 0, Math.PI * 2);
            ctx.fill();
            drawShadedBlock(ctx, this.x - camX - 9, this.y - camY, 18, 18, '#06b6d4');
            ctx.fillStyle = '#1e1b4b';
            ctx.fillRect(this.x - camX - 9, this.y - camY - 4, 18, 4);
        } else if (this.heroKey === 'taro') {
            ctx.fillStyle = '#16a34a';
            ctx.fillRect(this.x - camX - 11, this.y - camY - 21, 22, 10);
            ctx.fillStyle = '#15803d';
            ctx.beginPath();
            ctx.arc(this.x - camX, this.y - camY - 21, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#14532d';
            ctx.beginPath();
            ctx.arc(this.x - camX - 10, this.y - camY + 6, 7, 0, Math.PI * 2);
            ctx.fill();
            drawShadedBlock(ctx, this.x - camX - 10, this.y - camY, 20, 18, '#15803d');
            ctx.fillStyle = '#facc15';
            ctx.fillRect(this.x - camX - 10, this.y - camY + 8, 20, 3);
        } else if (this.heroKey === 'lumi') {
            ctx.fillStyle = '#db2777';
            ctx.fillRect(this.x - camX - 11, this.y - camY - 21, 22, 10);
            ctx.fillStyle = '#be185d';
            ctx.beginPath();
            ctx.moveTo(this.x - camX - 10, this.y - camY - 21);
            ctx.lineTo(this.x - camX - 13, this.y - camY - 30);
            ctx.lineTo(this.x - camX - 3, this.y - camY - 21);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(this.x - camX + 3, this.y - camY - 21);
            ctx.lineTo(this.x - camX + 13, this.y - camY - 30);
            ctx.lineTo(this.x - camX + 10, this.y - camY - 21);
            ctx.fill();
            drawShadedBlock(ctx, this.x - camX - 9, this.y - camY, 18, 18, '#fef08a');
            ctx.fillStyle = '#fbcfe8';
            ctx.fillRect(this.x - camX - 3, this.y - camY - 4, 6, 22);
        }

        // 눈/볼 (공용)
        ctx.fillStyle = '#000000';
        ctx.fillRect(this.x - camX - 4, this.y - camY - 12, 2, 4);
        ctx.fillRect(this.x - camX + 2, this.y - camY - 12, 2, 4);
        ctx.fillStyle = '#fca5a5';
        ctx.fillRect(this.x - camX - 6, this.y - camY - 8, 3, 2);
        ctx.fillRect(this.x - camX + 3, this.y - camY - 8, 3, 2);

        // 머리 위 체력바
        drawStatBar(ctx, this.x - camX - 15, this.y - camY - 35, 30, 4, this.hp / this.maxHp, '#10b981');
        ctx.restore();
    }
}
