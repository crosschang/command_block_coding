/** C3 EXECUTE RUN command reporters.
 * A separate MakeCode category with groups; each returns the canonical AST wrapper
 * accepted by Command.execute(...). Legacy Command.executeRunX() still works.
 * Do not serialize .mcfunction strings here.
 */
//% color="#7651A8" weight=95 icon="\uf04b" block="EXECUTE RUN"
//% groups='["EXECUTE", "SCOREBOARD", "RIDE", "DIALOGUE", "PLAYANIMATION", "FOG", "DAMAGE", "EVENT", "CONTROLSCHEME", "AIMASSIST", "SETBLOCK", "FILL", "CLONE", "PARTICLE", "SOUND", "MUSIC", "ENCHANT", "TELL", "TIME", "WEATHER", "DIFFICULTY", "CAMERASHAKE", "CAMERA", "HUD", "INPUTPERMISSION", "SPAWNPOINT", "SETWORLDSPAWN", "GAMERULE", "TAG", "GAMEMODE", "KILL", "CLEAR", "SUMMON", "EFFECT", "TELEPORT", "GIVE", "SAY", "FUNCTION", "RAW COMMAND"]'
namespace MCFunctionExecuteRun {
    //% group="SAY" weight=110
    //% blockId=mcfunction_execute_run_group_say
    //% block="run SAY $message"
    //% message.shadow="text" message.defl="C3 condition matched"
    export function say(message: string): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createSayCommand(message));
    }
    //% group="SCOREBOARD" weight=100
    //% blockId=mcfunction_execute_run_group_scoreboard
    //% block="run SCOREBOARD $action"
    export function scoreboard(action: Command.ScoreboardActionValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(action ? MCFunctionBlocks.createScoreboardCommand(action.command) : undefined);
    }
    //% group="RAW COMMAND" weight=90
    //% blockId=mcfunction_execute_run_group_raw
    //% block="run RAW COMMAND $line"
    //% line.shadow="text" line.defl="say Hello"
    export function raw(line: string): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionAST.createRawCommand(line));
    }
    //% group="FUNCTION" weight=106
    //% blockId=mcfunction_execute_run_group_mcfunction
    //% block="run FUNCTION $functionId"
    //% functionId.shadow="text" functionId.defl="test/example"
    export function mcfunction(functionId: string): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionAST.createMcFunctionCommand(functionId));
    }
    //% group="KILL" weight=106
    //% blockId=mcfunction_execute_run_group_kill
    //% block="run KILL || target $target"
    //% expandableArgumentMode="enabled"
    //% target.shadow="mcfunction_selector_self"
    export function kill(target?: MCFunctionFields.SelectorValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionAST.createKillCommand(target ? target.selector : undefined));
    }
    //% group="SETBLOCK" weight=110
    //% blockHidden=true
    //% blockId=mcfunction_execute_run_group_setblock
    //% block="run SETBLOCK position $position block $block states $states"
    //% position.shadow="mcfunction_position_absolute"
    //% block.shadow="mcfunction_block_custom_id"
    //% states.shadow="mcfunction_block_states_none"
    //% inlineInputMode=external
    export function setblock(position: MCFunctionPositionFields.PositionValue,
        block: MCFunctionFields.BlockValue,
        states: MCFunctionBlockStateFields.BlockStatesValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionAST.createSetBlockCommand(
            position ? position.position : undefined, block ? block.blockId : "",
            states ? states.states : undefined));
    }
    //% group="SUMMON" weight=110
    //% blockHidden=true
    //% blockId=mcfunction_execute_run_group_summon
    //% block="run SUMMON entity $entity at $position"
    //% entity.shadow="mcfunction_entity_select"
    //% position.shadow="mcfunction_position_absolute"
    //% inlineInputMode=external
    export function summon(entity: MCFunctionFields.EntityValue,
        position: MCFunctionPositionFields.PositionValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionAST.createSummonSimpleCommand(
            entity ? entity.entityId : "", undefined, position ? position.position : undefined));
    }
    //% group="TAG" weight=107
    //% blockHidden=true
    //% blockId=mcfunction_execute_run_group_tag
    //% block="run TAG target $target add $tag"
    //% target.shadow="mcfunction_selector_self"
    //% tag.shadow="text" tag.defl="c3_test"
    //% inlineInputMode=external
    export function tag(target: MCFunctionFields.SelectorValue,
        tag: string): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionAST.createTagCommand(target ? target.selector : undefined,
            MCFunctionAST.TagActionKind.Add, tag));
    }
    //% group="TELEPORT" weight=110
    //% blockHidden=true
    //% blockId=mcfunction_execute_run_group_teleport
    //% block="run TP target $target destination $position"
    //% target.shadow="mcfunction_target_selector"
    //% position.shadow="mcfunction_position_absolute"
    //% inlineInputMode=external
    export function teleport(target: MCFunctionFields.TargetValue,
        position: MCFunctionPositionFields.PositionValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionAST.createTeleportReferenceCommand(
            target ? target.target : undefined,
            MCFunctionAST.createTeleportPositionDestination(position ? position.position : undefined)));
    }
    //% group="GIVE" weight=107
    //% blockHidden=true
    //% blockId=mcfunction_execute_run_group_give
    //% block="run GIVE $target item $item count $amount"
    //% target.shadow="mcfunction_selector_self"
    //% item.shadow="mcfunction_item_custom_id"
    //% amount.defl=1
    //% inlineInputMode=external
    export function give(target: MCFunctionFields.SelectorValue,
        item: string, amount: number): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionAST.createGiveCommand(
            target ? target.selector : undefined,
            MCFunctionAST.createItemStack(item, amount)));
    }
    //% group="FILL" weight=107
    //% blockHidden=true
    //% blockId=mcfunction_execute_run_group_fill
    //% block="run FILL from $from to $to block $block states $states"
    //% from.shadow="mcfunction_position_absolute"
    //% to.shadow="mcfunction_position_absolute"
    //% block.shadow="mcfunction_block_custom_id"
    //% states.shadow="mcfunction_block_states_none"
    //% inlineInputMode=external
    export function fill(from: MCFunctionPositionFields.PositionValue,
        to: MCFunctionPositionFields.PositionValue, block: MCFunctionFields.BlockValue,
        states: MCFunctionBlockStateFields.BlockStatesValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionAST.createFillCommand(
            from ? from.position : undefined, to ? to.position : undefined,
            block ? block.blockId : "", states ? states.states : undefined));
    }
    //% group="GAMERULE" weight=103
    //% blockId=mcfunction_execute_run_group_gamerule
    //% block="run GAMERULE $action"
    export function gamerule(action: Command.GameRuleOperationValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(action ? action.command : undefined);
    }
    //% group="RIDE" weight=103
    //% blockId=mcfunction_execute_run_group_ride
    //% block="run RIDE target $target action $action"
    //% target.shadow="mcfunction_target_selector"
    //% action.shadow="mcfunction_ride_action_stop"
    //% inlineInputMode=external
    export function ride(target: MCFunctionFields.TargetValue,
        action: Command.RideActionValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createRideCommand(
            action ? action.action : undefined, target ? target.target : undefined,
            action ? action.mount : undefined, action ? action.entityType : undefined,
            action ? action.teleportRule : undefined, action ? action.fillType : undefined,
            action ? action.rideRule : undefined, action ? action.spawnEvent : undefined,
            action ? action.nameTag : undefined));
    }
    //% group="DIALOGUE" weight=100
    //% blockId=mcfunction_execute_run_group_dialogue
    //% block="run DIALOGUE NPC $npc action $action"
    //% npc.shadow="mcfunction_target_selector"
    //% action.shadow="mcfunction_dialogue_action_open"
    //% inlineInputMode=external
    export function dialogue(npc: MCFunctionFields.TargetValue,
        action: Command.DialogueActionValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createDialogueCommand(
            action ? action.action : undefined, npc ? npc.target : undefined,
            action ? action.player : undefined, action ? action.sceneName : undefined));
    }

    // C3 RUN extension. All entries return the same canonical AST as Command.
    // They are reporters: no side effects occur while composing an EXECUTE.

    //% group="EXECUTE" weight=109
    //% blockId=mcfunction_execute_run_group_nested_execute
    //% block="run EXECUTE clauses $clauses RUN $run"
    //% clauses.shadow="mcfunction_execute_end"
    //% run.shadow="mcfunction_execute_run_group_say"
    //% inlineInputMode=external
    export function nestedExecute(clauses: Command.ExecuteClauseValue,
        run: Command.ExecuteRunValue): Command.ExecuteRunValue {
        let slow = clauses;
        let fast = clauses;
        while (fast && fast.next) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) {
                return new Command.ExecuteRunValue(MCFunctionBlocks.createExecuteCommand([], undefined));
            }
        }
        let list: MCFunctionAST.ExecuteClause[] = [];
        let cur = clauses;
        while (cur && cur.clause) {
            list.push(cur.clause);
            cur = cur.next;
        }
        return new Command.ExecuteRunValue(MCFunctionBlocks.createExecuteCommand(
            list, run ? run.command : undefined));
    }

    //% group="PLAYANIMATION" weight=110
    //% blockId=mcfunction_execute_run_group_playanimation
    //% block="run PLAYANIMATION entity $target animation $animation || options $options"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_target_selector"
    //% animation.shadow="mcfunction_animation_custom_id"
    //% options.shadow="mcfunction_playanimation_options"
    export function playAnimation(target: MCFunctionFields.TargetValue,
        animation: MCFunctionAnimationLibrary.AnimationValue,
        options?: Command.PlayAnimationOptionsValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createPlayAnimationCommand(
            target ? target.target : undefined, animation ? animation.id : undefined,
            options ? options.nextState : undefined,
            options ? options.blendOutTime : undefined,
            options ? options.stopExpression : undefined,
            options ? options.controllerId : undefined));
    }

    //% group="FOG" weight=110
    //% blockId=mcfunction_execute_run_group_fog
    //% block="run FOG player $target action $action"
    //% target.shadow="mcfunction_target_selector"
    //% action.shadow="mcfunction_fog_action_push"
    //% inlineInputMode=external
    export function fog(target: MCFunctionFields.TargetValue,
        action: Command.FogActionValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createFogCommand(
            target ? target.target : undefined,
            action ? action.action : undefined,
            action ? action.userProvidedId : undefined,
            action ? action.fogId : undefined));
    }

    //% group="DAMAGE" weight=110
    //% blockId=mcfunction_execute_run_group_damage
    //% block="run DAMAGE target $target amount $amount || cause $cause"
    //% expandableArgumentMode="enabled"
    //% target.shadow="mcfunction_target_selector"
    //% cause.shadow="mcfunction_damage_cause_choice"
    //% amount.defl=1
    //% inlineInputMode=external
    export function damage(target: MCFunctionFields.TargetValue,
        amount: number, cause?: Command.DamageCauseValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createDamageCommand(
            target ? target.target : undefined, amount, cause ? cause.id : undefined));
    }
    //% group="DAMAGE" weight=109
    //% blockId=mcfunction_execute_run_group_damage_from_entity
    //% block="run DAMAGE target $target amount $amount cause $cause from $damager"
    //% target.shadow="mcfunction_target_selector"
    //% cause.shadow="mcfunction_damage_cause_choice"
    //% damager.shadow="mcfunction_target_selector"
    //% amount.defl=1
    //% inlineInputMode=external
    export function damageFromEntity(target: MCFunctionFields.TargetValue,
        amount: number, cause: Command.DamageCauseValue,
        damager: MCFunctionFields.TargetValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createDamageCommand(
            target ? target.target : undefined, amount, cause ? cause.id : undefined,
            damager ? damager.target : undefined, MCFunctionAST.DamageAction.FromEntity));
    }

    //% group="EVENT" weight=110
    //% blockId=mcfunction_execute_run_group_event
    //% block="run EVENT entity $target trigger $eventId || owner $ownerEntityId"
    //% expandableArgumentMode="enabled"
    //% target.shadow="mcfunction_target_selector"
    //% eventId.shadow="mcfunction_entity_event_custom_id"
    //% ownerEntityId.shadow="text" ownerEntityId.defl="minecraft:cow"
    //% inlineInputMode=external
    export function eventEntity(target: MCFunctionFields.TargetValue,
        eventId: string, ownerEntityId?: string): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createEventCommand(
            target ? target.target : undefined, eventId, ownerEntityId));
    }

    //% group="CONTROLSCHEME" weight=110
    //% blockId=mcfunction_execute_run_group_controlscheme_set
    //% block="run CONTROLSCHEME player $target set $scheme"
    //% target.shadow="mcfunction_target_selector"
    //% inlineInputMode=external
    export function controlSchemeSet(target: MCFunctionFields.TargetValue,
        scheme: Command.ControlSchemeChoice): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createControlSchemeCommand(
            target ? target.target : undefined, MCFunctionAST.ControlSchemeAction.Set,
            <MCFunctionAST.ControlSchemeType><number>scheme));
    }
    //% group="CONTROLSCHEME" weight=109
    //% blockId=mcfunction_execute_run_group_controlscheme_clear
    //% block="run CONTROLSCHEME player $target clear"
    //% target.shadow="mcfunction_target_selector"
    export function controlSchemeClear(target: MCFunctionFields.TargetValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createControlSchemeCommand(
            target ? target.target : undefined, MCFunctionAST.ControlSchemeAction.Clear));
    }

    //% group="AIMASSIST" weight=110
    //% blockId=mcfunction_execute_run_group_aimassist_set
    //% block="run AIMASSIST player $target set || options $options"
    //% expandableArgumentMode="enabled"
    //% target.shadow="mcfunction_target_selector"
    //% options.shadow="mcfunction_aimassist_options"
    //% inlineInputMode=external
    export function aimAssistSet(target: MCFunctionFields.TargetValue,
        options?: Command.AimAssistOptionsValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createAimAssistCommand(
            target ? target.target : undefined, MCFunctionAST.AimAssistAction.Set,
            options ? options.xAngle : undefined,
            options ? options.yAngle : undefined,
            options ? options.maxDistance : undefined,
            options ? options.mode : undefined,
            options ? options.presetId : undefined));
    }
    //% group="AIMASSIST" weight=109
    //% blockId=mcfunction_execute_run_group_aimassist_clear
    //% block="run AIMASSIST player $target clear"
    //% target.shadow="mcfunction_target_selector"
    export function aimAssistClear(target: MCFunctionFields.TargetValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createAimAssistCommand(
            target ? target.target : undefined, MCFunctionAST.AimAssistAction.Clear));
    }
    //% group="AIMASSIST" weight=108
    //% blockId=mcfunction_execute_run_group_aimassist_preset
    //% block="run AIMASSIST player $target preset $presetId"
    //% target.shadow="mcfunction_target_selector"
    //% presetId.shadow="text" presetId.defl="example:my_preset"
    export function aimAssistPreset(target: MCFunctionFields.TargetValue,
        presetId: string): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createAimAssistCommand(
            target ? target.target : undefined, MCFunctionAST.AimAssistAction.Set,
            undefined, undefined, undefined, undefined, presetId));
    }

    //% group="CLONE" weight=110
    //% blockId=mcfunction_execute_run_group_clone
    //% block="run CLONE begin $begin end $end destination $destination || $mask $mode"
    //% expandableArgumentMode="enabled"
    //% begin.shadow="mcfunction_position_relative"
    //% end.shadow="mcfunction_position_relative"
    //% destination.shadow="mcfunction_position_relative"
    //% mask.shadow="mcfunction_clone_mask_replace"
    //% mode.shadow="mcfunction_clone_mode"
    //% inlineInputMode=external
    export function clone(begin: MCFunctionPositionFields.PositionValue,
        end: MCFunctionPositionFields.PositionValue,
        destination: MCFunctionPositionFields.PositionValue,
        mask?: Command.CloneMaskValue,
        mode?: Command.CloneModeValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createCloneCommand(
            begin ? begin.position : undefined, end ? end.position : undefined,
            destination ? destination.position : undefined,
            mask ? mask.maskKind : undefined, mode ? mode.mode : undefined,
            mask && mask.hasFilterBlock ? mask.filterBlockId : undefined,
            mask && mask.hasFilterStates ? mask.filterBlockStates : undefined));
    }

    //% group="PARTICLE" weight=110
    //% blockId=mcfunction_execute_run_group_particle
    //% block="run PARTICLE $particle || at $position"
    //% expandableArgumentMode="enabled"
    //% particle.shadow="mcfunction_particle_registry_minecraft_basic_flame_particle"
    //% position.shadow="mcfunction_position_relative"
    //% inlineInputMode=external
    export function particle(particle: MCFunctionFields.ParticleValue,
        position?: MCFunctionPositionFields.PositionValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createParticleCommand(
            particle ? particle.particleId : "", position ? position.position : undefined));
    }

    //% group="SOUND" weight=110
    //% blockId=mcfunction_execute_run_group_playsound
    //% block="run PLAYSOUND $sound || target $target position $position $volume $pitch $minimumVolume"
    //% expandableArgumentMode="enabled"
    //% sound.shadow="mcfunction_sound_registry_random_click"
    //% target.shadow="mcfunction_selector_all_players"
    //% position.shadow="mcfunction_position_relative"
    //% volume.shadow="mcfunction_sound_volume"
    //% pitch.shadow="mcfunction_sound_pitch"
    //% minimumVolume.shadow="mcfunction_sound_min_volume"
    //% inlineInputMode=external
    export function playSound(sound: MCFunctionFields.SoundValue,
        target?: MCFunctionFields.SelectorValue,
        position?: MCFunctionPositionFields.PositionValue,
        volume?: Command.SoundVolumeValue,
        pitch?: Command.SoundPitchValue,
        minimumVolume?: Command.SoundMinimumVolumeValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createPlaySoundCommand(
            sound ? sound.soundId : "", target ? target.selector : undefined,
            position ? position.position : undefined,
            volume ? volume.value : undefined, pitch ? pitch.value : undefined,
            minimumVolume ? minimumVolume.value : undefined));
    }
    //% group="SOUND" weight=109
    //% blockId=mcfunction_execute_run_group_stopsound
    //% block="run STOPSOUND $target || sound $sound"
    //% expandableArgumentMode="enabled"
    //% target.shadow="mcfunction_selector_all_players"
    //% sound.shadow="mcfunction_sound_registry_random_click"
    //% inlineInputMode=external
    export function stopSound(target: MCFunctionFields.SelectorValue,
        sound?: MCFunctionFields.SoundValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createStopSoundCommand(
            target ? target.selector : undefined, sound ? sound.soundId : undefined));
    }

    //% group="MUSIC" weight=110
    //% blockId=mcfunction_execute_run_group_music
    //% block="run MUSIC $operation"
    //% operation.shadow="mcfunction_music_playback_action"
    //% inlineInputMode=external
    export function music(operation: Command.MusicOperationValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(operation ? operation.command : undefined);
    }

    //% group="ENCHANT" weight=110
    //% blockId=mcfunction_execute_run_group_enchant
    //% block="run ENCHANT target $target enchantment $enchantment || level $level"
    //% expandableArgumentMode="enabled"
    //% target.shadow="mcfunction_selector_self"
    //% enchantment.shadow="mcfunction_enchantment_registry_sharpness"
    //% level.shadow="mcfunction_enchant_level"
    //% inlineInputMode=external
    export function enchant(target: MCFunctionFields.SelectorValue,
        enchantment: MCFunctionEnchantmentLibrary.EnchantmentRef,
        level?: Command.EnchantLevelValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createEnchantCommand(
            target ? target.selector : undefined,
            enchantment ? enchantment.idKind : MCFunctionAST.EnchantmentIdKind.Name,
            enchantment ? enchantment.name : "",
            enchantment ? enchantment.numericId : undefined,
            level ? level.value : undefined));
    }

    //% group="TELL" weight=110
    //% blockId=mcfunction_execute_run_group_tell
    //% block="run TELL $target message $message"
    //% target.shadow="mcfunction_selector_self"
    //% message.shadow="text" message.defl="Hello!"
    //% inlineInputMode=external
    export function tell(target: MCFunctionFields.SelectorValue,
        message: string): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createTellCommand(
            target ? target.selector : undefined, message));
    }

    //% group="TIME" weight=110
    //% blockId=mcfunction_execute_run_group_time_preset
    //% block="run TIME set $preset"
    export function timeSetPreset(preset: Command.TimePresetChoice): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createTimeCommand(
            MCFunctionAST.TimeAction.SetPreset, <MCFunctionAST.TimePreset><number>preset));
    }
    //% group="TIME" weight=109
    //% blockId=mcfunction_execute_run_group_time_ticks
    //% block="run TIME set ticks $ticks" ticks.defl=6000
    export function timeSetTicks(ticks: number): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createTimeCommand(
            MCFunctionAST.TimeAction.SetTicks, undefined, ticks));
    }
    //% group="TIME" weight=108
    //% blockId=mcfunction_execute_run_group_time_add
    //% block="run TIME add ticks $ticks" ticks.defl=1000
    export function timeAddTicks(ticks: number): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createTimeCommand(
            MCFunctionAST.TimeAction.AddTicks, undefined, ticks));
    }
    //% group="TIME" weight=107
    //% blockId=mcfunction_execute_run_group_time_query
    //% block="run TIME query $query"
    export function timeQuery(query: Command.TimeQueryChoice): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createTimeCommand(
            MCFunctionAST.TimeAction.Query, undefined, undefined,
            <MCFunctionAST.TimeQueryKind><number>query));
    }

    //% group="WEATHER" weight=110
    //% blockId=mcfunction_execute_run_group_weather
    //% block="run WEATHER $weather || duration $duration"
    //% expandableArgumentMode="enabled"
    //% duration.shadow="mcfunction_weather_duration_seconds"
    //% inlineInputMode=external
    export function weather(weather: Command.WeatherChoice,
        duration?: Command.WeatherDurationValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createWeatherCommand(
            <MCFunctionAST.WeatherType><number>weather, duration ? duration.duration : undefined));
    }

    //% group="DIFFICULTY" weight=110
    //% blockId=mcfunction_execute_run_group_difficulty
    //% block="run DIFFICULTY $difficulty"
    export function difficulty(difficulty: Command.DifficultyChoice): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createDifficultyCommand(
            <MCFunctionAST.DifficultyType><number>difficulty));
    }

    //% group="CAMERASHAKE" weight=110
    //% blockId=mcfunction_execute_run_group_camerashake_add
    //% block="run CAMERASHAKE add target $target || $intensity $seconds $shakeType"
    //% expandableArgumentMode="enabled"
    //% target.shadow="mcfunction_selector_self"
    //% intensity.shadow="mcfunction_camerashake_intensity"
    //% seconds.shadow="mcfunction_camerashake_seconds"
    //% shakeType.shadow="mcfunction_camerashake_type"
    //% inlineInputMode=external
    export function cameraShakeAdd(target: MCFunctionFields.SelectorValue,
        intensity?: Command.CameraShakeIntensityValue,
        seconds?: Command.CameraShakeSecondsValue,
        shakeType?: Command.CameraShakeTypeValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createCameraShakeAddCommand(
            target ? target.selector : undefined, intensity ? intensity.value : undefined,
            seconds ? seconds.value : undefined,
            shakeType ? shakeType.value : undefined));
    }
    //% group="CAMERASHAKE" weight=109
    //% blockId=mcfunction_execute_run_group_camerashake_stop
    //% block="run CAMERASHAKE stop || target $target"
    //% expandableArgumentMode="enabled"
    //% target.shadow="mcfunction_selector_self"
    export function cameraShakeStop(target?: MCFunctionFields.SelectorValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createCameraShakeStopCommand(
            target ? target.selector : undefined));
    }

    //% group="CAMERA" weight=110
    //% blockId=mcfunction_execute_run_group_camera
    //% block="run CAMERA target $target action $action"
    //% target.shadow="mcfunction_selector_self"
    //% action.shadow="mcfunction_camera_action_set_chain"
    //% inlineInputMode=external
    export function camera(target: MCFunctionFields.SelectorValue,
        action: Command.CameraActionValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createCameraFromAction(
            target ? target.selector : undefined, action ? action.command : undefined));
    }

    //% group="HUD" weight=110
    //% blockId=mcfunction_execute_run_group_hud
    //% block="run HUD target $target $visibility || element $element"
    //% expandableArgumentMode="enabled"
    //% target.shadow="mcfunction_selector_self"
    //% element.shadow="mcfunction_hud_element_choice"
    //% inlineInputMode=external
    export function hud(target: MCFunctionFields.SelectorValue,
        visibility: Command.HudVisibilityChoice,
        element?: Command.HudElementValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createHudCommand(
            target ? target.selector : undefined, <MCFunctionAST.HudVisibility><number>visibility,
            element ? element.element : undefined));
    }

    //% group="INPUTPERMISSION" weight=110
    //% blockId=mcfunction_execute_run_group_inputpermission
    //% block="run INPUTPERMISSION target $target permission $permission state $state"
    //% target.shadow="mcfunction_selector_self"
    //% inlineInputMode=external
    export function inputPermission(target: MCFunctionFields.SelectorValue,
        permission: Command.InputPermissionChoice,
        state: Command.InputStateChoice): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createInputPermissionCommand(
            target ? target.selector : undefined,
            <MCFunctionAST.InputPermissionType><number>permission,
            <MCFunctionAST.InputPermissionState><number>state));
    }

    //% group="SPAWNPOINT" weight=110
    //% blockId=mcfunction_execute_run_group_spawnpoint
    //% block="run SPAWNPOINT || target $target position $position"
    //% expandableArgumentMode="enabled"
    //% target.shadow="mcfunction_target_selector"
    //% position.shadow="mcfunction_position_absolute"
    //% inlineInputMode=external
    export function spawnpoint(target?: MCFunctionFields.TargetValue,
        position?: MCFunctionPositionFields.PositionValue): Command.ExecuteRunValue {
        let mode = position ? MCFunctionAST.SpawnPointMode.TargetAt :
            target ? MCFunctionAST.SpawnPointMode.TargetCurrent : MCFunctionAST.SpawnPointMode.Default;
        return new Command.ExecuteRunValue(MCFunctionBlocks.createSpawnPointCommand(
            mode, target ? target.target : undefined, position ? position.position : undefined));
    }
    //% group="SPAWNPOINT" weight=109
    //% blockId=mcfunction_execute_run_group_clearspawnpoint
    //% block="run CLEARSPAWNPOINT || target $target"
    //% expandableArgumentMode="enabled"
    //% target.shadow="mcfunction_target_selector"
    export function clearSpawnpoint(target?: MCFunctionFields.TargetValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createClearSpawnPointCommand(
            target ? MCFunctionAST.ClearSpawnPointMode.Target : MCFunctionAST.ClearSpawnPointMode.Default,
            target ? target.target : undefined));
    }

    //% group="SETWORLDSPAWN" weight=110
    //% blockId=mcfunction_execute_run_group_setworldspawn
    //% block="run SETWORLDSPAWN || position $position"
    //% expandableArgumentMode="enabled"
    //% position.shadow="mcfunction_position_absolute"
    export function setWorldSpawn(position?: MCFunctionPositionFields.PositionValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createSetWorldSpawnCommand(
            position ? MCFunctionAST.SetWorldSpawnMode.At : MCFunctionAST.SetWorldSpawnMode.Current,
            position ? position.position : undefined));
    }

    //% group="GAMEMODE" weight=110
    //% blockId=mcfunction_execute_run_group_gamemode
    //% block="run GAMEMODE $mode || target $target"
    //% expandableArgumentMode="enabled"
    //% target.shadow="mcfunction_selector_self"
    //% inlineInputMode=external
    export function gamemode(mode: MCFunctionAST.GameMode,
        target?: MCFunctionFields.SelectorValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createGameModeCommand(
            mode, target ? target.selector : undefined));
    }

    //% group="CLEAR" weight=110
    //% blockId=mcfunction_execute_run_group_clear
    //% block="run CLEAR || target $target $item $data $maxCount"
    //% expandableArgumentMode="enabled"
    //% target.shadow="mcfunction_selector_self"
    //% item.shadow="mcfunction_clear_item"
    //% data.shadow="mcfunction_clear_data"
    //% maxCount.shadow="mcfunction_clear_max_count"
    //% inlineInputMode=external
    export function clear(target?: MCFunctionFields.SelectorValue,
        item?: Command.ClearItemValue, data?: Command.ClearDataValue,
        maxCount?: Command.ClearMaxCountValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createClearCommand(
            target ? target.selector : undefined, item ? item.itemId : undefined,
            data ? data.data : undefined, maxCount ? maxCount.maxCount : undefined));
    }

    //% group="EFFECT" weight=110
    //% blockId=mcfunction_execute_run_group_effect
    //% block="run EFFECT target $target action $action || $duration $amplifier $particles"
    //% expandableArgumentMode="enabled"
    //% target.shadow="mcfunction_selector_self"
    //% action.shadow="mcfunction_effect_action_apply"
    //% duration.shadow="mcfunction_effect_duration_seconds"
    //% amplifier.shadow="mcfunction_effect_amplifier"
    //% particles.shadow="mcfunction_effect_particles"
    //% inlineInputMode=external
    export function effect(target: MCFunctionFields.SelectorValue,
        action: Command.EffectActionValue,
        duration?: Command.EffectDurationValue,
        amplifier?: Command.EffectAmplifierValue,
        particles?: Command.EffectParticlesValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createEffectCommand(
            target ? target.selector : undefined,
            action ? action.mode : undefined, action ? action.effectId : undefined,
            duration ? duration.mode : undefined, duration ? duration.seconds : undefined,
            amplifier ? amplifier.amplifier : undefined,
            particles ? particles.hideParticles : undefined));
    }


    // C3 RUN parity wrappers: mirror the established Command variants.
    // Keep the original simple RUN blockIds above for backward compatibility.

    //% group="SUMMON" weight=109
    //% blockId=mcfunction_execute_run_summon_simple_full
    //% block="run SUMMON entity $entity || name $nameTag at $spawnPosition"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% entity.shadow="mcfunction_entity_custom_id"
    //% nameTag.shadow="text" nameTag.defl=""
    //% spawnPosition.shadow="mcfunction_position_relative"
    export function summonSimpleFull(entity: MCFunctionFields.EntityValue,
        nameTag?: string, spawnPosition?: MCFunctionPositionFields.PositionValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createSummonSimpleCommand(
            entity ? entity.entityId : "", nameTag,
            spawnPosition ? spawnPosition.position : undefined));
    }

    //% group="SUMMON" weight=108
    //% blockId=mcfunction_execute_run_summon_advanced
    //% block="run SUMMON ADVANCED entity $entity at $spawnPosition orientation $orientation || spawn event $spawnEvent name $nameTag"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% entity.shadow="mcfunction_entity_custom_id"
    //% spawnPosition.shadow="mcfunction_position_relative"
    //% orientation.shadow="mcfunction_summon_orientation_none"
    //% spawnEvent.shadow="text" spawnEvent.defl=""
    //% nameTag.shadow="text" nameTag.defl=""
    export function summonAdvanced(entity: MCFunctionFields.EntityValue,
        spawnPosition: MCFunctionPositionFields.PositionValue,
        orientation: Command.SummonOrientationValue,
        spawnEvent?: string, nameTag?: string): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createSummonAdvancedCommand(
            entity ? entity.entityId : "", spawnPosition ? spawnPosition.position : undefined,
            orientation ? orientation.orientation : undefined,
            spawnEvent, nameTag));
    }

    //% group="TELEPORT" weight=109
    //% blockId=mcfunction_execute_run_tp_self
    //% block="run TP destination $destination check blocks $checkForBlocks || $orientation"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% destination.shadow="mcfunction_tp_destination_position"
    //% orientation.shadow="mcfunction_tp_orientation_rotation"
    export function teleportSelf(destination: Command.TeleportDestinationValue,
        checkForBlocks: MCFunctionFields.BooleanLiteral,
        orientation?: Command.TeleportOrientationValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createTeleportSelfCommand(
            destination ? destination.destination : undefined,
            orientation ? orientation.orientation : undefined,
            MCFunctionFields.booleanLiteralValue(checkForBlocks)));
    }

    //% group="TELEPORT" weight=108
    //% blockId=mcfunction_execute_run_tp_target
    //% block="run TP TARGET victim $victim destination $destination check blocks $checkForBlocks || $orientation"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% victim.shadow="mcfunction_target_selector"
    //% destination.shadow="mcfunction_tp_destination_position"
    //% orientation.shadow="mcfunction_tp_orientation_rotation"
    export function teleportTargetReference(victim: MCFunctionFields.TargetValue,
        destination: Command.TeleportDestinationValue,
        checkForBlocks: MCFunctionFields.BooleanLiteral,
        orientation?: Command.TeleportOrientationValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createTeleportReferenceCommand(
            victim ? victim.target : undefined,
            destination ? destination.destination : undefined,
            orientation ? orientation.orientation : undefined,
            MCFunctionFields.booleanLiteralValue(checkForBlocks)));
    }

    //% group="TAG" weight=106
    //% blockId=mcfunction_execute_run_tag_action
    //% block="run TAG target $target action $action"
    //% target.shadow="mcfunction_selector_self"
    //% action.shadow="mcfunction_tag_action_add"
    //% inlineInputMode=external
    export function tagAction(target: MCFunctionFields.SelectorValue,
        action: Command.TagActionValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createTagCommand(
            target ? target.selector : undefined,
            action ? action.action : undefined,
            action ? action.name : undefined));
    }

    //% group="GIVE" weight=106
    //% blockId=mcfunction_execute_run_give_full
    //% block="run GIVE target $target item $item || $count $data $components"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_selector_self"
    //% item.shadow="mcfunction_item_id_text_shadow"
    //% count.shadow="mcfunction_give_count"
    //% data.shadow="mcfunction_give_data"
    //% components.shadow="mcfunction_item_components"
    export function giveFull(target: MCFunctionFields.SelectorValue,
        item: string, count?: Command.GiveCountValue,
        data?: Command.GiveDataValue,
        components?: MCFunctionFields.ItemComponentsValue): Command.ExecuteRunValue {
        let itemValue = MCFunctionFields.item(item);
        return new Command.ExecuteRunValue(MCFunctionBlocks.createGiveCommand(
            target ? target.selector : undefined,
            itemValue.itemId,
            count ? count.count : undefined,
            data ? data.data : undefined,
            components ? components.components : undefined));
    }

    //% group="SETBLOCK" weight=109
    //% blockId=mcfunction_execute_run_setblock_full
    //% block="run SETBLOCK position $position block $block || $states $mode"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% position.shadow="mcfunction_position_relative"
    //% block.shadow="mcfunction_block_custom_id"
    //% states.shadow="mcfunction_block_states_none"
    //% mode.shadow="mcfunction_setblock_mode"
    export function setblockFull(position: MCFunctionPositionFields.PositionValue,
        block: MCFunctionFields.BlockValue,
        states?: MCFunctionBlockStateFields.BlockStatesValue,
        mode?: Command.SetBlockModeValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createSetBlockCommand(
            position ? position.position : undefined,
            block ? block.blockId : "",
            states ? states.states : undefined,
            mode ? mode.mode : undefined));
    }

    //% group="FILL" weight=106
    //% blockId=mcfunction_execute_run_fill_full
    //% block="run FILL from $from to $to block $block || $states $handling"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% from.shadow="mcfunction_position_relative"
    //% to.shadow="mcfunction_position_relative"
    //% block.shadow="mcfunction_block_custom_id"
    //% states.shadow="mcfunction_block_states_none"
    //% handling.shadow="mcfunction_fill_replace"
    export function fillFull(from: MCFunctionPositionFields.PositionValue,
        to: MCFunctionPositionFields.PositionValue,
        block: MCFunctionFields.BlockValue,
        states?: MCFunctionBlockStateFields.BlockStatesValue,
        handling?: Command.FillHandlingValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createFillCommand(
            from ? from.position : undefined, to ? to.position : undefined,
            block ? block.blockId : "", states ? states.states : undefined,
            handling ? handling.mode : undefined,
            handling && handling.hasReplaceBlock ? handling.replaceBlockId : undefined,
            handling && handling.hasReplaceStates ? handling.replaceBlockStates : undefined));
    }


}
