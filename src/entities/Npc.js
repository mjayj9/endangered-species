// ============================================================
// NPC (Phase 5: 상점 상인 / 스토리 대화 NPC / 퀘스트 NPC)
//  - 가까이 가서 E 로 상호작용.
//    · type 'shop'   → 상점 UI
//    · type 'story'  → dialogueId 대화 트리
//    · type 'quest'  → 퀘스트 상태에 맞는 대화(수락/진행/완료)
// ============================================================

import { openShop } from '../ui/shop.js';
import { startDialogue } from '../ui/dialogue.js';
import { buildQuestDialogue, questState } from '../systems/quests.js';

export class Npc {
    constructor(data) {
        this.type = data.type;
        this.name = data.name;
        this.emoji = data.emoji;
        this.dialogueId = data.dialogueId;
        this.questId = data.questId;
        this.x = data.x;
        this.y = data.y;
        this.radius = 26;
        this.interactRange = 60;
    }

    interact() {
        if (this.type === 'shop') openShop();
        else if (this.type === 'quest') startDialogue(buildQuestDialogue(this.questId));
        else startDialogue(this.dialogueId);
    }

    // 퀘스트 NPC 머리 위 표식: 제안 가능(❗) / 완료 가능(❓처럼 노란 별)
    questMarker() {
        if (this.type !== 'quest') return null;
        const st = questState(this.questId);
        if (st === 'inactive') return '❗';
        if (st === 'active') return '…';
        return null;
    }

    draw(ctx, camera, player) {
        const px = this.x - camera.x, py = this.y - camera.y;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 그림자
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(px, py + 20, 18, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        if (this.type === 'shop') {
            ctx.font = '34px sans-serif';
            ctx.fillText('🏪', px, py - 6);
            ctx.fillText(this.emoji, px, py + 16);
        } else {
            ctx.font = '30px sans-serif';
            ctx.fillText(this.emoji, px, py);
        }

        // 퀘스트 표식(둥실둥실)
        const marker = this.questMarker();
        if (marker) {
            ctx.font = "bold 16px 'Jua', sans-serif";
            ctx.fillStyle = marker === '❗' ? '#facc15' : '#94a3b8';
            ctx.fillText(marker, px + 14, py - 22 + Math.sin(Date.now() * 0.005) * 2);
        }

        // 이름표
        ctx.fillStyle = '#fde68a';
        ctx.font = "bold 10px 'Nanum Gothic'";
        ctx.fillText(this.name, px, py - 28);

        // 근처면 상호작용 안내
        const dist = player ? Math.hypot(player.x - this.x, player.y - this.y) : Infinity;
        if (dist < this.interactRange) {
            ctx.fillStyle = '#facc15';
            ctx.font = "bold 10px 'Nanum Gothic'";
            ctx.fillText(this.type === 'shop' ? '상점 열기 [E]' : '대화 [E]', px, py - 42);
        }

        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
        ctx.restore();
    }
}
