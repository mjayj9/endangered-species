// ============================================================
// 캐릭터 선택 화면 렌더링
//  - data/classes.js 를 읽어 4직업 카드를 동적으로 생성한다.
//  - 카드 클릭 시 onSelect(key) 콜백 호출.
// ============================================================

import { CLASSES, CLASS_ORDER } from '../data/classes.js';

const BORDER_HOVER = {
    leo: 'hover:border-orange-500',
    aria: 'hover:border-cyan-500',
    taro: 'hover:border-emerald-500',
    lumi: 'hover:border-pink-500',
};

export function renderCharSelect(onSelect) {
    const grid = document.getElementById('char-select-grid');
    grid.innerHTML = '';

    CLASS_ORDER.forEach((key) => {
        const c = CLASSES[key];
        const card = document.createElement('div');
        card.className =
            `group bg-slate-900 border-2 border-slate-800 ${BORDER_HOVER[key]} ` +
            'rounded-xl p-3.5 cursor-pointer transition-all hover:scale-105 text-center';
        card.innerHTML = `
            <div class="text-4xl mb-1.5 group-hover:scale-125 transition-transform">${c.emoji}</div>
            <h3 class="text-sm font-bold" style="color:${c.color}">${c.name} (${c.title})</h3>
            <p class="text-[10px] text-slate-400 mt-1 leading-tight">${c.desc}</p>
            <div class="text-[8px] text-slate-300 bg-slate-950/80 py-0.5 px-1 rounded mt-2">
                HP ${c.stats.hp} · 공격 ${c.stats.atk} · 방어 ${c.stats.def} · 역할 ${c.role}
            </div>`;
        card.onclick = () => onSelect(key);
        grid.appendChild(card);
    });
}
