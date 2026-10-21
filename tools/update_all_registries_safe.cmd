@echo off
setlocal
REM Run the original Registry updater unchanged, then isolated B4 update.
REM No argument = check-only; --apply = fetch/write snapshots and generate reporters.
cd /d "%~dp0.."
if /i "%~1"=="--apply" goto apply
if not "%~1"=="" goto usage
call "%~dp0update_registry.cmd"
if errorlevel 1 exit /b 1
node "%~dp0update_b4_registry.cjs"
if errorlevel 1 exit /b 1
call "%~dp0generate_registry.cmd" -Check
if errorlevel 1 exit /b 1
node "%~dp0generate_b4_registry.cjs" --check
exit /b %errorlevel%
:apply
call "%~dp0update_registry.cmd" -Apply -SkipGenerate
if errorlevel 1 exit /b 1
node "%~dp0update_b4_registry.cjs" --apply --skip-generate
if errorlevel 1 exit /b 1
call "%~dp0generate_registry.cmd"
if errorlevel 1 exit /b 1
node "%~dp0generate_b4_registry.cjs"
exit /b %errorlevel%
:usage
echo Usage: update_all_registries_safe.cmd [--apply]
exit /b 2
