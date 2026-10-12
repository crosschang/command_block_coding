/** One public ENCHANT command, shared Selector and typed enchantment reporters. */
namespace Command {
    export class EnchantLevelValue {
        value: number;
        constructor(value: number) { this.value = value; }
    }
    //% blockId=mcfunction_enchant_level
    //% group="ENCHANT" weight=90
    //% block="enchant level $value"
    //% value.defl=1
    export function enchantLevel(value: number): EnchantLevelValue {
        return new EnchantLevelValue(value);
    }

    //% blockId=command_enchant
    //% group="ENCHANT" weight=100
    //% block="ENCHANT target $target enchantment $enchantment || $level"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_selector_self"
    //% enchantment.shadow="mcfunction_enchantment_registry_sharpness"
    //% level.shadow="mcfunction_enchant_level"
    export function enchant(
        target: MCFunctionFields.SelectorValue,
        enchantment: MCFunctionEnchantmentLibrary.EnchantmentRef,
        level?: EnchantLevelValue
    ): void {
        executeAudioCommand(MCFunctionBlocks.createEnchantCommand(
            target ? target.selector : undefined,
            enchantment ? enchantment.idKind : MCFunctionAST.EnchantmentIdKind.Name,
            enchantment ? enchantment.name : "",
            enchantment ? enchantment.numericId : undefined,
            level ? level.value : undefined
        ));
    }
}
