/** Searchable selector family values. Custom family text remains allowed. */
//% color="#6A5ACD" weight=84 icon="\uf0c0" block="FAMILY"
//% groups='["Direct Input", "Registry"]'
namespace MCFunctionFamilyLibrary {
    //% group="Direct Input"
    //% weight=100
    //% blockId=mcfunction_family_custom_id
    //% block="family custom $family"
    //% family.shadow="text"
    //% family.defl="monster"
    export function custom(family: string): string {
        return family;
    }
}
