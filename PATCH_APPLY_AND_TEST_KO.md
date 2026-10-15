# 0.0.49 CAMERA BASIC + TIME QUERY 통합 패치 적용 가이드

## 기준과 충돌 방지

- 기준 원본: `command_block_coding(20261014-062303).zip` (`pxt.json.version = 0.0.49`)
- **기존 CAMERA BASIC 패치(동일 날짜)를 반영했든 안 했든 이 ZIP 하나로 통합 적용**할 수 있도록 CAMERA 변경까지 포함합니다.
- 복수 HASITEM, SCORES, 첫 번째 7종 명령은 수정하지 않습니다. 원본에 포함된 구현을 유지합니다.
- 사용자가 위 기준 ZIP 이후 다른 소스 파일을 수동 수정했다면 먼저 원본 전체 ZIP을 올려 비교한 뒤 적용하세요.
- 버전 숫자를 임의로 올리지 않았습니다.

## 적용

1. 전체 프로젝트를 백업합니다.
2. 패치 ZIP의 파일을 `pxt.json`이 있는 **프로젝트 루트에 직접** 압축 해제하고 같은 상대경로의 파일을 덮어씁니다.
3. `commands/camera.ts`, `src/blocks/camera_blocks.ts` 확인. TIME QUERY는 기존 `commands/simple_commands.ts`, `src/blocks/simple_command_blocks.ts`, `src/preview/query_adapter.ts` 등에 병합돼 있습니다.
4. `pxt.json` 버전은 `0.0.49`이며 등록 파일 누락이 없어야 합니다.
5. `tests/TIME_QUERY_0.0.49_PUBLIC_API_MAIN.ts` 내용을 임시 `main.ts`에 **전체 복사**합니다. `test.ts`는 변경하지 않습니다.
6. JavaScript → Blocks 전환 후 Education에서 실행합니다.

## 테스트 (채팅 함수는 슬래시 없이)

**1. DayTime**
```
/time set 6000
/daylock true
```
채팅: `tq49_daytime`
기대: `[Preview] TIME QUERY daytime: 6000 ticks` (기존 `tellraw`로 출력)
직접 비교: `/time query daytime`

**2. GameTime**
채팅: `tq49_gametime`
직접 비교: `/time query gametime`
기대: 두 값이 시간 경과만큼 조금 차이 나는 누적 틱 숫자로 출력

**3. Day**
채팅: `tq49_day`
직접 비교: `/time query day`
기대: 두 값이 동일한 정수 날짜

**4. 복원**
`/daylock false`로 시간 흐름 재개 (원래 월드 설정에 맞춰 선택적으로 시행).

## 주의

- Preview 출력은 기존 `MCFunctionPreview.previewSay()`가 `tellraw` JSON 텍스트로 보냅니다. `player.say("[...]")`로 출력하지 않습니다.
- `.mcfunction` Compiler 결과는 `time query ...`이며 `[Preview]` 메시지를 파일에 넣지 않습니다.
- 현재 MakeCode Extension 통합 패치는 **로컬 26개 테스트 및 TypeScript 정적 검사 PASS**, 실제 Education/PXT 결과는 사용자 실측이 나오기 전까지 미검증입니다.
- `TIME QUERY`는 명령형 블록으로 이번에 도입합니다. 결과를 다른 수식의 숫자 입력에 연결하는 독립 Reporter API는 추후 설계 대상입니다.
