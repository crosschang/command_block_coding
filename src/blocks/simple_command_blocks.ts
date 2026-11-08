/** MakeCode public APIs for the first group of simple commands. */
namespace Command {
    export enum TimePresetChoice {
        //% block="day"
        Day = 0,
        //% block="sunrise"
        Sunrise = 1,
        //% block="noon"
        Noon = 2,
        //% block="sunset"
        Sunset = 3,
        //% block="night"
        Night = 4,
        //% block="midnight"
        Midnight = 5
    }
    export enum TimeQueryChoice {
        //% block="daytime (0-23999)"
        DayTime = 0,
        //% block="gametime (total ticks)"
        GameTime = 1,
        //% block="day (world day)"
        Day = 2
    }
    export enum WeatherChoice {
        //% block="clear"
        Clear = 0,
        //% block="rain"
        Rain = 1,
        //% block="thunder"
        Thunder = 2
    }
    export enum DifficultyChoice {
        //% block="peaceful"
        Peaceful = 0,
        //% block="easy"
        Easy = 1,
        //% block="normal"
        Normal = 2,
        //% block="hard"
        Hard = 3
    }
    export enum HudVisibilityChoice {
        //% block="hide"
        Hide = 0,
        //% block="reset"
        Reset = 1
    }
    export enum HudElementChoice {
        //% block="all"
        All = 0,
        //% block="hotbar"
        Hotbar = 1,
        //% block="health"
        Health = 2,
        //% block="hunger"
        Hunger = 3,
        //% block="armor"
        Armor = 4,
        //% block="crosshair"
        Crosshair = 5,
        //% block="paperdoll"
        Paperdoll = 6,
        //% block="tooltips"
        Tooltips = 7,
        //% block="air bubbles"
        AirBubbles = 8,
        //% block="progress bar"
        ProgressBar = 9,
        //% block="horse health"
        HorseHealth = 10,
        //% block="touch controls"
        TouchControls = 11,
        //% block="status effects"
        StatusEffects = 12,
        //% block="item text"
        ItemText = 13
    }
    export enum InputPermissionChoice {
        //% block="movement"
        Movement = 0,
        //% block="camera"
        Camera = 1,
        //% block="jump"
        Jump = 2,
        //% block="lateral movement"
        LateralMovement = 3,
        //% block="sneak"
        Sneak = 4,
        //% block="dismount"
        Dismount = 5,
        //% block="mount"
        Mount = 6,
        //% block="move backward"
        MoveBackward = 7,
        //% block="move forward"
        MoveForward = 8,
        //% block="move left"
        MoveLeft = 9,
        //% block="move right"
        MoveRight = 10
    }
    export enum InputStateChoice {
        //% block="enabled"
        Enabled = 0,
        //% block="disabled"
        Disabled = 1
    }
    export class WeatherDurationValue {
        duration: number;
        constructor(duration: number) { this.duration = duration; }
    }
    export class HudElementValue {
        element: MCFunctionAST.HudElement;
        constructor(element: MCFunctionAST.HudElement) { this.element = element; }
    }
    //% blockId=mcfunction_hud_element_choice
    //% group="HUD" weight=95
    //% block="HUD element $element"
    export function hudElement(element: HudElementChoice): HudElementValue {
        return new HudElementValue(<MCFunctionAST.HudElement><number>element);
    }
    //% blockId=mcfunction_weather_duration_seconds
    //% group="WEATHER" weight=90
    //% block="duration seconds $duration" duration.defl=300
    export function weatherDuration(duration: number): WeatherDurationValue {
        return new WeatherDurationValue(duration);
    }
    //% blockId=command_tell
    //% group="TELL" weight=100
    //% block="TELL $target message $message"
    //% target.shadow="mcfunction_selector_self"
    //% message.shadow="text" message.defl="Hello!"
    //% inlineInputMode=external
    export function tell(target: MCFunctionFields.SelectorValue, message: string): void {
        executeAudioCommand(MCFunctionBlocks.createTellCommand(target ? target.selector : undefined, message));
    }
    //% blockId=command_time_set_preset
    //% group="TIME" weight=100
    //% block="TIME set $preset"
    export function timeSetPreset(preset: TimePresetChoice): void {
        executeAudioCommand(MCFunctionBlocks.createTimeCommand(MCFunctionAST.TimeAction.SetPreset, <MCFunctionAST.TimePreset><number>preset));
    }
    //% blockId=command_time_set_ticks
    //% group="TIME" weight=99
    //% block="TIME set ticks $ticks" ticks.defl=6000
    export function timeSetTicks(ticks: number): void {
        executeAudioCommand(MCFunctionBlocks.createTimeCommand(MCFunctionAST.TimeAction.SetTicks, undefined, ticks));
    }
    //% blockId=command_time_add_ticks
    //% group="TIME" weight=98
    //% block="TIME add ticks $ticks" ticks.defl=1000
    export function timeAddTicks(ticks: number): void {
        executeAudioCommand(MCFunctionBlocks.createTimeCommand(MCFunctionAST.TimeAction.AddTicks, undefined, ticks));
    }
    //% blockId=command_time_query
    //% group="TIME" weight=97
    //% block="TIME query $query"
    export function timeQuery(query: TimeQueryChoice): void {
        executeAudioCommand(MCFunctionBlocks.createTimeCommand(
            MCFunctionAST.TimeAction.Query, undefined, undefined,
            <MCFunctionAST.TimeQueryKind><number>query));
    }
    //% blockId=command_weather_set
    //% group="WEATHER" weight=100
    //% block="WEATHER $weather || $duration"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% duration.shadow="mcfunction_weather_duration_seconds"
    export function weatherSet(weather: WeatherChoice, duration?: WeatherDurationValue): void {
        executeAudioCommand(MCFunctionBlocks.createWeatherCommand(<MCFunctionAST.WeatherType><number>weather, duration ? duration.duration : undefined));
    }
    //% blockId=command_difficulty_set
    //% group="DIFFICULTY" weight=100
    //% block="DIFFICULTY $difficulty"
    export function difficultySet(difficulty: DifficultyChoice): void {
        executeAudioCommand(MCFunctionBlocks.createDifficultyCommand(<MCFunctionAST.DifficultyType><number>difficulty));
    }
    //% blockId=command_hud_set
    //% group="HUD" weight=100
    //% block="HUD target $target $visibility || $element"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_selector_self"
    //% element.shadow="mcfunction_hud_element_choice"
    export function hudSet(target: MCFunctionFields.SelectorValue, visibility: HudVisibilityChoice,
        element?: HudElementValue): void {
        executeAudioCommand(MCFunctionBlocks.createHudCommand(target ? target.selector : undefined, <MCFunctionAST.HudVisibility><number>visibility,
            element ? element.element : undefined));
    }
    //% blockId=command_inputpermission_set
    //% group="INPUTPERMISSION" weight=100
    //% block="INPUTPERMISSION target $target permission $permission state $state"
    //% target.shadow="mcfunction_selector_self"
    //% inlineInputMode=external
    export function inputPermissionSet(target: MCFunctionFields.SelectorValue,
        permission: InputPermissionChoice, state: InputStateChoice): void {
        executeAudioCommand(MCFunctionBlocks.createInputPermissionCommand(
            target ? target.selector : undefined, <MCFunctionAST.InputPermissionType><number>permission,
            <MCFunctionAST.InputPermissionState><number>state));
    }
}
