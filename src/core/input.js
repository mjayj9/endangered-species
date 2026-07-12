// ============================================================
// 키보드 입력 관리
//  - keys: 현재 눌린 상태(연속 입력용, 이동에 사용)
//  - onAnyKey: 한 번성(edge) 콜백 등록 (전투 화면에서 '아무 키'로 복귀 등)
// ============================================================

export const keys = { w: false, a: false, s: false, d: false, e: false };

const KEY_MAP = { w: 'w', a: 'a', s: 's', d: 'd', e: 'e' };

// '아무 키 눌림'을 한 번만 받아 처리하는 콜백들
const anyKeyListeners = [];

export function onAnyKey(fn) {
    anyKeyListeners.push(fn);
}

export function initInput(getScene) {
    window.addEventListener('keydown', (e) => {
        const mapped = KEY_MAP[e.key.toLowerCase()];
        if (mapped) {
            keys[mapped] = true;
            // 오버월드에서 방향키/스페이스 스크롤 방지
            if (getScene() === 'overworld') e.preventDefault();
        }

        // 등록된 anyKey 콜백 실행 후 비움 (일회성)
        if (anyKeyListeners.length > 0) {
            const pending = anyKeyListeners.splice(0, anyKeyListeners.length);
            pending.forEach((fn) => fn(e));
        }
    });

    window.addEventListener('keyup', (e) => {
        const mapped = KEY_MAP[e.key.toLowerCase()];
        if (mapped) keys[mapped] = false;
    });
}

// 모든 키 상태 초기화(씬 전환 시 잔여 입력 방지)
export function clearKeys() {
    for (const k of Object.keys(keys)) keys[k] = false;
}
