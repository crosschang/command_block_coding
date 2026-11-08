/** Temporary TypeScript-only stubs for MakeCode ambient APIs (not shipped). */
declare const player: {
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
