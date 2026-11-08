/**
 * Minecraft Slot AST
 *
 * hasitem, replaceitem 등에서 공통으로 사용한다.
 */

namespace MCFunctionAST {

    export enum SlotLocation {
        WeaponMainhand = 0,
        WeaponOffhand = 1,

        ArmorHead = 2,
        ArmorChest = 3,
        ArmorLegs = 4,
        ArmorFeet = 5,
        ArmorBody = 6,

        Hotbar = 7,
        Inventory = 8,
        EnderChest = 9,

        Saddle = 10,
        Armor = 11,
        Chest = 12,
        Equippable = 13
    }

    export function slotLocationToken(
        location: SlotLocation
    ): string {

        switch (location) {

            case SlotLocation.WeaponMainhand:
                return "slot.weapon.mainhand";

            case SlotLocation.WeaponOffhand:
                return "slot.weapon.offhand";

            case SlotLocation.ArmorHead:
                return "slot.armor.head";

            case SlotLocation.ArmorChest:
                return "slot.armor.chest";

            case SlotLocation.ArmorLegs:
                return "slot.armor.legs";

            case SlotLocation.ArmorFeet:
                return "slot.armor.feet";

            case SlotLocation.ArmorBody:
                return "slot.armor.body";

            case SlotLocation.Hotbar:
                return "slot.hotbar";

            case SlotLocation.Inventory:
                return "slot.inventory";

            case SlotLocation.EnderChest:
                return "slot.enderchest";

            case SlotLocation.Saddle:
                return "slot.saddle";

            case SlotLocation.Armor:
                return "slot.armor";

            case SlotLocation.Chest:
                return "slot.chest";

            case SlotLocation.Equippable:
                return "slot.equippable";

            default:
                return "slot.inventory";
        }
    }
}