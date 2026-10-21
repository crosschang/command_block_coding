/** Camera preset reporters share the existing Command.CameraPresetValue AST adapter. */
//% color="#3A77A5" weight=82 icon="\uf030" block="CAMERA PRESET"
//% groups='["Built-in", "Custom"]'
namespace MCFunctionCameraPresetLibrary {
    //% group="Custom" weight=99
    //% blockId=mcfunction_camera_library_custom
    //% block="camera custom preset $presetId"
    //% presetId.shadow="text" presetId.defl="example:my_camera"
    export function custom(presetId: string): Command.CameraPresetValue {
        return new Command.CameraPresetValue(presetId);
    }
}
