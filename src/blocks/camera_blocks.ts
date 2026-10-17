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
    //% blockHidden=true
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
    //% blockHidden=true
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
    //% blockHidden=true
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
    //% blockHidden=true
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
    //% blockHidden=true
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
    //% blockHidden=true
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
    //% blockHidden=true
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
    //% blockHidden=true
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
    //% blockHidden=true
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

/** Unified CAMERA SET; historical block IDs remain callable for existing workspaces. */
namespace Command {
    export class CameraOrientationValue {
        rotation?: MCFunctionAST.Rotation;
        facing?: MCFunctionAST.Facing;
        constructor(rotation?: MCFunctionAST.Rotation, facing?: MCFunctionAST.Facing) {
            this.rotation = rotation; this.facing = facing;
        }
    }
    export class CameraViewOffsetValue {
        value: MCFunctionAST.CameraOffset2;
        constructor(x: number, y: number) { this.value = { x: x, y: y }; }
    }
    export class CameraEntityOffsetValue {
        value: MCFunctionAST.CameraOffset3;
        constructor(x: number, y: number, z: number) { this.value = { x: x, y: y, z: z }; }
    }
    export enum CameraSetMode {
        //% block="overrides"
        Overrides = 0,
        //% block="default"
        Default = 1
    }

    //% blockId=mcfunction_camera_orientation_rotation
    //% group="CAMERA" weight=83
    //% block="camera orientation rotation $rotation"
    //% rotation.shadow="mcfunction_rotation_absolute"
    export function cameraOrientationRotation(rotation: MCFunctionRotationFields.RotationValue): CameraOrientationValue {
        return new CameraOrientationValue(rotation ? rotation.rotation : undefined, undefined);
    }
    //% blockId=mcfunction_camera_orientation_facing
    //% group="CAMERA" weight=82
    //% block="camera orientation $facing"
    //% facing.shadow="mcfunction_camera_facing_position"
    export function cameraOrientationFacing(facing: CameraFacingValue): CameraOrientationValue {
        return new CameraOrientationValue(undefined, facing ? facing.facing : undefined);
    }
    //% blockId=mcfunction_camera_view_offset
    //% group="CAMERA" weight=81
    //% block="camera view offset x $x y $y"
    //% x.defl=0 y.defl=0
    export function cameraViewOffset(x: number, y: number): CameraViewOffsetValue { return new CameraViewOffsetValue(x, y); }
    //% blockId=mcfunction_camera_entity_offset
    //% group="CAMERA" weight=80
    //% block="camera entity offset x $x y $y z $z"
    //% x.defl=0 y.defl=0 z.defl=0
    export function cameraEntityOffset(x: number, y: number, z: number): CameraEntityOffsetValue {
        return new CameraEntityOffsetValue(x, y, z);
    }

    //% blockId=command_camera_set_unified
    //% blockHidden=true
    //% group="CAMERA" weight=110
    //% block="CAMERA target $target set $preset || ease $ease position $position orientation $orientation mode $mode view offset $viewOffset entity offset $entityOffset"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_selector_self"
    //% preset.shadow="mcfunction_camera_preset_builtin"
    //% ease.shadow="mcfunction_camera_ease"
    //% position.shadow="mcfunction_position_absolute"
    //% orientation.shadow="mcfunction_camera_orientation_rotation"
    //% viewOffset.shadow="mcfunction_camera_view_offset"
    //% entityOffset.shadow="mcfunction_camera_entity_offset"
    export function cameraSetUnified(target: MCFunctionFields.SelectorValue, preset: CameraPresetValue,
        ease?: CameraEaseValue, position?: MCFunctionPositionFields.PositionValue,
        orientation?: CameraOrientationValue, mode?: CameraSetMode,
        viewOffset?: CameraViewOffsetValue, entityOffset?: CameraEntityOffsetValue): void {
        executeAudioCommand(MCFunctionBlocks.createCameraSetUnifiedCommand(
            target ? target.selector : undefined, preset ? preset.presetId : undefined,
            ease ? ease.ease : undefined, position ? position.position : undefined,
            orientation ? orientation.rotation : undefined,
            orientation ? orientation.facing : undefined, mode == CameraSetMode.Default,
            viewOffset ? viewOffset.value : undefined, entityOffset ? entityOffset.value : undefined));
    }
    //% blockId=command_camera_attach_entity
    //% blockHidden=true
    //% group="CAMERA" weight=79
    //% block="CAMERA target $target attach to entity $entity"
    //% target.shadow="mcfunction_selector_self"
    //% entity.shadow="mcfunction_selector_self"
    export function cameraAttach(target: MCFunctionFields.SelectorValue, entity: MCFunctionFields.SelectorValue): void {
        executeAudioCommand(MCFunctionBlocks.createCameraEntityCommand(MCFunctionAST.CameraAction.Attach,
            target ? target.selector : undefined, entity ? entity.selector : undefined));
    }
    //% blockId=command_camera_detach_entity
    //% blockHidden=true
    //% group="CAMERA" weight=78
    //% block="CAMERA target $target detach from entity"
    //% target.shadow="mcfunction_selector_self"
    export function cameraDetach(target: MCFunctionFields.SelectorValue): void {
        executeAudioCommand(MCFunctionBlocks.createCameraEntityCommand(MCFunctionAST.CameraAction.Detach,
            target ? target.selector : undefined));
    }
    //% blockId=command_camera_target_entity
    //% blockHidden=true
    //% group="CAMERA" weight=77
    //% block="CAMERA target $target track entity $entity || center offset $offset"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_selector_self"
    //% entity.shadow="mcfunction_selector_self"
    //% offset.shadow="mcfunction_camera_entity_offset"
    export function cameraTargetEntity(target: MCFunctionFields.SelectorValue, entity: MCFunctionFields.SelectorValue,
        offset?: CameraEntityOffsetValue): void {
        executeAudioCommand(MCFunctionBlocks.createCameraEntityCommand(MCFunctionAST.CameraAction.TargetEntity,
            target ? target.selector : undefined, entity ? entity.selector : undefined,
            offset ? offset.value : undefined));
    }
    //% blockId=command_camera_remove_target
    //% blockHidden=true
    //% group="CAMERA" weight=76
    //% block="CAMERA target $target remove tracking target"
    //% target.shadow="mcfunction_selector_self"
    export function cameraRemoveTarget(target: MCFunctionFields.SelectorValue): void {
        executeAudioCommand(MCFunctionBlocks.createCameraEntityCommand(MCFunctionAST.CameraAction.RemoveTarget,
            target ? target.selector : undefined));
    }
    //% blockId=command_camera_fov_set
    //% blockHidden=true
    //% group="CAMERA" weight=75
    //% block="CAMERA target $target FOV set $fov || ease $ease"
    //% expandableArgumentMode="enabled"
    //% target.shadow="mcfunction_selector_self"
    //% fov.defl=70
    //% ease.shadow="mcfunction_camera_ease"
    export function cameraFovSet(target: MCFunctionFields.SelectorValue, fov: number,
        ease?: CameraEaseValue): void {
        executeAudioCommand(MCFunctionBlocks.createCameraFovCommand(MCFunctionAST.CameraAction.FovSet,
            target ? target.selector : undefined, fov, ease ? ease.ease : undefined));
    }
    //% blockId=command_camera_fov_clear
    //% blockHidden=true
    //% group="CAMERA" weight=74
    //% block="CAMERA target $target FOV clear || ease $ease"
    //% expandableArgumentMode="enabled"
    //% target.shadow="mcfunction_selector_self"
    //% ease.shadow="mcfunction_camera_ease"
    export function cameraFovClear(target: MCFunctionFields.SelectorValue, ease?: CameraEaseValue): void {
        executeAudioCommand(MCFunctionBlocks.createCameraFovCommand(MCFunctionAST.CameraAction.FovClear,
            target ? target.selector : undefined, undefined, ease ? ease.ease : undefined));
    }
}

/** Single public CAMERA command: a target plus a typed action reporter.
 * The reporter carries AST data, never a compiled command string.
 * All legacy block IDs above remain available to previously saved workspaces.
 */
namespace Command {
    export class CameraActionValue {
        command: MCFunctionAST.CameraCommand;
        constructor(command: MCFunctionAST.CameraCommand) { this.command = command; }
    }

    //% blockId=command_camera_dispatch
    //% group="CAMERA" weight=120
    //% block="CAMERA target $target command $action"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_selector_self"
    //% action.shadow="mcfunction_camera_action_set"
    export function cameraCommand(target: MCFunctionFields.SelectorValue, action: CameraActionValue): void {
        // Adapter creates the final AST with the main block's target.
        executeAudioCommand(MCFunctionBlocks.createCameraFromAction(
            target ? target.selector : undefined,
            action ? action.command : undefined));
    }

    //% blockId=mcfunction_camera_action_set
    //% group="CAMERA" weight=119
    //% block="set $preset || ease $ease position $position orientation $orientation mode $mode view offset $viewOffset entity offset $entityOffset"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% preset.shadow="mcfunction_camera_preset_builtin"
    //% ease.shadow="mcfunction_camera_ease"
    //% position.shadow="mcfunction_position_absolute"
    //% orientation.shadow="mcfunction_camera_orientation_rotation"
    //% viewOffset.shadow="mcfunction_camera_view_offset"
    //% entityOffset.shadow="mcfunction_camera_entity_offset"
    export function cameraActionSet(preset: CameraPresetValue,
        ease?: CameraEaseValue, position?: MCFunctionPositionFields.PositionValue,
        orientation?: CameraOrientationValue, mode?: CameraSetMode,
        viewOffset?: CameraViewOffsetValue, entityOffset?: CameraEntityOffsetValue): CameraActionValue {
        return new CameraActionValue(MCFunctionAST.createCameraSetUnifiedCommand(
            undefined, preset ? preset.presetId : undefined,
            ease ? ease.ease : undefined, position ? position.position : undefined,
            orientation ? orientation.rotation : undefined, orientation ? orientation.facing : undefined,
            mode == CameraSetMode.Default,
            viewOffset ? viewOffset.value : undefined, entityOffset ? entityOffset.value : undefined));
    }

    //% blockId=mcfunction_camera_action_clear
    //% group="CAMERA" weight=118
    //% block="clear camera"
    export function cameraActionClear(): CameraActionValue {
        return new CameraActionValue(MCFunctionAST.createCameraClearCommand(undefined));
    }

    //% blockId=mcfunction_camera_action_fade
    //% group="CAMERA" weight=117
    //% block="fade || time $time color $color"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% time.shadow="mcfunction_camera_fade_time"
    //% color.shadow="mcfunction_camera_fade_color"
    export function cameraActionFade(time?: CameraFadeTimeValue, color?: CameraFadeColorValue): CameraActionValue {
        return new CameraActionValue(MCFunctionAST.createCameraFadeCommand(undefined,
            time ? time.time : undefined, color ? color.color : undefined));
    }

    export enum CameraEntityActionChoice {
        //% block="attach"
        Attach = 0,
        //% block="detach"
        Detach = 1,
        //% block="track"
        Track = 2,
        //% block="remove tracking"
        RemoveTracking = 3
    }

    //% blockId=mcfunction_camera_action_entity
    //% group="CAMERA" weight=116
    //% block="entity control $operation || entity $entity center offset $offset"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% entity.shadow="mcfunction_selector_self"
    //% offset.shadow="mcfunction_camera_entity_offset"
    export function cameraActionEntity(operation: CameraEntityActionChoice,
        entity?: MCFunctionFields.SelectorValue, offset?: CameraEntityOffsetValue): CameraActionValue {
        let a = MCFunctionAST.CameraAction.Attach;
        if (operation == CameraEntityActionChoice.Detach) a = MCFunctionAST.CameraAction.Detach;
        else if (operation == CameraEntityActionChoice.Track) a = MCFunctionAST.CameraAction.TargetEntity;
        else if (operation == CameraEntityActionChoice.RemoveTracking) a = MCFunctionAST.CameraAction.RemoveTarget;
        return new CameraActionValue(MCFunctionAST.createCameraEntityCommand(a, undefined,
            entity ? entity.selector : undefined, offset ? offset.value : undefined));
    }

    export enum CameraFovActionChoice {
        //% block="set"
        Set = 0,
        //% block="clear"
        Clear = 1
    }

    //% blockId=mcfunction_camera_action_fov
    //% group="CAMERA" weight=115
    //% block="FOV $operation || value $value ease $ease"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% value.defl=70
    //% ease.shadow="mcfunction_camera_ease"
    export function cameraActionFov(operation: CameraFovActionChoice,
        value?: number, ease?: CameraEaseValue): CameraActionValue {
        return new CameraActionValue(MCFunctionAST.createCameraFovCommand(
            operation == CameraFovActionChoice.Clear ? MCFunctionAST.CameraAction.FovClear : MCFunctionAST.CameraAction.FovSet,
            undefined, operation == CameraFovActionChoice.Clear ? undefined : (value == undefined ? 70 : value),
            ease ? ease.ease : undefined));
    }
}
