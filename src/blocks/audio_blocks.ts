/** MakeCode public Sound and Music command blocks. */
namespace Command {
    export class SoundVolumeValue {
        value: number;
        constructor(value: number) { this.value = value; }
    }
    export class SoundPitchValue {
        value: number;
        constructor(value: number) { this.value = value; }
    }
    export class SoundMinimumVolumeValue {
        value: number;
        constructor(value: number) { this.value = value; }
    }
    //% blockId=mcfunction_sound_volume
    //% group="SOUND" weight=87
    //% block="volume $value" value.defl=1
    export function soundVolume(value: number): SoundVolumeValue { return new SoundVolumeValue(value); }
    //% blockId=mcfunction_sound_pitch
    //% group="SOUND" weight=86
    //% block="pitch $value" value.defl=1
    export function soundPitch(value: number): SoundPitchValue { return new SoundPitchValue(value); }
    //% blockId=mcfunction_sound_min_volume
    //% group="SOUND" weight=85
    //% block="minimum volume $value" value.defl=0
    export function soundMinimumVolume(value: number): SoundMinimumVolumeValue { return new SoundMinimumVolumeValue(value); }

    //% blockId=command_playsound
    //% group="SOUND" weight=100
    //% block="PLAYSOUND $sound || target $target position $position $volume $pitch $minimumVolume"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% sound.shadow="mcfunction_sound_registry_random_click"
    //% target.shadow="mcfunction_selector_all_players"
    //% position.shadow="mcfunction_position_relative"
    //% volume.shadow="mcfunction_sound_volume"
    //% pitch.shadow="mcfunction_sound_pitch"
    //% minimumVolume.shadow="mcfunction_sound_min_volume"
    export function playSound(
        sound: MCFunctionFields.SoundValue,
        target?: MCFunctionFields.SelectorValue,
        position?: MCFunctionPositionFields.PositionValue,
        volume?: SoundVolumeValue,
        pitch?: SoundPitchValue,
        minimumVolume?: SoundMinimumVolumeValue
    ): void {
        executeAudioCommand(MCFunctionBlocks.createPlaySoundCommand(
            sound ? sound.soundId : "",
            target ? target.selector : undefined,
            position ? position.position : undefined,
            volume ? volume.value : undefined,
            pitch ? pitch.value : undefined,
            minimumVolume ? minimumVolume.value : undefined
        ));
    }

    //% blockId=command_stopsound
    //% group="SOUND" weight=99
    //% block="STOPSOUND target $target || sound $sound"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_selector_all_players"
    //% sound.shadow="mcfunction_sound_registry_random_click"
    export function stopSound(
        target: MCFunctionFields.SelectorValue,
        sound?: MCFunctionFields.SoundValue
    ): void {
        executeAudioCommand(MCFunctionBlocks.createStopSoundCommand(
            target ? target.selector : undefined,
            sound ? sound.soundId : undefined
        ));
    }

    export class MusicVolumeValue {
        value: number;
        constructor(value: number) { this.value = value; }
    }
    export class MusicFadeValue {
        value: number;
        constructor(value: number) { this.value = value; }
    }
    export class MusicRepeatValue {
        value: MCFunctionAST.MusicRepeatMode;
        constructor(value: MCFunctionAST.MusicRepeatMode) { this.value = value; }
    }
    //% blockId=mcfunction_music_volume_option
    //% group="MUSIC" weight=93
    //% block="music volume $value" value.defl=1
    export function musicVolumeOption(value: number): MusicVolumeValue { return new MusicVolumeValue(value); }
    //% blockId=mcfunction_music_fade_option
    //% group="MUSIC" weight=92
    //% block="fade seconds $value" value.defl=0
    export function musicFadeOption(value: number): MusicFadeValue { return new MusicFadeValue(value); }
    export enum MusicRepeatChoice {
        //% block="play once"
        PlayOnce = 0,
        //% block="loop"
        Loop = 1
    }
    //% blockId=mcfunction_music_repeat_option
    //% group="MUSIC" weight=91
    //% block="repeat $repeatMode"
    export function musicRepeatOption(repeatMode: MusicRepeatChoice): MusicRepeatValue {
        return new MusicRepeatValue(repeatMode == MusicRepeatChoice.Loop ?
            MCFunctionAST.MusicRepeatMode.Loop : MCFunctionAST.MusicRepeatMode.PlayOnce);
    }

    //% blockId=command_music_play
    //% blockHidden=true
    //% group="MUSIC" weight=100
    //% block="MUSIC PLAY track $track || $volume $fade $repeat"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% track.shadow="mcfunction_music_track_registry_record_cat"
    //% volume.shadow="mcfunction_music_volume_option"
    //% fade.shadow="mcfunction_music_fade_option"
    //% repeat.shadow="mcfunction_music_repeat_option"
    export function musicPlay(
        track: MCFunctionFields.MusicTrackValue, volume?: MusicVolumeValue,
        fade?: MusicFadeValue, repeat?: MusicRepeatValue
    ): void {
        executeAudioCommand(MCFunctionBlocks.createMusicCommand(
            MCFunctionAST.MusicAction.Play, track ? track.trackId : "",
            volume ? volume.value : undefined,
            fade ? fade.value : undefined, repeat ? repeat.value : undefined
        ));
    }

    //% blockId=command_music_queue
    //% blockHidden=true
    //% group="MUSIC" weight=99
    //% block="MUSIC QUEUE track $track || $volume $fade $repeat"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% track.shadow="mcfunction_music_track_registry_record_cat"
    //% volume.shadow="mcfunction_music_volume_option"
    //% fade.shadow="mcfunction_music_fade_option"
    //% repeat.shadow="mcfunction_music_repeat_option"
    export function musicQueue(
        track: MCFunctionFields.MusicTrackValue, volume?: MusicVolumeValue,
        fade?: MusicFadeValue, repeat?: MusicRepeatValue
    ): void {
        executeAudioCommand(MCFunctionBlocks.createMusicCommand(
            MCFunctionAST.MusicAction.Queue, track ? track.trackId : "",
            volume ? volume.value : undefined,
            fade ? fade.value : undefined, repeat ? repeat.value : undefined
        ));
    }

    //% blockId=command_music_stop
    //% blockHidden=true
    //% group="MUSIC" weight=98
    //% block="MUSIC STOP || $fade"
    //% expandableArgumentMode="enabled"
    //% fade.shadow="mcfunction_music_fade_option"
    export function musicStop(fade?: MusicFadeValue): void {
        executeAudioCommand(MCFunctionBlocks.createMusicCommand(
            MCFunctionAST.MusicAction.Stop, undefined, undefined,
            fade ? fade.value : undefined
        ));
    }

    //% blockId=command_music_volume
    //% blockHidden=true
    //% group="MUSIC" weight=97
    //% block="MUSIC VOLUME $value"
    //% value.defl=0.5
    export function musicVolume(value: number): void {
        executeAudioCommand(MCFunctionBlocks.createMusicCommand(
            MCFunctionAST.MusicAction.Volume, undefined, value
        ));
    }

    /**
     * A Music action reporter carries one canonical MusicCommand AST node.
     * Only the public MUSIC statement is shown in the toolbox; the four
     * legacy statement block IDs remain hidden but fully supported so
     * existing workspaces and JavaScript continue to round-trip.
     */
    export class MusicOperationValue {
        command: MCFunctionAST.MusicCommand;
        constructor(command: MCFunctionAST.MusicCommand) { this.command = command; }
    }

    export enum MusicPlaybackChoice {
        //% block="play"
        Play = 0,
        //% block="queue"
        Queue = 1
    }

    //% blockId=mcfunction_music_playback_action
    //% group="MUSIC" weight=96
    //% block="action $mode track $track || $volume $fade $repeat"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% track.shadow="mcfunction_music_track_registry_record_cat"
    //% volume.shadow="mcfunction_music_volume_option"
    //% fade.shadow="mcfunction_music_fade_option"
    //% repeat.shadow="mcfunction_music_repeat_option"
    export function musicPlayback(
        mode: MusicPlaybackChoice,
        track: MCFunctionFields.MusicTrackValue,
        volume?: MusicVolumeValue,
        fade?: MusicFadeValue,
        repeat?: MusicRepeatValue
    ): MusicOperationValue {
        return new MusicOperationValue(MCFunctionBlocks.createMusicCommand(
            mode == MusicPlaybackChoice.Queue ? MCFunctionAST.MusicAction.Queue : MCFunctionAST.MusicAction.Play,
            track ? track.trackId : "",
            volume ? volume.value : undefined,
            fade ? fade.value : undefined,
            repeat ? repeat.value : undefined
        ));
    }

    //% blockId=mcfunction_music_stop_action
    //% group="MUSIC" weight=95
    //% block="stop music || $fade"
    //% expandableArgumentMode="enabled"
    //% fade.shadow="mcfunction_music_fade_option"
    export function musicStopAction(fade?: MusicFadeValue): MusicOperationValue {
        return new MusicOperationValue(MCFunctionBlocks.createMusicCommand(
            MCFunctionAST.MusicAction.Stop, undefined, undefined,
            fade ? fade.value : undefined
        ));
    }

    //% blockId=mcfunction_music_set_volume_action
    //% group="MUSIC" weight=94
    //% block="set music volume $value"
    //% value.defl=0.5
    export function musicSetVolumeAction(value: number): MusicOperationValue {
        return new MusicOperationValue(MCFunctionBlocks.createMusicCommand(
            MCFunctionAST.MusicAction.Volume, undefined, value
        ));
    }

    //% blockId=command_music_unified
    //% group="MUSIC" weight=110
    //% block="MUSIC $operation"
    //% operation.shadow="mcfunction_music_playback_action"
    //% inlineInputMode=external
    export function music(operation: MusicOperationValue): void {
        executeAudioCommand(operation ? operation.command : MCFunctionBlocks.createMusicCommand(
            MCFunctionAST.MusicAction.Play, ""
        ));
    }
}
