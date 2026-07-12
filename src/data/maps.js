// ============================================================
// 맵/지역 데이터
//  - 새 지역 추가 = 이 객체에 맵 하나 추가 (좌표/장식/충돌/몬스터 배치).
//  - Phase 1에서는 1장 "에메랄드 숲 평원"만 정의한다.
//    사막/설산/늪/최종장은 Phase 6에서 이 파일에 이어붙인다.
// ============================================================

export const MAPS = {
    emerald_forest: {
        id: 'emerald_forest',
        name: '에메랄드 푸른 숲 평원',
        theme: 'forest',
        width: 1800,
        height: 1200,
        ground: '#86efac',        // 잔디 기본색
        spawn: { x: 400, y: 320 }, // 플레이어 시작 위치

        // 정적 충돌 오브젝트 (아래 deco 좌표와 일치시켜 배치)
        obstacles: [
            { x: 400, y: 150, r: 24 },   // 주황 단풍나무
            { x: 600, y: 100, r: 22 },   // 분홍 벚꽃나무
            { x: 1200, y: 450, r: 26 },  // 전나무
            { x: 300, y: 600, r: 24 },   // 초록 나무
            { x: 1000, y: 250, r: 108 }, // 푸른 연못 호수
        ],

        // 장식 오브젝트 (렌더 전용, 충돌은 obstacles 로 별도 관리)
        deco: {
            trees: [
                { x: 400, y: 150, color: '#f97316' }, // 가을 단풍
                { x: 600, y: 100, color: '#fbcfe8' }, // 벚꽃
                { x: 1200, y: 450, color: '#047857' }, // 전나무
                { x: 300, y: 600, color: '#10b981' }, // 상록수
            ],
            pond: { x: 1000, y: 250, r: 110 },
            picnic: { x: 700, y: 400 },
            bench: { x: 200, y: 100 },
        },

        // 몬스터 배치 (data/monsters.js 의 id 참조)
        monsterSpawns: [
            { monsterId: 'sludge', x: 750, y: 520 },
            { monsterId: 'sawbot', x: 1250, y: 720 },
            { monsterId: 'trapdrone', x: 520, y: 820 },
            { monsterId: 'sludge', x: 1400, y: 320 },
        ],
    },
};

// Phase 1 시작 맵
export const START_MAP = 'emerald_forest';
