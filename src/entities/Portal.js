// ============================================================
// 포탈 (Phase 6) — 맵 간 이동(오버월드 ↔ 던전/최종장)
//  - E 로 상호작용하면 화면 전환 연출 중간에 목적지 맵으로 이동.
//  - requires 플래그가 충족되지 않으면 잠김(🔒) 상태로 이동 불가.
// ============================================================

import { game } from '../core/game.js';
import { startTransition } from '../render/transition.js';
import { travelTo } from '../world/overworld.js';
import { spawnText } from '../ui/damageText.js';
import { playSound } from '../core/audio.js';

export class Portal {
    constructor(data) {
        this.to = data.to;
        this.name = data.name;
        this.emoji = data.emoji || '🌀';
        this.color = data.color || '#94a3b8';
        this.x = data.x; this.y = data.y;
        this.spawn = data.spawn || null;      // 목적지 도착 좌표
        this.requires = data.requires || [];
        this.lockedText = data.lockedText || '아직 열 수 없습니다.';
        this.radius = 30;
        this.interactRange = 66;
        this.opened = false; // 인터페이스 통일(포탈은 항상 재사용 가능)
    }

    get locked() { return this.requires.some((f) => !game.flags[f]); }

    interact() {
        if (this.locked) {
            playSound('wrong');
            spawnText(this.x, this.y - 24, '🔒 ' + this.lockedText, '#fca5a5');
            return;
        }
        playSound('correct');
        startTransition(() => travelTo(this.to, this.spawn));
    }

    draw(ctx, camera, player) {
        const px = this.x - camera.x, py = this.y - camera.y;
        ctx.save();

        // 소용돌이 포탈
        const t = Date.now() * 0.004;
        const grad = ctx.createRadialGradient(px, py, 3, px, py, this.radius);
        grad.addColorStop(0, '#020617');
        grad.addColorStop(0.5, this.locked ? '#334155' : this.color);
        grad.addColorStop(1, 'rgba(15,23,42,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, this.radius + Math.sin(t) * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '26px sans-serif';
        ctx.fillText(this.locked ? '🔒' : this.emoji, px, py);

        ctx.fillStyle = this.locked ? '#94a3b8' : '#fde68a';
        ctx.font = "bold 10px 'Nanum Gothic'";
        ctx.fillText(this.name, px, py - this.radius - 8);

        const dist = player ? Math.hypot(player.x - this.x, player.y - this.y) : Infinity;
        if (dist < this.interactRange) {
            ctx.fillStyle = this.locked ? '#f87171' : '#facc15';
            ctx.font = "bold 10px 'Nanum Gothic'";
            ctx.fillText(this.locked ? '잠김 [E]' : '진입 [E]', px, py - this.radius - 22);
        }
        ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
        ctx.restore();
    }
}
