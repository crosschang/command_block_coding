/** C4 public blocks; actual command text is compiled from AST, not built here. */
namespace Command {
    export enum TitleLocationChoice {
        //% block="title"
        Title = 0,
        //% block="subtitle"
        Subtitle = 1,
        //% block="actionbar"
        Actionbar = 2
    }
    export class TitleActionValue {
        action: MCFunctionAST.TitleAction; location?: MCFunctionAST.TitleLocation;
        text?: string; fadeIn?: number; stay?: number; fadeOut?: number;
        constructor(action: MCFunctionAST.TitleAction, location?: MCFunctionAST.TitleLocation,
            text?: string, fadeIn?: number, stay?: number, fadeOut?: number) {
            this.action = action; this.location = location; this.text = text;
            this.fadeIn = fadeIn; this.stay = stay; this.fadeOut = fadeOut;
        }
    }
    //% group="TITLE" weight=100
    //% blockId=mcfunction_title_show
    //% block="show $location text $message"
    //% message.shadow="text" message.defl="Hello!"
    export function titleShow(location: TitleLocationChoice, message: string): TitleActionValue {
        return new TitleActionValue(MCFunctionAST.TitleAction.Show,
            <MCFunctionAST.TitleLocation><number>location, message);
    }
    //% group="TITLE" weight=99
    //% blockId=mcfunction_title_clear
    //% block="clear title"
    export function titleClear(): TitleActionValue { return new TitleActionValue(MCFunctionAST.TitleAction.Clear); }
    //% group="TITLE" weight=98
    //% blockId=mcfunction_title_reset
    //% block="reset title"
    export function titleReset(): TitleActionValue { return new TitleActionValue(MCFunctionAST.TitleAction.Reset); }
    //% group="TITLE" weight=97
    //% blockId=mcfunction_title_times
    //% block="times fadeIn $fadeIn stay $stay fadeOut $fadeOut"
    //% fadeIn.defl=10 stay.defl=70 fadeOut.defl=20
    export function titleTimes(fadeIn: number, stay: number, fadeOut: number): TitleActionValue {
        return new TitleActionValue(MCFunctionAST.TitleAction.Times,
            undefined, undefined, fadeIn, stay, fadeOut);
    }
    //% group="TITLE" weight=110
    //% blockId=command_title
    //% block="TITLE player $target action $action"
    //% target.shadow="mcfunction_target_selector"
    //% action.shadow="mcfunction_title_show"
    //% inlineInputMode=external
    export function title(target: MCFunctionFields.TargetValue, action: TitleActionValue): void {
        executeAudioCommand(MCFunctionBlocks.createTitleCommand(target ? target.target : undefined,
            action ? action.action : <MCFunctionAST.TitleAction>-1,
            action ? action.location : undefined, action ? action.text : undefined,
            action ? action.fadeIn : undefined, action ? action.stay : undefined,
            action ? action.fadeOut : undefined));
    }

    export class ReplaceItemHandlingValue {
        handling: MCFunctionAST.ReplaceItemHandling;
        constructor(handling: MCFunctionAST.ReplaceItemHandling) { this.handling = handling; }
    }
    //% group="REPLACEITEM" weight=99
    //% blockId=mcfunction_replaceitem_keep
    //% block="keep old item"
    export function replaceItemKeep(): ReplaceItemHandlingValue {
        return new ReplaceItemHandlingValue(MCFunctionAST.ReplaceItemHandling.Keep);
    }
    //% group="REPLACEITEM" weight=98
    //% blockId=mcfunction_replaceitem_destroy
    //% block="destroy old item"
    export function replaceItemDestroy(): ReplaceItemHandlingValue {
        return new ReplaceItemHandlingValue(MCFunctionAST.ReplaceItemHandling.Destroy);
    }
    function replaceStack(id: string, count?: GiveCountValue, data?: GiveDataValue,
        components?: MCFunctionFields.ItemComponentsValue): MCFunctionAST.ItemStack {
        let stack = MCFunctionAST.createItemStack(id,
            count ? count.count : undefined, data ? data.data : undefined);
        if (components) stack.components = components.components;
        return stack;
    }
    //% group="REPLACEITEM" weight=110
    //% blockId=command_replaceitem_block
    //% block="REPLACEITEM BLOCK at $position slot $slotId item $item || handling $handling count $count data $data components $components"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% position.shadow="mcfunction_position_absolute"
    //% item.shadow="mcfunction_item_custom_id"
    //% slotId.defl=0
    //% handling.shadow="mcfunction_replaceitem_destroy"
    //% count.shadow="mcfunction_give_count"
    //% data.shadow="mcfunction_give_data"
    //% components.shadow="mcfunction_item_components"
    export function replaceItemBlock(position: MCFunctionPositionFields.PositionValue,
        slotId: number, item: string, handling?: ReplaceItemHandlingValue,
        count?: GiveCountValue, data?: GiveDataValue,
        components?: MCFunctionFields.ItemComponentsValue): void {
        executeAudioCommand(MCFunctionBlocks.createReplaceItemBlockCommand(
            position ? position.position : undefined, slotId, replaceStack(item,count,data,components),
            handling ? handling.handling : undefined));
    }
    //% group="REPLACEITEM" weight=109
    //% blockId=command_replaceitem_entity
    //% block="REPLACEITEM ENTITY target $target equipment $slot slot $slotId item $item || handling $handling count $count data $data components $components"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_target_selector"
    //% item.shadow="mcfunction_item_custom_id"
    //% slotId.defl=0
    //% handling.shadow="mcfunction_replaceitem_destroy"
    //% count.shadow="mcfunction_give_count"
    //% data.shadow="mcfunction_give_data"
    //% components.shadow="mcfunction_item_components"
    export function replaceItemEntity(target: MCFunctionFields.TargetValue,
        slot: MCFunctionAST.SlotLocation, slotId: number, item: string,
        handling?: ReplaceItemHandlingValue, count?: GiveCountValue,
        data?: GiveDataValue, components?: MCFunctionFields.ItemComponentsValue): void {
        executeAudioCommand(MCFunctionBlocks.createReplaceItemEntityCommand(
            target ? target.target : undefined, slot, slotId, replaceStack(item,count,data,components),
            handling ? handling.handling : undefined));
    }

    export class AbilityActionValue {
        action: MCFunctionAST.AbilityAction; ability?: string; value?: boolean;
        constructor(action: MCFunctionAST.AbilityAction, ability?: string, value?: boolean) {
            this.action = action; this.ability = ability; this.value = value;
        }
    }
    //% group="ABILITY" weight=100
    //% blockId=mcfunction_ability_set
    //% block="set ability $ability to $value"
    //% ability.shadow="text" ability.defl="mayfly"
    export function abilitySet(ability: string, value: MCFunctionFields.BooleanLiteral): AbilityActionValue {
        return new AbilityActionValue(MCFunctionAST.AbilityAction.Set, ability,
            MCFunctionFields.booleanLiteralValue(value));
    }
    //% group="ABILITY" weight=99
    //% blockId=mcfunction_ability_query
    //% block="query abilities || name $ability"
    //% expandableArgumentMode="enabled"
    //% ability.shadow="text" ability.defl="mayfly"
    export function abilityQuery(ability?: string): AbilityActionValue {
        return new AbilityActionValue(MCFunctionAST.AbilityAction.Query, ability);
    }
    //% group="ABILITY" weight=110
    //% blockId=command_ability
    //% block="ABILITY player $target action $action"
    //% target.shadow="mcfunction_target_selector"
    //% action.shadow="mcfunction_ability_set"
    //% inlineInputMode=external
    export function ability(target: MCFunctionFields.TargetValue, action: AbilityActionValue): void {
        executeAudioCommand(MCFunctionBlocks.createAbilityCommand(target ? target.target : undefined,
            action ? action.action : <MCFunctionAST.AbilityAction>-1,
            action ? action.ability : undefined, action ? action.value : undefined));
    }
    //% group="WORLDBUILDER" weight=110
    //% blockId=command_worldbuilder
    //% block="WORLDBUILDER toggle for executor"
    export function worldBuilder(): void {
        executeAudioCommand(MCFunctionBlocks.createWorldBuilderCommand());
    }
    //% group="IMMUTABLEWORLD" weight=110
    //% blockId=command_immutableworld
    //% block="IMMUTABLEWORLD || value $value"
    //% expandableArgumentMode="enabled"
    export function immutableWorld(value?: MCFunctionFields.BooleanLiteral): void {
        executeAudioCommand(MCFunctionBlocks.createImmutableWorldCommand(
            value == undefined ? undefined : MCFunctionFields.booleanLiteralValue(value)));
    }
}
