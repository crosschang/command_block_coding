/** Public MakeCode blocks for basic CAMERA; preset IDs are data, not command strings. */
namespace Command {
    export enum CameraPresetChoice {
        //% block="first person"
        FirstPerson = 0,
        //% block="third person"
        ThirdPerson = 1,
        //% block="third person front"
        ThirdPersonFront = 2,
        //% block="free camera"
        Free = 3
    }

    export class CameraPresetValue {
        presetId: string;
        constructor(presetId: string) { this.presetId = presetId; }
    }

    //% blockId=mcfunction_camera_preset_builtin
    //% group="CAMERA" weight=96
    //% block="camera preset $preset"
    export function cameraPresetBuiltin(preset: CameraPresetChoice): CameraPresetValue {
        let names = ["minecraft:first_person", "minecraft:third_person",
            "minecraft:third_person_front", "minecraft:free"];
        return new CameraPresetValue(names[<number>preset]);
    }

    //% blockId=mcfunction_camera_preset_custom
    //% group="CAMERA" weight=95
    //% block="custom camera preset ID $presetId"
    //% presetId.shadow="text" presetId.defl="example:sky"
    export function cameraPresetCustom(presetId: string): CameraPresetValue {
        return new CameraPresetValue(presetId);
    }

    //% blockId=command_camera_set
    //% group="CAMERA" weight=100
    //% block="CAMERA target $target set $preset"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_selector_self"
    //% preset.shadow="mcfunction_camera_preset_builtin"
    export function cameraSet(target: MCFunctionFields.SelectorValue, preset: CameraPresetValue): void {
        executeAudioCommand(MCFunctionBlocks.createCameraSetCommand(
            target ? target.selector : undefined,
            preset ? preset.presetId : undefined));
    }

    //% blockId=command_camera_set_advanced
    //% group="CAMERA" weight=98
    //% block="CAMERA target $target set $preset position $position rotation $rotation"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_selector_self"
    //% preset.shadow="mcfunction_camera_preset_builtin"
    //% position.shadow="mcfunction_position_absolute"
    //% rotation.shadow="mcfunction_rotation_absolute"
    export function cameraSetAdvanced(
        target: MCFunctionFields.SelectorValue,
        preset: CameraPresetValue,
        position?: MCFunctionPositionFields.PositionValue,
        rotation?: MCFunctionRotationFields.RotationValue
    ): void {
        executeAudioCommand(MCFunctionBlocks.createCameraSetAdvancedCommand(
            target ? target.selector : undefined,
            preset ? preset.presetId : undefined,
            position ? position.position : undefined,
            rotation ? rotation.rotation : undefined));
    }

    //% blockId=command_camera_clear
    //% group="CAMERA" weight=99
    //% block="CAMERA clear target $target"
    //% target.shadow="mcfunction_selector_self"
    export function cameraClear(target: MCFunctionFields.SelectorValue): void {
        executeAudioCommand(MCFunctionBlocks.createCameraClearCommand(
            target ? target.selector : undefined));
    }
}

/** B2 CAMERA advanced: reusable field values feed the canonical Camera AST. */
namespace Command {
    export class CameraEaseValue {
        ease: MCFunctionAST.CameraEase;
        constructor(seconds: number, type: MCFunctionAST.CameraEaseType) {
            this.ease = { seconds: seconds, type: type };
        }
    }
    export class CameraFacingValue {
        facing: MCFunctionAST.Facing;
        constructor(facing: MCFunctionAST.Facing) { this.facing = facing; }
    }
    export class CameraFadeTimeValue {
        time: MCFunctionAST.CameraFadeTime;
        constructor(a: number, b: number, c: number) { this.time = { fadeIn: a, hold: b, fadeOut: c }; }
    }
    export class CameraFadeColorValue {
        color: MCFunctionAST.CameraFadeColor;
        constructor(r: number, g: number, b: number) { this.color = { red: r, green: g, blue: b }; }
    }

    //% blockId=mcfunction_camera_ease
    //% group="CAMERA" weight=94
    //% block="camera ease seconds $seconds type $type"
    //% seconds.defl=1.5
    export function cameraEase(seconds: number, type: MCFunctionAST.CameraEaseType): CameraEaseValue {
        return new CameraEaseValue(seconds, type);
    }

    //% blockId=mcfunction_camera_facing_position
    //% group="CAMERA" weight=93
    //% block="camera facing position $position"
    //% position.shadow="mcfunction_position_absolute"
    export function cameraFacingPosition(position: MCFunctionPositionFields.PositionValue): CameraFacingValue {
        return new CameraFacingValue(MCFunctionAST.createFacingPosition(position ? position.position : undefined));
    }

    //% blockId=mcfunction_camera_facing_entity
    //% group="CAMERA" weight=92
    //% block="camera facing entity $target"
    //% target.shadow="mcfunction_selector_self"
    export function cameraFacingEntity(target: MCFunctionFields.SelectorValue): CameraFacingValue {
        return new CameraFacingValue(MCFunctionAST.createFacingEntityNoAnchor(target ? target.selector : undefined));
    }

    //% blockId=command_camera_set_facing
    //% group="CAMERA" weight=91
    //% block="CAMERA target $target set $preset position $position facing $facing"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_selector_self"
    //% preset.shadow="mcfunction_camera_preset_builtin"
    //% position.shadow="mcfunction_position_absolute"
    //% facing.shadow="mcfunction_camera_facing_position"
    export function cameraSetFacing(target: MCFunctionFields.SelectorValue, preset: CameraPresetValue,
        position?: MCFunctionPositionFields.PositionValue, facing?: CameraFacingValue): void {
        executeAudioCommand(MCFunctionBlocks.createCameraSetOptionsCommand(
            target ? target.selector : undefined, preset ? preset.presetId : undefined,
            position ? position.position : undefined, undefined, facing ? facing.facing : undefined));
    }

    //% blockId=command_camera_set_ease_rotation
    //% group="CAMERA" weight=90
    //% block="CAMERA target $target set $preset ease $ease position $position rotation $rotation"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_selector_self"
    //% preset.shadow="mcfunction_camera_preset_builtin"
    //% ease.shadow="mcfunction_camera_ease"
    //% position.shadow="mcfunction_position_absolute"
    //% rotation.shadow="mcfunction_rotation_absolute"
    export function cameraSetEaseRotation(target: MCFunctionFields.SelectorValue, preset: CameraPresetValue,
        ease?: CameraEaseValue, position?: MCFunctionPositionFields.PositionValue,
        rotation?: MCFunctionRotationFields.RotationValue): void {
        executeAudioCommand(MCFunctionBlocks.createCameraSetOptionsCommand(
            target ? target.selector : undefined, preset ? preset.presetId : undefined,
            position ? position.position : undefined, rotation ? rotation.rotation : undefined,
            undefined, ease ? ease.ease : undefined));
    }

    //% blockId=command_camera_set_ease_facing
    //% group="CAMERA" weight=89
    //% block="CAMERA target $target set $preset ease $ease position $position facing $facing"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_selector_self"
    //% preset.shadow="mcfunction_camera_preset_builtin"
    //% ease.shadow="mcfunction_camera_ease"
    //% position.shadow="mcfunction_position_absolute"
    //% facing.shadow="mcfunction_camera_facing_position"
    export function cameraSetEaseFacing(target: MCFunctionFields.SelectorValue, preset: CameraPresetValue,
        ease?: CameraEaseValue, position?: MCFunctionPositionFields.PositionValue,
        facing?: CameraFacingValue): void {
        executeAudioCommand(MCFunctionBlocks.createCameraSetOptionsCommand(
            target ? target.selector : undefined, preset ? preset.presetId : undefined,
            position ? position.position : undefined, undefined, facing ? facing.facing : undefined,
            ease ? ease.ease : undefined));
    }

    //% blockId=command_camera_set_default
    //% group="CAMERA" weight=88
    //% block="CAMERA target $target set $preset default"
    //% target.shadow="mcfunction_selector_self"
    //% preset.shadow="mcfunction_camera_preset_builtin"
    export function cameraSetDefault(target: MCFunctionFields.SelectorValue, preset: CameraPresetValue): void {
        executeAudioCommand(MCFunctionBlocks.createCameraSetOptionsCommand(
            target ? target.selector : undefined, preset ? preset.presetId : undefined,
            undefined, undefined, undefined, undefined, true));
    }

    //% blockId=command_camera_set_ease_default
    //% group="CAMERA" weight=87
    //% block="CAMERA target $target set $preset ease $ease default"
    //% target.shadow="mcfunction_selector_self"
    //% preset.shadow="mcfunction_camera_preset_builtin"
    //% ease.shadow="mcfunction_camera_ease"
    export function cameraSetEaseDefault(target: MCFunctionFields.SelectorValue, preset: CameraPresetValue,
        ease: CameraEaseValue): void {
        executeAudioCommand(MCFunctionBlocks.createCameraSetOptionsCommand(
            target ? target.selector : undefined, preset ? preset.presetId : undefined,
            undefined, undefined, undefined, ease ? ease.ease : undefined, true));
    }

    //% blockId=mcfunction_camera_fade_time
    //% group="CAMERA" weight=86
    //% block="camera fade time in $fadeIn hold $hold out $fadeOut"
    //% fadeIn.defl=0.5 hold.defl=1 fadeOut.defl=0.5
    export function cameraFadeTime(fadeIn: number, hold: number, fadeOut: number): CameraFadeTimeValue {
        return new CameraFadeTimeValue(fadeIn, hold, fadeOut);
    }

    //% blockId=mcfunction_camera_fade_color
    //% group="CAMERA" weight=85
    //% block="camera fade RGB red $red green $green blue $blue"
    //% red.defl=0 green.defl=0 blue.defl=0
    export function cameraFadeColor(red: number, green: number, blue: number): CameraFadeColorValue {
        return new CameraFadeColorValue(red, green, blue);
    }

    //% blockId=command_camera_fade
    //% group="CAMERA" weight=84
    //% block="CAMERA fade target $target time $time color $color"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_selector_self"
    //% time.shadow="mcfunction_camera_fade_time"
    //% color.shadow="mcfunction_camera_fade_color"
    export function cameraFade(target: MCFunctionFields.SelectorValue,
        time?: CameraFadeTimeValue, color?: CameraFadeColorValue): void {
        executeAudioCommand(MCFunctionBlocks.createCameraFadeCommand(target ? target.selector : undefined,
            time ? time.time : undefined, color ? color.color : undefined));
    }
}
