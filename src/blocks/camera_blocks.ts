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
    //% action.shadow="mcfunction_camera_action_set_compact"
    export function cameraCommand(target: MCFunctionFields.SelectorValue, action: CameraActionValue): void {
        // Adapter creates the final AST with the main block's target.
        executeAudioCommand(MCFunctionBlocks.createCameraFromAction(
            target ? target.selector : undefined,
            action ? action.command : undefined));
    }

    //% blockId=mcfunction_camera_action_set
    //% blockHidden=true
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


    /** Optional SET configuration; omission is different from zero-valued fields. */
    export class CameraSetOptionsValue {
        ease?: MCFunctionAST.CameraEase;
        position?: MCFunctionAST.Position;
        rotation?: MCFunctionAST.Rotation;
        facing?: MCFunctionAST.Facing;
        useDefault: boolean;
        viewOffset?: MCFunctionAST.CameraOffset2;
        entityOffset?: MCFunctionAST.CameraOffset3;
        constructor(ease?: MCFunctionAST.CameraEase, position?: MCFunctionAST.Position,
            rotation?: MCFunctionAST.Rotation, facing?: MCFunctionAST.Facing,
            useDefault?: boolean, viewOffset?: MCFunctionAST.CameraOffset2,
            entityOffset?: MCFunctionAST.CameraOffset3) {
            this.ease = ease; this.position = position;
            this.rotation = rotation; this.facing = facing;
            this.useDefault = useDefault == true;
            this.viewOffset = viewOffset; this.entityOffset = entityOffset;
        }
    }

    //% blockId=mcfunction_camera_set_options
    //% group="CAMERA" weight=113
    //% block="camera SET options || ease $ease position $position orientation $orientation mode $mode view offset $viewOffset entity offset $entityOffset"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% ease.shadow="mcfunction_camera_ease"
    //% position.shadow="mcfunction_position_absolute"
    //% orientation.shadow="mcfunction_camera_orientation_rotation"
    //% viewOffset.shadow="mcfunction_camera_view_offset"
    //% entityOffset.shadow="mcfunction_camera_entity_offset"
    export function cameraSetOptions(ease?: CameraEaseValue,
        position?: MCFunctionPositionFields.PositionValue, orientation?: CameraOrientationValue,
        mode?: CameraSetMode, viewOffset?: CameraViewOffsetValue,
        entityOffset?: CameraEntityOffsetValue): CameraSetOptionsValue {
        return new CameraSetOptionsValue(ease ? ease.ease : undefined,
            position ? position.position : undefined,
            orientation ? orientation.rotation : undefined,
            orientation ? orientation.facing : undefined, mode == CameraSetMode.Default,
            viewOffset ? viewOffset.value : undefined,
            entityOffset ? entityOffset.value : undefined);
    }

    //% blockId=mcfunction_camera_action_set_compact
    //% group="CAMERA" weight=119
    //% block="set $preset || settings $settings"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% preset.shadow="mcfunction_camera_preset_builtin"
    //% settings.shadow="mcfunction_camera_set_options"
    export function cameraActionSetCompact(preset: CameraPresetValue,
        settings?: CameraSetOptionsValue): CameraActionValue {
        return new CameraActionValue(MCFunctionAST.createCameraSetUnifiedCommand(
            undefined, preset ? preset.presetId : undefined,
            settings ? settings.ease : undefined,
            settings ? settings.position : undefined,
            settings ? settings.rotation : undefined,
            settings ? settings.facing : undefined,
            settings ? settings.useDefault : false,
            settings ? settings.viewOffset : undefined,
            settings ? settings.entityOffset : undefined));
    }

    //% blockId=mcfunction_camera_action_spline
    //% group="CAMERA" weight=114
    //% block="play spline $splineName"
    //% splineName.shadow="text" splineName.defl="example:camera_path"
    export function cameraActionSpline(splineName: string): CameraActionValue {
        return new CameraActionValue(MCFunctionAST.createCameraSplineCommand(undefined, splineName));
    }

    //% blockId=mcfunction_camera_action_clear
    //% group="CAMERA" weight=118
    //% block="clear camera"
    export function cameraActionClear(): CameraActionValue {
        return new CameraActionValue(MCFunctionAST.createCameraClearCommand(undefined));
    }

    //% blockId=mcfunction_camera_action_fade
    //% blockHidden=true
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
    //% blockHidden=true
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
    //% blockHidden=true
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


/** CAMERA action composition v0.0.68: one executable block, typed sub-actions.
 * Existing block IDs above are retained but hidden for workspace compatibility.
 * Each reporter returns AST data and never assembles command text.
 */
namespace Command {
    /** Omitted FADE fields are different from explicit zero values. */
    export class CameraFadeOptionsValue {
        time?: MCFunctionAST.CameraFadeTime;
        color?: MCFunctionAST.CameraFadeColor;
        constructor(time?: MCFunctionAST.CameraFadeTime, color?: MCFunctionAST.CameraFadeColor) {
            this.time = time;
            this.color = color;
        }
    }

    //% blockId=mcfunction_camera_fade_options
    //% blockHidden=true
    //% group="CAMERA" weight=110
    //% block="fade settings || time $time color $color"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% time.shadow="mcfunction_camera_fade_time"
    //% color.shadow="mcfunction_camera_fade_color"
    export function cameraFadeOptions(time?: CameraFadeTimeValue,
        color?: CameraFadeColorValue): CameraFadeOptionsValue {
        return new CameraFadeOptionsValue(time ? time.time : undefined,
            color ? color.color : undefined);
    }

    /** CAMERA fade has four official forms: bare fade, color, time, time + color.
     * These three visible typed reporters make the optional forms explicit;
     * the legacy expandable fade-settings reporter above remains hidden for
     * existing workspaces.  No command strings are assembled in UI code.
     */
    //% blockId=mcfunction_camera_fade_color_only
    //% group="CAMERA" weight=113
    //% block="fade color $color"
    //% color.shadow="mcfunction_camera_fade_color"
    export function cameraFadeColorOnly(color: CameraFadeColorValue): CameraFadeOptionsValue {
        return new CameraFadeOptionsValue(undefined, color ? color.color : undefined);
    }

    //% blockId=mcfunction_camera_fade_time_only
    //% group="CAMERA" weight=112
    //% block="fade time $time"
    //% time.shadow="mcfunction_camera_fade_time"
    export function cameraFadeTimeOnly(time: CameraFadeTimeValue): CameraFadeOptionsValue {
        return new CameraFadeOptionsValue(time ? time.time : undefined, undefined);
    }

    //% blockId=mcfunction_camera_fade_time_color
    //% group="CAMERA" weight=111
    //% block="fade time $time color $color"
    //% inlineInputMode=external
    //% time.shadow="mcfunction_camera_fade_time"
    //% color.shadow="mcfunction_camera_fade_color"
    export function cameraFadeTimeColor(time: CameraFadeTimeValue,
        color: CameraFadeColorValue): CameraFadeOptionsValue {
        return new CameraFadeOptionsValue(time ? time.time : undefined,
            color ? color.color : undefined);
    }

    //% blockId=mcfunction_camera_action_fade_compact
    //% group="CAMERA" weight=117
    //% block="fade || settings $settings"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% settings.shadow="mcfunction_camera_fade_color_only"
    export function cameraActionFadeCompact(settings?: CameraFadeOptionsValue): CameraActionValue {
        return new CameraActionValue(MCFunctionAST.createCameraFadeCommand(undefined,
            settings ? settings.time : undefined, settings ? settings.color : undefined));
    }

    /** Discriminated entity operation.  Attach and Track require a selector;
     * Detach and Remove Target never carry a redundant selector or offset.
     */
    export class CameraEntityOperationValue {
        action: MCFunctionAST.CameraAction;
        entity?: MCFunctionAST.Selector;
        offset?: MCFunctionAST.CameraOffset3;
        constructor(action: MCFunctionAST.CameraAction,
            entity?: MCFunctionAST.Selector, offset?: MCFunctionAST.CameraOffset3) {
            this.action = action;
            this.entity = entity;
            this.offset = offset;
        }
    }

    //% blockId=mcfunction_camera_entity_attach_option
    //% group="CAMERA" weight=109
    //% block="attach to entity $entity"
    //% entity.shadow="mcfunction_selector_self"
    export function cameraEntityAttachOption(entity: MCFunctionFields.SelectorValue): CameraEntityOperationValue {
        return new CameraEntityOperationValue(MCFunctionAST.CameraAction.Attach,
            entity ? entity.selector : undefined);
    }

    //% blockId=mcfunction_camera_entity_detach_option
    //% group="CAMERA" weight=108
    //% block="detach from entity"
    export function cameraEntityDetachOption(): CameraEntityOperationValue {
        return new CameraEntityOperationValue(MCFunctionAST.CameraAction.Detach);
    }

    //% blockId=mcfunction_camera_entity_track_option
    //% blockHidden=true
    //% group="CAMERA" weight=107
    //% block="track entity $entity || center offset $offset"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% entity.shadow="mcfunction_selector_self"
    //% offset.shadow="mcfunction_camera_entity_offset"
    export function cameraEntityTrackOption(entity: MCFunctionFields.SelectorValue,
        offset?: CameraEntityOffsetValue): CameraEntityOperationValue {
        return new CameraEntityOperationValue(MCFunctionAST.CameraAction.TargetEntity,
            entity ? entity.selector : undefined, offset ? offset.value : undefined);
    }

    //% blockId=mcfunction_camera_entity_remove_option
    //% group="CAMERA" weight=106
    //% block="remove tracking target"
    export function cameraEntityRemoveOption(): CameraEntityOperationValue {
        return new CameraEntityOperationValue(MCFunctionAST.CameraAction.RemoveTarget);
    }

    /** Explicit target_entity syntax variants.  Unlike the legacy expandable
     * reporter, these expose only arguments that belong to the chosen form.
     */
    //% blockId=mcfunction_camera_entity_track_direct
    //% group="CAMERA" weight=107
    //% block="track entity $entity"
    //% entity.shadow="mcfunction_selector_self"
    export function cameraEntityTrackDirect(entity: MCFunctionFields.SelectorValue): CameraEntityOperationValue {
        return new CameraEntityOperationValue(MCFunctionAST.CameraAction.TargetEntity,
            entity ? entity.selector : undefined);
    }

    /** A tracking center offset is not the SET entity_offset option.
     * Both reuse the same 3-axis numeric value shape, not command strings.
     */
    //% blockId=mcfunction_camera_target_center_offset
    //% group="CAMERA" weight=106
    //% block="target center offset x $x y $y z $z"
    //% x.defl=0 y.defl=1 z.defl=0
    export function cameraTargetCenterOffset(x: number, y: number, z: number): CameraEntityOffsetValue {
        return new CameraEntityOffsetValue(x, y, z);
    }

    //% blockId=mcfunction_camera_entity_track_offset
    //% group="CAMERA" weight=106
    //% block="track entity $entity target center offset $offset"
    //% inlineInputMode=external
    //% entity.shadow="mcfunction_selector_self"
    //% offset.shadow="mcfunction_camera_target_center_offset"
    export function cameraEntityTrackOffset(entity: MCFunctionFields.SelectorValue,
        offset: CameraEntityOffsetValue): CameraEntityOperationValue {
        return new CameraEntityOperationValue(MCFunctionAST.CameraAction.TargetEntity,
            entity ? entity.selector : undefined, offset ? offset.value : undefined);
    }

    //% blockId=mcfunction_camera_action_entity_compact
    //% group="CAMERA" weight=116
    //% block="entity control $operation"
    //% operation.shadow="mcfunction_camera_entity_attach_option"
    export function cameraActionEntityCompact(operation: CameraEntityOperationValue): CameraActionValue {
        if (!operation) return new CameraActionValue(MCFunctionAST.createCameraEntityCommand(
            <MCFunctionAST.CameraAction>-1, undefined));
        return new CameraActionValue(MCFunctionAST.createCameraEntityCommand(
            operation.action, undefined, operation.entity, operation.offset));
    }

    /** FOV Set requires a value, whereas FOV Clear has no FOV value. */
    export class CameraFovOperationValue {
        action: MCFunctionAST.CameraAction;
        value?: number;
        ease?: MCFunctionAST.CameraEase;
        constructor(action: MCFunctionAST.CameraAction, value?: number, ease?: MCFunctionAST.CameraEase) {
            this.action = action;
            this.value = value;
            this.ease = ease;
        }
    }

    //% blockId=mcfunction_camera_fov_set_option
    //% blockHidden=true
    //% group="CAMERA" weight=105
    //% block="FOV set value $value || ease $ease"
    //% expandableArgumentMode="enabled"
    //% value.defl=70
    //% ease.shadow="mcfunction_camera_ease"
    export function cameraFovSetOption(value: number, ease?: CameraEaseValue): CameraFovOperationValue {
        return new CameraFovOperationValue(MCFunctionAST.CameraAction.FovSet, value,
            ease ? ease.ease : undefined);
    }

    //% blockId=mcfunction_camera_fov_clear_option
    //% blockHidden=true
    //% group="CAMERA" weight=104
    //% block="FOV clear || ease $ease"
    //% expandableArgumentMode="enabled"
    //% ease.shadow="mcfunction_camera_ease"
    export function cameraFovClearOption(ease?: CameraEaseValue): CameraFovOperationValue {
        return new CameraFovOperationValue(MCFunctionAST.CameraAction.FovClear, undefined,
            ease ? ease.ease : undefined);
    }

    /** Explicit fov_set / fov_clear forms.  FOV easing is emitted as
     * '<seconds> <easing-type>', with no 'ease' command keyword.
     * Keep the older expandable reporters hidden for existing workspaces.
     */
    //% blockId=mcfunction_camera_fov_set_direct
    //% group="CAMERA" weight=105
    //% block="FOV set value $value"
    //% value.defl=70
    export function cameraFovSetDirect(value: number): CameraFovOperationValue {
        return new CameraFovOperationValue(MCFunctionAST.CameraAction.FovSet, value);
    }

    //% blockId=mcfunction_camera_fov_set_eased
    //% group="CAMERA" weight=104
    //% block="FOV set value $value transition $ease"
    //% inlineInputMode=external
    //% value.defl=70
    //% ease.shadow="mcfunction_camera_ease"
    export function cameraFovSetEased(value: number,
        ease: CameraEaseValue): CameraFovOperationValue {
        return new CameraFovOperationValue(MCFunctionAST.CameraAction.FovSet,
            value, ease ? ease.ease : undefined);
    }

    //% blockId=mcfunction_camera_fov_clear_direct
    //% group="CAMERA" weight=103
    //% block="FOV clear"
    export function cameraFovClearDirect(): CameraFovOperationValue {
        return new CameraFovOperationValue(MCFunctionAST.CameraAction.FovClear);
    }

    //% blockId=mcfunction_camera_fov_clear_eased
    //% group="CAMERA" weight=102
    //% block="FOV clear transition $ease"
    //% ease.shadow="mcfunction_camera_ease"
    export function cameraFovClearEased(ease: CameraEaseValue): CameraFovOperationValue {
        return new CameraFovOperationValue(MCFunctionAST.CameraAction.FovClear,
            undefined, ease ? ease.ease : undefined);
    }

    //% blockId=mcfunction_camera_action_fov_compact
    //% group="CAMERA" weight=115
    //% block="FOV $operation"
    //% operation.shadow="mcfunction_camera_fov_set_direct"
    export function cameraActionFovCompact(operation: CameraFovOperationValue): CameraActionValue {
        if (!operation) return new CameraActionValue(MCFunctionAST.createCameraFovCommand(
            <MCFunctionAST.CameraAction>-1, undefined));
        return new CameraActionValue(MCFunctionAST.createCameraFovCommand(
            operation.action, undefined, operation.value, operation.ease));
    }
}
