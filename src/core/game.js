// ============================================================
// 공용 게임 상태(싱글턴)
//  - 캔버스 게임 특성상 여러 모듈이 공유하는 런타임 상태를 한 곳에 모은다.
//  - 콘텐츠 데이터(data/*)와 달리, 이 객체는 "현재 실행 상태"만 담는다.
//  - Phase 진행에 따라 필드(파티/인벤토리/퀘스트 플래그 등)가 확장될 자리다.
// ============================================================

export const game = {
    // 캔버스 참조
    canvas: null,
    ctx: null,
    viewport: null,

    // 현재 씬: 'charSelect' | 'overworld' | 'battle'
    scene: 'charSelect',

    // 선택된 주인공 직업 키 (data/classes.js)
    heroKey: 'leo',

    // 엔티티
    player: null,        // entities/Hero 인스턴스
    camera: null,        // world/camera Camera 인스턴스
    monsters: [],        // 현재 맵의 필드 몬스터(스프라이트)

    // 현재 맵 데이터(data/maps.js 의 맵 객체)
    map: null,

    // 자원(재화) — Phase 3에서 상점/전투 보상과 연동
    gold: 0,

    // 보유 펫 전체(각 인스턴스의 active 플래그로 전투 출전 여부 지정).
    //  - 출전 펫 = pets.filter(p => p.active) (최대 2, 주인공 포함 3).
    //  - '동물 보호소' 파티 편성 UI에서 관리한다.
    pets: [],

    // 소비 아이템 인벤토리 { itemId: 개수 }
    inventory: {},

    // 장비: 보유(미장착) 목록 + 장착 슬롯 3종
    bag: [],
    equipped: { weapon: null, armor: null, accessory: null },

    // 오버레이 UI 상태: 'none' | 'menu' | 'shop' | 'dialogue' (열려 있으면 오버월드 갱신 정지)
    overlay: 'none',

    // 퀘스트 진행 상태 { questId: 'active' | 'complete' } (Phase 6에서 localStorage 저장)
    quests: {},
    // 처치 카운트 등 퀘스트 진행 수치 { questId: number }
    questProgress: {},
    // 스토리 플래그 { key: true } (오프닝/배후 세력 떡밥 등)
    flags: {},
    // 도감 등록된 동물 id 목록
    encyclopedia: [],

    // 화면 전환 연출 상태
    transition: { active: false, t: 0, dir: 1, onMid: null },

    // 전투 진입 시 상대 몬스터 데이터 (Phase 2에서 실제 전투에 사용)
    pendingBattle: null,
};
