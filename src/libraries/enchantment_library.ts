/** Native enchantment names and numeric command IDs; name enum is versioned. */
//% color="#795548" weight=80 icon="\uf06b" block="ENCHANTMENT ID"
//% groups='["Direct Input", "Numeric ID", "Registry"]'
namespace MCFunctionEnchantmentLibrary {
    export class EnchantmentRef {
        idKind: MCFunctionAST.EnchantmentIdKind;
        name: string;
        numericId: number;
        constructor(kind: MCFunctionAST.EnchantmentIdKind, name: string, numericId?: number) {
            this.idKind = kind;
            this.name = name;
            this.numericId = numericId;
        }
    }
    //% group="Direct Input" weight=100
    //% blockId=mcfunction_enchantment_direct
    //% block="enchantment direct value $name"
    //% name.shadow="text" name.defl="sharpness"
    export function custom(name: string): EnchantmentRef {
        return new EnchantmentRef(MCFunctionAST.EnchantmentIdKind.Name, name);
    }
    //% group="Numeric ID" weight=99
    //% blockId=mcfunction_enchantment_numeric
    //% block="enchantment numeric ID $id"
    //% id.defl=9
    export function numeric(id: number): EnchantmentRef {
        return new EnchantmentRef(MCFunctionAST.EnchantmentIdKind.Numeric, "", id);
    }
}
