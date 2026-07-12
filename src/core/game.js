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

    // 파티 편성: 전투 출전(active, 주인공 제외 펫) / 대기(bench)
    //  - Phase 2에서는 교체 커맨드 시험용 더미 펫이 들어간다(Phase 4에서 실제 구현).
    party: { active: [], bench: [] },

    // 소비 아이템 인벤토리 { itemId: 개수 } — Phase 3에서 확장
    inventory: {},

    // 화면 전환 연출 상태
    transition: { active: false, t: 0, dir: 1, onMid: null },

    // 전투 진입 시 상대 몬스터 데이터 (Phase 2에서 실제 전투에 사용)
    pendingBattle: null,
};
