/** Searchable particle identifiers. Custom namespace IDs remain allowed. */
//% color="#00ACC1" weight=85 icon="\uf0c2" block="PARTICLE ID"
//% groups='["Direct Input", "Registry"]'
namespace MCFunctionParticleLibrary {
    //% group="Direct Input"
    //% weight=100
    //% blockId=mcfunction_particle_custom_id
    //% block="particle custom id $particleId"
    //% particleId.shadow="text"
    //% particleId.defl="minecraft:basic_flame_particle"
    export function custom(particleId: string): MCFunctionFields.ParticleValue {
        return MCFunctionFields.particle(particleId);
    }
}
