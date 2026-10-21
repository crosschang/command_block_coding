# B4 고급 정적 테스트 버전 호환성 수정 (2026-10-21)

현재 `pxt.json`의 버전이 `0.0.76`이면 기존 테스트에서 고정 값 `0.0.75`와 비교해 실패했습니다.
이 패치는 **테스트 파일 1개만** 수정합니다. `pxt.json`, Registry 원본 및 생성 파일, 명령 블록, 컴파일러, 업데이트 스크립트는 변경하지 않습니다.

적용: ZIP을 `D:\command_block_coding`에 **폴더 구조 그대로** 압축 해제하세요.
덮어쓸 대상: `tests/B4_ADVANCED_FOG_COMPAT_STATIC_TEST.cjs`

다시 검사:
```powershell
node --test tests\B4_ADVANCED_FOG_COMPAT_STATIC_TEST.cjs
node --test tests\B4_REGISTRY_SAFE_UPDATE_TEST.cjs
node tools\generate_b4_registry.cjs --check
```

이번에는 B4 최소 버전인 `0.0.75` 이상만 허용합니다 (`0.0.76`, 향후 `0.0.77` 등 포함).
실제 게임 테스트나 Registry 업데이트가 이미 정상 작동한 결과를 다시 수행할 필요는 없습니다.
