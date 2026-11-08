@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0update_audio_registry.ps1" %*
