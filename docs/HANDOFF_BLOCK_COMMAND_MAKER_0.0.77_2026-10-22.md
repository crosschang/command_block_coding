# command_block_coding — 차기 대화/작업 인수인계 (2026-10-22)

**저장소:** https://github.com/crosschang/command_block_coding  
**브랜치:** `master`  
**현재 PXT 버전:** **0.0.77**  
**최근 확인 커밋:** `351aae3d3397f2b4f1a5e1ee134cf3ce506c7c5f` (`0.0.77`, **pxt.json 단독 변경**)  
**실게임 대표 검증 기준:** Minecraft Education 26.32, B4 기능 대부분 0.0.75~0.0.76에서 사용자 직접 테스트. 0.0.77의 명령 소스는 기능적으로 동일.  
**이번 인수인계 산출물:** 문서/증거 색인 갱신만 수행. **GitHub 수정·커밋/푸시·PXT 버전 증가·게임 재실행 없음.**

## 1. 반드시 유지할 아키텍처
```text
MakeCode Blocks → Block Adapter → MCFunctionAST (Source of Truth)
               → Validator → Compiler → canonical Minecraft command
                                        ├─ Education Preview: player.execute(...)
                                        └─ future: functions/*.mcfunction

.mcfunction → Parser → AST → Block Adapter → MakeCode Blocks
```
- MakeCode/PXT GitHub Extension 사용. `pxt.json/main.ts/main.blocks/test.ts` 보존.
- Core Engine은 `src/ast`, `src/parser`, `src/compiler`, `src/validator`, `src/blocks`, `src/fields`, `registry` 등으로 분리. Parser/Converter는 **목표 구조이며 완료했다고 주장하지 않음**.
- Selector/Position/Rotation/RawText 등 공통 AST 재사용. 명령별 직접 문자열 조립을 `main.ts`에 넣지 않는다.
- 지원하지 않는 명령은 **Raw Command AST**로 보존. Registry에 없는 custom namespace/input 허용.
- Bedrock/Education 문법/실게임 차이 구분. Official JSON ID와 Education Runtime 지원의 차이 구분.

## 2. B4 완료 판정 — 대표 인게임 경로
| 영역 | 실제 확인 | 판정 |
|---|---|---|
| CAMERA | 기존 주요 동작의 대표 실게임 PASS, 7 preset UI 연결 확인 | 대표 PASS, 전체 확장 기능 미완료 |
| FOG | push/pop/remove, Crimson Forest 지상, Water 수중, End Fog, 스택 A/B 복귀 | **대표 PASS** |
| PLAYANIMATION | Allay 춤, Armor Stand pose 연속 변경, STOP `0/1`, BLEND `0/2`, NEXT_STATE `hero_pose/none`, Controller ID 재사용/추가/종료 | **대표 PASS** |
| Sniffer | 새끼 Sniffer `dig` 자세 시각 재생, `search` 동작·정지·재실행 | DIG 시각 PASS; 2초 반복 주기·STOP/BLEND 정밀 계측 보류 |
| CAMERA/ANIMATION/FOG Registry | Camera 7, Animation 536, Controller 179, FOG 80. FOG 5그룹 42/24/7/6/1 | 소스·MakeCode UI 대표 검증; 목록 전수 실게임 아님 |

- 최종 Controller 증거: 사용자가 `b4f_ctrl_compare`와 `b4f_ctrl_stop_extra` 사진 제공. 동일 `zombie_pose`에 서로 다른 Controller ID 적용 후 오른쪽 자세 변화 확인. **내부 혼합 우선순위 전수 증명이 아니라 대표 시각 PASS**.
- 최종 Next State 증거: 사용자가 `state_reset → state_seed` 두 개체가 같은 시작 자세임을 사진과 발언으로 확정. `state_switch` 후 서로 다른 최종 자세(왼쪽 HERO/오른쪽 none)를 영상에서 확인.
- `query.anim_time > 1.5`를 전환 속도라고 설명했던 오류는 **정정 완료**. 별도 `query.state_time` 정확성은 미검증. STOP과 BLEND 별개 값 유지.

## 3. 이력 및 원칙
- 이전 B3 DAMAGE/EVENT와 C1 CONTROLSCHEME/AIMASSIST는 대표 실게임 PASS를 보존. `ride`와 `dialogue`는 구현된 C1로 합산하지 말 것.
- B4 레지스트리 생성/업데이트는 `tools/update_b4_registry.cjs`·`tools/generate_b4_registry.cjs`이며 이전 `update_registry.ps1`·`generate_registry.ps1`의 동작은 유지.
- `fog_desert`는 공식 정의상 water만 있어 지상에서 안 보였던 초기 이력. `fog_crimson_forest`는 지상 시각 재현 PASS.
- FOG 구식 분류 `Mixed=55`는 기록상 **과거 단계**. 현재는 `Air + Water (42)`·`Water Only (24)`·`Air + Water + Weather (7)`·`Lava Included (6)`·`Powder Snow (1)`.
- 새 소스 파일을 MakeCode에서 사용할 때는 `pxt.json.files` 등재 여부를 확인. 기존 Reporter 함수명/blockId 유지.

## 4. 검증시 주의
- `[Preview] ... OK`, `Execution allowed`는 정적/정의 검사; 실제 애니메이션 효과가 없을 때 PASS 금지.
- MakeCode `player.execute()`와 게임 직접 `/command`는 차이가 있을 수 있음. 현재 아머 스탠드는 정면 테스트에서 `Command.playAnimation` 시각 변화를 확인했으므로 그 실패를 다시 추정하지 않음.
- Camera 특수 spline 등 기능 전체 구현·통합 게임 테스트, Registry 전수 호환성, Bedrock/Education 교차 버전, 전체 PXT release/rebuild 검증은 남음.
- 최신 GitHub 버전 0.0.77은 기능 수정 아닌 버전 변경. 단, 사용자 PC의 미커밋 파일과 GitHub HEAD 차이는 별도로 확인해야 함.

## 5. 다음 개발 작업 (새 채팅의 시작점)
1. 이 문서와 `TEST_EVIDENCE_LEDGER.md`, `COMMAND_IMPLEMENTATION_ROADMAP_2026-10-22.md` 읽기.
2. `git status --short`, `git log -1 --oneline`, `cat pxt.json` 및 기존 테스트 회귀. **버전 수정/커밋은 사용자 승인 전 금지**.
3. 새 명령 우선순위: C1 잔여 `ride`/`dialogue` 문법 확인·구현, 또는 사용자 선택에 따라 B2 CAMERA 고급 범위 마무리. 이후 C2 scoreboard 명령 AST → C3 modern execute → C4 RawText → D converter.
4. 새 명령마다 Official syntax → AST/Adapter/Validator/Compiler → PXT blocks → Definition/Runtime → Education 시각 테스트 → 문서 원장 업데이트. `.mcfunction` Export/Import는 별도 단계.
5. 코드 패치를 실제로 시작할 때는 사용자 최신 전체 통합 프로젝트 ZIP 확인 또는 로컬 작업본·GitHub HEAD 비교. **문서 패키지를 최신 실행 코드 ZIP으로 오인하지 말 것.**

## 6. Windows 확인 명령 (실행 결과를 붙여주면 기록 가능)
```powershell
cd D:\command_block_coding
git status --short
node --test tests\B4_REGISTRY_SAFE_UPDATE_TEST.cjs
node --test tests\B4_FOG_ENVIRONMENT_GROUPS_TEST.cjs
node --test tests\B4_ADVANCED_FOG_COMPAT_STATIC_TEST.cjs
node tools\generate_b4_registry.cjs --check
git diff --check
```
`0.0.77`에서 이 명령을 **문서 생성자가 실행했다고 주장하지 않음**.

## 7. 최신 증거 색인
`TEST_EVIDENCE_LEDGER.md`의 2026-10-21~22 B4 Addendum 및 `evidence/INDEX.json`의 `b4_2026_10_22`를 확인. 원본 대용량 mp4는 본 문서 패키지에 포함되지 않음.
