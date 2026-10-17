# CAMERA 0.0.67 — PlaySpline AST 동기화 복구

오류: Compiler/Validator에서 CameraAction.PlaySpline, CameraCommand.splineName 미인식 (11건).

원인 후보: 최종 Compiler/Validator만 교체되어 commands/camera.ts가 이전 버전인 상태. 업로드된 MakeCode 프로젝트를 직접 가져올 수 없어 실제 원인은 미확정.

적용: MakeCode의 commands/camera.ts 파일을 이 ZIP의 같은 경로 파일로 **전체 교체**합니다. pxt.json에 commands/camera.ts가 포함되어 있는지 확인합니다. 기존 0.0.67 전체 ZIP에는 포함되어 있으므로 별도 pxt.json 교체는 불필요합니다.

MakeCode를 다시 컴파일하고 오류 11건이 사라지는지 확인하십시오. 남으면 실제 프로젝트의 commands/camera.ts 파일 내용을 확인해야 합니다.

주의: 다른 파일, 특히 진단 시스템·pxt.json의 버전·기존 함수는 수정하지 마십시오. 실게임 검증 및 .mcfunction 저장은 현재 범위에서 제외됩니다.
