/** Searchable Entity ID values. Full Registry reporters are generated separately. */
//% color="#2E8B57" weight=89 icon="\uf1b0" block="ENTITY ID"
//% groups='["Direct Input", "Registry"]'
namespace MCFunctionEntityLibrary {
    //% group="Direct Input"
    //% weight=100
    //% blockId=mcfunction_entity_custom_id
    //% block="entity custom id $entityId"
    //% entityId.shadow="text"
    //% entityId.defl="minecraft:zombie"
    export function custom(entityId: string): MCFunctionFields.EntityValue {
        return MCFunctionFields.entity(entityId);
    }
}
