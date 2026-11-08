@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0generate_registry.ps1" %*
