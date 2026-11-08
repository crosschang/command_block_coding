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
