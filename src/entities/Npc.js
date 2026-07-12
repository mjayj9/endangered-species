// ============================================================
// NPC (Phase 3: 허브 마을 상점 상인)
//  - 가까이 가서 E 로 상호작용하면 상점 UI를 연다.
//  - 대화/퀘스트 NPC는 Phase 5에서 확장한다.
// ============================================================

import { openShop } from '../ui/shop.js';

export class Npc {
    constructor(data) {
        this.type = data.type;       // 'shop'
        this.name = data.name;
        this.emoji = data.emoji;
        this.x = data.x;
        this.y = data.y;
        this.radius = 26;
        this.interactRange = 60;
    }

    interact() {
        if (this.type === 'shop') openShop();
    }

    draw(ctx, camera, player) {
        const px = this.x - camera.x, py = this.y - camera.y;
        ctx.save();

        // 그림자
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(px, py + 22, 20, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // 상점 좌판 + 상인
        ctx.font = '34px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🏪', px, py - 6);
        ctx.fillText(this.emoji, px, py + 16);

        // 이름표
        ctx.fillStyle = '#fde68a';
        ctx.font = "bold 10px 'Nanum Gothic'";
        ctx.fillText(this.name, px, py - 30);

        // 근처면 상호작용 안내
        const dist = player ? Math.hypot(player.x - this.x, player.y - this.y) : Infinity;
        if (dist < this.interactRange) {
            ctx.fillStyle = '#facc15';
            ctx.font = "bold 10px 'Nanum Gothic'";
            ctx.fillText('상점 열기 [E]', px, py - 44);
        }

        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
        ctx.restore();
    }
}
