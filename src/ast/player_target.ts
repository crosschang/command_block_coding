/** Player-specific target. Unlike a Selector, a command target may be a named player. */
namespace MCFunctionAST {
    export enum PlayerTargetKind {
        Selector = 0,
        Name = 1
    }

    export interface PlayerTarget {
        kind: PlayerTargetKind;
        selector?: Selector;
        name?: string;
    }

    export function createSelectorPlayerTarget(selector: Selector): PlayerTarget {
        return { kind: PlayerTargetKind.Selector, selector: selector };
    }

    export function createNamedPlayerTarget(name: string): PlayerTarget {
        return { kind: PlayerTargetKind.Name, name: name };
    }
}
