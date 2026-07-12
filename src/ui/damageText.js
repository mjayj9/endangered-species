// ============================================================
// 떠오르는 텍스트 파티클 (기존 spawnGameTextParticle 이식)
//  - viewport 위에 HTML div 를 절대배치하고 월드좌표→화면좌표로 투영.
//  - 매 프레임 updateDamageTexts(camera) 로 위치/투명도 갱신.
// ============================================================

import { game } from '../core/game.js';

const particles = [];

export function spawnText(worldX, worldY, text, color = '#ffffff') {
    const div = document.createElement('div');
    div.className = 'game-text-particle animate-bounce';
    div.style.color = color;
    div.innerText = text;

    const viewport = game.viewport || document.getElementById('game-viewport');
    if (viewport) viewport.appendChild(div);

    particles.push({ div, x: worldX, y: worldY, offsetY: 1.5, timer: 60 });
}

// 캔버스 표시 크기와 내부 해상도 비율을 반영해 화면 좌표로 투영
export function updateDamageTexts(camera) {
    const canvas = game.canvas;
    const scaleX = canvas ? canvas.clientWidth / canvas.width : 1;
    const scaleY = canvas ? canvas.clientHeight / canvas.height : 1;

    for (let i = particles.length - 1; i >= 0; i--) {
        const dt = particles[i];
        dt.timer--;
        dt.offsetY += 0.04;

        const screenX = (dt.x - camera.x) * scaleX;
        const screenY = (dt.y - camera.y - dt.offsetY * 10) * scaleY;
        dt.div.style.left = `${screenX}px`;
        dt.div.style.top = `${screenY}px`;
        dt.div.style.opacity = dt.timer / 60;

        if (dt.timer <= 0) {
            if (dt.div.parentNode) dt.div.parentNode.removeChild(dt.div);
            particles.splice(i, 1);
        }
    }
}
