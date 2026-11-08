/** Public CAMERASHAKE API, with typed optional argument reporters. */
namespace Command {
    export class CameraShakeIntensityValue {
        value: number;
        constructor(value: number) { this.value = value; }
    }
    export class CameraShakeSecondsValue {
        value: number;
        constructor(value: number) { this.value = value; }
    }
    export class CameraShakeTypeValue {
        value: MCFunctionAST.CameraShakeType;
        constructor(value: MCFunctionAST.CameraShakeType) { this.value = value; }
    }
    export enum CameraShakeChoice {
        //% block="positional"
        Positional = 0,
        //% block="rotational"
        Rotational = 1
    }

    //% blockId=mcfunction_camerashake_intensity
    //% group="CAMERASHAKE" weight=95
    //% block="shake intensity $value" value.defl=0.5
    export function cameraShakeIntensity(value: number): CameraShakeIntensityValue {
        return new CameraShakeIntensityValue(value);
    }

    //% blockId=mcfunction_camerashake_seconds
    //% group="CAMERASHAKE" weight=94
    //% block="shake seconds $value" value.defl=2
    export function cameraShakeSeconds(value: number): CameraShakeSecondsValue {
        return new CameraShakeSecondsValue(value);
    }

    //% blockId=mcfunction_camerashake_type
    //% group="CAMERASHAKE" weight=93
    //% block="shake type $type"
    export function cameraShakeType(type: CameraShakeChoice): CameraShakeTypeValue {
        return new CameraShakeTypeValue(type == CameraShakeChoice.Rotational ?
            MCFunctionAST.CameraShakeType.Rotational : MCFunctionAST.CameraShakeType.Positional);
    }

    //% blockId=command_camerashake_add
    //% group="CAMERASHAKE" weight=100
    //% block="CAMERASHAKE add target $target || $intensity $seconds $shakeType"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_selector_self"
    //% intensity.shadow="mcfunction_camerashake_intensity"
    //% seconds.shadow="mcfunction_camerashake_seconds"
    //% shakeType.shadow="mcfunction_camerashake_type"
    export function cameraShakeAdd(
        target: MCFunctionFields.SelectorValue,
        intensity?: CameraShakeIntensityValue,
        seconds?: CameraShakeSecondsValue,
        shakeType?: CameraShakeTypeValue
    ): void {
        executeAudioCommand(MCFunctionBlocks.createCameraShakeAddCommand(
            target ? target.selector : undefined,
            intensity ? intensity.value : undefined,
            seconds ? seconds.value : undefined,
            shakeType ? shakeType.value : undefined
        ));
    }

    //% blockId=command_camerashake_stop
    //% group="CAMERASHAKE" weight=99
    //% block="CAMERASHAKE stop || target $target"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_selector_self"
    export function cameraShakeStop(target?: MCFunctionFields.SelectorValue): void {
        executeAudioCommand(MCFunctionBlocks.createCameraShakeStopCommand(
            target ? target.selector : undefined
        ));
    }
}
