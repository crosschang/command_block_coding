declare namespace FunctionFile { function define(id:string,body:()=>void):void; }
declare namespace Preview { function ready():void; }
declare namespace Command {
 enum ExecutePositionContextMode { Positioned=0, FacingPosition=1 }
 enum ExecutePolarity { If=0, Unless=1 }
 function execute(clauses:any,run:any):void;
 function executeEnd():any;
 function executePositionContext(mode:ExecutePositionContextMode,p:any,next:any):any;
 function executeIfBlock(mode:ExecutePolarity,p:any,block:any,next:any):any;
 function executeAlign(axes:string,next:any):any;
 function setblock(p:any,block:any,states?:any):void;
 function say(message:string):void;
}
declare namespace MCFunctionPositionFields {
 function absolute(x:number,y:number,z:number):any;
 function relative(x:number,y:number,z:number):any;
}
declare namespace MCFunctionBlockLibrary {function custom(id:string):any;}
declare namespace MCFunctionBlockStateFields {function none():any;}
declare namespace MCFunctionExecuteRun {
 function say(message:string):any;
 function setblockFull(p:any,block:any,states?:any):any;
}
declare namespace Command {
 enum ExecuteTargetContextMode { As=0, At=1 }
 enum ExecuteEntityContextMode { PositionedAs=0, RotatedAs=1 }
 function executeTargetContext(mode:ExecuteTargetContextMode,target:any,next:any):any;
 function executeEntityContext(mode:ExecuteEntityContextMode,target:any,next:any):any;
}
declare namespace MCFunctionFields {
 function targetSelector(selector:any):any;
 function self(conditions:any):any;
 function allPlayers(conditions:any):any;
 function noSelectorCondition():any;
}
declare namespace Command {
    enum ExecuteDimensionChoice {Overworld=0,Nether=1,TheEnd=2}
    enum ExecuteAnchorChoice {Feet=0,Eyes=1}
    enum ScoreboardNumberMode {Set=0,Add=1,Remove=2}
    function executeIn(dimension:ExecuteDimensionChoice,next:any):any;
    function executeAnchored(anchor:ExecuteAnchorChoice,next:any):any;
    function executeRotated(rotation:any,next:any):any;
    function executeIfEntity(mode:ExecutePolarity,target:any,next:any):any;
    function executeIfScore(mode:ExecutePolarity,target:any,objective:string,range:any,next:any):any;
    function scoreboard(action:any):void;
    function scoreboardObjectiveAdd(objective:string,displayName?:string):any;
    function scoreboardPlayersScore(mode:ScoreboardNumberMode,target:any,objective:string,count:number):any;
}
declare namespace MCFunctionRotationFields {function absolute(yaw:number,pitch:number):any;}
declare namespace MCFunctionPositionFields {function local(x:number,y:number,z:number):any;}
declare namespace MCFunctionFields {function rangeMinMax(min:number,max:number):any;}
declare namespace Command {function mcFunction(functionId:string):void;}
