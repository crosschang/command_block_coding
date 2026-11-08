declare namespace MCFunctionAST {
  enum CoordinateMode { Absolute=0, Relative=1, Local=2 }
  enum CommandKind { Raw=0, Say=1, SetBlock=11, Execute=40, Other=99 }
  enum ExecuteClauseKind {
    As=0, At=1, In=2, Positioned=3, Rotated=4, FacingPosition=5,
    FacingEntity=6, Align=7, Anchored=8, IfEntity=9, UnlessEntity=10,
    IfBlock=11, UnlessBlock=12, IfBlocks=13, UnlessBlocks=14, PositionedAs=17
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
declare const player: { position():Position;execute(command:string):boolean };
declare const blocks: { blockByName(id:string):any;testForBlock(id:any,p:Position):boolean;testForBlocks(a:Position,b:Position,c:Position,mask:number):boolean };
declare function world(x:number,y:number,z:number):Position;
declare const MCFunctionPreview: { previewSay(m:string):void;tryHandleQuery(c:any):{handled:boolean};observeCommand(c:any,success:boolean):void };
declare const MCFunctionCompiler: { compileCommand(c:any):string };
declare const MCFunctionPreviewBlockCommandSerializer: { tryCompile(c:any):string };
declare namespace MCFunctionAST {
  enum PlayerTargetKind { Selector=0, Name=1 }
  enum SelectorBase { AllPlayers=0, AllEntities=1, NearestPlayer=2, RandomPlayer=3, Self=4, Initiator=5 }
  type PlayerTarget = { kind: PlayerTargetKind, selector?: any, name?: string };
}
