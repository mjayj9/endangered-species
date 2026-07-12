// ============================================================
// 전투 참가자(Combatant) — 주인공/펫/적을 공통으로 감싼다.
//  - 전투 중 상태(hp/mp/defending/alive)만 담고, 원본 엔티티는 ref 로 참조.
//  - 주인공/펫의 hp/mp 변화는 endBattle 시 원본에 반영된다(펫은 Phase 4에서 확장).
// ============================================================

import { SKILLS } from '../data/skills.js';

export class Combatant {
    constructor(opts) {
        this.name = opts.name;
        this.emoji = opts.emoji;
        this.color = opts.color;
        this.side = opts.side;            // 'ally' | 'enemy'
        this.isPlayer = !!opts.isPlayer;  // 플레이어가 직접 커맨드를 고르는가

        this.maxHp = opts.maxHp;
        this.hp = opts.hp ?? opts.maxHp;
        this.maxMp = opts.maxMp ?? 0;
        this.mp = opts.mp ?? this.maxMp;
        this.atk = opts.atk;
        this.def = opts.def;
        this.spd = opts.spd;

        this.skillIds = opts.skillIds || [];
        this.defending = false;
        this.alive = true;

        this.ref = opts.ref || null;      // 원본 Hero/Enemy(있으면)
    }

    get skills() {
        return this.skillIds.map((id) => SKILLS[id]).filter(Boolean);
    }

    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
        if (this.hp <= 0) this.alive = false;
    }

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    spendMp(amount) {
        this.mp = Math.max(0, this.mp - amount);
    }

    restoreMp(amount) {
        this.mp = Math.min(this.maxMp, this.mp + amount);
    }
}
