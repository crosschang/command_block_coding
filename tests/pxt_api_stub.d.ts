declare namespace MCFunctionAST {
  enum CoordinateMode { Absolute=0, Relative=1, Local=2 }
  enum CommandKind { Raw=0, Say=1, Give=3, Effect=6, Tag=7, SetBlock=11, Execute=40, Other=99 }
  enum ExecuteClauseKind {
    As=0, At=1, In=2, Positioned=3, Rotated=4, FacingPosition=5,
    FacingEntity=6, Align=7, Anchored=8, IfEntity=9, UnlessEntity=10,
    IfBlock=11, UnlessBlock=12, IfBlocks=13, UnlessBlocks=14, IfScoreMatches=15, UnlessScoreMatches=16, PositionedAs=17, RotatedAs=18, IfScoreCompare=19, UnlessScoreCompare=20
  }
  enum ExecuteScan {All=0, Masked=1}
  type Position = any;
  type Coordinate = any;
  type ExecuteClause = any;
  type CommandNode = any;
  type ExecuteCommand = any;
  type SetBlockCommand = any;
  function createAbsolutePosition(x:number, y:number, z:number): any;
  function createSetBlockCommand(p:any,id:string,states?:any,mode?:any):any;
}
declare interface Position { getValue(axis:number):number; }
declare const Axis: { X:number;Y:number;Z:number };
declare const TestForBlocksMask: { Masked:number;All:number };
declare const player: { position():Position;execute(command:string):boolean; getOrientation():number };
declare const blocks: { blockByName(id:string):any;testForBlock(id:any,p:Position):boolean;testForBlocks(a:Position,b:Position,c:Position,mask:number):boolean };
declare function world(x:number,y:number,z:number):Position;
declare namespace MCFunctionPreview { function previewSay(m:string):void;function tryHandleQuery(c:any):{handled:boolean};function observeCommand(c:any,success:boolean):void; }
declare const MCFunctionCompiler: { compileCommand(c:any):string; compilePlayerTarget(t:any):string; compileSelector(s:any):string };
declare const MCFunctionPreviewBlockCommandSerializer: { tryCompile(c:any):string };
declare namespace MCFunctionAST {
  enum PlayerTargetKind { Selector=0, Name=1 }
  enum SelectorBase { AllPlayers=0, AllEntities=1, NearestPlayer=2, RandomPlayer=3, Self=4, Initiator=5 }
  type PlayerTarget = { kind: PlayerTargetKind, selector?: any, name?: string };
}
interface Position { toWorld(): Position; }
declare function posLocal(x:number,y:number,z:number): Position;
declare namespace MCFunctionAST {
    enum RotationMode { Absolute=0, Relative=1 }
    type Rotation = any;
    enum EntityAnchor { Eyes=0, Feet=1 }
    function createExecuteCommand(clauses:any[], run:any):any;
}

declare namespace MCFunctionAST {
    type NumberRange = any;
    function createSelector(base:SelectorBase):any;
    function addSelectorScoreCondition(selector:any,condition:any):void;
    function createSelectorScoreCondition(objective:string,range:any,inverted:boolean):any;
    function createMaxRange(max:number):any;
    function createMinRange(min:number):any;
}
interface CompilerHelper { compileSelector(s:any):string; }
declare namespace MCFunctionAST {
    enum ExecuteScoreComparison { Equal=0, Less=1, LessOrEqual=2, Greater=3, GreaterOrEqual=4 }
    function createMinMaxRange(minimum:number, maximum:number):any;
}

declare namespace MCFunctionPreview {
function createInternalTagScopeToken():string;
function createInternalTagName(purpose:string,token:string):string;
function cleanupInternalTag(tag:string):void;
function previewEscapeJsonText(text:string):string;
}
