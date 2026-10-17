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
