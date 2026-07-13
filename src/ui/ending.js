// ============================================================
// 엔딩 화면 (Phase 6) — 최종보스 격파 시 표시
//  - 짧은 마무리 대사 + 플레이 완료 요약 + 크레딧 + 다시 시작.
// ============================================================

import { game } from '../core/game.js';
import { playSound } from '../core/audio.js';
import { PETS } from '../data/pets.js';

export function showEnding() {
    playSound('correct');
    const el = document.getElementById('ending-screen');
    if (!el) return;

    const hero = game.player;
    const rescued = game.encyclopedia.length;
    const total = Object.keys(PETS).length;

    document.getElementById('ending-body').innerHTML = `
        <div class="text-5xl mb-3">🌏✨🐯🐻🦅</div>
        <h2 class="text-2xl md:text-3xl font-black text-emerald-300 fancy-title mb-3">지구가 숨을 되찾았다</h2>
        <p class="text-slate-300 text-xs md:text-sm leading-relaxed max-w-lg mx-auto mb-2">
            잿빛 의장 시네리스가 쓰러지자, 세 지역의 파괴 명령서도 함께 멈췄다.
            밥은 마을로, 잭은 설산의 감시원으로, 독스는 늪의 정화 작업으로 돌아갔다.
            숫자로 계산되지 않는 힘 — 생명을 아끼는 마음이, 끝내 탐욕을 이겼다.
        </p>
        <p class="text-emerald-200 text-xs md:text-sm mb-4">
            하지만 탐욕은 어디서든 다시 자란다. 수호자여, 앞으로도 이 푸른 지구를 지켜다오.
        </p>
        <div class="bg-slate-950/70 rounded-xl p-3 border border-emerald-700 max-w-sm mx-auto text-left text-xs text-slate-200 mb-4">
            <div class="text-emerald-300 font-black mb-1.5 text-center">— 수호 기록 —</div>
            <div class="flex justify-between"><span>수호자</span><b style="color:${hero.color}">${hero.name} · Lv.${hero.level}</b></div>
            <div class="flex justify-between"><span>보유 골드</span><b class="text-yellow-300">${game.gold}G</b></div>
            <div class="flex justify-between"><span>도감 등록</span><b class="text-emerald-300">${rescued}/${total} 종</b></div>
            <div class="flex justify-between"><span>지역보스 격파</span><b class="text-rose-300">밥 · 잭 · 독스 · 시네리스</b></div>
        </div>
        <div class="text-[11px] text-slate-500 mb-4">
            에코 가디언즈: 멸종위기 수호 연대기 · 완결<br>Made with 🌱 — Vanilla JS + HTML5 Canvas
        </div>
        <button id="ending-restart" class="rpg-btn">✦ 처음부터 다시 시작</button>`;

    el.classList.remove('hidden');
    document.getElementById('ending-restart').onclick = () => location.reload();
}
