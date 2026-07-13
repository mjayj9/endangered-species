// ============================================================
// 사이드 퀘스트 정의 (Phase 5)
//  - type: 'collect'(아이템 수집) | 'kill'(몬스터 처치) | 'rescue'(동물 구출)
//  - target: 수집/처치/구출 대상과 수량
//  - reward: { gold, exp, item }
//  - lines: 상태별 NPC 대사(offer/active/ready/done)
//  퀘스트 1개 추가 = 이 객체에 항목 하나 추가.
// ============================================================

export const QUESTS = {
    collect_juice: {
        id: 'collect_juice',
        name: '아픈 다람쥐를 위한 과일즙',
        giver: '마을 아이',
        portrait: '🧒',
        type: 'collect',
        target: { itemId: 'potion', count: 3 },
        reward: { gold: 120, exp: 20, item: 'eco_charm' },
        lines: {
            offer: '누나(형)! 우리 집 다람쥐가 아파요. 생태 과일즙 3개만 구해다 주면 안 돼요? 상인 아저씨한테 팔아요.',
            active: '다람쥐가 아직도 기운이 없어요… 생태 과일즙 3개 부탁해요!',
            ready: '와, 과일즙 가져왔어요?! 다람쥐가 좋아할 거예요. 이거 받으세요!',
            done: '다람쥐가 다시 뛰어다녀요! 정말 고마워요, 수호자님!',
        },
    },
    hunt_sludge: {
        id: 'hunt_sludge',
        name: '오염 슬라임 소탕',
        giver: '숲 순찰대원',
        portrait: '💂',
        type: 'kill',
        target: { monsterId: 'sludge', count: 3 },
        reward: { gold: 150, exp: 30, item: 'hi_potion' },
        lines: {
            offer: '폐수가 뭉친 오염 슬라임이 개울을 더럽히고 있소. 셋만 처치해 주면 물이 맑아질 거요. 맡아 주겠소?',
            active: '오염 슬라임은 개울가에 자주 나타나오. 셋을 처치하면 돌아와 주시오.',
            ready: '개울 물이 다시 맑아졌군! 역시 수호자야. 약속한 보상이오.',
            done: '덕분에 아이들이 다시 개울에서 놀 수 있게 됐소. 고맙소.',
        },
    },
    rescue_eagle: {
        id: 'rescue_eagle',
        name: '그물에 걸린 독수리',
        giver: '수의사',
        portrait: '👩‍⚕️',
        type: 'rescue',
        target: { animalId: 'eagle' },
        reward: { gold: 130, exp: 25, item: 'ether' },
        lines: {
            offer: '북동쪽 덫에 독수리가 그물에 뒤엉켜 있대요. 저는 손이 떨려서… 당신이 구해 주면 제가 치료할게요. 부탁해요.',
            active: '독수리는 북동쪽 덫에 있어요. 구출하면 도감에도 자동으로 기록될 거예요!',
            ready: '독수리를 구했군요! 상태를 보니 곧 회복하겠어요. 정말 고마워요, 이거 받아요.',
            done: '독수리가 다시 하늘을 날았어요. 당신 덕분이에요.',
        },
    },
};
