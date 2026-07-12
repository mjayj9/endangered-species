// ============================================================
// 데미지/회복 계산 공식 (문서 "5. 전투 시스템" 기본안)
//   최종 데미지 = max(1, 공격력 * (스킬위력/100) - 방어력 * 0.5)  × (±10% 랜덤)
//  - 기본 공격은 power = 100 으로 호출.
//  - 방어 태세(defending)면 받는 피해를 절반으로.
// ============================================================

export function computeDamage(attacker, defender, power = 100) {
    const base = attacker.atk * (power / 100) - defender.def * 0.5;
    let dmg = Math.max(1, base);

    // ±10% 랜덤 편차
    dmg *= 0.9 + Math.random() * 0.2;

    // 방어 커맨드 사용 중이면 절반
    if (defender.defending) dmg *= 0.5;

    return Math.max(1, Math.round(dmg));
}

// 회복량: 시전자 공격력 기반 (스킬 power = 회복 배율)
export function computeHeal(caster, power = 100) {
    return Math.max(1, Math.round(caster.atk * (power / 100)));
}
