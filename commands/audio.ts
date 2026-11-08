/** Sound/Music command meaning is independent of MakeCode reporter presentation. */
namespace MCFunctionAST {
    export interface PlaySoundCommand extends CommandNode {
        kind: CommandKind;
        soundId: string;
        target?: Selector;
        position?: Position;
        volume?: number;
        pitch?: number;
        minimumVolume?: number;
    }
    export interface StopSoundCommand extends CommandNode {
        kind: CommandKind;
        target: Selector;
        soundId?: string;
    }
    export enum MusicAction {
        Play = 0,
        Queue = 1,
        Stop = 2,
        Volume = 3
    }
    export enum MusicRepeatMode {
        PlayOnce = 0,
        Loop = 1
    }
    export interface MusicCommand extends CommandNode {
        kind: CommandKind;
        action: MusicAction;
        trackId?: string;
        volume?: number;
        fadeSeconds?: number;
        repeatMode?: MusicRepeatMode;
    }
    export function createPlaySoundCommand(
        soundId: string, target?: Selector, position?: Position,
        volume?: number, pitch?: number, minimumVolume?: number
    ): PlaySoundCommand {
        return { kind: CommandKind.PlaySound, soundId: soundId,
            target: target, position: position, volume: volume,
            pitch: pitch, minimumVolume: minimumVolume };
    }
    export function createStopSoundCommand(target: Selector, soundId?: string): StopSoundCommand {
        return {kind: CommandKind.StopSound, target: target, soundId: soundId};
    }
    export function createMusicCommand(
        action: MusicAction, trackId?: string, volume?: number,
        fadeSeconds?: number, repeatMode?: MusicRepeatMode
    ): MusicCommand {
        return { kind: CommandKind.Music, action: action, trackId: trackId,
            volume: volume, fadeSeconds: fadeSeconds, repeatMode: repeatMode };
    }
}
