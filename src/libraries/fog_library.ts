/** Fog ID library: known resource-pack values plus unrestricted Custom ID. */
//% color="#678B9E" weight=81 icon="\uf0c2" block="FOG ID"
//% groups='["Built-in", "Custom"]'
namespace MCFunctionFogLibrary {
    export class FogValue {
        id: string;
        constructor(id: string) { this.id = id; }
    }
    //% group="Custom" weight=99
    //% blockId=mcfunction_fog_custom_id
    //% block="fog custom ID $id"
    //% id.shadow="text" id.defl="custom_pack:example"
    export function custom(id: string): FogValue { return new FogValue(id); }
}
