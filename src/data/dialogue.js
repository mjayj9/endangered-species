// ============================================================
// 대사 트리 데이터 (Phase 5)
//  - 노드: { speaker, portrait, text, next?, choices?, effect?, end? }
//    · choices: [{ label, next?, effect? }]  선택지 분기
//    · effect:  'flag.set:key' | 'encyclopedia.register:id' | 'quest.accept:id' | 'quest.complete:id'
//    · next 없고 choices 없으면 클릭 시 종료(end 취급)
//  - 퀘스트 대사는 systems/quests.js 에서 상태에 따라 동적으로 생성한다.
// ============================================================

export const DIALOGUES = {
    // ---------------- 오프닝(게임 시작 자동 재생) ----------------
    intro: {
        start: 'n0',
        nodes: {
            n0: { speaker: '마을 원로', portrait: '🧓', text: '드디어 깨어났구나, 젊은 수호자여. 에메랄드 숲에 온 걸 환영한다.', next: 'n1' },
            n1: { speaker: '마을 원로', portrait: '🧓', text: '요즘 숲 곳곳에서 이상한 기계 소리가 들려. 나무가 베이고, 늪이 검게 물들고… 야생동물들이 덫에 걸려 울부짖는다.', next: 'n2' },
            n2: { speaker: '마을 원로', portrait: '🧓', text: '사막의 벌목단, 설산의 밀렵꾼, 독늪의 폐기물 유기범. 셋 다 제각각인 줄 알았는데, 하나같이 같은 잿빛 로고가 찍힌 명령서를 들고 있더군.', next: 'n3' },
            n3: { speaker: '마을 원로', portrait: '🧓', text: '누군가 뒤에서 이 모든 파괴를 사주하고 있어. 하지만 우린 힘이 없다. …네가 가진 수호의 힘이라면 다르겠지.', next: 'n4' },
            n4: {
                speaker: '마을 원로', portrait: '🧓',
                text: '부탁이다. 덫에 걸린 동물들을 구하고, 파괴단을 막아 이 지역들을 되찾아다오. 떠나 주겠느냐?',
                choices: [
                    { label: '숲을 지키겠습니다', next: 'yes', effect: 'flag.set:intro_done' },
                    { label: '왜 하필 저죠?', next: 'why' },
                ],
            },
            why: { speaker: '마을 원로', portrait: '🧓', text: '이 힘은 아무에게나 깃들지 않아. 생명을 아끼는 마음이 있어야 반응하지. …네겐 그게 있다. 그래서다.', next: 'yes' },
            yes: {
                speaker: '마을 원로', portrait: '🧓',
                text: '고맙다. 우선 마을을 둘러보렴. 연구소 박사가 유용한 정보를 줄 게다. 필요한 건 상인에게서 구하고. 부디 몸조심하거라.',
                effect: 'flag.set:intro_done', end: true,
            },
        },
    },

    // ---------------- 마을 원로(반복 대화: 배후 세력 떡밥) ----------------
    elder: {
        start: 'n0',
        nodes: {
            n0: { speaker: '마을 원로', portrait: '🧓', text: '세 지역의 우두머리들… 밥, 잭, 독스. 악당이라기엔 눈빛이 너무 지쳐 있었어.', next: 'n1' },
            n1: { speaker: '마을 원로', portrait: '🧓', text: '그들도 누군가에게 쫓기고 있는 걸지 몰라. 진짜 적은 명령서에 서명한 얼굴 없는 자들 — "잿빛 컨소시엄"이다.', next: 'n2' },
            n2: { speaker: '마을 원로', portrait: '🧓', text: '언젠가 그 실체와 마주하게 될 게다. 그때까지, 한 걸음씩. 눈앞의 생명부터 구하렴.', end: true },
        },
    },

    // ---------------- 생태 연구소 박사(환경 지식 + 보스 정보) ----------------
    doctor: {
        start: 'n0',
        nodes: {
            n0: {
                speaker: '이나 박사', portrait: '👩‍🔬',
                text: '오, 새 수호자! 마침 잘 왔어요. 뭐가 제일 궁금해요?',
                choices: [
                    { label: '동물들이 왜 위험한가요?', next: 'eco' },
                    { label: '파괴단은 뭐하는 자들이죠?', next: 'foe' },
                    { label: '나중에요', next: 'bye' },
                ],
            },
            eco: { speaker: '이나 박사', portrait: '👩‍🔬', text: '길 하나가 숲을 가르면, 동물들은 먹이 찾을 터전이 뚝 끊겨요. 그래서 "생태통로" 같은 연결로가 중요하죠. 우리가 덫을 없애고 서식지를 이어주면 개체 수가 되살아나요.', next: 'eco2' },
            eco2: { speaker: '이나 박사', portrait: '👩‍🔬', text: '바다도 마찬가지예요. 상괭이는 버려진 폐그물에 걸려 숨을 못 쉬어 죽어요. 쓰레기 하나 덜 버리는 게, 생각보다 큰 생명을 살린답니다.', next: 'menu' },
            foe: { speaker: '이나 박사', portrait: '👩‍🔬', text: '표면적으론 벌목·밀렵·폐기물 처리업자들이에요. 그런데 세 곳의 장비에서 똑같은 잿빛 각인을 발견했어요. 우연이 아니에요.', next: 'foe2' },
            foe2: { speaker: '이나 박사', portrait: '👩‍🔬', text: '누군가 세 지역을 동시에 망가뜨려 이득을 챙기고 있어요. …아직 정체는 몰라요. 하지만 당신이 보스들을 만나면, 그 입에서 실마리가 나올 거예요.', next: 'menu' },
            menu: {
                speaker: '이나 박사', portrait: '👩‍🔬', text: '더 궁금한 게 있나요?',
                choices: [
                    { label: '동물 얘기 더', next: 'eco' },
                    { label: '파괴단 얘기 더', next: 'foe' },
                    { label: '그만 들을게요', next: 'bye' },
                ],
            },
            bye: { speaker: '이나 박사', portrait: '👩‍🔬', text: '구출한 동물은 자동으로 도감에 기록돼요. 메뉴(Tab)에서 확인해요. 조심히 다녀와요!', end: true },
        },
    },
};
