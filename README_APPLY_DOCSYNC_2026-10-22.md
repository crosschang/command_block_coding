# 2026-10-22 문서 동기화 적용 안내

**문서 전용 패치.** GitHub `0.0.77` 코드/버전은 변경하지 않음.

ZIP을 최신 `D:\command_block_coding`에 풀면 `docs/PROJECT_PLAN.md`를 현재 내용으로 갱신하고, 나머지 네 개 새 문서를 `docs/`에 추가한다.

적용 전:
```powershell
cd D:\command_block_coding
git status --short
git diff -- docs/PROJECT_PLAN.md
```

압축 해제 후:
```powershell
git diff -- docs/PROJECT_PLAN.md
git diff --check
git status --short
```

**충돌 방지:** 이 패치의 `docs/PROJECT_PLAN.md`는 2026-10-22 GitHub master의 원문 내용을 보존해 최신 섹션을 **앞에 덧붙인** 파일이다. 사용자 PC에서 추가로 편집된 내용이 있다면 그대로 덮어쓰지 말고 diff를 통해 병합해야 한다. GitHub 자동 커밋/푸시는 수행하지 않았다.

`tests/*.cjs`, `pxt.json`, `main.ts`, `src/`, `registry/`는 이 ZIP에 없다. 과거 `docs/B4_FOG_ENVIRONMENT_GROUPS_0.0.76.md`는 역사 기록으로 유지한다.
