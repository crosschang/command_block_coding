/**
 * Shared Facing AST.
 *
 * Position facing is reusable by teleport/execute.
 * EntityAnchor (eyes/feet) is preserved for commands such as modern execute.
 * Bedrock teleport facing-entity syntax itself does not take an anchor token.
 */
namespace MCFunctionAST {
    export enum FacingKind {
        Position = 0,
        Entity = 1
    }

    export enum EntityAnchor {
        Eyes = 0,
        Feet = 1
    }

    export interface Facing {
        kind: FacingKind;
        position?: Position;
        entitySelector?: Selector;
        anchor?: EntityAnchor;
    }

    export function createFacingPosition(
        position: Position
    ): Facing {
        return {
            kind: FacingKind.Position,
            position: position
        };
    }

    export function createFacingEntity(
        selector: Selector,
        anchor: EntityAnchor
    ): Facing {
        return {
            kind: FacingKind.Entity,
            entitySelector: selector,
            anchor: anchor
        };
    }

    /** Facing entity form used by commands whose syntax has no eyes/feet anchor. */
    export function createFacingEntityNoAnchor(
        selector: Selector
    ): Facing {
        return {
            kind: FacingKind.Entity,
            entitySelector: selector
        };
    }

    export function entityAnchorToken(
        anchor: EntityAnchor
    ): string {
        switch (anchor) {
            case EntityAnchor.Eyes:
                return "eyes";

            case EntityAnchor.Feet:
                return "feet";

            default:
                return "feet";
        }
    }
}
