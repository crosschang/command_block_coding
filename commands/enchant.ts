/** /enchant AST: name and numeric ID forms remain distinguishable. */
namespace MCFunctionAST {
    export enum EnchantmentIdKind {
        Name = 0,
        Numeric = 1
    }
    export interface EnchantCommand extends CommandNode {
        kind: CommandKind;
        target: Selector;
        idKind: EnchantmentIdKind;
        enchantmentName?: string;
        enchantmentNumber?: number;
        level?: number;
    }
    export function createEnchantCommand(
        target: Selector,
        idKind: EnchantmentIdKind,
        enchantmentName?: string,
        enchantmentNumber?: number,
        level?: number
    ): EnchantCommand {
        return {
            kind: CommandKind.Enchant,
            target: target,
            idKind: idKind,
            enchantmentName: enchantmentName,
            enchantmentNumber: enchantmentNumber,
            level: level
        };
    }
}
