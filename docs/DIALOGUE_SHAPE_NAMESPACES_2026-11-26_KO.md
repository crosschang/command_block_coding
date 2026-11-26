# Dialogue 블록을 모양별 두 네임스페이스로 분리 — 2026-11-26

## 사용자 의도
- 이전 `DialogueScene`, `DialogueButton`, `DialogueEvent`는 Scene·Button·Event **기능별** 메뉴 분리여서 요청과 달랐다.
- 정확한 요청은 커스텀 Dialogue 블록의 **C자형**과 **원블록(단일 블록)** 작성 방식을 **두 네임스페이스**로 구분하는 것이다.
- 향후 Execute 조립식 C자형 설계에도 같은 원칙을 검토한다. 단, 이번 변경은 Execute를 구현하거나 수정하지 않는다.

## 신규 MakeCode 카테고리
| Namespace | 표시 메뉴 | 포함 블록 |
| --- | --- | --- |
| `DialogueC` | **DIALOGUE C자형** | `file`(파일 정의), `scene`, `button`, `openSection`, `closeSection` |
| `DialogueOne` | **DIALOGUE 원블록** | `choices`, `typed`, `choice`, `none`, `open`/`close`, `openNone`/`closeNone`, `command`/`sectionCommand`/`onOpen`/`onClose` |

- 두 네임스페이스 내부에는 파일·장면·버튼·이벤트 등 하위 **그룹**이 있다. Scene·Button·Event를 별개의 네임스페이스 세 개로 표시하지 않는다.
- 원블록은 콜백 C자형 영역이 **없는 블록**을 뜻한다. 값 블록과 단독 명령 블록, 다수 입력칸을 가진 하나짜리 Scene choices / Typed Scene 블록 모두 여기에 포함한다.
- `ResourceText`, `LanguageFile`, `ResourceFiles`는 Dialogue 작성 방식과 별개인 공통 기능이므로 변경하지 않는다.

## 기존 프로젝트 호환성과 의미 보존
- 신규 `src/blocks/dialogue_shape_namespaces.ts` 파일에 새 공개 블록 ID 17개를 정의한다.
- 이전 `DialogueScene / DialogueButton / DialogueEvent` 공개 API와 블록 ID 16개는 그대로 두고 `blockHidden=true`로 도구상자에서만 숨긴다.
- 과거 `DialogueFile.define`의 블록 ID도 삭제하지 않고 숨긴다. 이제 파일 정의는 `DialogueC.file`에서 노출한다.
- 새 네임스페이스 API는 기존 `DialogueFile.*` 함수로 위임한다. AST, Parser, Validator, Compiler, JSON Codec과 동작 시점을 변경하지 않는다.
- 기존 C자형의 연결 공간에는 물리적 연결 제한이나 순서 잠금이 추가되지 않았다. 유효하지 않은 중첩은 현재 Resource Project 문맥 검사로 진단한다.
- `pxt.json.files`에 신규 TS 파일 하나만 등록하며 `pxt.json.version=0.0.25`와 대상 버전 `2.2.14`는 변경하지 않는다.

## 변경 파일
- 신규: `src/blocks/dialogue_shape_namespaces.ts`, `tests/DIALOGUE_SHAPE_NAMESPACE_REGRESSION.cjs`, 본 문서.
- 변경: `src/blocks/dialogue_namespaces.ts`, `src/blocks/resource_blocks.ts`, `tests/DIALOGUE_NAMESPACE_REGRESSION.cjs`, `pxt.json`.
- 기존 `main.ts`, `main.blocks`, Resource AST/Registry/Parser/Compiler/Validator, 행동팩 및 브리지 소스 변경 없음.

## 검증 범위
- 새 두 네임스페이스, C형 5개·원블록 12개, 블록 ID 고유성·그림자 블록 참조, 기존 블록 숨김 및 JavaScript 위임 인수/순서 보존을 소스 기반으로 검사.
- **미검증:** 전체 MakeCode/PXT 빌드, 실제 블록 카테고리 렌더링, 기존 Blocks↔JavaScript 왕복, Education 실게임 실행.
- 과거 프로젝트의 실제 .blocks 복원은 확인 전이므로 소스/API 보존만으로 실사용 호환이 검증됐다고 기록하지 않는다.

## 공식 PXT 자료
- https://github.com/microsoft/pxt/blob/master/docs/defining-blocks.md
- https://github.com/microsoft/pxt/blob/master/pxtblocks/loader.ts
