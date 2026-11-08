# CAMERA 0.0.67 — 정적 검증 및 후속 확인

- 기준: 2026-10-17 CAMERA SPLINE FULL 소스. 버전 변경 없음.
- CAMERA 추적 관련 출력: `target_entity`, `target_center_offset`, `remove_target`. Bedrock/Education 사용자 자동완성 화면과 Microsoft Camera System Introduction 기준.
- SET 조합: `ease`가 선행하고, `facing`과 `rot`는 대체 관계이며, `pos/facing`과 `view_offset/entity_offset`의 혼합은 기존 Validator에서 거부.
- Fade/Clear: 무관한 엔티티/FOV AST 속성이 들어오면 기존처럼 무시하는 대신 오류 보고하도록 검사 강화.
- Preset: 기본 목록 + Custom namespace 입력 유지. `play_spline`은 버전/Behavior Pack 지원 확인 INFO 유지.
- 기존 MakeCode 공개 API 및 진단 캐시 로직 수정 없음.

## 확인 필요 (PASS 아님)

1. MakeCode/PXT 실제 빌드.
2. 블록 ↔ JavaScript 왕복 복원과 CAMERA Action Reporter 조립.
3. PREVIEW에서 각 SET 조합/추적/초기화/FOV/FADE/SPLINE의 컴파일 결과.
4. Minecraft Education과 Bedrock 실제 실행은 CAMERA 전체 구현 후 사용자 계획대로 진행.

## PREVIEW 기대 문자열

```text
camera @s target_entity @e[type=cow,c=1] target_center_offset 0 1 0
camera @s remove_target
camera @s set minecraft:free ease 2 linear pos 100 80 100 rot 0 180
camera @s fade time 0.5 1 0.5 color 0 0 0
camera @s play_spline example:camera_path
```

이는 기대 문자열이며 실환경 실행 PASS를 주장하지 않습니다.
