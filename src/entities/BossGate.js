// ============================================================
// 보스 관문 (Phase 6) — 던전 최심부의 보스 도전 지점
//  - 던전 몬스터를 모두 소탕해야(부하가 남아 있으면 불가) 도전 가능.
//  - E 로 보스 멀티 페이즈 전투 시작. 격파 시 flags['boss_<id>'] 설정.
// ============================================================

import { game } from '../core/game.js';
import { startBossBattle } from '../battle/battleScene.js';
import { spawnText } from '../ui/damageText.js';
import { playSound } from '../core/audio.js';
import { BOSSES } from '../data/bosses.js';

export class BossGate {
    constructor(data) {
        this.bossId = data.bossId;
        this.x = data.x; this.y = data.y;
        this.radius = 34;
        this.interactRange = 74;
    }

    get defeated() { return !!game.flags['boss_' + this.bossId]; }
    // 이미 격파했으면 상호작용 대상에서 제외(overworld 가 opened 로 필터)
    get opened() { return this.defeated; }

    interact() {
        if (this.defeated) return;
        if (game.monsters.length > 0) {
            playSound('wrong');
            spawnText(this.x, this.y - 24, '부하들을 먼저 소탕하라!', '#fca5a5');
            return;
        }
        startBossBattle(this.bossId);
    }

    draw(ctx, camera, player) {
        const px = this.x - camera.x, py = this.y - camera.y;
        const boss = BOSSES[this.bossId];
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 위압적인 대형 관문
        const grad = ctx.createRadialGradient(px, py, 4, px, py, this.radius + 10);
        grad.addColorStop(0, '#7f1d1d');
        grad.addColorStop(1, 'rgba(15,23,42,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, this.radius + 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '40px sans-serif';
        ctx.globalAlpha = this.defeated ? 0.4 : 1;
        ctx.fillText(boss.emoji, px, py);
        ctx.globalAlpha = 1;

        ctx.fillStyle = this.defeated ? '#94a3b8' : '#fca5a5';
        ctx.font = "bold 11px 'Nanum Gothic'";
        ctx.fillText(this.defeated ? `${boss.name} (격파 완료)` : boss.name, px, py - this.radius - 14);

        if (!this.defeated) {
            const dist = player ? Math.hypot(player.x - this.x, player.y - this.y) : Infinity;
            if (dist < this.interactRange) {
                const ready = game.monsters.length === 0;
                ctx.fillStyle = ready ? '#facc15' : '#94a3b8';
                ctx.font = "bold 11px 'Nanum Gothic'";
                ctx.fillText(ready ? '보스 도전 [E]' : '부하 소탕 필요', px, py - this.radius - 30);
            }
        }
        ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
        ctx.restore();
    }
}
