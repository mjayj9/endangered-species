// ============================================================
// 카메라 (부드러운 추적 + 타격 흔들림)
//  - 기존 3d.html 의 cameraX/cameraY 보간 및 cameraShakeIntensity 이식.
// ============================================================

export class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.shake = 0; // 흔들림 강도
    }

    // 대상(플레이어)을 화면 중앙에 두도록 부드럽게 추적
    follow(target, canvas, worldW, worldH) {
        const targetX = target.x - canvas.width / 2;
        const targetY = target.y - canvas.height / 2;
        this.x += (targetX - this.x) * 0.1;
        this.y += (targetY - this.y) * 0.1;

        // 월드 경계 고정
        this.x = Math.max(0, Math.min(this.x, worldW - canvas.width));
        this.y = Math.max(0, Math.min(this.y, worldH - canvas.height));
    }

    // 타격 시 흔들림 추가
    addShake(intensity) {
        this.shake = Math.max(this.shake, intensity);
    }

    // 렌더 시작 시 흔들림 오프셋 적용(ctx.save 이후 호출). 감쇄까지 처리.
    applyShake(ctx) {
        if (this.shake > 0) {
            this.shake *= 0.9;
            ctx.translate(
                (Math.random() - 0.5) * this.shake,
                (Math.random() - 0.5) * this.shake
            );
            if (this.shake < 0.1) this.shake = 0;
        }
    }
}
