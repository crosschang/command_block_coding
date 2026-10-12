/** Sound event IDs: dotted names (random.click) and custom IDs are allowed. */
//% color="#00897B" weight=85 icon="\uf028" block="SOUND ID"
//% groups='["Direct Input", "Registry"]'
namespace MCFunctionSoundLibrary {
    //% group="Direct Input" weight=100
    //% blockId=mcfunction_sound_custom_id
    //% block="sound direct id $soundId"
    //% soundId.shadow="text"
    //% soundId.defl="random.click"
    export function custom(soundId: string): MCFunctionFields.SoundValue {
        return MCFunctionFields.sound(soundId);
    }
}
