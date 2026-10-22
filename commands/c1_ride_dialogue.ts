/** C1 RIDE and DIALOGUE command AST. Reuse the shared PlayerTarget model. */
namespace MCFunctionAST {
    export enum RideAction {
        StartRiding = 0, StopRiding = 1, EvictRiders = 2,
        SummonRider = 3, SummonRide = 4
    }
    export enum RideTeleportRule { TeleportRider = 0, TeleportRide = 1 }
    export enum RideFillType { UntilFull = 0, IfGroupFits = 1 }
    export enum RideSummonRule { NoRideChange = 0, ReassignRides = 1, SkipRiders = 2 }

    export interface RideCommand extends CommandNode {
        action: RideAction;
        actor: PlayerTarget;
        mount?: PlayerTarget;
        teleportRule?: RideTeleportRule;
        fillType?: RideFillType;
        entityType?: string;
        rideRule?: RideSummonRule;
        spawnEvent?: string;
        nameTag?: string;
    }
    export function createRideCommand(action: RideAction, actor: PlayerTarget,
        mount?: PlayerTarget, entityType?: string,
        teleportRule?: RideTeleportRule, fillType?: RideFillType,
        rideRule?: RideSummonRule, spawnEvent?: string, nameTag?: string): RideCommand {
        return { kind: CommandKind.Ride, action: action, actor: actor, mount: mount,
            entityType: entityType, teleportRule: teleportRule, fillType: fillType,
            rideRule: rideRule, spawnEvent: spawnEvent, nameTag: nameTag };
    }

    export enum DialogueAction { Open = 0, Change = 1 }
    export interface DialogueCommand extends CommandNode {
        action: DialogueAction;
        npc: PlayerTarget;
        player?: PlayerTarget;
        sceneName?: string;
    }
    export function createDialogueCommand(action: DialogueAction, npc: PlayerTarget,
        player?: PlayerTarget, sceneName?: string): DialogueCommand {
        return { kind: CommandKind.Dialogue, action: action, npc: npc,
            player: player, sceneName: sceneName };
    }
}
