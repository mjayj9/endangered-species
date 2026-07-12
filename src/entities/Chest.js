// ============================================================
// 보물상자 (Phase 3)
//  - 가까이 가서 E 로 열면 골드 + 확률 아이템을 획득한다.
//  - 한 번 열면 비활성(열린 모양)으로 남는다.
// ============================================================

import { game } from '../core/game.js';
import { addItem } from '../systems/inventory.js';
import { ITEMS } from '../data/items.js';
import { spawnText } from '../ui/damageText.js';
import { playSound } from '../core/audio.js';

export class Chest {
    constructor(data) {
        this.x = data.x;
        this.y = data.y;
        this.gold = data.gold || 0;
        this.loot = data.loot || [];
        this.radius = 20;
        this.interactRange = 55;
        this.opened = false;
    }

    interact() {
        if (this.opened) return;
        this.opened = true;
        playSound('correct');

        game.gold += this.gold;
        spawnText(this.x, this.y - 10, `골드 +${this.gold}`, '#facc15');

        // 확률 아이템 드롭
        let dy = 24;
        this.loot.forEach((d) => {
            if (Math.random() < d.chance) {
                addItem(d.itemId, 1);
                spawnText(this.x, this.y - 10 - dy, `${ITEMS[d.itemId].emoji} ${ITEMS[d.itemId].name} 획득!`, '#34d399');
                dy += 16;
            }
        });
    }

    draw(ctx, camera, player) {
        const px = this.x - camera.x, py = this.y - camera.y;
        ctx.save();
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.opened ? '📭' : '🎁', px, py);

        if (!this.opened) {
            const dist = player ? Math.hypot(player.x - this.x, player.y - this.y) : Infinity;
            if (dist < this.interactRange) {
                ctx.fillStyle = '#facc15';
                ctx.font = "bold 10px 'Nanum Gothic'";
                ctx.fillText('상자 열기 [E]', px, py - 22);
            }
        }
        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
        ctx.restore();
    }
}
