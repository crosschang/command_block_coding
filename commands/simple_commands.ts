/** First-batch native commands. Structured AST, separate from Preview. */
namespace MCFunctionAST {
    export interface TellCommand extends CommandNode {
        kind: CommandKind;
        target: Selector;
        message: string;
    }
    export function createTellCommand(target: Selector, message: string): TellCommand {
        return {kind: CommandKind.Tell, target: target, message: message};
    }
    export enum TimeAction { SetPreset = 0, SetTicks = 1, AddTicks = 2 }
    export enum TimePreset { Day = 0, Sunrise = 1, Noon = 2, Sunset = 3, Night = 4, Midnight = 5 }
    export interface TimeCommand extends CommandNode {
        kind: CommandKind;
        action: TimeAction;
        preset?: TimePreset;
        ticks?: number;
    }
    export function createTimeCommand(action: TimeAction, preset?: TimePreset, ticks?: number): TimeCommand {
        return {kind: CommandKind.Time, action: action, preset: preset, ticks: ticks};
    }
    export enum WeatherType { Clear = 0, Rain = 1, Thunder = 2 }
    export interface WeatherCommand extends CommandNode {
        kind: CommandKind;
        weather: WeatherType;
        duration?: number;
    }
    export function createWeatherCommand(weather: WeatherType, duration?: number): WeatherCommand {
        return {kind: CommandKind.Weather, weather: weather, duration: duration};
    }
    export enum DifficultyType { Peaceful = 0, Easy = 1, Normal = 2, Hard = 3 }
    export interface DifficultyCommand extends CommandNode {
        kind: CommandKind;
        difficulty: DifficultyType;
    }
    export function createDifficultyCommand(difficulty: DifficultyType): DifficultyCommand {
        return {kind: CommandKind.Difficulty, difficulty: difficulty};
    }
    export enum HudVisibility { Hide = 0, Reset = 1 }
    export enum HudElement {
        All = 0, Hotbar = 1, Health = 2, Hunger = 3, Armor = 4,
        Crosshair = 5, Paperdoll = 6, Tooltips = 7, AirBubbles = 8,
        ProgressBar = 9, HorseHealth = 10, TouchControls = 11,
        StatusEffects = 12, ItemText = 13
    }
    export interface HudCommand extends CommandNode {
        kind: CommandKind;
        target: Selector;
        visibility: HudVisibility;
        element?: HudElement;
    }
    export function createHudCommand(target: Selector, visibility: HudVisibility, element?: HudElement): HudCommand {
        return {kind: CommandKind.Hud, target: target, visibility: visibility, element: element};
    }
    export enum InputPermissionType {
        Movement = 0, Camera = 1, Jump = 2, LateralMovement = 3,
        Sneak = 4, Dismount = 5, Mount = 6, MoveBackward = 7,
        MoveForward = 8, MoveLeft = 9, MoveRight = 10
    }
    export enum InputPermissionState { Enabled = 0, Disabled = 1 }
    export interface InputPermissionCommand extends CommandNode {
        kind: CommandKind;
        target: Selector;
        permission: InputPermissionType;
        state: InputPermissionState;
    }
    export function createInputPermissionCommand(target: Selector, permission: InputPermissionType,
        state: InputPermissionState): InputPermissionCommand {
        return {kind: CommandKind.InputPermission, target: target, permission: permission, state: state};
    }
}
