/** Music track IDs are a separate domain from general sound effect IDs. */
//% color="#AB47BC" weight=84 icon="\uf001" block="MUSIC TRACK"
//% groups='["Direct Input", "Registry"]'
namespace MCFunctionMusicLibrary {
    //% group="Direct Input" weight=100
    //% blockId=mcfunction_music_custom_id
    //% block="music direct track $trackId"
    //% trackId.shadow="text"
    //% trackId.defl="record.cat"
    export function custom(trackId: string): MCFunctionFields.MusicTrackValue {
        return MCFunctionFields.musicTrack(trackId);
    }
}
