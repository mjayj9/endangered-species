# 🎮 에코 가디언즈 RPG

기존 "에코 가디언즈" 2D 액션 게임을, 같은 세계관·그림체(코드로 그리는 벡터/이모지 스타일)를 유지하면서
레벨업·장비·스킬트리·펫·NPC 퀘스트·턴제 전투·저장 기능을 갖춘 **완전한 RPG**로 재구성하는 프로젝트입니다.

---

## ▶️ 실행 방법 (중요)

이 프로젝트는 **ES Modules(`import`/`export`)** 를 사용하므로 `index.html`을 `file://`로 직접 열면 동작하지 않습니다.
반드시 **로컬 서버**로 실행하세요.

```bash
# 저장소 루트에서
python -m http.server 8000
# 또는: npx serve .   /   VSCode Live Server 확장
```

브라우저에서 `http://localhost:8000/` 접속 → 영웅 선택 → **WASD로 이동**.

### 조작
- **W A S D** : 사방 이동
- **몬스터 접촉** : 전투 씬 진입 (Phase 1은 빈 전투 화면 → 아무 키로 복귀)
- **E** : 상호작용 (다음 Phase에서 활성화)

---

## 📂 폴더 구조

```
index.html                 # 진입 HTML (홈페이지 껍데기 제거, 게임 뷰포트만)
style.css                  # 전역 스타일
src/
├── main.js                # 진입점 + 상태 머신(charSelect→overworld→battle)
├── core/
│   ├── game.js            # 공용 런타임 상태(싱글턴)
│   ├── input.js           # 키보드 입력
│   └── audio.js           # 사운드 합성(Web Audio, 원본 이식)
├── world/
│   ├── camera.js          # 카메라 추적 + 타격 흔들림
│   ├── overworld.js       # 필드 이동/렌더(잔디/장식/몬스터)
│   └── encounter.js       # 몬스터 접촉 → 전투 진입 트리거
├── entities/
│   ├── Hero.js            # 주인공(4직업 도트 렌더 + 이동)
│   └── Enemy.js           # 필드 몬스터 스프라이트
├── battle/
│   └── battleScene.js     # 전투 씬 (Phase 1: placeholder)
├── render/
│   └── primitives.js      # 도형/명암/나무 등 렌더 헬퍼(원본 이식)
├── ui/
│   ├── charSelect.js      # 캐릭터 선택 카드
│   ├── hud.js             # 골드/HP/구역 HUD
│   └── damageText.js      # 떠오르는 텍스트 파티클
└── data/                  # ★ 콘텐츠는 전부 데이터 파일로 분리(확장 용이)
    ├── classes.js         # 4직업 스탯/색상
    ├── monsters.js        # 일반 몬스터 정의
    └── maps.js            # 맵/지역 데이터(에메랄드 숲)
```

**설계 원칙**: 로직과 콘텐츠(데이터)를 분리합니다. 몬스터/맵을 추가할 때는 `src/data/`의
해당 파일에 항목 하나만 추가하면 되도록 설계했습니다. (지역/전투/스킬 등은 이후 Phase에서 이어붙입니다.)

---

## 🗺️ 개발 로드맵 (Phase 1~6)

- **Phase 1 (완료)** — 뼈대 세팅 & 기존 코드 추출. 오버월드 이동 + 카메라 + 에메랄드 숲 렌더,
  몬스터 접촉 시 전투 씬 진입 트리거(빈 전투 화면).
- Phase 2 — 턴제 전투 시스템 완성
- Phase 3 — 레벨업·스탯 성장·인벤토리·장비
- Phase 4 — 4직업 스킬트리 + 펫 파티 시스템
- Phase 5 — NPC 대화·퀘스트·스토리·도감 통합
- Phase 6 — 저장 시스템·던전 3개+최종장·밸런싱
