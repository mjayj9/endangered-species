// ============================================================
// 구조 덫 (Phase 4)
//  - 필드의 덫에 갇힌 멸종위기 동물을 E로 구출하면 펫으로 보유 목록에 합류.
//  - 구출 시 해당 동물의 생태 정보(eco)를 안내한다(Phase 5 도감과 연계 예정).
// ============================================================

import { game } from '../core/game.js';
import { createPet, PETS } from '../data/pets.js';
import { playSound } from '../core/audio.js';
import { startDialogue } from '../ui/dialogue.js';

export class Trap {
    constructor(data) {
        this.animalId = data.animalId;
        this.x = data.x;
        this.y = data.y;
        this.desc = data.desc || '';
        this.radius = 22;
        this.interactRange = 55;
        this.opened = false; // 구출 완료 여부 (인터페이스 통일: overworld 가 opened 로 필터)
    }

    interact() {
        if (this.opened) return;
        this.opened = true;
        playSound('correct');

        const pet = createPet(this.animalId);
        pet.active = false; // 보호소(대기)로 합류 — 파티 편성에서 출전 지정
        game.pets.push(pet);

        // 구출 성공 대화 → 마지막에 도감 자동 등록 알림
        const base = PETS[this.animalId];
        startDialogue({
            start: 'n0',
            nodes: {
                n0: { speaker: base.name, portrait: base.emoji, text: `${this.desc}\n덫을 풀자 ${base.name}이(가) 힘겹게 몸을 일으켰다.`, next: 'n1' },
                n1: { speaker: base.name, portrait: base.emoji, text: base.eco, next: 'n2' },
                n2: {
                    speaker: '📖 도감', portrait: '📖',
                    text: `${base.emoji} ${base.name}의 생태 정보가 도감에 등록되었습니다!\n동물 보호소(메뉴 Tab)에 새 동료로 합류했습니다.`,
                    effect: `encyclopedia.register:${this.animalId}`, end: true,
                },
            },
        });
    }

    draw(ctx, camera, player) {
        const px = this.x - camera.x, py = this.y - camera.y;
        const base = PETS[this.animalId];
        ctx.save();

        if (this.opened) {
            // 구출 완료: 동물만 남기고 표시
            ctx.font = '18px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(base.emoji, px, py);
            ctx.fillStyle = '#34d399';
            ctx.font = "bold 9px 'Nanum Gothic'";
            ctx.fillText('구출 완료', px, py + 14);
            ctx.textAlign = 'start';
            ctx.restore();
            return;
        }

        // 덫(붉은 원 + 톱니) + 갇힌 동물
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(px, py, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#64748b';
        for (let a = 0; a < 8; a++) {
            const ang = (a / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(px + Math.sin(ang) * (this.radius - 3), py + Math.cos(ang) * (this.radius - 3), 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(base.emoji, px, py + 2);

        const dist = player ? Math.hypot(player.x - this.x, player.y - this.y) : Infinity;
        if (dist < this.interactRange) {
            ctx.fillStyle = '#facc15';
            ctx.font = "bold 10px 'Nanum Gothic'";
            ctx.fillText('동물 구출 [E]', px, py - 30);
        }
        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
        ctx.restore();
    }
}
