// ============================================================
// 지역보스 + 최종보스 데이터 (Phase 6: 전투 스탯 · 멀티 페이즈 · 서사 대사)
//  - 세 보스(밥/잭/독스)는 배후 "잿빛 컨소시엄"에게 고용·명령받는 하수인.
//  - phases: 체력 구간별 패턴. phases[0]=시작(threshold 1). 이후 threshold 이하로
//    떨어지면 다음 페이즈로 전환(공격 배수 변화 + 대사 배너).
//  - lines: start(전투 시작) / phase별 line / defeat(패배). 전투 중 배너로 출력.
// ============================================================

export const BOSSES = {
    bob: {
        id: 'bob', name: '벌목단 우두머리 밥', emoji: '🚜', theme: 'desert', chapter: 2,
        stats: { hp: 900, maxHp: 900, mp: 0, maxMp: 0, atk: 34, def: 12, spd: 8 },
        exp: 220, gold: 260,
        drops: [{ itemId: 'guardian_blade', chance: 0.5 }, { itemId: 'bark_mail', chance: 0.6 }],
        startLine: '멈춰라. 이 나무들은… 내 계약이야. 물러서면 다치지 않게 해주지.',
        phases: [
            { threshold: 1.0, atkMult: 1.0 },
            { threshold: 0.5, atkMult: 1.4, line: '제발… 그냥 가! 할당량을 못 채우면 우리 마을이 통째로 쫓겨난단 말이야!' },
        ],
        defeatLine: '나도… 이게 옳지 않다는 건 알았어. 잿빛 로고가 찍힌 서류만 아니었어도… 미안하다, 숲아.',
        motive: '고향 마을이 빚에 넘어가자 가족을 지키려 잿빛 컨소시엄의 벌목 계약을 받아들였다.',
    },
    jack: {
        id: 'jack', name: '밀렵 포수 잭', emoji: '🚁', theme: 'snow', chapter: 3,
        stats: { hp: 1500, maxHp: 1500, mp: 0, maxMp: 0, atk: 56, def: 18, spd: 12 },
        exp: 380, gold: 420,
        drops: [{ itemId: 'guardian_blade', chance: 0.6 }, { itemId: 'spirit_ring', chance: 0.5 }],
        startLine: '한때 나도 이 짐승들을 지켰지. …웃기지 않나? 이제 내 손으로 잡는다.',
        phases: [
            { threshold: 1.0, atkMult: 1.0 },
            { threshold: 0.5, atkMult: 1.5, line: '그들은 사람의 약점을 정확히 알아. 누명을 씌우고, 복수심을 미끼로 던지지. 너도 곧 알게 될 거다!' },
        ],
        defeatLine: '내가 지키려던 걸… 내 손으로 잡고 있었어. 이제야 눈이 뜨이는군. 그 잿빛 놈들을… 막아줘.',
        motive: '멸종위기종을 지키던 감시원이었으나 조직의 함정에 누명을 쓰고 쫓겨나 포섭되었다.',
    },
    dox: {
        id: 'dox', name: '폐기물 유기 대장 독스', emoji: '🚛', theme: 'swamp', chapter: 4,
        stats: { hp: 2200, maxHp: 2200, mp: 0, maxMp: 0, atk: 80, def: 24, spd: 12 },
        exp: 600, gold: 700,
        drops: [{ itemId: 'legend_amulet', chance: 0.4 }, { itemId: 'guardian_blade', chance: 0.7 }],
        startLine: '나는 시키는 대로 했을 뿐이야. 명령서에 서명한 건 내가 아니라고!',
        phases: [
            { threshold: 1.0, atkMult: 1.0 },
            { threshold: 0.5, atkMult: 1.5, line: '진짜 책임자는 얼굴도 본 적 없어… 잿빛 로고가 찍힌 서류만 올 뿐! 그래서 나도 멈출 수가 없었다고!' },
        ],
        defeatLine: '매일… 늪이 죽어가는 걸 봤어. 알면서도 서명했지. 그 위에 있는 자를 끌어내려. 부탁이야.',
        motive: '거대 공장의 하급 관리자로 상부 지시서대로 폐기물을 늪에 버려 왔다.',
    },

    // ===== 최종보스 (5장) — 잿빛 컨소시엄의 정체 =====
    consortium: {
        id: 'consortium', name: '잿빛 의장 · 시네리스', emoji: '🕴️', theme: 'ashen', chapter: 5,
        stats: { hp: 3600, maxHp: 3600, mp: 0, maxMp: 0, atk: 120, def: 34, spd: 16 },
        exp: 1500, gold: 2000,
        drops: [{ itemId: 'legend_amulet', chance: 1.0 }, { itemId: 'guardian_blade', chance: 1.0 }],
        startLine: '어서 오게, 수호자. 밥도, 잭도, 독스도… 다들 내 서류 한 장에 움직였지. 사람이란 참 값싼 자원이야.',
        phases: [
            { threshold: 1.0, atkMult: 1.0 },
            { threshold: 0.66, atkMult: 1.3, line: '자연? 사람? 전부 장부의 숫자일 뿐. 이익 앞에선 숲도 마을도 소모품이다.' },
            { threshold: 0.33, atkMult: 1.7, line: '나를 쓰러뜨려도 소용없어. 잿빛 컨소시엄은 이름일 뿐, 탐욕은 어디에나 다시 자라니까!' },
        ],
        defeatLine: '이럴 리가… 숫자로 계산되지 않는 힘이라니. …어쩌면, 내가 놓친 변수가 바로 그것이었나.',
        motive: '세 지역의 파괴를 모두 사주한 자본 연합의 의장. 이익을 위해 사람도 자연도 소모품으로 쓴다.',
    },
};

// 배후 세력(최종장 요약)
export const FINAL_FOE = {
    id: 'consortium',
    name: '잿빛 컨소시엄',
    hint: '세 지역의 파괴를 모두 사주한 정체불명의 자본 연합.',
};

// 지역보스 3인 (최종장 개방 조건: 이 셋을 모두 격파)
export const REGION_BOSS_IDS = ['bob', 'jack', 'dox'];
