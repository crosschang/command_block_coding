/**
 * AUTO-GENERATED FILE. DO NOT EDIT BY HAND.
 *
 * Source: registry/derived/bedrock/spawn_events.json
 * Generator: tools/generate_registry.ps1
 *
 * Values are grouped by vanilla entity for MakeCode Toolbox browsing.
 * Direct/custom input remains available in this generated category.
 */

//% color="#D35400" weight=82 icon="\uf1d8" block="SPAWN EVENT"
//% groups='["Direct Input","Allay","Armadillo","Arrow","Axolotl","Bee","Blaze","Boat","Bogged","Breeze","Camel","Camel Husk","Cat","Cave Spider","Chest Boat","Chicken","Command Block Minecart","Copper Golem","Cow","Creaking","Creeper","Dolphin","Donkey","Drowned","Egg","Ender Crystal","Ender Dragon","Ender Pearl","Enderman","Evocation Illager","Fireball","Fishing Hook","Fox","Frog","Glow Squid","Goat","Guardian","Happy Ghast","Hoglin","Hopper Minecart","Horse","Husk","Iron Golem","Llama","Magma Cube","Mooshroom","Mule","Nautilus","Ocelot","Panda","Parched","Parrot","Pig","Piglin","Piglin Brute","Pillager","Player","Polar Bear","Pufferfish","Rabbit","Ravager","Salmon","Sheep","Shulker","Silverfish","Skeleton","Skeleton Horse","Slime","Sniffer","Snow Golem","Spider","Squid","Stray","Strider","Sulfur Cube","Tadpole","Tnt","Tnt Minecart","Trader Llama","Tropicalfish","Turtle","Vex","Villager","Villager V2","Vindicator","Wandering Trader","Warden","Witch","Wither","Wither Skeleton","Wither Skull","Wither Skull Dangerous","Wolf","Zoglin","Zombie","Zombie Horse","Zombie Nautilus","Zombie Pigman","Zombie Villager","Zombie Villager V2"]'
namespace MCFunctionSpawnEventLibrary {

    //% group="Direct Input"
    //% weight=100
    //% blockId=mcfunction_spawn_event_custom_id
    //% block="spawn event custom $eventId"
    //% eventId.shadow="text"
    //% eventId.defl="minecraft:entity_spawned"
    export function custom(eventId: string): string {
        return eventId;
    }

    //% group="Allay"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_allay_minecraft_entity_spawned
    //% block="allay recommended spawn event minecraft:entity_spawned"
    export function allayEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Allay"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_allay_pickup_item_delay
    //% block="allay spawn event pickup_item_delay"
    export function allayPickupItemDelay(): string {
        return "pickup_item_delay";
    }

    //% group="Allay"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_allay_pickup_item_delay_complete
    //% block="allay spawn event pickup_item_delay_complete"
    export function allayPickupItemDelayComplete(): string {
        return "pickup_item_delay_complete";
    }

    //% group="Armadillo"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_armadillo_minecraft_entity_born
    //% block="armadillo recommended spawn event minecraft:entity_born"
    export function armadilloEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Armadillo"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_armadillo_minecraft_entity_spawned
    //% block="armadillo recommended spawn event minecraft:entity_spawned"
    export function armadilloEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Armadillo"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_armadillo_minecraft_ageable_grow_up
    //% block="armadillo spawn event minecraft:ageable_grow_up"
    export function armadilloAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Armadillo"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_armadillo_minecraft_no_threat_detected
    //% block="armadillo spawn event minecraft:no_threat_detected"
    export function armadilloNoThreatDetected(): string {
        return "minecraft:no_threat_detected";
    }

    //% group="Armadillo"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_armadillo_minecraft_roll_up
    //% block="armadillo spawn event minecraft:roll_up"
    export function armadilloRollUp(): string {
        return "minecraft:roll_up";
    }

    //% group="Armadillo"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_armadillo_minecraft_spawn_adult
    //% block="armadillo spawn event minecraft:spawn_adult"
    export function armadilloSpawnAdult(): string {
        return "minecraft:spawn_adult";
    }

    //% group="Armadillo"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_armadillo_minecraft_spawn_baby
    //% block="armadillo spawn event minecraft:spawn_baby"
    export function armadilloSpawnBaby(): string {
        return "minecraft:spawn_baby";
    }

    //% group="Armadillo"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_armadillo_minecraft_start_peeking
    //% block="armadillo spawn event minecraft:start_peeking"
    export function armadilloStartPeeking(): string {
        return "minecraft:start_peeking";
    }

    //% group="Armadillo"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_armadillo_minecraft_start_unrolling
    //% block="armadillo spawn event minecraft:start_unrolling"
    export function armadilloStartUnrolling(): string {
        return "minecraft:start_unrolling";
    }

    //% group="Armadillo"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_armadillo_minecraft_stop_peeking
    //% block="armadillo spawn event minecraft:stop_peeking"
    export function armadilloStopPeeking(): string {
        return "minecraft:stop_peeking";
    }

    //% group="Armadillo"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_armadillo_minecraft_threat_detected
    //% block="armadillo spawn event minecraft:threat_detected"
    export function armadilloThreatDetected(): string {
        return "minecraft:threat_detected";
    }

    //% group="Armadillo"
    //% weight=79
    //% blockId=mcfunction_spawn_event_minecraft_armadillo_minecraft_unroll
    //% block="armadillo spawn event minecraft:unroll"
    export function armadilloUnroll(): string {
        return "minecraft:unroll";
    }

    //% group="Arrow"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_arrow_minecraft_entity_spawned
    //% block="arrow recommended spawn event minecraft:entity_spawned"
    export function arrowEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Axolotl"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_axolotl_minecraft_entity_born
    //% block="axolotl recommended spawn event minecraft:entity_born"
    export function axolotlEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Axolotl"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_axolotl_minecraft_entity_spawned
    //% block="axolotl recommended spawn event minecraft:entity_spawned"
    export function axolotlEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Axolotl"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_axolotl_attack_cooldown_complete_event
    //% block="axolotl spawn event attack_cooldown_complete_event"
    export function axolotlAttackCooldownCompleteEvent(): string {
        return "attack_cooldown_complete_event";
    }

    //% group="Axolotl"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_axolotl_dried_out
    //% block="axolotl spawn event dried_out"
    export function axolotlDriedOut(): string {
        return "dried_out";
    }

    //% group="Axolotl"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_axolotl_enter_water
    //% block="axolotl spawn event enter_water"
    export function axolotlEnterWater(): string {
        return "enter_water";
    }

    //% group="Axolotl"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_axolotl_killed_enemy_event
    //% block="axolotl spawn event killed_enemy_event"
    export function axolotlKilledEnemyEvent(): string {
        return "killed_enemy_event";
    }

    //% group="Axolotl"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_axolotl_minecraft_ageable_grow_up
    //% block="axolotl spawn event minecraft:ageable_grow_up"
    export function axolotlAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Axolotl"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_axolotl_recover_after_dried_out
    //% block="axolotl spawn event recover_after_dried_out"
    export function axolotlRecoverAfterDriedOut(): string {
        return "recover_after_dried_out";
    }

    //% group="Axolotl"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_axolotl_start_drying_out
    //% block="axolotl spawn event start_drying_out"
    export function axolotlStartDryingOut(): string {
        return "start_drying_out";
    }

    //% group="Axolotl"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_axolotl_stop_drying_out
    //% block="axolotl spawn event stop_drying_out"
    export function axolotlStopDryingOut(): string {
        return "stop_drying_out";
    }

    //% group="Bee"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_bee_minecraft_entity_born
    //% block="bee recommended spawn event minecraft:entity_born"
    export function beeEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Bee"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_bee_minecraft_entity_spawned
    //% block="bee recommended spawn event minecraft:entity_spawned"
    export function beeEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Bee"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_bee_abort_sheltering
    //% block="bee spawn event abort_sheltering"
    export function beeAbortSheltering(): string {
        return "abort_sheltering";
    }

    //% group="Bee"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_bee_attacked
    //% block="bee spawn event attacked"
    export function beeAttacked(): string {
        return "attacked";
    }

    //% group="Bee"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_bee_calmed_down
    //% block="bee spawn event calmed_down"
    export function beeCalmedDown(): string {
        return "calmed_down";
    }

    //% group="Bee"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_bee_collected_nectar
    //% block="bee spawn event collected_nectar"
    export function beeCollectedNectar(): string {
        return "collected_nectar";
    }

    //% group="Bee"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_bee_countdown_to_perish_event
    //% block="bee spawn event countdown_to_perish_event"
    export function beeCountdownToPerishEvent(): string {
        return "countdown_to_perish_event";
    }

    //% group="Bee"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_bee_fed_open_eyeblossom
    //% block="bee spawn event fed_open_eyeblossom"
    export function beeFedOpenEyeblossom(): string {
        return "fed_open_eyeblossom";
    }

    //% group="Bee"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_bee_fed_wither_rose
    //% block="bee spawn event fed_wither_rose"
    export function beeFedWitherRose(): string {
        return "fed_wither_rose";
    }

    //% group="Bee"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_bee_find_flower_timeout
    //% block="bee spawn event find_flower_timeout"
    export function beeFindFlowerTimeout(): string {
        return "find_flower_timeout";
    }

    //% group="Bee"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_bee_find_hive_event
    //% block="bee spawn event find_hive_event"
    export function beeFindHiveEvent(): string {
        return "find_hive_event";
    }

    //% group="Bee"
    //% weight=79
    //% blockId=mcfunction_spawn_event_minecraft_bee_find_hive_timeout
    //% block="bee spawn event find_hive_timeout"
    export function beeFindHiveTimeout(): string {
        return "find_hive_timeout";
    }

    //% group="Bee"
    //% weight=78
    //% blockId=mcfunction_spawn_event_minecraft_bee_hive_destroyed
    //% block="bee spawn event hive_destroyed"
    export function beeHiveDestroyed(): string {
        return "hive_destroyed";
    }

    //% group="Bee"
    //% weight=77
    //% blockId=mcfunction_spawn_event_minecraft_bee_minecraft_ageable_grow_up
    //% block="bee spawn event minecraft:ageable_grow_up"
    export function beeAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Bee"
    //% weight=76
    //% blockId=mcfunction_spawn_event_minecraft_bee_minecraft_exited_disturbed_hive
    //% block="bee spawn event minecraft:exited_disturbed_hive"
    export function beeExitedDisturbedHive(): string {
        return "minecraft:exited_disturbed_hive";
    }

    //% group="Bee"
    //% weight=75
    //% blockId=mcfunction_spawn_event_minecraft_bee_minecraft_exited_hive
    //% block="bee spawn event minecraft:exited_hive"
    export function beeExitedHive(): string {
        return "minecraft:exited_hive";
    }

    //% group="Bee"
    //% weight=74
    //% blockId=mcfunction_spawn_event_minecraft_bee_minecraft_exited_hive_on_fire
    //% block="bee spawn event minecraft:exited_hive_on_fire"
    export function beeExitedHiveOnFire(): string {
        return "minecraft:exited_hive_on_fire";
    }

    //% group="Bee"
    //% weight=73
    //% blockId=mcfunction_spawn_event_minecraft_bee_minecraft_hive_full
    //% block="bee spawn event minecraft:hive_full"
    export function beeHiveFull(): string {
        return "minecraft:hive_full";
    }

    //% group="Bee"
    //% weight=72
    //% blockId=mcfunction_spawn_event_minecraft_bee_minecraft_spawn_adult
    //% block="bee spawn event minecraft:spawn_adult"
    export function beeSpawnAdult(): string {
        return "minecraft:spawn_adult";
    }

    //% group="Bee"
    //% weight=71
    //% blockId=mcfunction_spawn_event_minecraft_bee_on_poison_effect_added
    //% block="bee spawn event on_poison_effect_added"
    export function beeOnPoisonEffectAdded(): string {
        return "on_poison_effect_added";
    }

    //% group="Bee"
    //% weight=70
    //% blockId=mcfunction_spawn_event_minecraft_bee_on_wither_effect_added
    //% block="bee spawn event on_wither_effect_added"
    export function beeOnWitherEffectAdded(): string {
        return "on_wither_effect_added";
    }

    //% group="Bee"
    //% weight=69
    //% blockId=mcfunction_spawn_event_minecraft_bee_perish_event
    //% block="bee spawn event perish_event"
    export function beePerishEvent(): string {
        return "perish_event";
    }

    //% group="Bee"
    //% weight=68
    //% blockId=mcfunction_spawn_event_minecraft_bee_seek_shelter
    //% block="bee spawn event seek_shelter"
    export function beeSeekShelter(): string {
        return "seek_shelter";
    }

    //% group="Bee"
    //% weight=67
    //% blockId=mcfunction_spawn_event_minecraft_bee_stop_panicking_after_fire
    //% block="bee spawn event stop_panicking_after_fire"
    export function beeStopPanickingAfterFire(): string {
        return "stop_panicking_after_fire";
    }

    //% group="Blaze"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_blaze_minecraft_entity_spawned
    //% block="blaze recommended spawn event minecraft:entity_spawned"
    export function blazeEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Blaze"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_blaze_minecraft_on_hurt_event
    //% block="blaze spawn event minecraft:on_hurt_event"
    export function blazeOnHurtEvent(): string {
        return "minecraft:on_hurt_event";
    }

    //% group="Blaze"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_blaze_switch_to_melee
    //% block="blaze spawn event switch_to_melee"
    export function blazeSwitchToMelee(): string {
        return "switch_to_melee";
    }

    //% group="Blaze"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_blaze_switch_to_ranged
    //% block="blaze spawn event switch_to_ranged"
    export function blazeSwitchToRanged(): string {
        return "switch_to_ranged";
    }

    //% group="Boat"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_boat_minecraft_entity_spawned
    //% block="boat recommended spawn event minecraft:entity_spawned"
    export function boatEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Boat"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_boat_minecraft_add_can_ride
    //% block="boat spawn event minecraft:add_can_ride"
    export function boatAddCanRide(): string {
        return "minecraft:add_can_ride";
    }

    //% group="Boat"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_boat_minecraft_entered_bubble_column_down
    //% block="boat spawn event minecraft:entered_bubble_column_down"
    export function boatEnteredBubbleColumnDown(): string {
        return "minecraft:entered_bubble_column_down";
    }

    //% group="Boat"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_boat_minecraft_entered_bubble_column_up
    //% block="boat spawn event minecraft:entered_bubble_column_up"
    export function boatEnteredBubbleColumnUp(): string {
        return "minecraft:entered_bubble_column_up";
    }

    //% group="Boat"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_boat_minecraft_exited_bubble_column
    //% block="boat spawn event minecraft:exited_bubble_column"
    export function boatExitedBubbleColumn(): string {
        return "minecraft:exited_bubble_column";
    }

    //% group="Boat"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_boat_minecraft_sink
    //% block="boat spawn event minecraft:sink"
    export function boatSink(): string {
        return "minecraft:sink";
    }

    //% group="Bogged"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_bogged_minecraft_entity_spawned
    //% block="bogged recommended spawn event minecraft:entity_spawned"
    export function boggedEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Bogged"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_bogged_minecraft_ranged_mode
    //% block="bogged recommended spawn event minecraft:ranged_mode"
    export function boggedRangedMode(): string {
        return "minecraft:ranged_mode";
    }

    //% group="Bogged"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_bogged_be_sheared
    //% block="bogged spawn event be_sheared"
    export function boggedBeSheared(): string {
        return "be_sheared";
    }

    //% group="Bogged"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_bogged_minecraft_melee_mode
    //% block="bogged spawn event minecraft:melee_mode"
    export function boggedMeleeMode(): string {
        return "minecraft:melee_mode";
    }

    //% group="Bogged"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_bogged_minecraft_switch_to_hard_ranged
    //% block="bogged spawn event minecraft:switch_to_hard_ranged"
    export function boggedSwitchToHardRanged(): string {
        return "minecraft:switch_to_hard_ranged";
    }

    //% group="Bogged"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_bogged_minecraft_switch_to_normal_ranged
    //% block="bogged spawn event minecraft:switch_to_normal_ranged"
    export function boggedSwitchToNormalRanged(): string {
        return "minecraft:switch_to_normal_ranged";
    }

    //% group="Breeze"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_breeze_minecraft_start_playing_idle_ground_sound
    //% block="breeze spawn event minecraft:start_playing_idle_ground_sound"
    export function breezeStartPlayingIdleGroundSound(): string {
        return "minecraft:start_playing_idle_ground_sound";
    }

    //% group="Breeze"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_breeze_minecraft_stop_playing_idle_ground_sound
    //% block="breeze spawn event minecraft:stop_playing_idle_ground_sound"
    export function breezeStopPlayingIdleGroundSound(): string {
        return "minecraft:stop_playing_idle_ground_sound";
    }

    //% group="Camel"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_camel_minecraft_entity_born
    //% block="camel recommended spawn event minecraft:entity_born"
    export function camelEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Camel"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_camel_minecraft_entity_spawned
    //% block="camel recommended spawn event minecraft:entity_spawned"
    export function camelEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Camel"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_camel_minecraft_ageable_grow_up
    //% block="camel spawn event minecraft:ageable_grow_up"
    export function camelAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Camel"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_camel_minecraft_camel_saddled
    //% block="camel spawn event minecraft:camel_saddled"
    export function camelCamelSaddled(): string {
        return "minecraft:camel_saddled";
    }

    //% group="Camel"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_camel_minecraft_camel_unsaddled
    //% block="camel spawn event minecraft:camel_unsaddled"
    export function camelCamelUnsaddled(): string {
        return "minecraft:camel_unsaddled";
    }

    //% group="Camel"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_camel_minecraft_spawn_adult
    //% block="camel spawn event minecraft:spawn_adult"
    export function camelSpawnAdult(): string {
        return "minecraft:spawn_adult";
    }

    //% group="Camel"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_camel_minecraft_start_sitting
    //% block="camel spawn event minecraft:start_sitting"
    export function camelStartSitting(): string {
        return "minecraft:start_sitting";
    }

    //% group="Camel"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_camel_minecraft_start_sitting_adult
    //% block="camel spawn event minecraft:start_sitting_adult"
    export function camelStartSittingAdult(): string {
        return "minecraft:start_sitting_adult";
    }

    //% group="Camel"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_camel_minecraft_start_sitting_baby
    //% block="camel spawn event minecraft:start_sitting_baby"
    export function camelStartSittingBaby(): string {
        return "minecraft:start_sitting_baby";
    }

    //% group="Camel"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_camel_minecraft_stop_sitting
    //% block="camel spawn event minecraft:stop_sitting"
    export function camelStopSitting(): string {
        return "minecraft:stop_sitting";
    }

    //% group="Camel"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_camel_minecraft_stop_sitting_adult
    //% block="camel spawn event minecraft:stop_sitting_adult"
    export function camelStopSittingAdult(): string {
        return "minecraft:stop_sitting_adult";
    }

    //% group="Camel"
    //% weight=79
    //% blockId=mcfunction_spawn_event_minecraft_camel_minecraft_stop_sitting_baby
    //% block="camel spawn event minecraft:stop_sitting_baby"
    export function camelStopSittingBaby(): string {
        return "minecraft:stop_sitting_baby";
    }

    //% group="Camel Husk"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_camel_husk_minecraft_entity_spawned
    //% block="camel_husk recommended spawn event minecraft:entity_spawned"
    export function camelHuskEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Camel Husk"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_camel_husk_minecraft_all_riders_dismounted
    //% block="camel_husk spawn event minecraft:all_riders_dismounted"
    export function camelHuskAllRidersDismounted(): string {
        return "minecraft:all_riders_dismounted";
    }

    //% group="Camel Husk"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_camel_husk_minecraft_camel_husk_saddled
    //% block="camel_husk spawn event minecraft:camel_husk_saddled"
    export function camelHuskCamelHuskSaddled(): string {
        return "minecraft:camel_husk_saddled";
    }

    //% group="Camel Husk"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_camel_husk_minecraft_camel_husk_unsaddled
    //% block="camel_husk spawn event minecraft:camel_husk_unsaddled"
    export function camelHuskCamelHuskUnsaddled(): string {
        return "minecraft:camel_husk_unsaddled";
    }

    //% group="Camel Husk"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_camel_husk_minecraft_rider_mounted
    //% block="camel_husk spawn event minecraft:rider_mounted"
    export function camelHuskRiderMounted(): string {
        return "minecraft:rider_mounted";
    }

    //% group="Camel Husk"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_camel_husk_minecraft_spawn_with_rider
    //% block="camel_husk spawn event minecraft:spawn_with_rider"
    export function camelHuskSpawnWithRider(): string {
        return "minecraft:spawn_with_rider";
    }

    //% group="Camel Husk"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_camel_husk_minecraft_start_sitting
    //% block="camel_husk spawn event minecraft:start_sitting"
    export function camelHuskStartSitting(): string {
        return "minecraft:start_sitting";
    }

    //% group="Camel Husk"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_camel_husk_minecraft_stop_sitting
    //% block="camel_husk spawn event minecraft:stop_sitting"
    export function camelHuskStopSitting(): string {
        return "minecraft:stop_sitting";
    }

    //% group="Cat"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_cat_minecraft_entity_born
    //% block="cat recommended spawn event minecraft:entity_born"
    export function catEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Cat"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_cat_minecraft_entity_spawned
    //% block="cat recommended spawn event minecraft:entity_spawned"
    export function catEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Cat"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_cat_minecraft_ageable_grow_up
    //% block="cat spawn event minecraft:ageable_grow_up"
    export function catAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Cat"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_cat_minecraft_cat_gifted_owner
    //% block="cat spawn event minecraft:cat_gifted_owner"
    export function catCatGiftedOwner(): string {
        return "minecraft:cat_gifted_owner";
    }

    //% group="Cat"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_cat_minecraft_on_tame
    //% block="cat spawn event minecraft:on_tame"
    export function catOnTame(): string {
        return "minecraft:on_tame";
    }

    //% group="Cat"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_cat_minecraft_pet_slept_with_owner
    //% block="cat spawn event minecraft:pet_slept_with_owner"
    export function catPetSleptWithOwner(): string {
        return "minecraft:pet_slept_with_owner";
    }

    //% group="Cat"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_cat_minecraft_randomize_sound_variant
    //% block="cat spawn event minecraft:randomize_sound_variant"
    export function catRandomizeSoundVariant(): string {
        return "minecraft:randomize_sound_variant";
    }

    //% group="Cat"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_cat_minecraft_spawn_from_village
    //% block="cat spawn event minecraft:spawn_from_village"
    export function catSpawnFromVillage(): string {
        return "minecraft:spawn_from_village";
    }

    //% group="Cat"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_cat_minecraft_spawn_midnight_cat
    //% block="cat spawn event minecraft:spawn_midnight_cat"
    export function catSpawnMidnightCat(): string {
        return "minecraft:spawn_midnight_cat";
    }

    //% group="Cat"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_cat_minecraft_spawn_tame_adult
    //% block="cat spawn event minecraft:spawn_tame_adult"
    export function catSpawnTameAdult(): string {
        return "minecraft:spawn_tame_adult";
    }

    //% group="Cat"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_cat_minecraft_spawn_tame_baby
    //% block="cat spawn event minecraft:spawn_tame_baby"
    export function catSpawnTameBaby(): string {
        return "minecraft:spawn_tame_baby";
    }

    //% group="Cat"
    //% weight=79
    //% blockId=mcfunction_spawn_event_minecraft_cat_minecraft_spawn_wild_adult
    //% block="cat spawn event minecraft:spawn_wild_adult"
    export function catSpawnWildAdult(): string {
        return "minecraft:spawn_wild_adult";
    }

    //% group="Cat"
    //% weight=78
    //% blockId=mcfunction_spawn_event_minecraft_cat_minecraft_spawn_wild_baby
    //% block="cat spawn event minecraft:spawn_wild_baby"
    export function catSpawnWildBaby(): string {
        return "minecraft:spawn_wild_baby";
    }

    //% group="Cave Spider"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_cave_spider_minecraft_entity_spawned
    //% block="cave_spider recommended spawn event minecraft:entity_spawned"
    export function caveSpiderEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Cave Spider"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_cave_spider_minecraft_become_angry
    //% block="cave_spider spawn event minecraft:become_angry"
    export function caveSpiderBecomeAngry(): string {
        return "minecraft:become_angry";
    }

    //% group="Cave Spider"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_cave_spider_minecraft_become_hostile
    //% block="cave_spider spawn event minecraft:become_hostile"
    export function caveSpiderBecomeHostile(): string {
        return "minecraft:become_hostile";
    }

    //% group="Cave Spider"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_cave_spider_minecraft_become_neutral
    //% block="cave_spider spawn event minecraft:become_neutral"
    export function caveSpiderBecomeNeutral(): string {
        return "minecraft:become_neutral";
    }

    //% group="Cave Spider"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_cave_spider_minecraft_entity_spawned_with_biome_specific_jockey
    //% block="cave_spider spawn event minecraft:entity_spawned_with_biome_specific_jockey"
    export function caveSpiderEntitySpawnedWithBiomeSpecificJockey(): string {
        return "minecraft:entity_spawned_with_biome_specific_jockey";
    }

    //% group="Cave Spider"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_cave_spider_minecraft_entity_spawned_with_default_jockey
    //% block="cave_spider spawn event minecraft:entity_spawned_with_default_jockey"
    export function caveSpiderEntitySpawnedWithDefaultJockey(): string {
        return "minecraft:entity_spawned_with_default_jockey";
    }

    //% group="Cave Spider"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_cave_spider_minecraft_on_calm
    //% block="cave_spider spawn event minecraft:on_calm"
    export function caveSpiderOnCalm(): string {
        return "minecraft:on_calm";
    }

    //% group="Chest Boat"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_chest_boat_minecraft_entity_spawned
    //% block="chest_boat recommended spawn event minecraft:entity_spawned"
    export function chestBoatEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Chest Boat"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_chest_boat_minecraft_add_can_ride
    //% block="chest_boat spawn event minecraft:add_can_ride"
    export function chestBoatAddCanRide(): string {
        return "minecraft:add_can_ride";
    }

    //% group="Chest Boat"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_chest_boat_minecraft_entered_bubble_column_down
    //% block="chest_boat spawn event minecraft:entered_bubble_column_down"
    export function chestBoatEnteredBubbleColumnDown(): string {
        return "minecraft:entered_bubble_column_down";
    }

    //% group="Chest Boat"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_chest_boat_minecraft_entered_bubble_column_up
    //% block="chest_boat spawn event minecraft:entered_bubble_column_up"
    export function chestBoatEnteredBubbleColumnUp(): string {
        return "minecraft:entered_bubble_column_up";
    }

    //% group="Chest Boat"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_chest_boat_minecraft_exited_bubble_column
    //% block="chest_boat spawn event minecraft:exited_bubble_column"
    export function chestBoatExitedBubbleColumn(): string {
        return "minecraft:exited_bubble_column";
    }

    //% group="Chest Boat"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_chest_boat_minecraft_sink
    //% block="chest_boat spawn event minecraft:sink"
    export function chestBoatSink(): string {
        return "minecraft:sink";
    }

    //% group="Chicken"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_chicken_minecraft_entity_born
    //% block="chicken recommended spawn event minecraft:entity_born"
    export function chickenEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Chicken"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_chicken_minecraft_entity_spawned
    //% block="chicken recommended spawn event minecraft:entity_spawned"
    export function chickenEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Chicken"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_chicken_minecraft_ageable_grow_up
    //% block="chicken spawn event minecraft:ageable_grow_up"
    export function chickenAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Chicken"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_chicken_minecraft_hatch_cold
    //% block="chicken spawn event minecraft:hatch_cold"
    export function chickenHatchCold(): string {
        return "minecraft:hatch_cold";
    }

    //% group="Chicken"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_chicken_minecraft_hatch_warm
    //% block="chicken spawn event minecraft:hatch_warm"
    export function chickenHatchWarm(): string {
        return "minecraft:hatch_warm";
    }

    //% group="Chicken"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_chicken_minecraft_randomize_sound_variant
    //% block="chicken spawn event minecraft:randomize_sound_variant"
    export function chickenRandomizeSoundVariant(): string {
        return "minecraft:randomize_sound_variant";
    }

    //% group="Chicken"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_chicken_minecraft_spawn_adult
    //% block="chicken spawn event minecraft:spawn_adult"
    export function chickenSpawnAdult(): string {
        return "minecraft:spawn_adult";
    }

    //% group="Command Block Minecart"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_command_block_minecart_minecraft_entity_spawned
    //% block="command_block_minecart recommended spawn event minecraft:entity_spawned"
    export function commandBlockMinecartEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Command Block Minecart"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_command_block_minecart_minecraft_command_block_activate
    //% block="command_block_minecart spawn event minecraft:command_block_activate"
    export function commandBlockMinecartCommandBlockActivate(): string {
        return "minecraft:command_block_activate";
    }

    //% group="Command Block Minecart"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_command_block_minecart_minecraft_command_block_deactivate
    //% block="command_block_minecart spawn event minecraft:command_block_deactivate"
    export function commandBlockMinecartCommandBlockDeactivate(): string {
        return "minecraft:command_block_deactivate";
    }

    //% group="Copper Golem"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_copper_golem_minecraft_entity_spawned
    //% block="copper_golem recommended spawn event minecraft:entity_spawned"
    export function copperGolemEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Copper Golem"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_copper_golem_minecraft_become_statue
    //% block="copper_golem spawn event minecraft:become_statue"
    export function copperGolemBecomeStatue(): string {
        return "minecraft:become_statue";
    }

    //% group="Copper Golem"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_copper_golem_minecraft_begin_oxidizing
    //% block="copper_golem spawn event minecraft:begin_oxidizing"
    export function copperGolemBeginOxidizing(): string {
        return "minecraft:begin_oxidizing";
    }

    //% group="Copper Golem"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_copper_golem_minecraft_from_player_default
    //% block="copper_golem spawn event minecraft:from_player_default"
    export function copperGolemFromPlayerDefault(): string {
        return "minecraft:from_player_default";
    }

    //% group="Copper Golem"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_copper_golem_minecraft_from_player_exposed
    //% block="copper_golem spawn event minecraft:from_player_exposed"
    export function copperGolemFromPlayerExposed(): string {
        return "minecraft:from_player_exposed";
    }

    //% group="Copper Golem"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_copper_golem_minecraft_from_player_oxidized
    //% block="copper_golem spawn event minecraft:from_player_oxidized"
    export function copperGolemFromPlayerOxidized(): string {
        return "minecraft:from_player_oxidized";
    }

    //% group="Copper Golem"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_copper_golem_minecraft_from_player_spawned
    //% block="copper_golem spawn event minecraft:from_player_spawned"
    export function copperGolemFromPlayerSpawned(): string {
        return "minecraft:from_player_spawned";
    }

    //% group="Copper Golem"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_copper_golem_minecraft_from_player_weathered
    //% block="copper_golem spawn event minecraft:from_player_weathered"
    export function copperGolemFromPlayerWeathered(): string {
        return "minecraft:from_player_weathered";
    }

    //% group="Copper Golem"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_copper_golem_minecraft_from_serialized_entity
    //% block="copper_golem spawn event minecraft:from_serialized_entity"
    export function copperGolemFromSerializedEntity(): string {
        return "minecraft:from_serialized_entity";
    }

    //% group="Copper Golem"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_copper_golem_minecraft_maximum_oxidation
    //% block="copper_golem spawn event minecraft:maximum_oxidation"
    export function copperGolemMaximumOxidation(): string {
        return "minecraft:maximum_oxidation";
    }

    //% group="Copper Golem"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_copper_golem_minecraft_on_sheared
    //% block="copper_golem spawn event minecraft:on_sheared"
    export function copperGolemOnSheared(): string {
        return "minecraft:on_sheared";
    }

    //% group="Copper Golem"
    //% weight=79
    //% blockId=mcfunction_spawn_event_minecraft_copper_golem_minecraft_on_take_flower
    //% block="copper_golem spawn event minecraft:on_take_flower"
    export function copperGolemOnTakeFlower(): string {
        return "minecraft:on_take_flower";
    }

    //% group="Copper Golem"
    //% weight=78
    //% blockId=mcfunction_spawn_event_minecraft_copper_golem_minecraft_oxidize_copper
    //% block="copper_golem spawn event minecraft:oxidize_copper"
    export function copperGolemOxidizeCopper(): string {
        return "minecraft:oxidize_copper";
    }

    //% group="Copper Golem"
    //% weight=77
    //% blockId=mcfunction_spawn_event_minecraft_copper_golem_minecraft_remove_oxidation_layer
    //% block="copper_golem spawn event minecraft:remove_oxidation_layer"
    export function copperGolemRemoveOxidationLayer(): string {
        return "minecraft:remove_oxidation_layer";
    }

    //% group="Copper Golem"
    //% weight=76
    //% blockId=mcfunction_spawn_event_minecraft_copper_golem_minecraft_restart_oxidation_timer
    //% block="copper_golem spawn event minecraft:restart_oxidation_timer"
    export function copperGolemRestartOxidationTimer(): string {
        return "minecraft:restart_oxidation_timer";
    }

    //% group="Copper Golem"
    //% weight=75
    //% blockId=mcfunction_spawn_event_minecraft_copper_golem_minecraft_serialize_entity_succeeded
    //% block="copper_golem spawn event minecraft:serialize_entity_succeeded"
    export function copperGolemSerializeEntitySucceeded(): string {
        return "minecraft:serialize_entity_succeeded";
    }

    //% group="Copper Golem"
    //% weight=74
    //% blockId=mcfunction_spawn_event_minecraft_copper_golem_minecraft_transport_items_start_place_fail
    //% block="copper_golem spawn event minecraft:transport_items.start_place_fail"
    export function copperGolemTransportItemsStartPlaceFail(): string {
        return "minecraft:transport_items.start_place_fail";
    }

    //% group="Copper Golem"
    //% weight=73
    //% blockId=mcfunction_spawn_event_minecraft_copper_golem_minecraft_transport_items_start_place_succeed
    //% block="copper_golem spawn event minecraft:transport_items.start_place_succeed"
    export function copperGolemTransportItemsStartPlaceSucceed(): string {
        return "minecraft:transport_items.start_place_succeed";
    }

    //% group="Copper Golem"
    //% weight=72
    //% blockId=mcfunction_spawn_event_minecraft_copper_golem_minecraft_transport_items_start_take_fail
    //% block="copper_golem spawn event minecraft:transport_items.start_take_fail"
    export function copperGolemTransportItemsStartTakeFail(): string {
        return "minecraft:transport_items.start_take_fail";
    }

    //% group="Copper Golem"
    //% weight=71
    //% blockId=mcfunction_spawn_event_minecraft_copper_golem_minecraft_transport_items_start_take_succeed
    //% block="copper_golem spawn event minecraft:transport_items.start_take_succeed"
    export function copperGolemTransportItemsStartTakeSucceed(): string {
        return "minecraft:transport_items.start_take_succeed";
    }

    //% group="Copper Golem"
    //% weight=70
    //% blockId=mcfunction_spawn_event_minecraft_copper_golem_minecraft_transport_items_stop_interaction
    //% block="copper_golem spawn event minecraft:transport_items.stop_interaction"
    export function copperGolemTransportItemsStopInteraction(): string {
        return "minecraft:transport_items.stop_interaction";
    }

    //% group="Copper Golem"
    //% weight=69
    //% blockId=mcfunction_spawn_event_minecraft_copper_golem_minecraft_wax_off
    //% block="copper_golem spawn event minecraft:wax_off"
    export function copperGolemWaxOff(): string {
        return "minecraft:wax_off";
    }

    //% group="Copper Golem"
    //% weight=68
    //% blockId=mcfunction_spawn_event_minecraft_copper_golem_minecraft_wax_on
    //% block="copper_golem spawn event minecraft:wax_on"
    export function copperGolemWaxOn(): string {
        return "minecraft:wax_on";
    }

    //% group="Cow"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_cow_minecraft_entity_born
    //% block="cow recommended spawn event minecraft:entity_born"
    export function cowEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Cow"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_cow_minecraft_entity_spawned
    //% block="cow recommended spawn event minecraft:entity_spawned"
    export function cowEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Cow"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_cow_minecraft_entity_transformed
    //% block="cow recommended spawn event minecraft:entity_transformed"
    export function cowEntityTransformed(): string {
        return "minecraft:entity_transformed";
    }

    //% group="Cow"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_cow_minecraft_ageable_grow_up
    //% block="cow spawn event minecraft:ageable_grow_up"
    export function cowAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Cow"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_cow_minecraft_randomize_sound_variant
    //% block="cow spawn event minecraft:randomize_sound_variant"
    export function cowRandomizeSoundVariant(): string {
        return "minecraft:randomize_sound_variant";
    }

    //% group="Cow"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_cow_minecraft_spawn_adult
    //% block="cow spawn event minecraft:spawn_adult"
    export function cowSpawnAdult(): string {
        return "minecraft:spawn_adult";
    }

    //% group="Creaking"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_creaking_minecraft_entity_spawned
    //% block="creaking recommended spawn event minecraft:entity_spawned"
    export function creakingEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Creaking"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_creaking_minecraft_become_hostile
    //% block="creaking spawn event minecraft:become_hostile"
    export function creakingBecomeHostile(): string {
        return "minecraft:become_hostile";
    }

    //% group="Creaking"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_creaking_minecraft_become_neutral
    //% block="creaking spawn event minecraft:become_neutral"
    export function creakingBecomeNeutral(): string {
        return "minecraft:become_neutral";
    }

    //% group="Creaking"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_creaking_minecraft_crumble
    //% block="creaking spawn event minecraft:crumble"
    export function creakingCrumble(): string {
        return "minecraft:crumble";
    }

    //% group="Creaking"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_creaking_minecraft_crumble_and_notify_creaking_heart
    //% block="creaking spawn event minecraft:crumble_and_notify_creaking_heart"
    export function creakingCrumbleAndNotifyCreakingHeart(): string {
        return "minecraft:crumble_and_notify_creaking_heart";
    }

    //% group="Creaking"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_creaking_minecraft_damaged_by_entity
    //% block="creaking spawn event minecraft:damaged_by_entity"
    export function creakingDamagedByEntity(): string {
        return "minecraft:damaged_by_entity";
    }

    //% group="Creaking"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_creaking_minecraft_damaged_by_player
    //% block="creaking spawn event minecraft:damaged_by_player"
    export function creakingDamagedByPlayer(): string {
        return "minecraft:damaged_by_player";
    }

    //% group="Creaking"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_creaking_minecraft_entity_spawned_by_creaking_heart
    //% block="creaking spawn event minecraft:entity_spawned_by_creaking_heart"
    export function creakingEntitySpawnedByCreakingHeart(): string {
        return "minecraft:entity_spawned_by_creaking_heart";
    }

    //% group="Creaking"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_creaking_minecraft_increment_swaying_ticks
    //% block="creaking spawn event minecraft:increment_swaying_ticks"
    export function creakingIncrementSwayingTicks(): string {
        return "minecraft:increment_swaying_ticks";
    }

    //% group="Creaking"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_creaking_minecraft_on_target_start_looking
    //% block="creaking spawn event minecraft:on_target_start_looking"
    export function creakingOnTargetStartLooking(): string {
        return "minecraft:on_target_start_looking";
    }

    //% group="Creaking"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_creaking_minecraft_on_target_stop_looking
    //% block="creaking spawn event minecraft:on_target_stop_looking"
    export function creakingOnTargetStopLooking(): string {
        return "minecraft:on_target_stop_looking";
    }

    //% group="Creaking"
    //% weight=79
    //% blockId=mcfunction_spawn_event_minecraft_creaking_minecraft_reset_swaying_ticks
    //% block="creaking spawn event minecraft:reset_swaying_ticks"
    export function creakingResetSwayingTicks(): string {
        return "minecraft:reset_swaying_ticks";
    }

    //% group="Creaking"
    //% weight=78
    //% blockId=mcfunction_spawn_event_minecraft_creaking_minecraft_start_twitching
    //% block="creaking spawn event minecraft:start_twitching"
    export function creakingStartTwitching(): string {
        return "minecraft:start_twitching";
    }

    //% group="Creeper"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_creeper_minecraft_become_charged
    //% block="creeper spawn event minecraft:become_charged"
    export function creeperBecomeCharged(): string {
        return "minecraft:become_charged";
    }

    //% group="Creeper"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_creeper_minecraft_start_exploding
    //% block="creeper spawn event minecraft:start_exploding"
    export function creeperStartExploding(): string {
        return "minecraft:start_exploding";
    }

    //% group="Creeper"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_creeper_minecraft_start_exploding_forced
    //% block="creeper spawn event minecraft:start_exploding_forced"
    export function creeperStartExplodingForced(): string {
        return "minecraft:start_exploding_forced";
    }

    //% group="Creeper"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_creeper_minecraft_stop_exploding
    //% block="creeper spawn event minecraft:stop_exploding"
    export function creeperStopExploding(): string {
        return "minecraft:stop_exploding";
    }

    //% group="Dolphin"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_dolphin_minecraft_entity_born
    //% block="dolphin recommended spawn event minecraft:entity_born"
    export function dolphinEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Dolphin"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_dolphin_minecraft_entity_spawned
    //% block="dolphin recommended spawn event minecraft:entity_spawned"
    export function dolphinEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Dolphin"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_dolphin_ageable_grow_up
    //% block="dolphin spawn event ageable_grow_up"
    export function dolphinAgeableGrowUp(): string {
        return "ageable_grow_up";
    }

    //% group="Dolphin"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_dolphin_become_angry
    //% block="dolphin spawn event become_angry"
    export function dolphinBecomeAngry(): string {
        return "become_angry";
    }

    //% group="Dolphin"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_dolphin_dried_out
    //% block="dolphin spawn event dried_out"
    export function dolphinDriedOut(): string {
        return "dried_out";
    }

    //% group="Dolphin"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_dolphin_navigation_off_land
    //% block="dolphin spawn event navigation_off_land"
    export function dolphinNavigationOffLand(): string {
        return "navigation_off_land";
    }

    //% group="Dolphin"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_dolphin_navigation_on_land
    //% block="dolphin spawn event navigation_on_land"
    export function dolphinNavigationOnLand(): string {
        return "navigation_on_land";
    }

    //% group="Dolphin"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_dolphin_on_calm
    //% block="dolphin spawn event on_calm"
    export function dolphinOnCalm(): string {
        return "on_calm";
    }

    //% group="Dolphin"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_dolphin_recover_after_dried_out
    //% block="dolphin spawn event recover_after_dried_out"
    export function dolphinRecoverAfterDriedOut(): string {
        return "recover_after_dried_out";
    }

    //% group="Dolphin"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_dolphin_start_dryingout
    //% block="dolphin spawn event start_dryingout"
    export function dolphinStartDryingout(): string {
        return "start_dryingout";
    }

    //% group="Dolphin"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_dolphin_stop_dryingout
    //% block="dolphin spawn event stop_dryingout"
    export function dolphinStopDryingout(): string {
        return "stop_dryingout";
    }

    //% group="Donkey"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_donkey_minecraft_entity_born
    //% block="donkey recommended spawn event minecraft:entity_born"
    export function donkeyEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Donkey"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_donkey_minecraft_entity_spawned
    //% block="donkey recommended spawn event minecraft:entity_spawned"
    export function donkeyEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Donkey"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_donkey_minecraft_ageable_grow_up
    //% block="donkey spawn event minecraft:ageable_grow_up"
    export function donkeyAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Donkey"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_donkey_minecraft_donkey_saddled
    //% block="donkey spawn event minecraft:donkey_saddled"
    export function donkeyDonkeySaddled(): string {
        return "minecraft:donkey_saddled";
    }

    //% group="Donkey"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_donkey_minecraft_donkey_unsaddled
    //% block="donkey spawn event minecraft:donkey_unsaddled"
    export function donkeyDonkeyUnsaddled(): string {
        return "minecraft:donkey_unsaddled";
    }

    //% group="Donkey"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_donkey_minecraft_on_chest
    //% block="donkey spawn event minecraft:on_chest"
    export function donkeyOnChest(): string {
        return "minecraft:on_chest";
    }

    //% group="Donkey"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_donkey_minecraft_on_tame
    //% block="donkey spawn event minecraft:on_tame"
    export function donkeyOnTame(): string {
        return "minecraft:on_tame";
    }

    //% group="Donkey"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_donkey_minecraft_spawn_adult
    //% block="donkey spawn event minecraft:spawn_adult"
    export function donkeySpawnAdult(): string {
        return "minecraft:spawn_adult";
    }

    //% group="Donkey"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_donkey_minecraft_spawn_tame_adult
    //% block="donkey spawn event minecraft:spawn_tame_adult"
    export function donkeySpawnTameAdult(): string {
        return "minecraft:spawn_tame_adult";
    }

    //% group="Drowned"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_drowned_minecraft_entity_born
    //% block="drowned recommended spawn event minecraft:entity_born"
    export function drownedEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Drowned"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_drowned_minecraft_entity_spawned
    //% block="drowned recommended spawn event minecraft:entity_spawned"
    export function drownedEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Drowned"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_drowned_minecraft_as_adult
    //% block="drowned spawn event minecraft:as_adult"
    export function drownedAsAdult(): string {
        return "minecraft:as_adult";
    }

    //% group="Drowned"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_drowned_minecraft_as_baby
    //% block="drowned spawn event minecraft:as_baby"
    export function drownedAsBaby(): string {
        return "minecraft:as_baby";
    }

    //% group="Drowned"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_drowned_minecraft_as_baby_jockey
    //% block="drowned spawn event minecraft:as_baby_jockey"
    export function drownedAsBabyJockey(): string {
        return "minecraft:as_baby_jockey";
    }

    //% group="Drowned"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_drowned_minecraft_as_ranged_adult
    //% block="drowned spawn event minecraft:as_ranged_adult"
    export function drownedAsRangedAdult(): string {
        return "minecraft:as_ranged_adult";
    }

    //% group="Drowned"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_drowned_minecraft_as_ranged_baby
    //% block="drowned spawn event minecraft:as_ranged_baby"
    export function drownedAsRangedBaby(): string {
        return "minecraft:as_ranged_baby";
    }

    //% group="Drowned"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_drowned_minecraft_as_ranged_baby_jockey
    //% block="drowned spawn event minecraft:as_ranged_baby_jockey"
    export function drownedAsRangedBabyJockey(): string {
        return "minecraft:as_ranged_baby_jockey";
    }

    //% group="Drowned"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_drowned_minecraft_as_rider
    //% block="drowned spawn event minecraft:as_rider"
    export function drownedAsRider(): string {
        return "minecraft:as_rider";
    }

    //% group="Drowned"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_drowned_minecraft_has_target
    //% block="drowned spawn event minecraft:has_target"
    export function drownedHasTarget(): string {
        return "minecraft:has_target";
    }

    //% group="Drowned"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_drowned_minecraft_lost_target
    //% block="drowned spawn event minecraft:lost_target"
    export function drownedLostTarget(): string {
        return "minecraft:lost_target";
    }

    //% group="Drowned"
    //% weight=79
    //% blockId=mcfunction_spawn_event_minecraft_drowned_minecraft_switch_to_melee
    //% block="drowned spawn event minecraft:switch_to_melee"
    export function drownedSwitchToMelee(): string {
        return "minecraft:switch_to_melee";
    }

    //% group="Drowned"
    //% weight=78
    //% blockId=mcfunction_spawn_event_minecraft_drowned_minecraft_switch_to_ranged
    //% block="drowned spawn event minecraft:switch_to_ranged"
    export function drownedSwitchToRanged(): string {
        return "minecraft:switch_to_ranged";
    }

    //% group="Egg"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_egg_minecraft_spawn_cold
    //% block="egg spawn event minecraft:spawn_cold"
    export function eggSpawnCold(): string {
        return "minecraft:spawn_cold";
    }

    //% group="Egg"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_egg_minecraft_spawn_temperate
    //% block="egg spawn event minecraft:spawn_temperate"
    export function eggSpawnTemperate(): string {
        return "minecraft:spawn_temperate";
    }

    //% group="Egg"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_egg_minecraft_spawn_warm
    //% block="egg spawn event minecraft:spawn_warm"
    export function eggSpawnWarm(): string {
        return "minecraft:spawn_warm";
    }

    //% group="Ender Crystal"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_ender_crystal_minecraft_crystal_explode
    //% block="ender_crystal spawn event minecraft:crystal_explode"
    export function enderCrystalCrystalExplode(): string {
        return "minecraft:crystal_explode";
    }

    //% group="Ender Dragon"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_ender_dragon_minecraft_entity_spawned
    //% block="ender_dragon recommended spawn event minecraft:entity_spawned"
    export function enderDragonEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Ender Dragon"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_ender_dragon_minecraft_start_death
    //% block="ender_dragon spawn event minecraft:start_death"
    export function enderDragonStartDeath(): string {
        return "minecraft:start_death";
    }

    //% group="Ender Dragon"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_ender_dragon_minecraft_start_fly
    //% block="ender_dragon spawn event minecraft:start_fly"
    export function enderDragonStartFly(): string {
        return "minecraft:start_fly";
    }

    //% group="Ender Dragon"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_ender_dragon_minecraft_start_land
    //% block="ender_dragon spawn event minecraft:start_land"
    export function enderDragonStartLand(): string {
        return "minecraft:start_land";
    }

    //% group="Ender Pearl"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_ender_pearl_minecraft_entity_spawned
    //% block="ender_pearl recommended spawn event minecraft:entity_spawned"
    export function enderPearlEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Enderman"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_enderman_minecraft_entity_spawned
    //% block="enderman recommended spawn event minecraft:entity_spawned"
    export function endermanEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Enderman"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_enderman_minecraft_become_angry
    //% block="enderman spawn event minecraft:become_angry"
    export function endermanBecomeAngry(): string {
        return "minecraft:become_angry";
    }

    //% group="Enderman"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_enderman_minecraft_on_calm
    //% block="enderman spawn event minecraft:on_calm"
    export function endermanOnCalm(): string {
        return "minecraft:on_calm";
    }

    //% group="Enderman"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_enderman_minecraft_started_riding
    //% block="enderman spawn event minecraft:started_riding"
    export function endermanStartedRiding(): string {
        return "minecraft:started_riding";
    }

    //% group="Enderman"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_enderman_minecraft_stopped_riding
    //% block="enderman spawn event minecraft:stopped_riding"
    export function endermanStoppedRiding(): string {
        return "minecraft:stopped_riding";
    }

    //% group="Evocation Illager"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_evocation_illager_minecraft_spawn_for_raid
    //% block="evocation_illager recommended spawn event minecraft:spawn_for_raid"
    export function evocationIllagerSpawnForRaid(): string {
        return "minecraft:spawn_for_raid";
    }

    //% group="Evocation Illager"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_evocation_illager_minecraft_raid_expired
    //% block="evocation_illager spawn event minecraft:raid_expired"
    export function evocationIllagerRaidExpired(): string {
        return "minecraft:raid_expired";
    }

    //% group="Evocation Illager"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_evocation_illager_minecraft_start_celebrating
    //% block="evocation_illager spawn event minecraft:start_celebrating"
    export function evocationIllagerStartCelebrating(): string {
        return "minecraft:start_celebrating";
    }

    //% group="Evocation Illager"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_evocation_illager_minecraft_stop_celebrating
    //% block="evocation_illager spawn event minecraft:stop_celebrating"
    export function evocationIllagerStopCelebrating(): string {
        return "minecraft:stop_celebrating";
    }

    //% group="Fireball"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_fireball_minecraft_explode
    //% block="fireball spawn event minecraft:explode"
    export function fireballExplode(): string {
        return "minecraft:explode";
    }

    //% group="Fishing Hook"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_fishing_hook_minecraft_entity_spawned
    //% block="fishing_hook recommended spawn event minecraft:entity_spawned"
    export function fishingHookEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Fox"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_fox_minecraft_entity_born
    //% block="fox recommended spawn event minecraft:entity_born"
    export function foxEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Fox"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_fox_minecraft_entity_spawned
    //% block="fox recommended spawn event minecraft:entity_spawned"
    export function foxEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Fox"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_fox_minecraft_ageable_grow_up
    //% block="fox spawn event minecraft:ageable_grow_up"
    export function foxAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Fox"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_fox_minecraft_ambient_night
    //% block="fox spawn event minecraft:ambient_night"
    export function foxAmbientNight(): string {
        return "minecraft:ambient_night";
    }

    //% group="Fox"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_fox_minecraft_ambient_normal
    //% block="fox spawn event minecraft:ambient_normal"
    export function foxAmbientNormal(): string {
        return "minecraft:ambient_normal";
    }

    //% group="Fox"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_fox_minecraft_ambient_sleep
    //% block="fox spawn event minecraft:ambient_sleep"
    export function foxAmbientSleep(): string {
        return "minecraft:ambient_sleep";
    }

    //% group="Fox"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_fox_minecraft_fox_configure_day
    //% block="fox spawn event minecraft:fox_configure_day"
    export function foxFoxConfigureDay(): string {
        return "minecraft:fox_configure_day";
    }

    //% group="Fox"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_fox_minecraft_fox_configure_defending
    //% block="fox spawn event minecraft:fox_configure_defending"
    export function foxFoxConfigureDefending(): string {
        return "minecraft:fox_configure_defending";
    }

    //% group="Fox"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_fox_minecraft_fox_configure_docile_day
    //% block="fox spawn event minecraft:fox_configure_docile_day"
    export function foxFoxConfigureDocileDay(): string {
        return "minecraft:fox_configure_docile_day";
    }

    //% group="Fox"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_fox_minecraft_fox_configure_docile_night
    //% block="fox spawn event minecraft:fox_configure_docile_night"
    export function foxFoxConfigureDocileNight(): string {
        return "minecraft:fox_configure_docile_night";
    }

    //% group="Fox"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_fox_minecraft_fox_configure_night
    //% block="fox spawn event minecraft:fox_configure_night"
    export function foxFoxConfigureNight(): string {
        return "minecraft:fox_configure_night";
    }

    //% group="Fox"
    //% weight=79
    //% blockId=mcfunction_spawn_event_minecraft_fox_minecraft_fox_configure_thunderstorm
    //% block="fox spawn event minecraft:fox_configure_thunderstorm"
    export function foxFoxConfigureThunderstorm(): string {
        return "minecraft:fox_configure_thunderstorm";
    }

    //% group="Frog"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_frog_minecraft_entity_spawned
    //% block="frog recommended spawn event minecraft:entity_spawned"
    export function frogEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Frog"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_frog_minecraft_entity_transformed
    //% block="frog recommended spawn event minecraft:entity_transformed"
    export function frogEntityTransformed(): string {
        return "minecraft:entity_transformed";
    }

    //% group="Frog"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_frog_become_pregnant
    //% block="frog spawn event become_pregnant"
    export function frogBecomePregnant(): string {
        return "become_pregnant";
    }

    //% group="Frog"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_frog_laid_egg
    //% block="frog spawn event laid_egg"
    export function frogLaidEgg(): string {
        return "laid_egg";
    }

    //% group="Frog"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_frog_spawn_cold
    //% block="frog spawn event spawn_cold"
    export function frogSpawnCold(): string {
        return "spawn_cold";
    }

    //% group="Frog"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_frog_spawn_temperate
    //% block="frog spawn event spawn_temperate"
    export function frogSpawnTemperate(): string {
        return "spawn_temperate";
    }

    //% group="Frog"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_frog_spawn_warm
    //% block="frog spawn event spawn_warm"
    export function frogSpawnWarm(): string {
        return "spawn_warm";
    }

    //% group="Glow Squid"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_glow_squid_minecraft_entity_born
    //% block="glow_squid recommended spawn event minecraft:entity_born"
    export function glowSquidEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Glow Squid"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_glow_squid_minecraft_entity_spawned
    //% block="glow_squid recommended spawn event minecraft:entity_spawned"
    export function glowSquidEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Glow Squid"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_glow_squid_minecraft_ageable_grow_up
    //% block="glow_squid spawn event minecraft:ageable_grow_up"
    export function glowSquidAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Goat"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_goat_minecraft_entity_born
    //% block="goat recommended spawn event minecraft:entity_born"
    export function goatEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Goat"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_goat_minecraft_entity_spawned
    //% block="goat recommended spawn event minecraft:entity_spawned"
    export function goatEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Goat"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_goat_attack_cooldown_complete_event
    //% block="goat spawn event attack_cooldown_complete_event"
    export function goatAttackCooldownCompleteEvent(): string {
        return "attack_cooldown_complete_event";
    }

    //% group="Goat"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_goat_minecraft_ageable_grow_up
    //% block="goat spawn event minecraft:ageable_grow_up"
    export function goatAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Goat"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_goat_minecraft_born_default
    //% block="goat spawn event minecraft:born_default"
    export function goatBornDefault(): string {
        return "minecraft:born_default";
    }

    //% group="Goat"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_goat_minecraft_born_screamer
    //% block="goat spawn event minecraft:born_screamer"
    export function goatBornScreamer(): string {
        return "minecraft:born_screamer";
    }

    //% group="Goat"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_goat_start_event
    //% block="goat spawn event start_event"
    export function goatStartEvent(): string {
        return "start_event";
    }

    //% group="Guardian"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_guardian_minecraft_target_far_enough
    //% block="guardian spawn event minecraft:target_far_enough"
    export function guardianTargetFarEnough(): string {
        return "minecraft:target_far_enough";
    }

    //% group="Guardian"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_guardian_minecraft_target_too_close
    //% block="guardian spawn event minecraft:target_too_close"
    export function guardianTargetTooClose(): string {
        return "minecraft:target_too_close";
    }

    //% group="Happy Ghast"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_happy_ghast_minecraft_entity_born
    //% block="happy_ghast recommended spawn event minecraft:entity_born"
    export function happyGhastEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Happy Ghast"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_happy_ghast_minecraft_entity_spawned
    //% block="happy_ghast recommended spawn event minecraft:entity_spawned"
    export function happyGhastEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Happy Ghast"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_happy_ghast_minecraft_ageable_grow_up
    //% block="happy_ghast spawn event minecraft:ageable_grow_up"
    export function happyGhastAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Happy Ghast"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_happy_ghast_minecraft_become_immobile
    //% block="happy_ghast spawn event minecraft:become_immobile"
    export function happyGhastBecomeImmobile(): string {
        return "minecraft:become_immobile";
    }

    //% group="Happy Ghast"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_happy_ghast_minecraft_become_mobile
    //% block="happy_ghast spawn event minecraft:become_mobile"
    export function happyGhastBecomeMobile(): string {
        return "minecraft:become_mobile";
    }

    //% group="Happy Ghast"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_happy_ghast_minecraft_on_harnessed
    //% block="happy_ghast spawn event minecraft:on_harnessed"
    export function happyGhastOnHarnessed(): string {
        return "minecraft:on_harnessed";
    }

    //% group="Happy Ghast"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_happy_ghast_minecraft_on_passenger_dismount
    //% block="happy_ghast spawn event minecraft:on_passenger_dismount"
    export function happyGhastOnPassengerDismount(): string {
        return "minecraft:on_passenger_dismount";
    }

    //% group="Happy Ghast"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_happy_ghast_minecraft_on_passenger_mount
    //% block="happy_ghast spawn event minecraft:on_passenger_mount"
    export function happyGhastOnPassengerMount(): string {
        return "minecraft:on_passenger_mount";
    }

    //% group="Happy Ghast"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_happy_ghast_minecraft_on_stop_tempting
    //% block="happy_ghast spawn event minecraft:on_stop_tempting"
    export function happyGhastOnStopTempting(): string {
        return "minecraft:on_stop_tempting";
    }

    //% group="Happy Ghast"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_happy_ghast_minecraft_on_unharnessed
    //% block="happy_ghast spawn event minecraft:on_unharnessed"
    export function happyGhastOnUnharnessed(): string {
        return "minecraft:on_unharnessed";
    }

    //% group="Happy Ghast"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_happy_ghast_minecraft_on_unleashed
    //% block="happy_ghast spawn event minecraft:on_unleashed"
    export function happyGhastOnUnleashed(): string {
        return "minecraft:on_unleashed";
    }

    //% group="Happy Ghast"
    //% weight=79
    //% blockId=mcfunction_spawn_event_minecraft_happy_ghast_minecraft_spawn_adult
    //% block="happy_ghast spawn event minecraft:spawn_adult"
    export function happyGhastSpawnAdult(): string {
        return "minecraft:spawn_adult";
    }

    //% group="Happy Ghast"
    //% weight=78
    //% blockId=mcfunction_spawn_event_minecraft_happy_ghast_minecraft_spawn_baby
    //% block="happy_ghast spawn event minecraft:spawn_baby"
    export function happyGhastSpawnBaby(): string {
        return "minecraft:spawn_baby";
    }

    //% group="Hoglin"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_hoglin_minecraft_entity_born
    //% block="hoglin recommended spawn event minecraft:entity_born"
    export function hoglinEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Hoglin"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_hoglin_minecraft_entity_spawned
    //% block="hoglin recommended spawn event minecraft:entity_spawned"
    export function hoglinEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Hoglin"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_hoglin_attack_cooldown_complete_event
    //% block="hoglin spawn event attack_cooldown_complete_event"
    export function hoglinAttackCooldownCompleteEvent(): string {
        return "attack_cooldown_complete_event";
    }

    //% group="Hoglin"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_hoglin_become_angry_event
    //% block="hoglin spawn event become_angry_event"
    export function hoglinBecomeAngryEvent(): string {
        return "become_angry_event";
    }

    //% group="Hoglin"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_hoglin_become_calm_event
    //% block="hoglin spawn event become_calm_event"
    export function hoglinBecomeCalmEvent(): string {
        return "become_calm_event";
    }

    //% group="Hoglin"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_hoglin_become_zombie_event
    //% block="hoglin spawn event become_zombie_event"
    export function hoglinBecomeZombieEvent(): string {
        return "become_zombie_event";
    }

    //% group="Hoglin"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_hoglin_escaped_event
    //% block="hoglin spawn event escaped_event"
    export function hoglinEscapedEvent(): string {
        return "escaped_event";
    }

    //% group="Hoglin"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_hoglin_minecraft_ageable_grow_up
    //% block="hoglin spawn event minecraft:ageable_grow_up"
    export function hoglinAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Hoglin"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_hoglin_spawn_adult
    //% block="hoglin spawn event spawn_adult"
    export function hoglinSpawnAdult(): string {
        return "spawn_adult";
    }

    //% group="Hoglin"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_hoglin_spawn_adult_unhuntable
    //% block="hoglin spawn event spawn_adult_unhuntable"
    export function hoglinSpawnAdultUnhuntable(): string {
        return "spawn_adult_unhuntable";
    }

    //% group="Hoglin"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_hoglin_spawn_baby
    //% block="hoglin spawn event spawn_baby"
    export function hoglinSpawnBaby(): string {
        return "spawn_baby";
    }

    //% group="Hoglin"
    //% weight=79
    //% blockId=mcfunction_spawn_event_minecraft_hoglin_start_zombification_event
    //% block="hoglin spawn event start_zombification_event"
    export function hoglinStartZombificationEvent(): string {
        return "start_zombification_event";
    }

    //% group="Hoglin"
    //% weight=78
    //% blockId=mcfunction_spawn_event_minecraft_hoglin_stop_zombification_event
    //% block="hoglin spawn event stop_zombification_event"
    export function hoglinStopZombificationEvent(): string {
        return "stop_zombification_event";
    }

    //% group="Hopper Minecart"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_hopper_minecart_minecraft_entity_spawned
    //% block="hopper_minecart recommended spawn event minecraft:entity_spawned"
    export function hopperMinecartEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Hopper Minecart"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_hopper_minecart_minecraft_hopper_activate
    //% block="hopper_minecart spawn event minecraft:hopper_activate"
    export function hopperMinecartHopperActivate(): string {
        return "minecraft:hopper_activate";
    }

    //% group="Hopper Minecart"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_hopper_minecart_minecraft_hopper_deactivate
    //% block="hopper_minecart spawn event minecraft:hopper_deactivate"
    export function hopperMinecartHopperDeactivate(): string {
        return "minecraft:hopper_deactivate";
    }

    //% group="Horse"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_horse_minecraft_entity_born
    //% block="horse recommended spawn event minecraft:entity_born"
    export function horseEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Horse"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_horse_minecraft_entity_spawned
    //% block="horse recommended spawn event minecraft:entity_spawned"
    export function horseEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Horse"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_horse_minecraft_ageable_grow_up
    //% block="horse spawn event minecraft:ageable_grow_up"
    export function horseAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Horse"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_horse_minecraft_horse_saddled
    //% block="horse spawn event minecraft:horse_saddled"
    export function horseHorseSaddled(): string {
        return "minecraft:horse_saddled";
    }

    //% group="Horse"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_horse_minecraft_horse_unsaddled
    //% block="horse spawn event minecraft:horse_unsaddled"
    export function horseHorseUnsaddled(): string {
        return "minecraft:horse_unsaddled";
    }

    //% group="Horse"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_horse_minecraft_make_black
    //% block="horse spawn event minecraft:make_black"
    export function horseMakeBlack(): string {
        return "minecraft:make_black";
    }

    //% group="Horse"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_horse_minecraft_make_brown
    //% block="horse spawn event minecraft:make_brown"
    export function horseMakeBrown(): string {
        return "minecraft:make_brown";
    }

    //% group="Horse"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_horse_minecraft_make_chestnut
    //% block="horse spawn event minecraft:make_chestnut"
    export function horseMakeChestnut(): string {
        return "minecraft:make_chestnut";
    }

    //% group="Horse"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_horse_minecraft_make_creamy
    //% block="horse spawn event minecraft:make_creamy"
    export function horseMakeCreamy(): string {
        return "minecraft:make_creamy";
    }

    //% group="Horse"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_horse_minecraft_make_darkbrown
    //% block="horse spawn event minecraft:make_darkbrown"
    export function horseMakeDarkbrown(): string {
        return "minecraft:make_darkbrown";
    }

    //% group="Horse"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_horse_minecraft_make_gray
    //% block="horse spawn event minecraft:make_gray"
    export function horseMakeGray(): string {
        return "minecraft:make_gray";
    }

    //% group="Horse"
    //% weight=79
    //% blockId=mcfunction_spawn_event_minecraft_horse_minecraft_make_white
    //% block="horse spawn event minecraft:make_white"
    export function horseMakeWhite(): string {
        return "minecraft:make_white";
    }

    //% group="Horse"
    //% weight=78
    //% blockId=mcfunction_spawn_event_minecraft_horse_minecraft_on_tame
    //% block="horse spawn event minecraft:on_tame"
    export function horseOnTame(): string {
        return "minecraft:on_tame";
    }

    //% group="Horse"
    //% weight=77
    //% blockId=mcfunction_spawn_event_minecraft_horse_minecraft_spawn_adult
    //% block="horse spawn event minecraft:spawn_adult"
    export function horseSpawnAdult(): string {
        return "minecraft:spawn_adult";
    }

    //% group="Horse"
    //% weight=76
    //% blockId=mcfunction_spawn_event_minecraft_horse_minecraft_spawn_tame_adult
    //% block="horse spawn event minecraft:spawn_tame_adult"
    export function horseSpawnTameAdult(): string {
        return "minecraft:spawn_tame_adult";
    }

    //% group="Husk"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_husk_minecraft_entity_born
    //% block="husk recommended spawn event minecraft:entity_born"
    export function huskEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Husk"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_husk_minecraft_entity_spawned
    //% block="husk recommended spawn event minecraft:entity_spawned"
    export function huskEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Husk"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_husk_minecraft_spawn_as_rider
    //% block="husk recommended spawn event minecraft:spawn_as_rider"
    export function huskSpawnAsRider(): string {
        return "minecraft:spawn_as_rider";
    }

    //% group="Husk"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_husk_minecraft_as_adult
    //% block="husk spawn event minecraft:as_adult"
    export function huskAsAdult(): string {
        return "minecraft:as_adult";
    }

    //% group="Husk"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_husk_minecraft_as_baby
    //% block="husk spawn event minecraft:as_baby"
    export function huskAsBaby(): string {
        return "minecraft:as_baby";
    }

    //% group="Husk"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_husk_minecraft_as_baby_jockey
    //% block="husk spawn event minecraft:as_baby_jockey"
    export function huskAsBabyJockey(): string {
        return "minecraft:as_baby_jockey";
    }

    //% group="Husk"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_husk_minecraft_convert_to_zombie
    //% block="husk spawn event minecraft:convert_to_zombie"
    export function huskConvertToZombie(): string {
        return "minecraft:convert_to_zombie";
    }

    //% group="Husk"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_husk_minecraft_on_start_riding_camel_husk
    //% block="husk spawn event minecraft:on_start_riding_camel_husk"
    export function huskOnStartRidingCamelHusk(): string {
        return "minecraft:on_start_riding_camel_husk";
    }

    //% group="Husk"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_husk_minecraft_on_stop_riding_camel_husk
    //% block="husk spawn event minecraft:on_stop_riding_camel_husk"
    export function huskOnStopRidingCamelHusk(): string {
        return "minecraft:on_stop_riding_camel_husk";
    }

    //% group="Husk"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_husk_minecraft_start_transforming_into_zombie
    //% block="husk spawn event minecraft:start_transforming_into_zombie"
    export function huskStartTransformingIntoZombie(): string {
        return "minecraft:start_transforming_into_zombie";
    }

    //% group="Husk"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_husk_minecraft_stop_transforming
    //% block="husk spawn event minecraft:stop_transforming"
    export function huskStopTransforming(): string {
        return "minecraft:stop_transforming";
    }

    //% group="Iron Golem"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_iron_golem_minecraft_from_player
    //% block="iron_golem spawn event minecraft:from_player"
    export function ironGolemFromPlayer(): string {
        return "minecraft:from_player";
    }

    //% group="Iron Golem"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_iron_golem_minecraft_from_village
    //% block="iron_golem spawn event minecraft:from_village"
    export function ironGolemFromVillage(): string {
        return "minecraft:from_village";
    }

    //% group="Llama"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_llama_minecraft_entity_born
    //% block="llama recommended spawn event minecraft:entity_born"
    export function llamaEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Llama"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_llama_minecraft_entity_spawned
    //% block="llama recommended spawn event minecraft:entity_spawned"
    export function llamaEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Llama"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_llama_minecraft_add_attributes
    //% block="llama spawn event minecraft:add_attributes"
    export function llamaAddAttributes(): string {
        return "minecraft:add_attributes";
    }

    //% group="Llama"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_llama_minecraft_ageable_grow_up
    //% block="llama spawn event minecraft:ageable_grow_up"
    export function llamaAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Llama"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_llama_minecraft_become_angry
    //% block="llama spawn event minecraft:become_angry"
    export function llamaBecomeAngry(): string {
        return "minecraft:become_angry";
    }

    //% group="Llama"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_llama_minecraft_join_caravan
    //% block="llama spawn event minecraft:join_caravan"
    export function llamaJoinCaravan(): string {
        return "minecraft:join_caravan";
    }

    //% group="Llama"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_llama_minecraft_leave_caravan
    //% block="llama spawn event minecraft:leave_caravan"
    export function llamaLeaveCaravan(): string {
        return "minecraft:leave_caravan";
    }

    //% group="Llama"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_llama_minecraft_mad_at_wolf
    //% block="llama spawn event minecraft:mad_at_wolf"
    export function llamaMadAtWolf(): string {
        return "minecraft:mad_at_wolf";
    }

    //% group="Llama"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_llama_minecraft_on_calm
    //% block="llama spawn event minecraft:on_calm"
    export function llamaOnCalm(): string {
        return "minecraft:on_calm";
    }

    //% group="Llama"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_llama_minecraft_on_chest
    //% block="llama spawn event minecraft:on_chest"
    export function llamaOnChest(): string {
        return "minecraft:on_chest";
    }

    //% group="Llama"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_llama_minecraft_on_leash
    //% block="llama spawn event minecraft:on_leash"
    export function llamaOnLeash(): string {
        return "minecraft:on_leash";
    }

    //% group="Llama"
    //% weight=79
    //% blockId=mcfunction_spawn_event_minecraft_llama_minecraft_on_tame
    //% block="llama spawn event minecraft:on_tame"
    export function llamaOnTame(): string {
        return "minecraft:on_tame";
    }

    //% group="Llama"
    //% weight=78
    //% blockId=mcfunction_spawn_event_minecraft_llama_minecraft_on_unleash
    //% block="llama spawn event minecraft:on_unleash"
    export function llamaOnUnleash(): string {
        return "minecraft:on_unleash";
    }

    //% group="Llama"
    //% weight=77
    //% blockId=mcfunction_spawn_event_minecraft_llama_minecraft_spawn_adult
    //% block="llama spawn event minecraft:spawn_adult"
    export function llamaSpawnAdult(): string {
        return "minecraft:spawn_adult";
    }

    //% group="Llama"
    //% weight=76
    //% blockId=mcfunction_spawn_event_minecraft_llama_minecraft_spawn_baby
    //% block="llama spawn event minecraft:spawn_baby"
    export function llamaSpawnBaby(): string {
        return "minecraft:spawn_baby";
    }

    //% group="Llama"
    //% weight=75
    //% blockId=mcfunction_spawn_event_minecraft_llama_minecraft_spawn_tame_adult
    //% block="llama spawn event minecraft:spawn_tame_adult"
    export function llamaSpawnTameAdult(): string {
        return "minecraft:spawn_tame_adult";
    }

    //% group="Magma Cube"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_magma_cube_minecraft_entity_spawned
    //% block="magma_cube recommended spawn event minecraft:entity_spawned"
    export function magmaCubeEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Magma Cube"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_magma_cube_minecraft_become_aggressive
    //% block="magma_cube spawn event minecraft:become_aggressive"
    export function magmaCubeBecomeAggressive(): string {
        return "minecraft:become_aggressive";
    }

    //% group="Magma Cube"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_magma_cube_minecraft_become_calm
    //% block="magma_cube spawn event minecraft:become_calm"
    export function magmaCubeBecomeCalm(): string {
        return "minecraft:become_calm";
    }

    //% group="Magma Cube"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_magma_cube_spawn_large
    //% block="magma_cube spawn event spawn_large"
    export function magmaCubeSpawnLarge(): string {
        return "spawn_large";
    }

    //% group="Magma Cube"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_magma_cube_spawn_medium
    //% block="magma_cube spawn event spawn_medium"
    export function magmaCubeSpawnMedium(): string {
        return "spawn_medium";
    }

    //% group="Magma Cube"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_magma_cube_spawn_small
    //% block="magma_cube spawn event spawn_small"
    export function magmaCubeSpawnSmall(): string {
        return "spawn_small";
    }

    //% group="Mooshroom"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_mooshroom_minecraft_entity_born
    //% block="mooshroom recommended spawn event minecraft:entity_born"
    export function mooshroomEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Mooshroom"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_mooshroom_minecraft_entity_spawned
    //% block="mooshroom recommended spawn event minecraft:entity_spawned"
    export function mooshroomEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Mooshroom"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_mooshroom_become_cow
    //% block="mooshroom spawn event become_cow"
    export function mooshroomBecomeCow(): string {
        return "become_cow";
    }

    //% group="Mooshroom"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_mooshroom_minecraft_ageable_grow_up
    //% block="mooshroom spawn event minecraft:ageable_grow_up"
    export function mooshroomAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Mooshroom"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_mooshroom_minecraft_ate_allium
    //% block="mooshroom spawn event minecraft:ate_allium"
    export function mooshroomAteAllium(): string {
        return "minecraft:ate_allium";
    }

    //% group="Mooshroom"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_mooshroom_minecraft_ate_bluet
    //% block="mooshroom spawn event minecraft:ate_bluet"
    export function mooshroomAteBluet(): string {
        return "minecraft:ate_bluet";
    }

    //% group="Mooshroom"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_mooshroom_minecraft_ate_closed_eyeblossom
    //% block="mooshroom spawn event minecraft:ate_closed_eyeblossom"
    export function mooshroomAteClosedEyeblossom(): string {
        return "minecraft:ate_closed_eyeblossom";
    }

    //% group="Mooshroom"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_mooshroom_minecraft_ate_cornflower
    //% block="mooshroom spawn event minecraft:ate_cornflower"
    export function mooshroomAteCornflower(): string {
        return "minecraft:ate_cornflower";
    }

    //% group="Mooshroom"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_mooshroom_minecraft_ate_daisy
    //% block="mooshroom spawn event minecraft:ate_daisy"
    export function mooshroomAteDaisy(): string {
        return "minecraft:ate_daisy";
    }

    //% group="Mooshroom"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_mooshroom_minecraft_ate_dandelion
    //% block="mooshroom spawn event minecraft:ate_dandelion"
    export function mooshroomAteDandelion(): string {
        return "minecraft:ate_dandelion";
    }

    //% group="Mooshroom"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_mooshroom_minecraft_ate_lily
    //% block="mooshroom spawn event minecraft:ate_lily"
    export function mooshroomAteLily(): string {
        return "minecraft:ate_lily";
    }

    //% group="Mooshroom"
    //% weight=79
    //% blockId=mcfunction_spawn_event_minecraft_mooshroom_minecraft_ate_open_eyeblossom
    //% block="mooshroom spawn event minecraft:ate_open_eyeblossom"
    export function mooshroomAteOpenEyeblossom(): string {
        return "minecraft:ate_open_eyeblossom";
    }

    //% group="Mooshroom"
    //% weight=78
    //% blockId=mcfunction_spawn_event_minecraft_mooshroom_minecraft_ate_orchid
    //% block="mooshroom spawn event minecraft:ate_orchid"
    export function mooshroomAteOrchid(): string {
        return "minecraft:ate_orchid";
    }

    //% group="Mooshroom"
    //% weight=77
    //% blockId=mcfunction_spawn_event_minecraft_mooshroom_minecraft_ate_poppy
    //% block="mooshroom spawn event minecraft:ate_poppy"
    export function mooshroomAtePoppy(): string {
        return "minecraft:ate_poppy";
    }

    //% group="Mooshroom"
    //% weight=76
    //% blockId=mcfunction_spawn_event_minecraft_mooshroom_minecraft_ate_rose
    //% block="mooshroom spawn event minecraft:ate_rose"
    export function mooshroomAteRose(): string {
        return "minecraft:ate_rose";
    }

    //% group="Mooshroom"
    //% weight=75
    //% blockId=mcfunction_spawn_event_minecraft_mooshroom_minecraft_ate_torchflower
    //% block="mooshroom spawn event minecraft:ate_torchflower"
    export function mooshroomAteTorchflower(): string {
        return "minecraft:ate_torchflower";
    }

    //% group="Mooshroom"
    //% weight=74
    //% blockId=mcfunction_spawn_event_minecraft_mooshroom_minecraft_ate_tulip
    //% block="mooshroom spawn event minecraft:ate_tulip"
    export function mooshroomAteTulip(): string {
        return "minecraft:ate_tulip";
    }

    //% group="Mooshroom"
    //% weight=73
    //% blockId=mcfunction_spawn_event_minecraft_mooshroom_minecraft_become_brown
    //% block="mooshroom spawn event minecraft:become_brown"
    export function mooshroomBecomeBrown(): string {
        return "minecraft:become_brown";
    }

    //% group="Mooshroom"
    //% weight=72
    //% blockId=mcfunction_spawn_event_minecraft_mooshroom_minecraft_become_brown_adult
    //% block="mooshroom spawn event minecraft:become_brown_adult"
    export function mooshroomBecomeBrownAdult(): string {
        return "minecraft:become_brown_adult";
    }

    //% group="Mooshroom"
    //% weight=71
    //% blockId=mcfunction_spawn_event_minecraft_mooshroom_minecraft_become_red
    //% block="mooshroom spawn event minecraft:become_red"
    export function mooshroomBecomeRed(): string {
        return "minecraft:become_red";
    }

    //% group="Mooshroom"
    //% weight=70
    //% blockId=mcfunction_spawn_event_minecraft_mooshroom_minecraft_become_red_adult
    //% block="mooshroom spawn event minecraft:become_red_adult"
    export function mooshroomBecomeRedAdult(): string {
        return "minecraft:become_red_adult";
    }

    //% group="Mooshroom"
    //% weight=69
    //% blockId=mcfunction_spawn_event_minecraft_mooshroom_minecraft_flowerless
    //% block="mooshroom spawn event minecraft:flowerless"
    export function mooshroomFlowerless(): string {
        return "minecraft:flowerless";
    }

    //% group="Mule"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_mule_minecraft_entity_born
    //% block="mule recommended spawn event minecraft:entity_born"
    export function muleEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Mule"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_mule_minecraft_entity_spawned
    //% block="mule recommended spawn event minecraft:entity_spawned"
    export function muleEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Mule"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_mule_minecraft_ageable_grow_up
    //% block="mule spawn event minecraft:ageable_grow_up"
    export function muleAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Mule"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_mule_minecraft_mule_saddled
    //% block="mule spawn event minecraft:mule_saddled"
    export function muleMuleSaddled(): string {
        return "minecraft:mule_saddled";
    }

    //% group="Mule"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_mule_minecraft_mule_unsaddled
    //% block="mule spawn event minecraft:mule_unsaddled"
    export function muleMuleUnsaddled(): string {
        return "minecraft:mule_unsaddled";
    }

    //% group="Mule"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_mule_minecraft_on_chest
    //% block="mule spawn event minecraft:on_chest"
    export function muleOnChest(): string {
        return "minecraft:on_chest";
    }

    //% group="Mule"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_mule_minecraft_on_tame
    //% block="mule spawn event minecraft:on_tame"
    export function muleOnTame(): string {
        return "minecraft:on_tame";
    }

    //% group="Mule"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_mule_minecraft_spawn_adult
    //% block="mule spawn event minecraft:spawn_adult"
    export function muleSpawnAdult(): string {
        return "minecraft:spawn_adult";
    }

    //% group="Mule"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_mule_minecraft_spawn_tame_adult
    //% block="mule spawn event minecraft:spawn_tame_adult"
    export function muleSpawnTameAdult(): string {
        return "minecraft:spawn_tame_adult";
    }

    //% group="Nautilus"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_nautilus_minecraft_entity_born
    //% block="nautilus recommended spawn event minecraft:entity_born"
    export function nautilusEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Nautilus"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_nautilus_minecraft_entity_spawned
    //% block="nautilus recommended spawn event minecraft:entity_spawned"
    export function nautilusEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Nautilus"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_nautilus_minecraft_ageable_grow_up
    //% block="nautilus spawn event minecraft:ageable_grow_up"
    export function nautilusAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Nautilus"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_nautilus_minecraft_become_angry
    //% block="nautilus spawn event minecraft:become_angry"
    export function nautilusBecomeAngry(): string {
        return "minecraft:become_angry";
    }

    //% group="Nautilus"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_nautilus_minecraft_on_armor_equip
    //% block="nautilus spawn event minecraft:on_armor_equip"
    export function nautilusOnArmorEquip(): string {
        return "minecraft:on_armor_equip";
    }

    //% group="Nautilus"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_nautilus_minecraft_on_calm
    //% block="nautilus spawn event minecraft:on_calm"
    export function nautilusOnCalm(): string {
        return "minecraft:on_calm";
    }

    //% group="Nautilus"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_nautilus_minecraft_on_dismount
    //% block="nautilus spawn event minecraft:on_dismount"
    export function nautilusOnDismount(): string {
        return "minecraft:on_dismount";
    }

    //% group="Nautilus"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_nautilus_minecraft_on_mount
    //% block="nautilus spawn event minecraft:on_mount"
    export function nautilusOnMount(): string {
        return "minecraft:on_mount";
    }

    //% group="Nautilus"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_nautilus_minecraft_on_saddled
    //% block="nautilus spawn event minecraft:on_saddled"
    export function nautilusOnSaddled(): string {
        return "minecraft:on_saddled";
    }

    //% group="Nautilus"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_nautilus_minecraft_on_saddled_in_water
    //% block="nautilus spawn event minecraft:on_saddled_in_water"
    export function nautilusOnSaddledInWater(): string {
        return "minecraft:on_saddled_in_water";
    }

    //% group="Nautilus"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_nautilus_minecraft_on_saddled_out_of_water
    //% block="nautilus spawn event minecraft:on_saddled_out_of_water"
    export function nautilusOnSaddledOutOfWater(): string {
        return "minecraft:on_saddled_out_of_water";
    }

    //% group="Nautilus"
    //% weight=79
    //% blockId=mcfunction_spawn_event_minecraft_nautilus_minecraft_on_stop_tempting
    //% block="nautilus spawn event minecraft:on_stop_tempting"
    export function nautilusOnStopTempting(): string {
        return "minecraft:on_stop_tempting";
    }

    //% group="Nautilus"
    //% weight=78
    //% blockId=mcfunction_spawn_event_minecraft_nautilus_minecraft_on_tame
    //% block="nautilus spawn event minecraft:on_tame"
    export function nautilusOnTame(): string {
        return "minecraft:on_tame";
    }

    //% group="Nautilus"
    //% weight=77
    //% blockId=mcfunction_spawn_event_minecraft_nautilus_minecraft_on_unleashed
    //% block="nautilus spawn event minecraft:on_unleashed"
    export function nautilusOnUnleashed(): string {
        return "minecraft:on_unleashed";
    }

    //% group="Nautilus"
    //% weight=76
    //% blockId=mcfunction_spawn_event_minecraft_nautilus_minecraft_on_unsaddled
    //% block="nautilus spawn event minecraft:on_unsaddled"
    export function nautilusOnUnsaddled(): string {
        return "minecraft:on_unsaddled";
    }

    //% group="Nautilus"
    //% weight=75
    //% blockId=mcfunction_spawn_event_minecraft_nautilus_minecraft_spawn_tame_adult
    //% block="nautilus spawn event minecraft:spawn_tame_adult"
    export function nautilusSpawnTameAdult(): string {
        return "minecraft:spawn_tame_adult";
    }

    //% group="Nautilus"
    //% weight=74
    //% blockId=mcfunction_spawn_event_minecraft_nautilus_minecraft_spawn_tame_baby
    //% block="nautilus spawn event minecraft:spawn_tame_baby"
    export function nautilusSpawnTameBaby(): string {
        return "minecraft:spawn_tame_baby";
    }

    //% group="Nautilus"
    //% weight=73
    //% blockId=mcfunction_spawn_event_minecraft_nautilus_minecraft_spawn_wild_adult
    //% block="nautilus spawn event minecraft:spawn_wild_adult"
    export function nautilusSpawnWildAdult(): string {
        return "minecraft:spawn_wild_adult";
    }

    //% group="Nautilus"
    //% weight=72
    //% blockId=mcfunction_spawn_event_minecraft_nautilus_minecraft_spawn_wild_baby
    //% block="nautilus spawn event minecraft:spawn_wild_baby"
    export function nautilusSpawnWildBaby(): string {
        return "minecraft:spawn_wild_baby";
    }

    //% group="Nautilus"
    //% weight=71
    //% blockId=mcfunction_spawn_event_minecraft_nautilus_minecraft_switch_to_ai_controlled
    //% block="nautilus spawn event minecraft:switch_to_ai_controlled"
    export function nautilusSwitchToAiControlled(): string {
        return "minecraft:switch_to_ai_controlled";
    }

    //% group="Nautilus"
    //% weight=70
    //% blockId=mcfunction_spawn_event_minecraft_nautilus_minecraft_switch_to_player_controlled
    //% block="nautilus spawn event minecraft:switch_to_player_controlled"
    export function nautilusSwitchToPlayerControlled(): string {
        return "minecraft:switch_to_player_controlled";
    }

    //% group="Ocelot"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_ocelot_minecraft_entity_born
    //% block="ocelot recommended spawn event minecraft:entity_born"
    export function ocelotEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Ocelot"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_ocelot_minecraft_entity_spawned
    //% block="ocelot recommended spawn event minecraft:entity_spawned"
    export function ocelotEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Ocelot"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_ocelot_minecraft_ageable_grow_up
    //% block="ocelot spawn event minecraft:ageable_grow_up"
    export function ocelotAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Ocelot"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_ocelot_minecraft_entity_born_wild
    //% block="ocelot spawn event minecraft:entity_born_wild"
    export function ocelotEntityBornWild(): string {
        return "minecraft:entity_born_wild";
    }

    //% group="Ocelot"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_ocelot_minecraft_on_leash
    //% block="ocelot spawn event minecraft:on_leash"
    export function ocelotOnLeash(): string {
        return "minecraft:on_leash";
    }

    //% group="Ocelot"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_ocelot_minecraft_on_trust
    //% block="ocelot spawn event minecraft:on_trust"
    export function ocelotOnTrust(): string {
        return "minecraft:on_trust";
    }

    //% group="Ocelot"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_ocelot_minecraft_on_unleash
    //% block="ocelot spawn event minecraft:on_unleash"
    export function ocelotOnUnleash(): string {
        return "minecraft:on_unleash";
    }

    //% group="Panda"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_panda_minecraft_entity_born
    //% block="panda recommended spawn event minecraft:entity_born"
    export function pandaEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Panda"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_panda_minecraft_entity_spawned
    //% block="panda recommended spawn event minecraft:entity_spawned"
    export function pandaEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Panda"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_panda_minecraft_ageable_grow_up
    //% block="panda spawn event minecraft:ageable_grow_up"
    export function pandaAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Panda"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_panda_minecraft_baby_on_calm
    //% block="panda spawn event minecraft:baby_on_calm"
    export function pandaBabyOnCalm(): string {
        return "minecraft:baby_on_calm";
    }

    //% group="Panda"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_panda_minecraft_become_angry
    //% block="panda spawn event minecraft:become_angry"
    export function pandaBecomeAngry(): string {
        return "minecraft:become_angry";
    }

    //% group="Panda"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_panda_minecraft_on_calm
    //% block="panda spawn event minecraft:on_calm"
    export function pandaOnCalm(): string {
        return "minecraft:on_calm";
    }

    //% group="Panda"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_panda_minecraft_on_scared
    //% block="panda spawn event minecraft:on_scared"
    export function pandaOnScared(): string {
        return "minecraft:on_scared";
    }

    //% group="Panda"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_panda_minecraft_panda_aggressive
    //% block="panda spawn event minecraft:panda_aggressive"
    export function pandaPandaAggressive(): string {
        return "minecraft:panda_aggressive";
    }

    //% group="Panda"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_panda_minecraft_panda_brown
    //% block="panda spawn event minecraft:panda_brown"
    export function pandaPandaBrown(): string {
        return "minecraft:panda_brown";
    }

    //% group="Panda"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_panda_minecraft_panda_lazy
    //% block="panda spawn event minecraft:panda_lazy"
    export function pandaPandaLazy(): string {
        return "minecraft:panda_lazy";
    }

    //% group="Panda"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_panda_minecraft_panda_playful
    //% block="panda spawn event minecraft:panda_playful"
    export function pandaPandaPlayful(): string {
        return "minecraft:panda_playful";
    }

    //% group="Panda"
    //% weight=79
    //% blockId=mcfunction_spawn_event_minecraft_panda_minecraft_panda_weak
    //% block="panda spawn event minecraft:panda_weak"
    export function pandaPandaWeak(): string {
        return "minecraft:panda_weak";
    }

    //% group="Panda"
    //% weight=78
    //% blockId=mcfunction_spawn_event_minecraft_panda_minecraft_panda_worried
    //% block="panda spawn event minecraft:panda_worried"
    export function pandaPandaWorried(): string {
        return "minecraft:panda_worried";
    }

    //% group="Parched"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_parched_minecraft_entity_spawned
    //% block="parched recommended spawn event minecraft:entity_spawned"
    export function parchedEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Parched"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_parched_minecraft_ranged_mode
    //% block="parched recommended spawn event minecraft:ranged_mode"
    export function parchedRangedMode(): string {
        return "minecraft:ranged_mode";
    }

    //% group="Parched"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_parched_minecraft_melee_mode
    //% block="parched spawn event minecraft:melee_mode"
    export function parchedMeleeMode(): string {
        return "minecraft:melee_mode";
    }

    //% group="Parched"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_parched_minecraft_switch_to_hard_ranged
    //% block="parched spawn event minecraft:switch_to_hard_ranged"
    export function parchedSwitchToHardRanged(): string {
        return "minecraft:switch_to_hard_ranged";
    }

    //% group="Parched"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_parched_minecraft_switch_to_normal_ranged
    //% block="parched spawn event minecraft:switch_to_normal_ranged"
    export function parchedSwitchToNormalRanged(): string {
        return "minecraft:switch_to_normal_ranged";
    }

    //% group="Parrot"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_parrot_minecraft_entity_spawned
    //% block="parrot recommended spawn event minecraft:entity_spawned"
    export function parrotEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Parrot"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_parrot_minecraft_on_not_riding_player
    //% block="parrot spawn event minecraft:on_not_riding_player"
    export function parrotOnNotRidingPlayer(): string {
        return "minecraft:on_not_riding_player";
    }

    //% group="Parrot"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_parrot_minecraft_on_riding_player
    //% block="parrot spawn event minecraft:on_riding_player"
    export function parrotOnRidingPlayer(): string {
        return "minecraft:on_riding_player";
    }

    //% group="Parrot"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_parrot_minecraft_on_tame
    //% block="parrot spawn event minecraft:on_tame"
    export function parrotOnTame(): string {
        return "minecraft:on_tame";
    }

    //% group="Pig"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_pig_minecraft_entity_born
    //% block="pig recommended spawn event minecraft:entity_born"
    export function pigEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Pig"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_pig_minecraft_entity_spawned
    //% block="pig recommended spawn event minecraft:entity_spawned"
    export function pigEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Pig"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_pig_become_zombie
    //% block="pig spawn event become_zombie"
    export function pigBecomeZombie(): string {
        return "become_zombie";
    }

    //% group="Pig"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_pig_minecraft_ageable_grow_up
    //% block="pig spawn event minecraft:ageable_grow_up"
    export function pigAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Pig"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_pig_minecraft_on_saddled
    //% block="pig spawn event minecraft:on_saddled"
    export function pigOnSaddled(): string {
        return "minecraft:on_saddled";
    }

    //% group="Pig"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_pig_minecraft_on_unsaddled
    //% block="pig spawn event minecraft:on_unsaddled"
    export function pigOnUnsaddled(): string {
        return "minecraft:on_unsaddled";
    }

    //% group="Pig"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_pig_minecraft_randomize_sound_variant
    //% block="pig spawn event minecraft:randomize_sound_variant"
    export function pigRandomizeSoundVariant(): string {
        return "minecraft:randomize_sound_variant";
    }

    //% group="Pig"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_pig_minecraft_spawn_adult
    //% block="pig spawn event minecraft:spawn_adult"
    export function pigSpawnAdult(): string {
        return "minecraft:spawn_adult";
    }

    //% group="Piglin"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_piglin_minecraft_entity_born
    //% block="piglin recommended spawn event minecraft:entity_born"
    export function piglinEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Piglin"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_piglin_minecraft_entity_spawned
    //% block="piglin recommended spawn event minecraft:entity_spawned"
    export function piglinEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Piglin"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_piglin_admire_item_started_event
    //% block="piglin spawn event admire_item_started_event"
    export function piglinAdmireItemStartedEvent(): string {
        return "admire_item_started_event";
    }

    //% group="Piglin"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_piglin_admire_item_stopped_event
    //% block="piglin spawn event admire_item_stopped_event"
    export function piglinAdmireItemStoppedEvent(): string {
        return "admire_item_stopped_event";
    }

    //% group="Piglin"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_piglin_attack_cooldown_complete_event
    //% block="piglin spawn event attack_cooldown_complete_event"
    export function piglinAttackCooldownCompleteEvent(): string {
        return "attack_cooldown_complete_event";
    }

    //% group="Piglin"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_piglin_become_angry_event
    //% block="piglin spawn event become_angry_event"
    export function piglinBecomeAngryEvent(): string {
        return "become_angry_event";
    }

    //% group="Piglin"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_piglin_become_calm_event
    //% block="piglin spawn event become_calm_event"
    export function piglinBecomeCalmEvent(): string {
        return "become_calm_event";
    }

    //% group="Piglin"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_piglin_become_zombie_event
    //% block="piglin spawn event become_zombie_event"
    export function piglinBecomeZombieEvent(): string {
        return "become_zombie_event";
    }

    //% group="Piglin"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_piglin_important_block_destroyed_event
    //% block="piglin spawn event important_block_destroyed_event"
    export function piglinImportantBlockDestroyedEvent(): string {
        return "important_block_destroyed_event";
    }

    //% group="Piglin"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_piglin_spawn_adult
    //% block="piglin spawn event spawn_adult"
    export function piglinSpawnAdult(): string {
        return "spawn_adult";
    }

    //% group="Piglin"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_piglin_spawn_adult_melee
    //% block="piglin spawn event spawn_adult_melee"
    export function piglinSpawnAdultMelee(): string {
        return "spawn_adult_melee";
    }

    //% group="Piglin"
    //% weight=79
    //% blockId=mcfunction_spawn_event_minecraft_piglin_spawn_adult_melee_no_hunting
    //% block="piglin spawn event spawn_adult_melee_no_hunting"
    export function piglinSpawnAdultMeleeNoHunting(): string {
        return "spawn_adult_melee_no_hunting";
    }

    //% group="Piglin"
    //% weight=78
    //% blockId=mcfunction_spawn_event_minecraft_piglin_spawn_adult_no_hunting
    //% block="piglin spawn event spawn_adult_no_hunting"
    export function piglinSpawnAdultNoHunting(): string {
        return "spawn_adult_no_hunting";
    }

    //% group="Piglin"
    //% weight=77
    //% blockId=mcfunction_spawn_event_minecraft_piglin_spawn_adult_ranged
    //% block="piglin spawn event spawn_adult_ranged"
    export function piglinSpawnAdultRanged(): string {
        return "spawn_adult_ranged";
    }

    //% group="Piglin"
    //% weight=76
    //% blockId=mcfunction_spawn_event_minecraft_piglin_spawn_adult_ranged_no_hunting
    //% block="piglin spawn event spawn_adult_ranged_no_hunting"
    export function piglinSpawnAdultRangedNoHunting(): string {
        return "spawn_adult_ranged_no_hunting";
    }

    //% group="Piglin"
    //% weight=75
    //% blockId=mcfunction_spawn_event_minecraft_piglin_spawn_baby
    //% block="piglin spawn event spawn_baby"
    export function piglinSpawnBaby(): string {
        return "spawn_baby";
    }

    //% group="Piglin"
    //% weight=74
    //% blockId=mcfunction_spawn_event_minecraft_piglin_start_zombification_event
    //% block="piglin spawn event start_zombification_event"
    export function piglinStartZombificationEvent(): string {
        return "start_zombification_event";
    }

    //% group="Piglin"
    //% weight=73
    //% blockId=mcfunction_spawn_event_minecraft_piglin_stop_zombification_event
    //% block="piglin spawn event stop_zombification_event"
    export function piglinStopZombificationEvent(): string {
        return "stop_zombification_event";
    }

    //% group="Piglin Brute"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_piglin_brute_minecraft_entity_spawned
    //% block="piglin_brute recommended spawn event minecraft:entity_spawned"
    export function piglinBruteEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Piglin Brute"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_piglin_brute_become_angry_event
    //% block="piglin_brute spawn event become_angry_event"
    export function piglinBruteBecomeAngryEvent(): string {
        return "become_angry_event";
    }

    //% group="Piglin Brute"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_piglin_brute_become_calm_event
    //% block="piglin_brute spawn event become_calm_event"
    export function piglinBruteBecomeCalmEvent(): string {
        return "become_calm_event";
    }

    //% group="Piglin Brute"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_piglin_brute_become_zombie_event
    //% block="piglin_brute spawn event become_zombie_event"
    export function piglinBruteBecomeZombieEvent(): string {
        return "become_zombie_event";
    }

    //% group="Piglin Brute"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_piglin_brute_go_back_to_spawn_failed
    //% block="piglin_brute spawn event go_back_to_spawn_failed"
    export function piglinBruteGoBackToSpawnFailed(): string {
        return "go_back_to_spawn_failed";
    }

    //% group="Piglin Brute"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_piglin_brute_important_block_destroyed_event
    //% block="piglin_brute spawn event important_block_destroyed_event"
    export function piglinBruteImportantBlockDestroyedEvent(): string {
        return "important_block_destroyed_event";
    }

    //% group="Piglin Brute"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_piglin_brute_start_zombification_event
    //% block="piglin_brute spawn event start_zombification_event"
    export function piglinBruteStartZombificationEvent(): string {
        return "start_zombification_event";
    }

    //% group="Piglin Brute"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_piglin_brute_stop_zombification_event
    //% block="piglin_brute spawn event stop_zombification_event"
    export function piglinBruteStopZombificationEvent(): string {
        return "stop_zombification_event";
    }

    //% group="Pillager"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_pillager_minecraft_entity_spawned
    //% block="pillager recommended spawn event minecraft:entity_spawned"
    export function pillagerEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Pillager"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_pillager_minecraft_ranged_mode
    //% block="pillager recommended spawn event minecraft:ranged_mode"
    export function pillagerRangedMode(): string {
        return "minecraft:ranged_mode";
    }

    //% group="Pillager"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_pillager_minecraft_spawn_as_illager_captain
    //% block="pillager recommended spawn event minecraft:spawn_as_illager_captain"
    export function pillagerSpawnAsIllagerCaptain(): string {
        return "minecraft:spawn_as_illager_captain";
    }

    //% group="Pillager"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_pillager_minecraft_spawn_for_raid
    //% block="pillager recommended spawn event minecraft:spawn_for_raid"
    export function pillagerSpawnForRaid(): string {
        return "minecraft:spawn_for_raid";
    }

    //% group="Pillager"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_pillager_minecraft_calm
    //% block="pillager spawn event minecraft:calm"
    export function pillagerCalm(): string {
        return "minecraft:calm";
    }

    //% group="Pillager"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_pillager_minecraft_melee_mode
    //% block="pillager spawn event minecraft:melee_mode"
    export function pillagerMeleeMode(): string {
        return "minecraft:melee_mode";
    }

    //% group="Pillager"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_pillager_minecraft_promote_to_illager_captain
    //% block="pillager spawn event minecraft:promote_to_illager_captain"
    export function pillagerPromoteToIllagerCaptain(): string {
        return "minecraft:promote_to_illager_captain";
    }

    //% group="Pillager"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_pillager_minecraft_promote_to_patrol_captain
    //% block="pillager spawn event minecraft:promote_to_patrol_captain"
    export function pillagerPromoteToPatrolCaptain(): string {
        return "minecraft:promote_to_patrol_captain";
    }

    //% group="Pillager"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_pillager_minecraft_raid_expired
    //% block="pillager spawn event minecraft:raid_expired"
    export function pillagerRaidExpired(): string {
        return "minecraft:raid_expired";
    }

    //% group="Pillager"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_pillager_minecraft_spawn_as_patrol_follower
    //% block="pillager spawn event minecraft:spawn_as_patrol_follower"
    export function pillagerSpawnAsPatrolFollower(): string {
        return "minecraft:spawn_as_patrol_follower";
    }

    //% group="Pillager"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_pillager_minecraft_start_celebrating
    //% block="pillager spawn event minecraft:start_celebrating"
    export function pillagerStartCelebrating(): string {
        return "minecraft:start_celebrating";
    }

    //% group="Pillager"
    //% weight=79
    //% blockId=mcfunction_spawn_event_minecraft_pillager_minecraft_stop_celebrating
    //% block="pillager spawn event minecraft:stop_celebrating"
    export function pillagerStopCelebrating(): string {
        return "minecraft:stop_celebrating";
    }

    //% group="Player"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_player_minecraft_clear_add_raid_omen
    //% block="player spawn event minecraft:clear_add_raid_omen"
    export function playerClearAddRaidOmen(): string {
        return "minecraft:clear_add_raid_omen";
    }

    //% group="Player"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_player_minecraft_gain_raid_omen
    //% block="player spawn event minecraft:gain_raid_omen"
    export function playerGainRaidOmen(): string {
        return "minecraft:gain_raid_omen";
    }

    //% group="Player"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_player_minecraft_remove_raid_trigger
    //% block="player spawn event minecraft:remove_raid_trigger"
    export function playerRemoveRaidTrigger(): string {
        return "minecraft:remove_raid_trigger";
    }

    //% group="Player"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_player_minecraft_trigger_raid
    //% block="player spawn event minecraft:trigger_raid"
    export function playerTriggerRaid(): string {
        return "minecraft:trigger_raid";
    }

    //% group="Polar Bear"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_polar_bear_minecraft_entity_born
    //% block="polar_bear recommended spawn event minecraft:entity_born"
    export function polarBearEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Polar Bear"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_polar_bear_minecraft_entity_spawned
    //% block="polar_bear recommended spawn event minecraft:entity_spawned"
    export function polarBearEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Polar Bear"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_polar_bear_minecraft_ageable_grow_up
    //% block="polar_bear spawn event minecraft:ageable_grow_up"
    export function polarBearAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Polar Bear"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_polar_bear_minecraft_baby_on_calm
    //% block="polar_bear spawn event minecraft:baby_on_calm"
    export function polarBearBabyOnCalm(): string {
        return "minecraft:baby_on_calm";
    }

    //% group="Polar Bear"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_polar_bear_minecraft_on_anger
    //% block="polar_bear spawn event minecraft:on_anger"
    export function polarBearOnAnger(): string {
        return "minecraft:on_anger";
    }

    //% group="Polar Bear"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_polar_bear_minecraft_on_calm
    //% block="polar_bear spawn event minecraft:on_calm"
    export function polarBearOnCalm(): string {
        return "minecraft:on_calm";
    }

    //% group="Polar Bear"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_polar_bear_minecraft_on_scared
    //% block="polar_bear spawn event minecraft:on_scared"
    export function polarBearOnScared(): string {
        return "minecraft:on_scared";
    }

    //% group="Pufferfish"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_pufferfish_minecraft_entity_spawned
    //% block="pufferfish recommended spawn event minecraft:entity_spawned"
    export function pufferfishEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Pufferfish"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_pufferfish_minecraft_from_full_puff
    //% block="pufferfish spawn event minecraft:from_full_puff"
    export function pufferfishFromFullPuff(): string {
        return "minecraft:from_full_puff";
    }

    //% group="Pufferfish"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_pufferfish_minecraft_on_deflate
    //% block="pufferfish spawn event minecraft:on_deflate"
    export function pufferfishOnDeflate(): string {
        return "minecraft:on_deflate";
    }

    //% group="Pufferfish"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_pufferfish_minecraft_on_full_puff
    //% block="pufferfish spawn event minecraft:on_full_puff"
    export function pufferfishOnFullPuff(): string {
        return "minecraft:on_full_puff";
    }

    //% group="Pufferfish"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_pufferfish_minecraft_on_half_puff
    //% block="pufferfish spawn event minecraft:on_half_puff"
    export function pufferfishOnHalfPuff(): string {
        return "minecraft:on_half_puff";
    }

    //% group="Pufferfish"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_pufferfish_minecraft_on_normal_puff
    //% block="pufferfish spawn event minecraft:on_normal_puff"
    export function pufferfishOnNormalPuff(): string {
        return "minecraft:on_normal_puff";
    }

    //% group="Pufferfish"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_pufferfish_minecraft_start_full_puff
    //% block="pufferfish spawn event minecraft:start_full_puff"
    export function pufferfishStartFullPuff(): string {
        return "minecraft:start_full_puff";
    }

    //% group="Pufferfish"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_pufferfish_minecraft_start_half_puff
    //% block="pufferfish spawn event minecraft:start_half_puff"
    export function pufferfishStartHalfPuff(): string {
        return "minecraft:start_half_puff";
    }

    //% group="Pufferfish"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_pufferfish_minecraft_to_full_puff
    //% block="pufferfish spawn event minecraft:to_full_puff"
    export function pufferfishToFullPuff(): string {
        return "minecraft:to_full_puff";
    }

    //% group="Rabbit"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_rabbit_minecraft_entity_born
    //% block="rabbit recommended spawn event minecraft:entity_born"
    export function rabbitEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Rabbit"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_rabbit_minecraft_entity_spawned
    //% block="rabbit recommended spawn event minecraft:entity_spawned"
    export function rabbitEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Rabbit"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_rabbit_grow_up
    //% block="rabbit spawn event grow_up"
    export function rabbitGrowUp(): string {
        return "grow_up";
    }

    //% group="Rabbit"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_rabbit_in_desert
    //% block="rabbit spawn event in_desert"
    export function rabbitInDesert(): string {
        return "in_desert";
    }

    //% group="Rabbit"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_rabbit_in_snow
    //% block="rabbit spawn event in_snow"
    export function rabbitInSnow(): string {
        return "in_snow";
    }

    //% group="Ravager"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_ravager_minecraft_entity_spawned
    //% block="ravager recommended spawn event minecraft:entity_spawned"
    export function ravagerEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Ravager"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_ravager_minecraft_spawn_for_raid
    //% block="ravager recommended spawn event minecraft:spawn_for_raid"
    export function ravagerSpawnForRaid(): string {
        return "minecraft:spawn_for_raid";
    }

    //% group="Ravager"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_ravager_minecraft_become_stunned
    //% block="ravager spawn event minecraft:become_stunned"
    export function ravagerBecomeStunned(): string {
        return "minecraft:become_stunned";
    }

    //% group="Ravager"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_ravager_minecraft_end_roar
    //% block="ravager spawn event minecraft:end_roar"
    export function ravagerEndRoar(): string {
        return "minecraft:end_roar";
    }

    //% group="Ravager"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_ravager_minecraft_raid_expired
    //% block="ravager spawn event minecraft:raid_expired"
    export function ravagerRaidExpired(): string {
        return "minecraft:raid_expired";
    }

    //% group="Ravager"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_ravager_minecraft_spawn_for_raid_with_evoker_rider
    //% block="ravager spawn event minecraft:spawn_for_raid_with_evoker_rider"
    export function ravagerSpawnForRaidWithEvokerRider(): string {
        return "minecraft:spawn_for_raid_with_evoker_rider";
    }

    //% group="Ravager"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_ravager_minecraft_spawn_for_raid_with_pillager_rider
    //% block="ravager spawn event minecraft:spawn_for_raid_with_pillager_rider"
    export function ravagerSpawnForRaidWithPillagerRider(): string {
        return "minecraft:spawn_for_raid_with_pillager_rider";
    }

    //% group="Ravager"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_ravager_minecraft_spawn_with_pillager_captain_rider
    //% block="ravager spawn event minecraft:spawn_with_pillager_captain_rider"
    export function ravagerSpawnWithPillagerCaptainRider(): string {
        return "minecraft:spawn_with_pillager_captain_rider";
    }

    //% group="Ravager"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_ravager_minecraft_spawn_with_pillager_rider
    //% block="ravager spawn event minecraft:spawn_with_pillager_rider"
    export function ravagerSpawnWithPillagerRider(): string {
        return "minecraft:spawn_with_pillager_rider";
    }

    //% group="Ravager"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_ravager_minecraft_spawn_with_vindicator_captain_rider
    //% block="ravager spawn event minecraft:spawn_with_vindicator_captain_rider"
    export function ravagerSpawnWithVindicatorCaptainRider(): string {
        return "minecraft:spawn_with_vindicator_captain_rider";
    }

    //% group="Ravager"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_ravager_minecraft_spawn_with_vindicator_rider
    //% block="ravager spawn event minecraft:spawn_with_vindicator_rider"
    export function ravagerSpawnWithVindicatorRider(): string {
        return "minecraft:spawn_with_vindicator_rider";
    }

    //% group="Ravager"
    //% weight=79
    //% blockId=mcfunction_spawn_event_minecraft_ravager_minecraft_start_celebrating
    //% block="ravager spawn event minecraft:start_celebrating"
    export function ravagerStartCelebrating(): string {
        return "minecraft:start_celebrating";
    }

    //% group="Ravager"
    //% weight=78
    //% blockId=mcfunction_spawn_event_minecraft_ravager_minecraft_start_roar
    //% block="ravager spawn event minecraft:start_roar"
    export function ravagerStartRoar(): string {
        return "minecraft:start_roar";
    }

    //% group="Ravager"
    //% weight=77
    //% blockId=mcfunction_spawn_event_minecraft_ravager_minecraft_stop_celebrating
    //% block="ravager spawn event minecraft:stop_celebrating"
    export function ravagerStopCelebrating(): string {
        return "minecraft:stop_celebrating";
    }

    //% group="Salmon"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_salmon_minecraft_entity_spawned
    //% block="salmon recommended spawn event minecraft:entity_spawned"
    export function salmonEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Sheep"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_sheep_minecraft_entity_born
    //% block="sheep recommended spawn event minecraft:entity_born"
    export function sheepEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Sheep"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_sheep_minecraft_entity_spawned
    //% block="sheep recommended spawn event minecraft:entity_spawned"
    export function sheepEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Sheep"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_sheep_minecraft_ageable_grow_up
    //% block="sheep spawn event minecraft:ageable_grow_up"
    export function sheepAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Sheep"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_sheep_minecraft_cold_color
    //% block="sheep spawn event minecraft:cold_color"
    export function sheepColdColor(): string {
        return "minecraft:cold_color";
    }

    //% group="Sheep"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_sheep_minecraft_on_eat_block
    //% block="sheep spawn event minecraft:on_eat_block"
    export function sheepOnEatBlock(): string {
        return "minecraft:on_eat_block";
    }

    //% group="Sheep"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_sheep_minecraft_on_sheared
    //% block="sheep spawn event minecraft:on_sheared"
    export function sheepOnSheared(): string {
        return "minecraft:on_sheared";
    }

    //% group="Sheep"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_sheep_minecraft_temperate_color
    //% block="sheep spawn event minecraft:temperate_color"
    export function sheepTemperateColor(): string {
        return "minecraft:temperate_color";
    }

    //% group="Sheep"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_sheep_minecraft_warm_color
    //% block="sheep spawn event minecraft:warm_color"
    export function sheepWarmColor(): string {
        return "minecraft:warm_color";
    }

    //% group="Sheep"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_sheep_spawn_adult
    //% block="sheep spawn event spawn_adult"
    export function sheepSpawnAdult(): string {
        return "spawn_adult";
    }

    //% group="Sheep"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_sheep_spawn_baby
    //% block="sheep spawn event spawn_baby"
    export function sheepSpawnBaby(): string {
        return "spawn_baby";
    }

    //% group="Sheep"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_sheep_wololo
    //% block="sheep spawn event wololo"
    export function sheepWololo(): string {
        return "wololo";
    }

    //% group="Shulker"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_shulker_minecraft_entity_spawned
    //% block="shulker recommended spawn event minecraft:entity_spawned"
    export function shulkerEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Shulker"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_shulker_minecraft_turn_black
    //% block="shulker spawn event minecraft:turn_black"
    export function shulkerTurnBlack(): string {
        return "minecraft:turn_black";
    }

    //% group="Shulker"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_shulker_minecraft_turn_blue
    //% block="shulker spawn event minecraft:turn_blue"
    export function shulkerTurnBlue(): string {
        return "minecraft:turn_blue";
    }

    //% group="Shulker"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_shulker_minecraft_turn_brown
    //% block="shulker spawn event minecraft:turn_brown"
    export function shulkerTurnBrown(): string {
        return "minecraft:turn_brown";
    }

    //% group="Shulker"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_shulker_minecraft_turn_cyan
    //% block="shulker spawn event minecraft:turn_cyan"
    export function shulkerTurnCyan(): string {
        return "minecraft:turn_cyan";
    }

    //% group="Shulker"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_shulker_minecraft_turn_gray
    //% block="shulker spawn event minecraft:turn_gray"
    export function shulkerTurnGray(): string {
        return "minecraft:turn_gray";
    }

    //% group="Shulker"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_shulker_minecraft_turn_green
    //% block="shulker spawn event minecraft:turn_green"
    export function shulkerTurnGreen(): string {
        return "minecraft:turn_green";
    }

    //% group="Shulker"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_shulker_minecraft_turn_light_blue
    //% block="shulker spawn event minecraft:turn_light_blue"
    export function shulkerTurnLightBlue(): string {
        return "minecraft:turn_light_blue";
    }

    //% group="Shulker"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_shulker_minecraft_turn_lime
    //% block="shulker spawn event minecraft:turn_lime"
    export function shulkerTurnLime(): string {
        return "minecraft:turn_lime";
    }

    //% group="Shulker"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_shulker_minecraft_turn_magenta
    //% block="shulker spawn event minecraft:turn_magenta"
    export function shulkerTurnMagenta(): string {
        return "minecraft:turn_magenta";
    }

    //% group="Shulker"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_shulker_minecraft_turn_orange
    //% block="shulker spawn event minecraft:turn_orange"
    export function shulkerTurnOrange(): string {
        return "minecraft:turn_orange";
    }

    //% group="Shulker"
    //% weight=79
    //% blockId=mcfunction_spawn_event_minecraft_shulker_minecraft_turn_pink
    //% block="shulker spawn event minecraft:turn_pink"
    export function shulkerTurnPink(): string {
        return "minecraft:turn_pink";
    }

    //% group="Shulker"
    //% weight=78
    //% blockId=mcfunction_spawn_event_minecraft_shulker_minecraft_turn_purple
    //% block="shulker spawn event minecraft:turn_purple"
    export function shulkerTurnPurple(): string {
        return "minecraft:turn_purple";
    }

    //% group="Shulker"
    //% weight=77
    //% blockId=mcfunction_spawn_event_minecraft_shulker_minecraft_turn_red
    //% block="shulker spawn event minecraft:turn_red"
    export function shulkerTurnRed(): string {
        return "minecraft:turn_red";
    }

    //% group="Shulker"
    //% weight=76
    //% blockId=mcfunction_spawn_event_minecraft_shulker_minecraft_turn_silver
    //% block="shulker spawn event minecraft:turn_silver"
    export function shulkerTurnSilver(): string {
        return "minecraft:turn_silver";
    }

    //% group="Shulker"
    //% weight=75
    //% blockId=mcfunction_spawn_event_minecraft_shulker_minecraft_turn_white
    //% block="shulker spawn event minecraft:turn_white"
    export function shulkerTurnWhite(): string {
        return "minecraft:turn_white";
    }

    //% group="Shulker"
    //% weight=74
    //% blockId=mcfunction_spawn_event_minecraft_shulker_minecraft_turn_yellow
    //% block="shulker spawn event minecraft:turn_yellow"
    export function shulkerTurnYellow(): string {
        return "minecraft:turn_yellow";
    }

    //% group="Silverfish"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_silverfish_minecraft_entity_spawned
    //% block="silverfish recommended spawn event minecraft:entity_spawned"
    export function silverfishEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Silverfish"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_silverfish_minecraft_become_angry
    //% block="silverfish spawn event minecraft:become_angry"
    export function silverfishBecomeAngry(): string {
        return "minecraft:become_angry";
    }

    //% group="Silverfish"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_silverfish_minecraft_on_calm
    //% block="silverfish spawn event minecraft:on_calm"
    export function silverfishOnCalm(): string {
        return "minecraft:on_calm";
    }

    //% group="Skeleton"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_skeleton_minecraft_entity_spawned
    //% block="skeleton recommended spawn event minecraft:entity_spawned"
    export function skeletonEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Skeleton"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_skeleton_minecraft_ranged_mode
    //% block="skeleton recommended spawn event minecraft:ranged_mode"
    export function skeletonRangedMode(): string {
        return "minecraft:ranged_mode";
    }

    //% group="Skeleton"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_skeleton_become_stray_event
    //% block="skeleton spawn event become_stray_event"
    export function skeletonBecomeStrayEvent(): string {
        return "become_stray_event";
    }

    //% group="Skeleton"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_skeleton_got_in_powder_snow
    //% block="skeleton spawn event got_in_powder_snow"
    export function skeletonGotInPowderSnow(): string {
        return "got_in_powder_snow";
    }

    //% group="Skeleton"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_skeleton_got_out_of_powder_snow
    //% block="skeleton spawn event got_out_of_powder_snow"
    export function skeletonGotOutOfPowderSnow(): string {
        return "got_out_of_powder_snow";
    }

    //% group="Skeleton"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_skeleton_minecraft_melee_mode
    //% block="skeleton spawn event minecraft:melee_mode"
    export function skeletonMeleeMode(): string {
        return "minecraft:melee_mode";
    }

    //% group="Skeleton"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_skeleton_minecraft_spring_trap
    //% block="skeleton spawn event minecraft:spring_trap"
    export function skeletonSpringTrap(): string {
        return "minecraft:spring_trap";
    }

    //% group="Skeleton"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_skeleton_minecraft_switch_to_hard_ranged
    //% block="skeleton spawn event minecraft:switch_to_hard_ranged"
    export function skeletonSwitchToHardRanged(): string {
        return "minecraft:switch_to_hard_ranged";
    }

    //% group="Skeleton"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_skeleton_minecraft_switch_to_normal_ranged
    //% block="skeleton spawn event minecraft:switch_to_normal_ranged"
    export function skeletonSwitchToNormalRanged(): string {
        return "minecraft:switch_to_normal_ranged";
    }

    //% group="Skeleton Horse"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_skeleton_horse_minecraft_entity_born
    //% block="skeleton_horse recommended spawn event minecraft:entity_born"
    export function skeletonHorseEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Skeleton Horse"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_skeleton_horse_minecraft_entity_spawned
    //% block="skeleton_horse recommended spawn event minecraft:entity_spawned"
    export function skeletonHorseEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Skeleton Horse"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_skeleton_horse_minecraft_set_trap
    //% block="skeleton_horse spawn event minecraft:set_trap"
    export function skeletonHorseSetTrap(): string {
        return "minecraft:set_trap";
    }

    //% group="Skeleton Horse"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_skeleton_horse_minecraft_spring_trap
    //% block="skeleton_horse spawn event minecraft:spring_trap"
    export function skeletonHorseSpringTrap(): string {
        return "minecraft:spring_trap";
    }

    //% group="Slime"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_slime_minecraft_entity_spawned
    //% block="slime recommended spawn event minecraft:entity_spawned"
    export function slimeEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Slime"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_slime_minecraft_become_aggressive
    //% block="slime spawn event minecraft:become_aggressive"
    export function slimeBecomeAggressive(): string {
        return "minecraft:become_aggressive";
    }

    //% group="Slime"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_slime_minecraft_become_calm
    //% block="slime spawn event minecraft:become_calm"
    export function slimeBecomeCalm(): string {
        return "minecraft:become_calm";
    }

    //% group="Slime"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_slime_spawn_large
    //% block="slime spawn event spawn_large"
    export function slimeSpawnLarge(): string {
        return "spawn_large";
    }

    //% group="Slime"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_slime_spawn_medium
    //% block="slime spawn event spawn_medium"
    export function slimeSpawnMedium(): string {
        return "spawn_medium";
    }

    //% group="Slime"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_slime_spawn_small
    //% block="slime spawn event spawn_small"
    export function slimeSpawnSmall(): string {
        return "spawn_small";
    }

    //% group="Sniffer"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_sniffer_minecraft_entity_born
    //% block="sniffer recommended spawn event minecraft:entity_born"
    export function snifferEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Sniffer"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_sniffer_minecraft_entity_spawned
    //% block="sniffer recommended spawn event minecraft:entity_spawned"
    export function snifferEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Sniffer"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_sniffer_minecraft_ageable_grow_up
    //% block="sniffer spawn event minecraft:ageable_grow_up"
    export function snifferAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Sniffer"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_sniffer_minecraft_spawn_adult
    //% block="sniffer spawn event minecraft:spawn_adult"
    export function snifferSpawnAdult(): string {
        return "minecraft:spawn_adult";
    }

    //% group="Sniffer"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_sniffer_on_digging_start
    //% block="sniffer spawn event on_digging_start"
    export function snifferOnDiggingStart(): string {
        return "on_digging_start";
    }

    //% group="Sniffer"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_sniffer_on_egg_spawned
    //% block="sniffer spawn event on_egg_spawned"
    export function snifferOnEggSpawned(): string {
        return "on_egg_spawned";
    }

    //% group="Sniffer"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_sniffer_on_fail_during_digging
    //% block="sniffer spawn event on_fail_during_digging"
    export function snifferOnFailDuringDigging(): string {
        return "on_fail_during_digging";
    }

    //% group="Sniffer"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_sniffer_on_fail_during_searching
    //% block="sniffer spawn event on_fail_during_searching"
    export function snifferOnFailDuringSearching(): string {
        return "on_fail_during_searching";
    }

    //% group="Sniffer"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_sniffer_on_feeling_happy_end
    //% block="sniffer spawn event on_feeling_happy_end"
    export function snifferOnFeelingHappyEnd(): string {
        return "on_feeling_happy_end";
    }

    //% group="Sniffer"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_sniffer_on_item_found
    //% block="sniffer spawn event on_item_found"
    export function snifferOnItemFound(): string {
        return "on_item_found";
    }

    //% group="Sniffer"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_sniffer_on_pregnant
    //% block="sniffer spawn event on_pregnant"
    export function snifferOnPregnant(): string {
        return "on_pregnant";
    }

    //% group="Sniffer"
    //% weight=79
    //% blockId=mcfunction_spawn_event_minecraft_sniffer_on_rising_end
    //% block="sniffer spawn event on_rising_end"
    export function snifferOnRisingEnd(): string {
        return "on_rising_end";
    }

    //% group="Sniffer"
    //% weight=78
    //% blockId=mcfunction_spawn_event_minecraft_sniffer_on_scenting_success
    //% block="sniffer spawn event on_scenting_success"
    export function snifferOnScentingSuccess(): string {
        return "on_scenting_success";
    }

    //% group="Sniffer"
    //% weight=77
    //% blockId=mcfunction_spawn_event_minecraft_sniffer_on_search_and_digging_success
    //% block="sniffer spawn event on_search_and_digging_success"
    export function snifferOnSearchAndDiggingSuccess(): string {
        return "on_search_and_digging_success";
    }

    //% group="Snow Golem"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_snow_golem_minecraft_on_sheared
    //% block="snow_golem spawn event minecraft:on_sheared"
    export function snowGolemOnSheared(): string {
        return "minecraft:on_sheared";
    }

    //% group="Spider"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_spider_minecraft_entity_spawned
    //% block="spider recommended spawn event minecraft:entity_spawned"
    export function spiderEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Spider"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_spider_minecraft_become_angry
    //% block="spider spawn event minecraft:become_angry"
    export function spiderBecomeAngry(): string {
        return "minecraft:become_angry";
    }

    //% group="Spider"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_spider_minecraft_become_calm
    //% block="spider spawn event minecraft:become_calm"
    export function spiderBecomeCalm(): string {
        return "minecraft:become_calm";
    }

    //% group="Spider"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_spider_minecraft_become_hostile
    //% block="spider spawn event minecraft:become_hostile"
    export function spiderBecomeHostile(): string {
        return "minecraft:become_hostile";
    }

    //% group="Spider"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_spider_minecraft_become_neutral
    //% block="spider spawn event minecraft:become_neutral"
    export function spiderBecomeNeutral(): string {
        return "minecraft:become_neutral";
    }

    //% group="Spider"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_spider_minecraft_entity_spawned_with_biome_specific_jockey
    //% block="spider spawn event minecraft:entity_spawned_with_biome_specific_jockey"
    export function spiderEntitySpawnedWithBiomeSpecificJockey(): string {
        return "minecraft:entity_spawned_with_biome_specific_jockey";
    }

    //% group="Spider"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_spider_minecraft_entity_spawned_with_default_jockey
    //% block="spider spawn event minecraft:entity_spawned_with_default_jockey"
    export function spiderEntitySpawnedWithDefaultJockey(): string {
        return "minecraft:entity_spawned_with_default_jockey";
    }

    //% group="Squid"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_squid_minecraft_entity_born
    //% block="squid recommended spawn event minecraft:entity_born"
    export function squidEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Squid"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_squid_minecraft_entity_spawned
    //% block="squid recommended spawn event minecraft:entity_spawned"
    export function squidEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Squid"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_squid_minecraft_ageable_grow_up
    //% block="squid spawn event minecraft:ageable_grow_up"
    export function squidAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Stray"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_stray_minecraft_entity_spawned
    //% block="stray recommended spawn event minecraft:entity_spawned"
    export function strayEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Stray"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_stray_minecraft_ranged_mode
    //% block="stray recommended spawn event minecraft:ranged_mode"
    export function strayRangedMode(): string {
        return "minecraft:ranged_mode";
    }

    //% group="Stray"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_stray_change_to_skeleton
    //% block="stray spawn event change_to_skeleton"
    export function strayChangeToSkeleton(): string {
        return "change_to_skeleton";
    }

    //% group="Stray"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_stray_minecraft_melee_mode
    //% block="stray spawn event minecraft:melee_mode"
    export function strayMeleeMode(): string {
        return "minecraft:melee_mode";
    }

    //% group="Stray"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_stray_minecraft_switch_to_hard_ranged
    //% block="stray spawn event minecraft:switch_to_hard_ranged"
    export function straySwitchToHardRanged(): string {
        return "minecraft:switch_to_hard_ranged";
    }

    //% group="Stray"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_stray_minecraft_switch_to_normal_ranged
    //% block="stray spawn event minecraft:switch_to_normal_ranged"
    export function straySwitchToNormalRanged(): string {
        return "minecraft:switch_to_normal_ranged";
    }

    //% group="Strider"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_strider_minecraft_entity_born
    //% block="strider recommended spawn event minecraft:entity_born"
    export function striderEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Strider"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_strider_minecraft_entity_spawned
    //% block="strider recommended spawn event minecraft:entity_spawned"
    export function striderEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Strider"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_strider_minecraft_spawn_baby_strider_jockey
    //% block="strider recommended spawn event minecraft:spawn_baby_strider_jockey"
    export function striderSpawnBabyStriderJockey(): string {
        return "minecraft:spawn_baby_strider_jockey";
    }

    //% group="Strider"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_strider_minecraft_ageable_grow_up
    //% block="strider spawn event minecraft:ageable_grow_up"
    export function striderAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Strider"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_strider_minecraft_on_saddled
    //% block="strider spawn event minecraft:on_saddled"
    export function striderOnSaddled(): string {
        return "minecraft:on_saddled";
    }

    //% group="Strider"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_strider_minecraft_on_unsaddled
    //% block="strider spawn event minecraft:on_unsaddled"
    export function striderOnUnsaddled(): string {
        return "minecraft:on_unsaddled";
    }

    //% group="Strider"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_strider_on_not_riding_parent
    //% block="strider spawn event on_not_riding_parent"
    export function striderOnNotRidingParent(): string {
        return "on_not_riding_parent";
    }

    //% group="Strider"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_strider_spawn_adult
    //% block="strider spawn event spawn_adult"
    export function striderSpawnAdult(): string {
        return "spawn_adult";
    }

    //% group="Strider"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_strider_spawn_adult_parent_jockey
    //% block="strider spawn event spawn_adult_parent_jockey"
    export function striderSpawnAdultParentJockey(): string {
        return "spawn_adult_parent_jockey";
    }

    //% group="Strider"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_strider_spawn_adult_piglin_jockey
    //% block="strider spawn event spawn_adult_piglin_jockey"
    export function striderSpawnAdultPiglinJockey(): string {
        return "spawn_adult_piglin_jockey";
    }

    //% group="Strider"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_strider_spawn_baby
    //% block="strider spawn event spawn_baby"
    export function striderSpawnBaby(): string {
        return "spawn_baby";
    }

    //% group="Strider"
    //% weight=79
    //% blockId=mcfunction_spawn_event_minecraft_strider_start_suffocating
    //% block="strider spawn event start_suffocating"
    export function striderStartSuffocating(): string {
        return "start_suffocating";
    }

    //% group="Strider"
    //% weight=78
    //% blockId=mcfunction_spawn_event_minecraft_strider_stop_suffocating
    //% block="strider spawn event stop_suffocating"
    export function striderStopSuffocating(): string {
        return "stop_suffocating";
    }

    //% group="Sulfur Cube"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_sulfur_cube_minecraft_entity_born
    //% block="sulfur_cube recommended spawn event minecraft:entity_born"
    export function sulfurCubeEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Sulfur Cube"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_sulfur_cube_minecraft_entity_spawned
    //% block="sulfur_cube recommended spawn event minecraft:entity_spawned"
    export function sulfurCubeEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Sulfur Cube"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_sulfur_cube_minecraft_ageable_grow_up
    //% block="sulfur_cube spawn event minecraft:ageable_grow_up"
    export function sulfurCubeAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Sulfur Cube"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_sulfur_cube_minecraft_become_bouncy
    //% block="sulfur_cube spawn event minecraft:become_bouncy"
    export function sulfurCubeBecomeBouncy(): string {
        return "minecraft:become_bouncy";
    }

    //% group="Sulfur Cube"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_sulfur_cube_minecraft_become_explosive
    //% block="sulfur_cube spawn event minecraft:become_explosive"
    export function sulfurCubeBecomeExplosive(): string {
        return "minecraft:become_explosive";
    }

    //% group="Sulfur Cube"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_sulfur_cube_minecraft_become_fast_flat
    //% block="sulfur_cube spawn event minecraft:become_fast_flat"
    export function sulfurCubeBecomeFastFlat(): string {
        return "minecraft:become_fast_flat";
    }

    //% group="Sulfur Cube"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_sulfur_cube_minecraft_become_fast_sliding
    //% block="sulfur_cube spawn event minecraft:become_fast_sliding"
    export function sulfurCubeBecomeFastSliding(): string {
        return "minecraft:become_fast_sliding";
    }

    //% group="Sulfur Cube"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_sulfur_cube_minecraft_become_high_resistance
    //% block="sulfur_cube spawn event minecraft:become_high_resistance"
    export function sulfurCubeBecomeHighResistance(): string {
        return "minecraft:become_high_resistance";
    }

    //% group="Sulfur Cube"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_sulfur_cube_minecraft_become_hot
    //% block="sulfur_cube spawn event minecraft:become_hot"
    export function sulfurCubeBecomeHot(): string {
        return "minecraft:become_hot";
    }

    //% group="Sulfur Cube"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_sulfur_cube_minecraft_become_light
    //% block="sulfur_cube spawn event minecraft:become_light"
    export function sulfurCubeBecomeLight(): string {
        return "minecraft:become_light";
    }

    //% group="Sulfur Cube"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_sulfur_cube_minecraft_become_regular
    //% block="sulfur_cube spawn event minecraft:become_regular"
    export function sulfurCubeBecomeRegular(): string {
        return "minecraft:become_regular";
    }

    //% group="Sulfur Cube"
    //% weight=79
    //% blockId=mcfunction_spawn_event_minecraft_sulfur_cube_minecraft_become_slow_bouncy
    //% block="sulfur_cube spawn event minecraft:become_slow_bouncy"
    export function sulfurCubeBecomeSlowBouncy(): string {
        return "minecraft:become_slow_bouncy";
    }

    //% group="Sulfur Cube"
    //% weight=78
    //% blockId=mcfunction_spawn_event_minecraft_sulfur_cube_minecraft_become_slow_flat
    //% block="sulfur_cube spawn event minecraft:become_slow_flat"
    export function sulfurCubeBecomeSlowFlat(): string {
        return "minecraft:become_slow_flat";
    }

    //% group="Sulfur Cube"
    //% weight=77
    //% blockId=mcfunction_spawn_event_minecraft_sulfur_cube_minecraft_become_slow_sliding
    //% block="sulfur_cube spawn event minecraft:become_slow_sliding"
    export function sulfurCubeBecomeSlowSliding(): string {
        return "minecraft:become_slow_sliding";
    }

    //% group="Sulfur Cube"
    //% weight=76
    //% blockId=mcfunction_spawn_event_minecraft_sulfur_cube_minecraft_become_sticky
    //% block="sulfur_cube spawn event minecraft:become_sticky"
    export function sulfurCubeBecomeSticky(): string {
        return "minecraft:become_sticky";
    }

    //% group="Sulfur Cube"
    //% weight=75
    //% blockId=mcfunction_spawn_event_minecraft_sulfur_cube_minecraft_on_block_absorbed
    //% block="sulfur_cube spawn event minecraft:on_block_absorbed"
    export function sulfurCubeOnBlockAbsorbed(): string {
        return "minecraft:on_block_absorbed";
    }

    //% group="Sulfur Cube"
    //% weight=74
    //% blockId=mcfunction_spawn_event_minecraft_sulfur_cube_minecraft_on_block_ejected
    //% block="sulfur_cube spawn event minecraft:on_block_ejected"
    export function sulfurCubeOnBlockEjected(): string {
        return "minecraft:on_block_ejected";
    }

    //% group="Sulfur Cube"
    //% weight=73
    //% blockId=mcfunction_spawn_event_minecraft_sulfur_cube_minecraft_on_gain_target
    //% block="sulfur_cube spawn event minecraft:on_gain_target"
    export function sulfurCubeOnGainTarget(): string {
        return "minecraft:on_gain_target";
    }

    //% group="Sulfur Cube"
    //% weight=72
    //% blockId=mcfunction_spawn_event_minecraft_sulfur_cube_minecraft_on_lose_target
    //% block="sulfur_cube spawn event minecraft:on_lose_target"
    export function sulfurCubeOnLoseTarget(): string {
        return "minecraft:on_lose_target";
    }

    //% group="Sulfur Cube"
    //% weight=71
    //% blockId=mcfunction_spawn_event_minecraft_sulfur_cube_minecraft_on_pickup_timeout
    //% block="sulfur_cube spawn event minecraft:on_pickup_timeout"
    export function sulfurCubeOnPickupTimeout(): string {
        return "minecraft:on_pickup_timeout";
    }

    //% group="Sulfur Cube"
    //% weight=70
    //% blockId=mcfunction_spawn_event_minecraft_sulfur_cube_minecraft_on_sheared
    //% block="sulfur_cube spawn event minecraft:on_sheared"
    export function sulfurCubeOnSheared(): string {
        return "minecraft:on_sheared";
    }

    //% group="Sulfur Cube"
    //% weight=69
    //% blockId=mcfunction_spawn_event_minecraft_sulfur_cube_minecraft_spawn_medium
    //% block="sulfur_cube spawn event minecraft:spawn_medium"
    export function sulfurCubeSpawnMedium(): string {
        return "minecraft:spawn_medium";
    }

    //% group="Sulfur Cube"
    //% weight=68
    //% blockId=mcfunction_spawn_event_minecraft_sulfur_cube_minecraft_spawn_small
    //% block="sulfur_cube spawn event minecraft:spawn_small"
    export function sulfurCubeSpawnSmall(): string {
        return "minecraft:spawn_small";
    }

    //% group="Sulfur Cube"
    //% weight=67
    //% blockId=mcfunction_spawn_event_minecraft_sulfur_cube_minecraft_try_priming
    //% block="sulfur_cube spawn event minecraft:try_priming"
    export function sulfurCubeTryPriming(): string {
        return "minecraft:try_priming";
    }

    //% group="Sulfur Cube"
    //% weight=66
    //% blockId=mcfunction_spawn_event_minecraft_sulfur_cube_minecraft_try_priming_on_explosion
    //% block="sulfur_cube spawn event minecraft:try_priming_on_explosion"
    export function sulfurCubeTryPrimingOnExplosion(): string {
        return "minecraft:try_priming_on_explosion";
    }

    //% group="Tadpole"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_tadpole_ageable_grow_up
    //% block="tadpole spawn event ageable_grow_up"
    export function tadpoleAgeableGrowUp(): string {
        return "ageable_grow_up";
    }

    //% group="Tnt"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_tnt_from_explosion
    //% block="tnt spawn event from_explosion"
    export function tntFromExplosion(): string {
        return "from_explosion";
    }

    //% group="Tnt Minecart"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_tnt_minecart_minecraft_entity_spawned
    //% block="tnt_minecart recommended spawn event minecraft:entity_spawned"
    export function tntMinecartEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Tnt Minecart"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_tnt_minecart_minecraft_on_instant_prime
    //% block="tnt_minecart spawn event minecraft:on_instant_prime"
    export function tntMinecartOnInstantPrime(): string {
        return "minecraft:on_instant_prime";
    }

    //% group="Tnt Minecart"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_tnt_minecart_minecraft_on_prime
    //% block="tnt_minecart spawn event minecraft:on_prime"
    export function tntMinecartOnPrime(): string {
        return "minecraft:on_prime";
    }

    //% group="Trader Llama"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_trader_llama_minecraft_entity_born
    //% block="trader_llama recommended spawn event minecraft:entity_born"
    export function traderLlamaEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Trader Llama"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_trader_llama_minecraft_entity_spawned
    //% block="trader_llama recommended spawn event minecraft:entity_spawned"
    export function traderLlamaEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Trader Llama"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_trader_llama_minecraft_from_wandering_trader
    //% block="trader_llama recommended spawn event minecraft:from_wandering_trader"
    export function traderLlamaFromWanderingTrader(): string {
        return "minecraft:from_wandering_trader";
    }

    //% group="Trader Llama"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_trader_llama_minecraft_add_attributes
    //% block="trader_llama spawn event minecraft:add_attributes"
    export function traderLlamaAddAttributes(): string {
        return "minecraft:add_attributes";
    }

    //% group="Trader Llama"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_trader_llama_minecraft_ageable_grow_up
    //% block="trader_llama spawn event minecraft:ageable_grow_up"
    export function traderLlamaAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Trader Llama"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_trader_llama_minecraft_become_angry
    //% block="trader_llama spawn event minecraft:become_angry"
    export function traderLlamaBecomeAngry(): string {
        return "minecraft:become_angry";
    }

    //% group="Trader Llama"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_trader_llama_minecraft_defend_wandering_trader
    //% block="trader_llama spawn event minecraft:defend_wandering_trader"
    export function traderLlamaDefendWanderingTrader(): string {
        return "minecraft:defend_wandering_trader";
    }

    //% group="Trader Llama"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_trader_llama_minecraft_join_caravan
    //% block="trader_llama spawn event minecraft:join_caravan"
    export function traderLlamaJoinCaravan(): string {
        return "minecraft:join_caravan";
    }

    //% group="Trader Llama"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_trader_llama_minecraft_leave_caravan
    //% block="trader_llama spawn event minecraft:leave_caravan"
    export function traderLlamaLeaveCaravan(): string {
        return "minecraft:leave_caravan";
    }

    //% group="Trader Llama"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_trader_llama_minecraft_mad_at_wolf
    //% block="trader_llama spawn event minecraft:mad_at_wolf"
    export function traderLlamaMadAtWolf(): string {
        return "minecraft:mad_at_wolf";
    }

    //% group="Trader Llama"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_trader_llama_minecraft_on_calm
    //% block="trader_llama spawn event minecraft:on_calm"
    export function traderLlamaOnCalm(): string {
        return "minecraft:on_calm";
    }

    //% group="Trader Llama"
    //% weight=79
    //% blockId=mcfunction_spawn_event_minecraft_trader_llama_minecraft_on_chest
    //% block="trader_llama spawn event minecraft:on_chest"
    export function traderLlamaOnChest(): string {
        return "minecraft:on_chest";
    }

    //% group="Trader Llama"
    //% weight=78
    //% blockId=mcfunction_spawn_event_minecraft_trader_llama_minecraft_on_leash
    //% block="trader_llama spawn event minecraft:on_leash"
    export function traderLlamaOnLeash(): string {
        return "minecraft:on_leash";
    }

    //% group="Trader Llama"
    //% weight=77
    //% blockId=mcfunction_spawn_event_minecraft_trader_llama_minecraft_on_tame
    //% block="trader_llama spawn event minecraft:on_tame"
    export function traderLlamaOnTame(): string {
        return "minecraft:on_tame";
    }

    //% group="Trader Llama"
    //% weight=76
    //% blockId=mcfunction_spawn_event_minecraft_trader_llama_minecraft_on_unleash
    //% block="trader_llama spawn event minecraft:on_unleash"
    export function traderLlamaOnUnleash(): string {
        return "minecraft:on_unleash";
    }

    //% group="Trader Llama"
    //% weight=75
    //% blockId=mcfunction_spawn_event_minecraft_trader_llama_minecraft_remove_persistence
    //% block="trader_llama spawn event minecraft:remove_persistence"
    export function traderLlamaRemovePersistence(): string {
        return "minecraft:remove_persistence";
    }

    //% group="Trader Llama"
    //% weight=74
    //% blockId=mcfunction_spawn_event_minecraft_trader_llama_minecraft_spawn_adult
    //% block="trader_llama spawn event minecraft:spawn_adult"
    export function traderLlamaSpawnAdult(): string {
        return "minecraft:spawn_adult";
    }

    //% group="Trader Llama"
    //% weight=73
    //% blockId=mcfunction_spawn_event_minecraft_trader_llama_minecraft_spawn_baby
    //% block="trader_llama spawn event minecraft:spawn_baby"
    export function traderLlamaSpawnBaby(): string {
        return "minecraft:spawn_baby";
    }

    //% group="Tropicalfish"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_tropicalfish_minecraft_entity_spawned
    //% block="tropicalfish recommended spawn event minecraft:entity_spawned"
    export function tropicalfishEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Tropicalfish"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_tropicalfish_minecraft_become_anenonme
    //% block="tropicalfish spawn event minecraft:become_anenonme"
    export function tropicalfishBecomeAnenonme(): string {
        return "minecraft:become_anenonme";
    }

    //% group="Tropicalfish"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_tropicalfish_minecraft_become_black_tang
    //% block="tropicalfish spawn event minecraft:become_black_tang"
    export function tropicalfishBecomeBlackTang(): string {
        return "minecraft:become_black_tang";
    }

    //% group="Tropicalfish"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_tropicalfish_minecraft_become_blue_dory
    //% block="tropicalfish spawn event minecraft:become_blue_dory"
    export function tropicalfishBecomeBlueDory(): string {
        return "minecraft:become_blue_dory";
    }

    //% group="Tropicalfish"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_tropicalfish_minecraft_become_butterfly_fish
    //% block="tropicalfish spawn event minecraft:become_butterfly_fish"
    export function tropicalfishBecomeButterflyFish(): string {
        return "minecraft:become_butterfly_fish";
    }

    //% group="Tropicalfish"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_tropicalfish_minecraft_become_cc_betta
    //% block="tropicalfish spawn event minecraft:become_cc_betta"
    export function tropicalfishBecomeCcBetta(): string {
        return "minecraft:become_cc_betta";
    }

    //% group="Tropicalfish"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_tropicalfish_minecraft_become_cichlid
    //% block="tropicalfish spawn event minecraft:become_cichlid"
    export function tropicalfishBecomeCichlid(): string {
        return "minecraft:become_cichlid";
    }

    //% group="Tropicalfish"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_tropicalfish_minecraft_become_clownfish
    //% block="tropicalfish spawn event minecraft:become_clownfish"
    export function tropicalfishBecomeClownfish(): string {
        return "minecraft:become_clownfish";
    }

    //% group="Tropicalfish"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_tropicalfish_minecraft_become_dog_fish
    //% block="tropicalfish spawn event minecraft:become_dog_fish"
    export function tropicalfishBecomeDogFish(): string {
        return "minecraft:become_dog_fish";
    }

    //% group="Tropicalfish"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_tropicalfish_minecraft_become_e_red_snapper
    //% block="tropicalfish spawn event minecraft:become_e_red_snapper"
    export function tropicalfishBecomeERedSnapper(): string {
        return "minecraft:become_e_red_snapper";
    }

    //% group="Tropicalfish"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_tropicalfish_minecraft_become_goat_fish
    //% block="tropicalfish spawn event minecraft:become_goat_fish"
    export function tropicalfishBecomeGoatFish(): string {
        return "minecraft:become_goat_fish";
    }

    //% group="Tropicalfish"
    //% weight=79
    //% blockId=mcfunction_spawn_event_minecraft_tropicalfish_minecraft_become_moorish_idol
    //% block="tropicalfish spawn event minecraft:become_moorish_idol"
    export function tropicalfishBecomeMoorishIdol(): string {
        return "minecraft:become_moorish_idol";
    }

    //% group="Tropicalfish"
    //% weight=78
    //% blockId=mcfunction_spawn_event_minecraft_tropicalfish_minecraft_become_ornate_butterfly
    //% block="tropicalfish spawn event minecraft:become_ornate_butterfly"
    export function tropicalfishBecomeOrnateButterfly(): string {
        return "minecraft:become_ornate_butterfly";
    }

    //% group="Tropicalfish"
    //% weight=77
    //% blockId=mcfunction_spawn_event_minecraft_tropicalfish_minecraft_become_parrot_fish
    //% block="tropicalfish spawn event minecraft:become_parrot_fish"
    export function tropicalfishBecomeParrotFish(): string {
        return "minecraft:become_parrot_fish";
    }

    //% group="Tropicalfish"
    //% weight=76
    //% blockId=mcfunction_spawn_event_minecraft_tropicalfish_minecraft_become_queen_angel_fish
    //% block="tropicalfish spawn event minecraft:become_queen_angel_fish"
    export function tropicalfishBecomeQueenAngelFish(): string {
        return "minecraft:become_queen_angel_fish";
    }

    //% group="Tropicalfish"
    //% weight=75
    //% blockId=mcfunction_spawn_event_minecraft_tropicalfish_minecraft_become_red_cichlid
    //% block="tropicalfish spawn event minecraft:become_red_cichlid"
    export function tropicalfishBecomeRedCichlid(): string {
        return "minecraft:become_red_cichlid";
    }

    //% group="Tropicalfish"
    //% weight=74
    //% blockId=mcfunction_spawn_event_minecraft_tropicalfish_minecraft_become_red_lipped_benny
    //% block="tropicalfish spawn event minecraft:become_red_lipped_benny"
    export function tropicalfishBecomeRedLippedBenny(): string {
        return "minecraft:become_red_lipped_benny";
    }

    //% group="Tropicalfish"
    //% weight=73
    //% blockId=mcfunction_spawn_event_minecraft_tropicalfish_minecraft_become_red_snapper
    //% block="tropicalfish spawn event minecraft:become_red_snapper"
    export function tropicalfishBecomeRedSnapper(): string {
        return "minecraft:become_red_snapper";
    }

    //% group="Tropicalfish"
    //% weight=72
    //% blockId=mcfunction_spawn_event_minecraft_tropicalfish_minecraft_become_threadfin
    //% block="tropicalfish spawn event minecraft:become_threadfin"
    export function tropicalfishBecomeThreadfin(): string {
        return "minecraft:become_threadfin";
    }

    //% group="Tropicalfish"
    //% weight=71
    //% blockId=mcfunction_spawn_event_minecraft_tropicalfish_minecraft_become_tomato_clown
    //% block="tropicalfish spawn event minecraft:become_tomato_clown"
    export function tropicalfishBecomeTomatoClown(): string {
        return "minecraft:become_tomato_clown";
    }

    //% group="Tropicalfish"
    //% weight=70
    //% blockId=mcfunction_spawn_event_minecraft_tropicalfish_minecraft_become_triggerfish
    //% block="tropicalfish spawn event minecraft:become_triggerfish"
    export function tropicalfishBecomeTriggerfish(): string {
        return "minecraft:become_triggerfish";
    }

    //% group="Tropicalfish"
    //% weight=69
    //% blockId=mcfunction_spawn_event_minecraft_tropicalfish_minecraft_become_yellow_tail_parrot
    //% block="tropicalfish spawn event minecraft:become_yellow_tail_parrot"
    export function tropicalfishBecomeYellowTailParrot(): string {
        return "minecraft:become_yellow_tail_parrot";
    }

    //% group="Tropicalfish"
    //% weight=68
    //% blockId=mcfunction_spawn_event_minecraft_tropicalfish_minecraft_become_yellow_tang
    //% block="tropicalfish spawn event minecraft:become_yellow_tang"
    export function tropicalfishBecomeYellowTang(): string {
        return "minecraft:become_yellow_tang";
    }

    //% group="Turtle"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_turtle_minecraft_entity_born
    //% block="turtle recommended spawn event minecraft:entity_born"
    export function turtleEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Turtle"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_turtle_minecraft_entity_spawned
    //% block="turtle recommended spawn event minecraft:entity_spawned"
    export function turtleEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Turtle"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_turtle_minecraft_ageable_grow_up
    //% block="turtle spawn event minecraft:ageable_grow_up"
    export function turtleAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Turtle"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_turtle_minecraft_become_pregnant
    //% block="turtle spawn event minecraft:become_pregnant"
    export function turtleBecomePregnant(): string {
        return "minecraft:become_pregnant";
    }

    //% group="Turtle"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_turtle_minecraft_go_lay_egg
    //% block="turtle spawn event minecraft:go_lay_egg"
    export function turtleGoLayEgg(): string {
        return "minecraft:go_lay_egg";
    }

    //% group="Turtle"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_turtle_minecraft_laid_egg
    //% block="turtle spawn event minecraft:laid_egg"
    export function turtleLaidEgg(): string {
        return "minecraft:laid_egg";
    }

    //% group="Vex"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_vex_minecraft_add_damage_timer
    //% block="vex spawn event minecraft:add_damage_timer"
    export function vexAddDamageTimer(): string {
        return "minecraft:add_damage_timer";
    }

    //% group="Vex"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_vex_minecraft_add_periodic_damage
    //% block="vex spawn event minecraft:add_periodic_damage"
    export function vexAddPeriodicDamage(): string {
        return "minecraft:add_periodic_damage";
    }

    //% group="Villager"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_villager_minecraft_entity_born
    //% block="villager recommended spawn event minecraft:entity_born"
    export function villagerEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Villager"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_villager_minecraft_entity_spawned
    //% block="villager recommended spawn event minecraft:entity_spawned"
    export function villagerEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Villager"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_villager_minecraft_entity_transformed
    //% block="villager recommended spawn event minecraft:entity_transformed"
    export function villagerEntityTransformed(): string {
        return "minecraft:entity_transformed";
    }

    //% group="Villager"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_villager_become_witch
    //% block="villager spawn event become_witch"
    export function villagerBecomeWitch(): string {
        return "become_witch";
    }

    //% group="Villager"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_villager_become_zombie
    //% block="villager spawn event become_zombie"
    export function villagerBecomeZombie(): string {
        return "become_zombie";
    }

    //% group="Villager"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_villager_minecraft_ageable_grow_up
    //% block="villager spawn event minecraft:ageable_grow_up"
    export function villagerAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Villager"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_villager_minecraft_become_cleric
    //% block="villager spawn event minecraft:become_cleric"
    export function villagerBecomeCleric(): string {
        return "minecraft:become_cleric";
    }

    //% group="Villager"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_villager_minecraft_spawn_armorer
    //% block="villager spawn event minecraft:spawn_armorer"
    export function villagerSpawnArmorer(): string {
        return "minecraft:spawn_armorer";
    }

    //% group="Villager"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_villager_minecraft_spawn_butcher
    //% block="villager spawn event minecraft:spawn_butcher"
    export function villagerSpawnButcher(): string {
        return "minecraft:spawn_butcher";
    }

    //% group="Villager"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_villager_minecraft_spawn_cleric
    //% block="villager spawn event minecraft:spawn_cleric"
    export function villagerSpawnCleric(): string {
        return "minecraft:spawn_cleric";
    }

    //% group="Villager"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_villager_minecraft_spawn_farmer
    //% block="villager spawn event minecraft:spawn_farmer"
    export function villagerSpawnFarmer(): string {
        return "minecraft:spawn_farmer";
    }

    //% group="Villager"
    //% weight=79
    //% blockId=mcfunction_spawn_event_minecraft_villager_minecraft_spawn_librarian
    //% block="villager spawn event minecraft:spawn_librarian"
    export function villagerSpawnLibrarian(): string {
        return "minecraft:spawn_librarian";
    }

    //% group="Villager"
    //% weight=78
    //% blockId=mcfunction_spawn_event_minecraft_villager_minecraft_start_celebrating
    //% block="villager spawn event minecraft:start_celebrating"
    export function villagerStartCelebrating(): string {
        return "minecraft:start_celebrating";
    }

    //% group="Villager"
    //% weight=77
    //% blockId=mcfunction_spawn_event_minecraft_villager_minecraft_stop_celebrating
    //% block="villager spawn event minecraft:stop_celebrating"
    export function villagerStopCelebrating(): string {
        return "minecraft:stop_celebrating";
    }

    //% group="Villager V2"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_entity_born
    //% block="villager_v2 recommended spawn event minecraft:entity_born"
    export function villagerV2EntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Villager V2"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_entity_spawned
    //% block="villager_v2 recommended spawn event minecraft:entity_spawned"
    export function villagerV2EntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Villager V2"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_entity_transformed
    //% block="villager_v2 recommended spawn event minecraft:entity_transformed"
    export function villagerV2EntityTransformed(): string {
        return "minecraft:entity_transformed";
    }

    //% group="Villager V2"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_become_witch
    //% block="villager_v2 spawn event become_witch"
    export function villagerV2BecomeWitch(): string {
        return "become_witch";
    }

    //% group="Villager V2"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_become_zombie
    //% block="villager_v2 spawn event become_zombie"
    export function villagerV2BecomeZombie(): string {
        return "become_zombie";
    }

    //% group="Villager V2"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_ageable_grow_up
    //% block="villager_v2 spawn event minecraft:ageable_grow_up"
    export function villagerV2AgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Villager V2"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_become_armorer
    //% block="villager_v2 spawn event minecraft:become_armorer"
    export function villagerV2BecomeArmorer(): string {
        return "minecraft:become_armorer";
    }

    //% group="Villager V2"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_become_butcher
    //% block="villager_v2 spawn event minecraft:become_butcher"
    export function villagerV2BecomeButcher(): string {
        return "minecraft:become_butcher";
    }

    //% group="Villager V2"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_become_cartographer
    //% block="villager_v2 spawn event minecraft:become_cartographer"
    export function villagerV2BecomeCartographer(): string {
        return "minecraft:become_cartographer";
    }

    //% group="Villager V2"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_become_cleric
    //% block="villager_v2 spawn event minecraft:become_cleric"
    export function villagerV2BecomeCleric(): string {
        return "minecraft:become_cleric";
    }

    //% group="Villager V2"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_become_farmer
    //% block="villager_v2 spawn event minecraft:become_farmer"
    export function villagerV2BecomeFarmer(): string {
        return "minecraft:become_farmer";
    }

    //% group="Villager V2"
    //% weight=79
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_become_fisherman
    //% block="villager_v2 spawn event minecraft:become_fisherman"
    export function villagerV2BecomeFisherman(): string {
        return "minecraft:become_fisherman";
    }

    //% group="Villager V2"
    //% weight=78
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_become_fletcher
    //% block="villager_v2 spawn event minecraft:become_fletcher"
    export function villagerV2BecomeFletcher(): string {
        return "minecraft:become_fletcher";
    }

    //% group="Villager V2"
    //% weight=77
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_become_leatherworker
    //% block="villager_v2 spawn event minecraft:become_leatherworker"
    export function villagerV2BecomeLeatherworker(): string {
        return "minecraft:become_leatherworker";
    }

    //% group="Villager V2"
    //% weight=76
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_become_librarian
    //% block="villager_v2 spawn event minecraft:become_librarian"
    export function villagerV2BecomeLibrarian(): string {
        return "minecraft:become_librarian";
    }

    //% group="Villager V2"
    //% weight=75
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_become_mason
    //% block="villager_v2 spawn event minecraft:become_mason"
    export function villagerV2BecomeMason(): string {
        return "minecraft:become_mason";
    }

    //% group="Villager V2"
    //% weight=74
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_become_sheperd
    //% block="villager_v2 spawn event minecraft:become_sheperd"
    export function villagerV2BecomeSheperd(): string {
        return "minecraft:become_sheperd";
    }

    //% group="Villager V2"
    //% weight=73
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_become_toolsmith
    //% block="villager_v2 spawn event minecraft:become_toolsmith"
    export function villagerV2BecomeToolsmith(): string {
        return "minecraft:become_toolsmith";
    }

    //% group="Villager V2"
    //% weight=72
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_become_unskilled
    //% block="villager_v2 spawn event minecraft:become_unskilled"
    export function villagerV2BecomeUnskilled(): string {
        return "minecraft:become_unskilled";
    }

    //% group="Villager V2"
    //% weight=71
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_become_weaponsmith
    //% block="villager_v2 spawn event minecraft:become_weaponsmith"
    export function villagerV2BecomeWeaponsmith(): string {
        return "minecraft:become_weaponsmith";
    }

    //% group="Villager V2"
    //% weight=70
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_resupply_trades
    //% block="villager_v2 spawn event minecraft:resupply_trades"
    export function villagerV2ResupplyTrades(): string {
        return "minecraft:resupply_trades";
    }

    //% group="Villager V2"
    //% weight=69
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_schedule_bed_villager
    //% block="villager_v2 spawn event minecraft:schedule_bed_villager"
    export function villagerV2ScheduleBedVillager(): string {
        return "minecraft:schedule_bed_villager";
    }

    //% group="Villager V2"
    //% weight=68
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_schedule_gather_villager
    //% block="villager_v2 spawn event minecraft:schedule_gather_villager"
    export function villagerV2ScheduleGatherVillager(): string {
        return "minecraft:schedule_gather_villager";
    }

    //% group="Villager V2"
    //% weight=67
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_schedule_home_villager
    //% block="villager_v2 spawn event minecraft:schedule_home_villager"
    export function villagerV2ScheduleHomeVillager(): string {
        return "minecraft:schedule_home_villager";
    }

    //% group="Villager V2"
    //% weight=66
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_schedule_play_villager
    //% block="villager_v2 spawn event minecraft:schedule_play_villager"
    export function villagerV2SchedulePlayVillager(): string {
        return "minecraft:schedule_play_villager";
    }

    //% group="Villager V2"
    //% weight=65
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_schedule_wander_villager
    //% block="villager_v2 spawn event minecraft:schedule_wander_villager"
    export function villagerV2ScheduleWanderVillager(): string {
        return "minecraft:schedule_wander_villager";
    }

    //% group="Villager V2"
    //% weight=64
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_schedule_work_farmer
    //% block="villager_v2 spawn event minecraft:schedule_work_farmer"
    export function villagerV2ScheduleWorkFarmer(): string {
        return "minecraft:schedule_work_farmer";
    }

    //% group="Villager V2"
    //% weight=63
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_schedule_work_fisher
    //% block="villager_v2 spawn event minecraft:schedule_work_fisher"
    export function villagerV2ScheduleWorkFisher(): string {
        return "minecraft:schedule_work_fisher";
    }

    //% group="Villager V2"
    //% weight=62
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_schedule_work_librarian
    //% block="villager_v2 spawn event minecraft:schedule_work_librarian"
    export function villagerV2ScheduleWorkLibrarian(): string {
        return "minecraft:schedule_work_librarian";
    }

    //% group="Villager V2"
    //% weight=61
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_schedule_work_pro_villager
    //% block="villager_v2 spawn event minecraft:schedule_work_pro_villager"
    export function villagerV2ScheduleWorkProVillager(): string {
        return "minecraft:schedule_work_pro_villager";
    }

    //% group="Villager V2"
    //% weight=60
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_spawn_armorer
    //% block="villager_v2 spawn event minecraft:spawn_armorer"
    export function villagerV2SpawnArmorer(): string {
        return "minecraft:spawn_armorer";
    }

    //% group="Villager V2"
    //% weight=59
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_spawn_butcher
    //% block="villager_v2 spawn event minecraft:spawn_butcher"
    export function villagerV2SpawnButcher(): string {
        return "minecraft:spawn_butcher";
    }

    //% group="Villager V2"
    //% weight=58
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_spawn_cleric
    //% block="villager_v2 spawn event minecraft:spawn_cleric"
    export function villagerV2SpawnCleric(): string {
        return "minecraft:spawn_cleric";
    }

    //% group="Villager V2"
    //% weight=57
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_spawn_farmer
    //% block="villager_v2 spawn event minecraft:spawn_farmer"
    export function villagerV2SpawnFarmer(): string {
        return "minecraft:spawn_farmer";
    }

    //% group="Villager V2"
    //% weight=56
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_spawn_from_village
    //% block="villager_v2 spawn event minecraft:spawn_from_village"
    export function villagerV2SpawnFromVillage(): string {
        return "minecraft:spawn_from_village";
    }

    //% group="Villager V2"
    //% weight=55
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_spawn_librarian
    //% block="villager_v2 spawn event minecraft:spawn_librarian"
    export function villagerV2SpawnLibrarian(): string {
        return "minecraft:spawn_librarian";
    }

    //% group="Villager V2"
    //% weight=54
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_start_celebrating
    //% block="villager_v2 spawn event minecraft:start_celebrating"
    export function villagerV2StartCelebrating(): string {
        return "minecraft:start_celebrating";
    }

    //% group="Villager V2"
    //% weight=53
    //% blockId=mcfunction_spawn_event_minecraft_villager_v2_minecraft_stop_celebrating
    //% block="villager_v2 spawn event minecraft:stop_celebrating"
    export function villagerV2StopCelebrating(): string {
        return "minecraft:stop_celebrating";
    }

    //% group="Vindicator"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_vindicator_minecraft_entity_spawned
    //% block="vindicator recommended spawn event minecraft:entity_spawned"
    export function vindicatorEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Vindicator"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_vindicator_minecraft_spawn_as_illager_captain
    //% block="vindicator recommended spawn event minecraft:spawn_as_illager_captain"
    export function vindicatorSpawnAsIllagerCaptain(): string {
        return "minecraft:spawn_as_illager_captain";
    }

    //% group="Vindicator"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_vindicator_minecraft_spawn_for_raid
    //% block="vindicator recommended spawn event minecraft:spawn_for_raid"
    export function vindicatorSpawnForRaid(): string {
        return "minecraft:spawn_for_raid";
    }

    //% group="Vindicator"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_vindicator_minecraft_become_aggro
    //% block="vindicator spawn event minecraft:become_aggro"
    export function vindicatorBecomeAggro(): string {
        return "minecraft:become_aggro";
    }

    //% group="Vindicator"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_vindicator_minecraft_promote_to_illager_captain
    //% block="vindicator spawn event minecraft:promote_to_illager_captain"
    export function vindicatorPromoteToIllagerCaptain(): string {
        return "minecraft:promote_to_illager_captain";
    }

    //% group="Vindicator"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_vindicator_minecraft_promote_to_patrol_captain
    //% block="vindicator spawn event minecraft:promote_to_patrol_captain"
    export function vindicatorPromoteToPatrolCaptain(): string {
        return "minecraft:promote_to_patrol_captain";
    }

    //% group="Vindicator"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_vindicator_minecraft_raid_expired
    //% block="vindicator spawn event minecraft:raid_expired"
    export function vindicatorRaidExpired(): string {
        return "minecraft:raid_expired";
    }

    //% group="Vindicator"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_vindicator_minecraft_spawn_as_patrol_follower
    //% block="vindicator spawn event minecraft:spawn_as_patrol_follower"
    export function vindicatorSpawnAsPatrolFollower(): string {
        return "minecraft:spawn_as_patrol_follower";
    }

    //% group="Vindicator"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_vindicator_minecraft_start_celebrating
    //% block="vindicator spawn event minecraft:start_celebrating"
    export function vindicatorStartCelebrating(): string {
        return "minecraft:start_celebrating";
    }

    //% group="Vindicator"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_vindicator_minecraft_start_johnny
    //% block="vindicator spawn event minecraft:start_johnny"
    export function vindicatorStartJohnny(): string {
        return "minecraft:start_johnny";
    }

    //% group="Vindicator"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_vindicator_minecraft_stop_aggro
    //% block="vindicator spawn event minecraft:stop_aggro"
    export function vindicatorStopAggro(): string {
        return "minecraft:stop_aggro";
    }

    //% group="Vindicator"
    //% weight=79
    //% blockId=mcfunction_spawn_event_minecraft_vindicator_minecraft_stop_celebrating
    //% block="vindicator spawn event minecraft:stop_celebrating"
    export function vindicatorStopCelebrating(): string {
        return "minecraft:stop_celebrating";
    }

    //% group="Vindicator"
    //% weight=78
    //% blockId=mcfunction_spawn_event_minecraft_vindicator_minecraft_stop_johnny
    //% block="vindicator spawn event minecraft:stop_johnny"
    export function vindicatorStopJohnny(): string {
        return "minecraft:stop_johnny";
    }

    //% group="Wandering Trader"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_wandering_trader_minecraft_become_calm
    //% block="wandering_trader spawn event minecraft:become_calm"
    export function wanderingTraderBecomeCalm(): string {
        return "minecraft:become_calm";
    }

    //% group="Wandering Trader"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_wandering_trader_minecraft_become_scared
    //% block="wandering_trader spawn event minecraft:become_scared"
    export function wanderingTraderBecomeScared(): string {
        return "minecraft:become_scared";
    }

    //% group="Wandering Trader"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_wandering_trader_minecraft_scheduled
    //% block="wandering_trader spawn event minecraft:scheduled"
    export function wanderingTraderScheduled(): string {
        return "minecraft:scheduled";
    }

    //% group="Wandering Trader"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_wandering_trader_minecraft_start_despawn
    //% block="wandering_trader spawn event minecraft:start_despawn"
    export function wanderingTraderStartDespawn(): string {
        return "minecraft:start_despawn";
    }

    //% group="Warden"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_warden_minecraft_entity_spawned
    //% block="warden recommended spawn event minecraft:entity_spawned"
    export function wardenEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Warden"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_warden_minecraft_emerged
    //% block="warden spawn event minecraft:emerged"
    export function wardenEmerged(): string {
        return "minecraft:emerged";
    }

    //% group="Warden"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_warden_minecraft_spawn_emerging
    //% block="warden spawn event minecraft:spawn_emerging"
    export function wardenSpawnEmerging(): string {
        return "minecraft:spawn_emerging";
    }

    //% group="Warden"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_warden_on_digging_event
    //% block="warden spawn event on_digging_event"
    export function wardenOnDiggingEvent(): string {
        return "on_digging_event";
    }

    //% group="Witch"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_witch_minecraft_spawn_for_raid
    //% block="witch recommended spawn event minecraft:spawn_for_raid"
    export function witchSpawnForRaid(): string {
        return "minecraft:spawn_for_raid";
    }

    //% group="Witch"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_witch_minecraft_raid_expired
    //% block="witch spawn event minecraft:raid_expired"
    export function witchRaidExpired(): string {
        return "minecraft:raid_expired";
    }

    //% group="Witch"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_witch_minecraft_start_celebrating
    //% block="witch spawn event minecraft:start_celebrating"
    export function witchStartCelebrating(): string {
        return "minecraft:start_celebrating";
    }

    //% group="Witch"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_witch_minecraft_stop_celebrating
    //% block="witch spawn event minecraft:stop_celebrating"
    export function witchStopCelebrating(): string {
        return "minecraft:stop_celebrating";
    }

    //% group="Wither"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_wither_minecraft_entity_spawned
    //% block="wither recommended spawn event minecraft:entity_spawned"
    export function witherEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Wither Skeleton"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_wither_skeleton_minecraft_entity_spawned
    //% block="wither_skeleton recommended spawn event minecraft:entity_spawned"
    export function witherSkeletonEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Wither Skull"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_wither_skull_minecraft_explode
    //% block="wither_skull spawn event minecraft:explode"
    export function witherSkullExplode(): string {
        return "minecraft:explode";
    }

    //% group="Wither Skull Dangerous"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_wither_skull_dangerous_minecraft_explode
    //% block="wither_skull_dangerous spawn event minecraft:explode"
    export function witherSkullDangerousExplode(): string {
        return "minecraft:explode";
    }

    //% group="Wolf"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_wolf_minecraft_entity_born
    //% block="wolf recommended spawn event minecraft:entity_born"
    export function wolfEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Wolf"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_wolf_minecraft_entity_spawned
    //% block="wolf recommended spawn event minecraft:entity_spawned"
    export function wolfEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Wolf"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_wolf_minecraft_ageable_grow_up
    //% block="wolf spawn event minecraft:ageable_grow_up"
    export function wolfAgeableGrowUp(): string {
        return "minecraft:ageable_grow_up";
    }

    //% group="Wolf"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_wolf_minecraft_ageable_set_baby
    //% block="wolf spawn event minecraft:ageable_set_baby"
    export function wolfAgeableSetBaby(): string {
        return "minecraft:ageable_set_baby";
    }

    //% group="Wolf"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_wolf_minecraft_become_angry
    //% block="wolf spawn event minecraft:become_angry"
    export function wolfBecomeAngry(): string {
        return "minecraft:become_angry";
    }

    //% group="Wolf"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_wolf_minecraft_become_armorable
    //% block="wolf spawn event minecraft:become_armorable"
    export function wolfBecomeArmorable(): string {
        return "minecraft:become_armorable";
    }

    //% group="Wolf"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_wolf_minecraft_increase_max_health
    //% block="wolf spawn event minecraft:increase_max_health"
    export function wolfIncreaseMaxHealth(): string {
        return "minecraft:increase_max_health";
    }

    //% group="Wolf"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_wolf_minecraft_on_calm
    //% block="wolf spawn event minecraft:on_calm"
    export function wolfOnCalm(): string {
        return "minecraft:on_calm";
    }

    //% group="Wolf"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_wolf_minecraft_on_tame
    //% block="wolf spawn event minecraft:on_tame"
    export function wolfOnTame(): string {
        return "minecraft:on_tame";
    }

    //% group="Wolf"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_wolf_minecraft_randomize_sound_variant
    //% block="wolf spawn event minecraft:randomize_sound_variant"
    export function wolfRandomizeSoundVariant(): string {
        return "minecraft:randomize_sound_variant";
    }

    //% group="Wolf"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_wolf_minecraft_spawn_tame_adult
    //% block="wolf spawn event minecraft:spawn_tame_adult"
    export function wolfSpawnTameAdult(): string {
        return "minecraft:spawn_tame_adult";
    }

    //% group="Wolf"
    //% weight=79
    //% blockId=mcfunction_spawn_event_minecraft_wolf_minecraft_spawn_tame_baby
    //% block="wolf spawn event minecraft:spawn_tame_baby"
    export function wolfSpawnTameBaby(): string {
        return "minecraft:spawn_tame_baby";
    }

    //% group="Wolf"
    //% weight=78
    //% blockId=mcfunction_spawn_event_minecraft_wolf_minecraft_spawn_wild_adult
    //% block="wolf spawn event minecraft:spawn_wild_adult"
    export function wolfSpawnWildAdult(): string {
        return "minecraft:spawn_wild_adult";
    }

    //% group="Wolf"
    //% weight=77
    //% blockId=mcfunction_spawn_event_minecraft_wolf_minecraft_spawn_wild_ashen
    //% block="wolf spawn event minecraft:spawn_wild_ashen"
    export function wolfSpawnWildAshen(): string {
        return "minecraft:spawn_wild_ashen";
    }

    //% group="Wolf"
    //% weight=76
    //% blockId=mcfunction_spawn_event_minecraft_wolf_minecraft_spawn_wild_baby
    //% block="wolf spawn event minecraft:spawn_wild_baby"
    export function wolfSpawnWildBaby(): string {
        return "minecraft:spawn_wild_baby";
    }

    //% group="Wolf"
    //% weight=75
    //% blockId=mcfunction_spawn_event_minecraft_wolf_minecraft_spawn_wild_baby_or_adult
    //% block="wolf spawn event minecraft:spawn_wild_baby_or_adult"
    export function wolfSpawnWildBabyOrAdult(): string {
        return "minecraft:spawn_wild_baby_or_adult";
    }

    //% group="Wolf"
    //% weight=74
    //% blockId=mcfunction_spawn_event_minecraft_wolf_minecraft_spawn_wild_black
    //% block="wolf spawn event minecraft:spawn_wild_black"
    export function wolfSpawnWildBlack(): string {
        return "minecraft:spawn_wild_black";
    }

    //% group="Wolf"
    //% weight=73
    //% blockId=mcfunction_spawn_event_minecraft_wolf_minecraft_spawn_wild_chestnut
    //% block="wolf spawn event minecraft:spawn_wild_chestnut"
    export function wolfSpawnWildChestnut(): string {
        return "minecraft:spawn_wild_chestnut";
    }

    //% group="Wolf"
    //% weight=72
    //% blockId=mcfunction_spawn_event_minecraft_wolf_minecraft_spawn_wild_pale
    //% block="wolf spawn event minecraft:spawn_wild_pale"
    export function wolfSpawnWildPale(): string {
        return "minecraft:spawn_wild_pale";
    }

    //% group="Wolf"
    //% weight=71
    //% blockId=mcfunction_spawn_event_minecraft_wolf_minecraft_spawn_wild_rusty
    //% block="wolf spawn event minecraft:spawn_wild_rusty"
    export function wolfSpawnWildRusty(): string {
        return "minecraft:spawn_wild_rusty";
    }

    //% group="Wolf"
    //% weight=70
    //% blockId=mcfunction_spawn_event_minecraft_wolf_minecraft_spawn_wild_snowy
    //% block="wolf spawn event minecraft:spawn_wild_snowy"
    export function wolfSpawnWildSnowy(): string {
        return "minecraft:spawn_wild_snowy";
    }

    //% group="Wolf"
    //% weight=69
    //% blockId=mcfunction_spawn_event_minecraft_wolf_minecraft_spawn_wild_spotted
    //% block="wolf spawn event minecraft:spawn_wild_spotted"
    export function wolfSpawnWildSpotted(): string {
        return "minecraft:spawn_wild_spotted";
    }

    //% group="Wolf"
    //% weight=68
    //% blockId=mcfunction_spawn_event_minecraft_wolf_minecraft_spawn_wild_striped
    //% block="wolf spawn event minecraft:spawn_wild_striped"
    export function wolfSpawnWildStriped(): string {
        return "minecraft:spawn_wild_striped";
    }

    //% group="Wolf"
    //% weight=67
    //% blockId=mcfunction_spawn_event_minecraft_wolf_minecraft_spawn_wild_woods
    //% block="wolf spawn event minecraft:spawn_wild_woods"
    export function wolfSpawnWildWoods(): string {
        return "minecraft:spawn_wild_woods";
    }

    //% group="Wolf"
    //% weight=66
    //% blockId=mcfunction_spawn_event_minecraft_wolf_minecraft_upgrade_to_1_21_100
    //% block="wolf spawn event minecraft:upgrade_to_1_21_100"
    export function wolfUpgradeTo121100(): string {
        return "minecraft:upgrade_to_1_21_100";
    }

    //% group="Zoglin"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_zoglin_minecraft_entity_born
    //% block="zoglin recommended spawn event minecraft:entity_born"
    export function zoglinEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Zoglin"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_zoglin_minecraft_entity_spawned
    //% block="zoglin recommended spawn event minecraft:entity_spawned"
    export function zoglinEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Zoglin"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_zoglin_minecraft_entity_transformed
    //% block="zoglin recommended spawn event minecraft:entity_transformed"
    export function zoglinEntityTransformed(): string {
        return "minecraft:entity_transformed";
    }

    //% group="Zoglin"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_zoglin_become_angry_event
    //% block="zoglin spawn event become_angry_event"
    export function zoglinBecomeAngryEvent(): string {
        return "become_angry_event";
    }

    //% group="Zoglin"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_zoglin_become_calm_event
    //% block="zoglin spawn event become_calm_event"
    export function zoglinBecomeCalmEvent(): string {
        return "become_calm_event";
    }

    //% group="Zoglin"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_zoglin_minecraft_as_adult
    //% block="zoglin spawn event minecraft:as_adult"
    export function zoglinAsAdult(): string {
        return "minecraft:as_adult";
    }

    //% group="Zoglin"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_zoglin_minecraft_as_baby
    //% block="zoglin spawn event minecraft:as_baby"
    export function zoglinAsBaby(): string {
        return "minecraft:as_baby";
    }

    //% group="Zombie"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_zombie_minecraft_entity_born
    //% block="zombie recommended spawn event minecraft:entity_born"
    export function zombieEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Zombie"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_zombie_minecraft_entity_spawned
    //% block="zombie recommended spawn event minecraft:entity_spawned"
    export function zombieEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Zombie"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_zombie_minecraft_spawn_as_rider
    //% block="zombie recommended spawn event minecraft:spawn_as_rider"
    export function zombieSpawnAsRider(): string {
        return "minecraft:spawn_as_rider";
    }

    //% group="Zombie"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_zombie_minecraft_as_adult
    //% block="zombie spawn event minecraft:as_adult"
    export function zombieAsAdult(): string {
        return "minecraft:as_adult";
    }

    //% group="Zombie"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_zombie_minecraft_as_baby
    //% block="zombie spawn event minecraft:as_baby"
    export function zombieAsBaby(): string {
        return "minecraft:as_baby";
    }

    //% group="Zombie"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_zombie_minecraft_as_baby_jockey
    //% block="zombie spawn event minecraft:as_baby_jockey"
    export function zombieAsBabyJockey(): string {
        return "minecraft:as_baby_jockey";
    }

    //% group="Zombie"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_zombie_minecraft_convert_to_drowned
    //% block="zombie spawn event minecraft:convert_to_drowned"
    export function zombieConvertToDrowned(): string {
        return "minecraft:convert_to_drowned";
    }

    //% group="Zombie"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_zombie_minecraft_on_start_riding_zombie_horse
    //% block="zombie spawn event minecraft:on_start_riding_zombie_horse"
    export function zombieOnStartRidingZombieHorse(): string {
        return "minecraft:on_start_riding_zombie_horse";
    }

    //% group="Zombie"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_zombie_minecraft_on_stop_riding_zombie_horse
    //% block="zombie spawn event minecraft:on_stop_riding_zombie_horse"
    export function zombieOnStopRidingZombieHorse(): string {
        return "minecraft:on_stop_riding_zombie_horse";
    }

    //% group="Zombie"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_zombie_minecraft_start_transforming_into_drowned
    //% block="zombie spawn event minecraft:start_transforming_into_drowned"
    export function zombieStartTransformingIntoDrowned(): string {
        return "minecraft:start_transforming_into_drowned";
    }

    //% group="Zombie"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_zombie_minecraft_stop_transforming
    //% block="zombie spawn event minecraft:stop_transforming"
    export function zombieStopTransforming(): string {
        return "minecraft:stop_transforming";
    }

    //% group="Zombie Horse"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_zombie_horse_minecraft_entity_born
    //% block="zombie_horse recommended spawn event minecraft:entity_born"
    export function zombieHorseEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Zombie Horse"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_zombie_horse_minecraft_entity_spawned
    //% block="zombie_horse recommended spawn event minecraft:entity_spawned"
    export function zombieHorseEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Zombie Horse"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_zombie_horse_minecraft_horse_saddled
    //% block="zombie_horse spawn event minecraft:horse_saddled"
    export function zombieHorseHorseSaddled(): string {
        return "minecraft:horse_saddled";
    }

    //% group="Zombie Horse"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_zombie_horse_minecraft_horse_unsaddled
    //% block="zombie_horse spawn event minecraft:horse_unsaddled"
    export function zombieHorseHorseUnsaddled(): string {
        return "minecraft:horse_unsaddled";
    }

    //% group="Zombie Horse"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_zombie_horse_minecraft_hostile_dismounted
    //% block="zombie_horse spawn event minecraft:hostile_dismounted"
    export function zombieHorseHostileDismounted(): string {
        return "minecraft:hostile_dismounted";
    }

    //% group="Zombie Horse"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_zombie_horse_minecraft_hostile_mounted
    //% block="zombie_horse spawn event minecraft:hostile_mounted"
    export function zombieHorseHostileMounted(): string {
        return "minecraft:hostile_mounted";
    }

    //% group="Zombie Horse"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_zombie_horse_minecraft_on_tame
    //% block="zombie_horse spawn event minecraft:on_tame"
    export function zombieHorseOnTame(): string {
        return "minecraft:on_tame";
    }

    //% group="Zombie Horse"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_zombie_horse_minecraft_spawn_adult
    //% block="zombie_horse spawn event minecraft:spawn_adult"
    export function zombieHorseSpawnAdult(): string {
        return "minecraft:spawn_adult";
    }

    //% group="Zombie Horse"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_zombie_horse_minecraft_spawn_adult_with_rider
    //% block="zombie_horse spawn event minecraft:spawn_adult_with_rider"
    export function zombieHorseSpawnAdultWithRider(): string {
        return "minecraft:spawn_adult_with_rider";
    }

    //% group="Zombie Horse"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_zombie_horse_minecraft_spawn_tame_adult
    //% block="zombie_horse spawn event minecraft:spawn_tame_adult"
    export function zombieHorseSpawnTameAdult(): string {
        return "minecraft:spawn_tame_adult";
    }

    //% group="Zombie Horse"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_zombie_horse_minecraft_upgrade_to_1_21_130
    //% block="zombie_horse spawn event minecraft:upgrade_to_1_21_130"
    export function zombieHorseUpgradeTo121130(): string {
        return "minecraft:upgrade_to_1_21_130";
    }

    //% group="Zombie Nautilus"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_zombie_nautilus_minecraft_entity_spawned
    //% block="zombie_nautilus recommended spawn event minecraft:entity_spawned"
    export function zombieNautilusEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Zombie Nautilus"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_zombie_nautilus_minecraft_become_angry
    //% block="zombie_nautilus spawn event minecraft:become_angry"
    export function zombieNautilusBecomeAngry(): string {
        return "minecraft:become_angry";
    }

    //% group="Zombie Nautilus"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_zombie_nautilus_minecraft_on_armor_equip
    //% block="zombie_nautilus spawn event minecraft:on_armor_equip"
    export function zombieNautilusOnArmorEquip(): string {
        return "minecraft:on_armor_equip";
    }

    //% group="Zombie Nautilus"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_zombie_nautilus_minecraft_on_calm
    //% block="zombie_nautilus spawn event minecraft:on_calm"
    export function zombieNautilusOnCalm(): string {
        return "minecraft:on_calm";
    }

    //% group="Zombie Nautilus"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_zombie_nautilus_minecraft_on_drowned_dismount
    //% block="zombie_nautilus spawn event minecraft:on_drowned_dismount"
    export function zombieNautilusOnDrownedDismount(): string {
        return "minecraft:on_drowned_dismount";
    }

    //% group="Zombie Nautilus"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_zombie_nautilus_minecraft_on_drowned_mount
    //% block="zombie_nautilus spawn event minecraft:on_drowned_mount"
    export function zombieNautilusOnDrownedMount(): string {
        return "minecraft:on_drowned_mount";
    }

    //% group="Zombie Nautilus"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_zombie_nautilus_minecraft_on_player_dismount
    //% block="zombie_nautilus spawn event minecraft:on_player_dismount"
    export function zombieNautilusOnPlayerDismount(): string {
        return "minecraft:on_player_dismount";
    }

    //% group="Zombie Nautilus"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_zombie_nautilus_minecraft_on_player_mount
    //% block="zombie_nautilus spawn event minecraft:on_player_mount"
    export function zombieNautilusOnPlayerMount(): string {
        return "minecraft:on_player_mount";
    }

    //% group="Zombie Nautilus"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_zombie_nautilus_minecraft_on_saddled
    //% block="zombie_nautilus spawn event minecraft:on_saddled"
    export function zombieNautilusOnSaddled(): string {
        return "minecraft:on_saddled";
    }

    //% group="Zombie Nautilus"
    //% weight=81
    //% blockId=mcfunction_spawn_event_minecraft_zombie_nautilus_minecraft_on_saddled_in_water
    //% block="zombie_nautilus spawn event minecraft:on_saddled_in_water"
    export function zombieNautilusOnSaddledInWater(): string {
        return "minecraft:on_saddled_in_water";
    }

    //% group="Zombie Nautilus"
    //% weight=80
    //% blockId=mcfunction_spawn_event_minecraft_zombie_nautilus_minecraft_on_saddled_out_of_water
    //% block="zombie_nautilus spawn event minecraft:on_saddled_out_of_water"
    export function zombieNautilusOnSaddledOutOfWater(): string {
        return "minecraft:on_saddled_out_of_water";
    }

    //% group="Zombie Nautilus"
    //% weight=79
    //% blockId=mcfunction_spawn_event_minecraft_zombie_nautilus_minecraft_on_stop_tempting
    //% block="zombie_nautilus spawn event minecraft:on_stop_tempting"
    export function zombieNautilusOnStopTempting(): string {
        return "minecraft:on_stop_tempting";
    }

    //% group="Zombie Nautilus"
    //% weight=78
    //% blockId=mcfunction_spawn_event_minecraft_zombie_nautilus_minecraft_on_tame
    //% block="zombie_nautilus spawn event minecraft:on_tame"
    export function zombieNautilusOnTame(): string {
        return "minecraft:on_tame";
    }

    //% group="Zombie Nautilus"
    //% weight=77
    //% blockId=mcfunction_spawn_event_minecraft_zombie_nautilus_minecraft_on_unleashed
    //% block="zombie_nautilus spawn event minecraft:on_unleashed"
    export function zombieNautilusOnUnleashed(): string {
        return "minecraft:on_unleashed";
    }

    //% group="Zombie Nautilus"
    //% weight=76
    //% blockId=mcfunction_spawn_event_minecraft_zombie_nautilus_minecraft_on_unsaddled
    //% block="zombie_nautilus spawn event minecraft:on_unsaddled"
    export function zombieNautilusOnUnsaddled(): string {
        return "minecraft:on_unsaddled";
    }

    //% group="Zombie Nautilus"
    //% weight=75
    //% blockId=mcfunction_spawn_event_minecraft_zombie_nautilus_minecraft_spawn_tame
    //% block="zombie_nautilus spawn event minecraft:spawn_tame"
    export function zombieNautilusSpawnTame(): string {
        return "minecraft:spawn_tame";
    }

    //% group="Zombie Nautilus"
    //% weight=74
    //% blockId=mcfunction_spawn_event_minecraft_zombie_nautilus_minecraft_spawn_wild
    //% block="zombie_nautilus spawn event minecraft:spawn_wild"
    export function zombieNautilusSpawnWild(): string {
        return "minecraft:spawn_wild";
    }

    //% group="Zombie Nautilus"
    //% weight=73
    //% blockId=mcfunction_spawn_event_minecraft_zombie_nautilus_minecraft_switch_to_ai_controlled
    //% block="zombie_nautilus spawn event minecraft:switch_to_ai_controlled"
    export function zombieNautilusSwitchToAiControlled(): string {
        return "minecraft:switch_to_ai_controlled";
    }

    //% group="Zombie Nautilus"
    //% weight=72
    //% blockId=mcfunction_spawn_event_minecraft_zombie_nautilus_minecraft_switch_to_player_controlled
    //% block="zombie_nautilus spawn event minecraft:switch_to_player_controlled"
    export function zombieNautilusSwitchToPlayerControlled(): string {
        return "minecraft:switch_to_player_controlled";
    }

    //% group="Zombie Pigman"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_zombie_pigman_minecraft_entity_born
    //% block="zombie_pigman recommended spawn event minecraft:entity_born"
    export function zombiePigmanEntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Zombie Pigman"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_zombie_pigman_minecraft_entity_spawned
    //% block="zombie_pigman recommended spawn event minecraft:entity_spawned"
    export function zombiePigmanEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Zombie Pigman"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_zombie_pigman_minecraft_entity_transformed
    //% block="zombie_pigman recommended spawn event minecraft:entity_transformed"
    export function zombiePigmanEntityTransformed(): string {
        return "minecraft:entity_transformed";
    }

    //% group="Zombie Pigman"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_zombie_pigman_minecraft_spawn_as_strider_jockey
    //% block="zombie_pigman recommended spawn event minecraft:spawn_as_strider_jockey"
    export function zombiePigmanSpawnAsStriderJockey(): string {
        return "minecraft:spawn_as_strider_jockey";
    }

    //% group="Zombie Pigman"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_zombie_pigman_minecraft_as_baby
    //% block="zombie_pigman spawn event minecraft:as_baby"
    export function zombiePigmanAsBaby(): string {
        return "minecraft:as_baby";
    }

    //% group="Zombie Pigman"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_zombie_pigman_minecraft_become_angry
    //% block="zombie_pigman spawn event minecraft:become_angry"
    export function zombiePigmanBecomeAngry(): string {
        return "minecraft:become_angry";
    }

    //% group="Zombie Pigman"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_zombie_pigman_minecraft_on_calm
    //% block="zombie_pigman spawn event minecraft:on_calm"
    export function zombiePigmanOnCalm(): string {
        return "minecraft:on_calm";
    }

    //% group="Zombie Pigman"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_zombie_pigman_spawn_adult
    //% block="zombie_pigman spawn event spawn_adult"
    export function zombiePigmanSpawnAdult(): string {
        return "spawn_adult";
    }

    //% group="Zombie Pigman"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_zombie_pigman_spawn_baby
    //% block="zombie_pigman spawn event spawn_baby"
    export function zombiePigmanSpawnBaby(): string {
        return "spawn_baby";
    }

    //% group="Zombie Villager"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_zombie_villager_minecraft_entity_spawned
    //% block="zombie_villager recommended spawn event minecraft:entity_spawned"
    export function zombieVillagerEntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Zombie Villager"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_zombie_villager_minecraft_entity_transformed
    //% block="zombie_villager recommended spawn event minecraft:entity_transformed"
    export function zombieVillagerEntityTransformed(): string {
        return "minecraft:entity_transformed";
    }

    //% group="Zombie Villager"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_zombie_villager_from_village
    //% block="zombie_villager spawn event from_village"
    export function zombieVillagerFromVillage(): string {
        return "from_village";
    }

    //% group="Zombie Villager"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_zombie_villager_minecraft_become_cleric
    //% block="zombie_villager spawn event minecraft:become_cleric"
    export function zombieVillagerBecomeCleric(): string {
        return "minecraft:become_cleric";
    }

    //% group="Zombie Villager"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_zombie_villager_villager_converted
    //% block="zombie_villager spawn event villager_converted"
    export function zombieVillagerVillagerConverted(): string {
        return "villager_converted";
    }

    //% group="Zombie Villager V2"
    //% weight=90
    //% blockId=mcfunction_spawn_event_minecraft_zombie_villager_v2_minecraft_entity_born
    //% block="zombie_villager_v2 recommended spawn event minecraft:entity_born"
    export function zombieVillagerV2EntityBorn(): string {
        return "minecraft:entity_born";
    }

    //% group="Zombie Villager V2"
    //% weight=89
    //% blockId=mcfunction_spawn_event_minecraft_zombie_villager_v2_minecraft_entity_spawned
    //% block="zombie_villager_v2 recommended spawn event minecraft:entity_spawned"
    export function zombieVillagerV2EntitySpawned(): string {
        return "minecraft:entity_spawned";
    }

    //% group="Zombie Villager V2"
    //% weight=88
    //% blockId=mcfunction_spawn_event_minecraft_zombie_villager_v2_minecraft_entity_transformed
    //% block="zombie_villager_v2 recommended spawn event minecraft:entity_transformed"
    export function zombieVillagerV2EntityTransformed(): string {
        return "minecraft:entity_transformed";
    }

    //% group="Zombie Villager V2"
    //% weight=87
    //% blockId=mcfunction_spawn_event_minecraft_zombie_villager_v2_from_village
    //% block="zombie_villager_v2 spawn event from_village"
    export function zombieVillagerV2FromVillage(): string {
        return "from_village";
    }

    //% group="Zombie Villager V2"
    //% weight=86
    //% blockId=mcfunction_spawn_event_minecraft_zombie_villager_v2_minecraft_add_biome_and_skin
    //% block="zombie_villager_v2 spawn event minecraft:add_biome_and_skin"
    export function zombieVillagerV2AddBiomeAndSkin(): string {
        return "minecraft:add_biome_and_skin";
    }

    //% group="Zombie Villager V2"
    //% weight=85
    //% blockId=mcfunction_spawn_event_minecraft_zombie_villager_v2_minecraft_as_baby
    //% block="zombie_villager_v2 spawn event minecraft:as_baby"
    export function zombieVillagerV2AsBaby(): string {
        return "minecraft:as_baby";
    }

    //% group="Zombie Villager V2"
    //% weight=84
    //% blockId=mcfunction_spawn_event_minecraft_zombie_villager_v2_minecraft_become_cleric
    //% block="zombie_villager_v2 spawn event minecraft:become_cleric"
    export function zombieVillagerV2BecomeCleric(): string {
        return "minecraft:become_cleric";
    }

    //% group="Zombie Villager V2"
    //% weight=83
    //% blockId=mcfunction_spawn_event_minecraft_zombie_villager_v2_minecraft_spawn_skilled_adult
    //% block="zombie_villager_v2 spawn event minecraft:spawn_skilled_adult"
    export function zombieVillagerV2SpawnSkilledAdult(): string {
        return "minecraft:spawn_skilled_adult";
    }

    //% group="Zombie Villager V2"
    //% weight=82
    //% blockId=mcfunction_spawn_event_minecraft_zombie_villager_v2_villager_converted
    //% block="zombie_villager_v2 spawn event villager_converted"
    export function zombieVillagerV2VillagerConverted(): string {
        return "villager_converted";
    }

}

