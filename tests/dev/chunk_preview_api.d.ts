/** Temporary TypeScript-only stubs for MakeCode ambient APIs (not shipped). */
declare const player: {
    getOrientation(): number;
    position(): Position;
    execute(command: string): boolean;
    say(message: string): void;
    onChat(command: string, handler: (...args: any[]) => void): void;
};
declare const loops: {
    forever(handler: () => void): void;
    pause(milliseconds: number): void;
};
declare enum TimeQuery { DayTime, GameTime, Day }
declare const gameplay: {timeQuery(kind: TimeQuery): number};
interface Math {randomRange(min: number, max: number): number;}

declare enum Axis { X, Y, Z }
declare enum TestForBlocksMask { All, Masked }
interface Position { getValue(axis: Axis): number; toWorld(): Position; }
declare function world(x: number, y: number, z: number): Position;
declare function posLocal(x: number, y: number, z: number): Position;
declare const blocks: {blockByName(id: string): string; testForBlock(id: string, p: Position): boolean; testForBlocks(a: Position, b: Position, c: Position, mask: TestForBlocksMask): boolean};
