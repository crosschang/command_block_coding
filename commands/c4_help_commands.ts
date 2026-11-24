/** Remaining game help commands, represented by the canonical AST. */
namespace MCFunctionAST {
    export enum TitleAction { Show = 0, Clear = 1, Reset = 2, Times = 3 }
    export enum TitleLocation { Title = 0, Subtitle = 1, Actionbar = 2 }
    export interface TitleCommand extends CommandNode {
        target: PlayerTarget; action: TitleAction; location?: TitleLocation;
        text?: string; fadeIn?: number; stay?: number; fadeOut?: number;
    }
    export function createTitleCommand(target: PlayerTarget, action: TitleAction,
        location?: TitleLocation, text?: string, fadeIn?: number, stay?: number,
        fadeOut?: number): TitleCommand {
        return {kind: CommandKind.Title, target: target, action: action, location: location,
            text: text, fadeIn: fadeIn, stay: stay, fadeOut: fadeOut};
    }
    export enum ReplaceItemDestination { Block = 0, Entity = 1 }
    export enum ReplaceItemHandling { Destroy = 0, Keep = 1 }
    export interface ReplaceItemCommand extends CommandNode {
        destination: ReplaceItemDestination; position?: Position; target?: PlayerTarget;
        slot?: SlotLocation; slotId: number; handling?: ReplaceItemHandling; item: ItemStack;
    }
    export function createReplaceItemBlockCommand(position: Position, slotId: number,
        item: ItemStack, handling?: ReplaceItemHandling): ReplaceItemCommand {
        return {kind: CommandKind.ReplaceItem, destination: ReplaceItemDestination.Block,
            position: position, slotId: slotId, item: item, handling: handling};
    }
    export function createReplaceItemEntityCommand(target: PlayerTarget,
        slot: SlotLocation, slotId: number, item: ItemStack,
        handling?: ReplaceItemHandling): ReplaceItemCommand {
        return {kind: CommandKind.ReplaceItem, destination: ReplaceItemDestination.Entity,
            target: target, slot: slot, slotId: slotId, item: item, handling: handling};
    }
    export enum AbilityAction { Set = 0, Query = 1 }
    export interface AbilityCommand extends CommandNode {
        target: PlayerTarget; action: AbilityAction; ability?: string; value?: boolean;
    }
    export function createAbilityCommand(target: PlayerTarget, action: AbilityAction,
        ability?: string, value?: boolean): AbilityCommand {
        return {kind: CommandKind.Ability, target: target, action: action,
            ability: ability, value: value};
    }
    export interface WorldBuilderCommand extends CommandNode {}
    export function createWorldBuilderCommand(): WorldBuilderCommand {
        return {kind: CommandKind.WorldBuilder};
    }
    export interface ImmutableWorldCommand extends CommandNode { value?: boolean; }
    export function createImmutableWorldCommand(value?: boolean): ImmutableWorldCommand {
        return {kind: CommandKind.ImmutableWorld, value: value};
    }
}
