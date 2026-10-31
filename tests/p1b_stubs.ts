// Host-only tests. NOT a Minecraft Education or complete PXT build.
namespace MCFunctionAST {
    export enum CommandKind {
        Raw=0, Say=1, McFunction=2, Give=3, Teleport=4, Summon=5,
        Effect=6, Tag=7, GameMode=8, Kill=9, Clear=10, SetBlock=11,
        Fill=12, Clone=13, Particle=14, PlaySound=15, StopSound=16,
        Music=17, Gamerule=18, Enchant=19, CameraShake=20, Tell=21,
        Time=22, Weather=23, Difficulty=24, Hud=25,
        InputPermission=26, Camera=27, SpawnPoint=28,
        SetWorldSpawn=29, ClearSpawnPoint=30, Damage=31, Event=32,
        ControlScheme=33, AimAssist=34, PlayAnimation=35, Fog=36,
        Ride=37, Dialogue=38, Scoreboard=39, Execute=40
    }
    export interface CommandNode {kind: CommandKind}
    export enum SummonForm {Simple=0, Advanced=1}
    export enum SummonOrientationKind {None=0, Rotation=1, Facing=2}
    export interface SummonCommand extends CommandNode {form:SummonForm,orientation?: {kind:SummonOrientationKind}}
    export enum TimeAction {SetPreset=0,SetTicks=1,AddTicks=2,Query=3}
    export interface TimeCommand extends CommandNode {action:TimeAction}
    export enum GameRuleAction {List=0,Query=1,SetBoolean=2,SetInteger=3,SetEnum=4}
    export interface GameRuleCommand extends CommandNode {action:GameRuleAction}
    export enum ScoreboardAction {ObjectiveAdd=0,ObjectiveRemove=1,ObjectiveList=2,ObjectiveDisplay=3,PlayerSet=4,PlayerAdd=5,PlayerRemove=6,PlayerReset=7,PlayerList=8,PlayerOperation=9,PlayerTest=10,PlayerRandom=11}
    export interface ScoreboardCommand extends CommandNode {action:ScoreboardAction}
    export enum TagActionKind {Add=0,Remove=1,List=2}
    export interface TagCommand extends CommandNode {action:TagActionKind}
    export enum SpawnPointMode {Default=0,TargetCurrent=1,TargetAt=2}
    export enum CoordinateMode {Absolute=0,Relative=1,Local=2}
    export interface Position {x:{mode:CoordinateMode},y:{mode:CoordinateMode},z:{mode:CoordinateMode}}
    export interface SpawnPointCommand extends CommandNode {mode:SpawnPointMode,position?:Position}
}
namespace MCFunctionCBX12Bridge {
    let enabled=false;
    let transport="off";
    export function enable(){enabled=true;transport="legacy";}
    export function disable(){enabled=false;transport="off";}
    export function enableUnified(){enabled=true;transport="hex";}
    export function enableSelective(){enabled=true;transport="selective";}
    export function isEnabled(){return enabled;}
    export function currentTransport(){return transport;}
}
namespace FunctionFile {
    export let allow=true;
    export function allowBridgeConfiguration(){return allow;}
}
namespace MCFunctionPreview {
    export let lastMessage="";
    export function previewSay(x:string){lastMessage=x;}
}
function assert(value:boolean,msg:string): void {if (!value) throw Error(msg);}
function node(kind: MCFunctionAST.CommandKind):MCFunctionAST.CommandNode{return {kind:kind};}

