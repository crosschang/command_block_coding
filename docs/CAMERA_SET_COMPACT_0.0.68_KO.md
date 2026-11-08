# CAMERA SET Reporter 간소화 — 0.0.68

## 사용자 확인 사항

기존 CAMERA 메인 → SET → `camera SET options`를 펼치면 Ease·Position·Orientation·Mode·View Offset·Entity Offset이 한꺼번에 나오는 문제가 있었습니다. 이번 변경은 CAMERA UI의 `src/blocks/camera_blocks.ts`만 수정해, 모든 입력을 하나의 Reporter에 집중시키지 않는 방식으로 개선합니다.

## 새 블록 구조

```
CAMERA target [Selector] command [Action Reporter]
  └ SET preset [기본 / Custom ID]
       └ 확장 (+) → ease [선택] settings [설정 Reporter 선택]
            ├ SET default
            ├ SET position [...] (+orientation 선택)
            ├ SET orientation [Rotation / Facing]
            ├ SET view offset [...]
            ├ SET entity offset [...]
            ├ SET offsets view [...] entity [...]
            └ SET rotation [...] (+view/entity offset 선택)
```

- Preset-only SET 및 선택 Ease 입력도 지원합니다.
- `ease`와 `settings`에는 기본 Shadow를 **연결하지 않습니다**. 펼친 것만으로 옵션이 활성화되지 않습니다.
- 기존 `mcfunction_camera_action_set_compact`, `mcfunction_camera_set_options` 등 블록 ID와 함수는 남겨두되 toolbox에서는 숨깁니다.
- 기존의 저장된 큰 SET 블록은 MakeCode가 자동 교체하지 않습니다. **새 CAMERA 블록을 드래그해서 SET Reporter를 선택해야 새 간소화 UI를 볼 수 있습니다.**
- 기존 AST·Adapter·Compiler·Validator·FADE·FOV·ENTITY·SPLINE 코드 및 진단 처리에는 변화가 없습니다.
- 컴파일러는 옵션을 AST에서 생성합니다. 명령 문자열을 Reporter에서 조립하지 않습니다.
- `.mcfunction` 파일 출력/저장 기능을 추가하지 않았습니다.

## 확인 순서

1. 기존 MakeCode 작업공간 백업
2. 이번 전체본 또는 패치 중 하나만 적용 (중복 덮어쓰기 불필요)
3. CAMERA 카테고리에서 **새 CAMERA 메인 블록** 드래그: SET의 Shadow가 새 `mcfunction_camera_action_set_composed`인지 확인
4. SET +를 펼쳤을 때 `ease`, `settings` **두 개의 입력만** 나오는지 확인
5. `settings`에 `SET position`, `SET default`, `SET orientation`, `SET offsets` 등을 교체 연결
6. 기본/Custom Preset을 모두 교체 가능해야 함
7. JavaScript↔Blocks 왕복과 PREVIEW 명령 출력 확인
8. FADE, FOV, ENTITY, Spline 회귀 검사

## 로컬 회귀 테스트

```bash
node tests/CAMERA_0.0.68_SET_COMPOSITION_REGRESSION.cjs
node tests/CAMERA_0.0.68_FOV_ENTITY_FADE_REGRESSION.cjs
```

로컬 테스트는 `AST→Validator→Compiler` 수준입니다. 실제 MakeCode/PXT 빌드 및 Bedrock/Education 게임 실행은 아직 검증하지 않았습니다.

## GitHub 접근 상태

2026-10-17 현재 연결된 GitHub 도구에서 `crosschang/block_command_maker` 접근을 시도하면 404가 반환되어 직접 커밋하지 않았습니다. GitHub 플러그인의 Repository access에서 이 저장소 접근 권한이 있는지 확인이 필요합니다.
