/** MakeCode block input -> Minecraft command AST adapter. */
namespace MCFunctionBlocks {
    /** A8 spawn commands reuse the common target and position ASTs. */
    export function createSpawnPointCommand(mode: MCFunctionAST.SpawnPointMode,
        target?: MCFunctionAST.PlayerTarget,
        position?: MCFunctionAST.Position): MCFunctionAST.SpawnPointCommand {
        return MCFunctionAST.createSpawnPointCommand(mode, target, position);
    }

    export function createSetWorldSpawnCommand(mode: MCFunctionAST.SetWorldSpawnMode,
        position?: MCFunctionAST.Position): MCFunctionAST.SetWorldSpawnCommand {
        return MCFunctionAST.createSetWorldSpawnCommand(mode, position);
    }

    export function createClearSpawnPointCommand(mode: MCFunctionAST.ClearSpawnPointMode,
        target?: MCFunctionAST.PlayerTarget): MCFunctionAST.ClearSpawnPointCommand {
        return MCFunctionAST.createClearSpawnPointCommand(mode, target);
    }

    /** Bind a typed CAMERA action to the selected player(s), using existing
     * AST constructors rather than copying every optional field by hand.
     * This prevents future properties from silently disappearing in the adapter.
     * Unsupported/missing reporters produce an invalid AST for the validator.
     */
    export function createCameraFromAction(target: MCFunctionAST.Selector,
        action: MCFunctionAST.CameraCommand): MCFunctionAST.CameraCommand {
        if (!action) return { kind: MCFunctionAST.CommandKind.Camera,
            action: <MCFunctionAST.CameraAction>-1, target: target };

        if (action.action == MCFunctionAST.CameraAction.Set) {
            let node = MCFunctionAST.createCameraSetUnifiedCommand(target, action.presetId,
                action.ease, action.position, action.rotation, action.facing,
                action.useDefault, action.viewOffset, action.entityOffset);
            node.setOptionSequence = action.setOptionSequence;
            return node;
        }
        if (action.action == MCFunctionAST.CameraAction.Clear) {
            return MCFunctionAST.createCameraClearCommand(target);
        }
        if (action.action == MCFunctionAST.CameraAction.Fade) {
            return MCFunctionAST.createCameraFadeCommand(target, action.fadeTime, action.fadeColor);
        }
        if (action.action == MCFunctionAST.CameraAction.Attach ||
            action.action == MCFunctionAST.CameraAction.Detach ||
            action.action == MCFunctionAST.CameraAction.TargetEntity ||
            action.action == MCFunctionAST.CameraAction.RemoveTarget) {
            return MCFunctionAST.createCameraEntityCommand(action.action,
                target, action.entityTarget, action.targetCenterOffset);
        }
        if (action.action == MCFunctionAST.CameraAction.FovSet ||
            action.action == MCFunctionAST.CameraAction.FovClear) {
            return MCFunctionAST.createCameraFovCommand(action.action,
                target, action.fovValue, action.ease);
        }
        if (action.action == MCFunctionAST.CameraAction.PlaySpline) {
            return MCFunctionAST.createCameraSplineCommand(target, action.splineName);
        }
        return { kind: MCFunctionAST.CommandKind.Camera,
            action: action.action, target: target };
    }

    /** CAMERA blocks reuse the common Selector and canonical AST. */
    export function createCameraSetCommand(
        target: MCFunctionAST.Selector, presetId: string
    ): MCFunctionAST.CameraCommand {
        return MCFunctionAST.createCameraSetCommand(target, presetId);
    }

    export function createCameraSetAdvancedCommand(
        target: MCFunctionAST.Selector, presetId: string,
        position?: MCFunctionAST.Position, rotation?: MCFunctionAST.Rotation
    ): MCFunctionAST.CameraCommand {
        return MCFunctionAST.createCameraSetAdvancedCommand(target, presetId, position, rotation);
    }

    export function createCameraSetOptionsCommand(target: MCFunctionAST.Selector, presetId: string,
        position?: MCFunctionAST.Position, rotation?: MCFunctionAST.Rotation,
        facing?: MCFunctionAST.Facing, ease?: MCFunctionAST.CameraEase,
        useDefault?: boolean): MCFunctionAST.CameraCommand {
        return MCFunctionAST.createCameraSetOptionsCommand(target, presetId, position, rotation, facing, ease, useDefault);
    }
    export function createCameraSetUnifiedCommand(target: MCFunctionAST.Selector, presetId: string,
        ease?: MCFunctionAST.CameraEase, position?: MCFunctionAST.Position,
        rotation?: MCFunctionAST.Rotation, facing?: MCFunctionAST.Facing,
        useDefault?: boolean, viewOffset?: MCFunctionAST.CameraOffset2,
        entityOffset?: MCFunctionAST.CameraOffset3): MCFunctionAST.CameraCommand {
        return MCFunctionAST.createCameraSetUnifiedCommand(target, presetId, ease, position,
            rotation, facing, useDefault, viewOffset, entityOffset);
    }
    export function createCameraEntityCommand(action: MCFunctionAST.CameraAction,
        target: MCFunctionAST.Selector, entity?: MCFunctionAST.Selector,
        offset?: MCFunctionAST.CameraOffset3): MCFunctionAST.CameraCommand {
        return MCFunctionAST.createCameraEntityCommand(action, target, entity, offset);
    }
    export function createCameraFovCommand(action: MCFunctionAST.CameraAction,
        target: MCFunctionAST.Selector, value?: number,
        ease?: MCFunctionAST.CameraEase): MCFunctionAST.CameraCommand {
        return MCFunctionAST.createCameraFovCommand(action, target, value, ease);
    }
    export function createCameraFadeCommand(target: MCFunctionAST.Selector,
        time?: MCFunctionAST.CameraFadeTime, color?: MCFunctionAST.CameraFadeColor): MCFunctionAST.CameraCommand {
        return MCFunctionAST.createCameraFadeCommand(target, time, color);
    }

    export function createCameraClearCommand(
        target: MCFunctionAST.Selector
    ): MCFunctionAST.CameraCommand {
        return MCFunctionAST.createCameraClearCommand(target);
    }

/** Structured CAMERASHAKE blocks: reuse the common Selector AST. */
    export function createCameraShakeAddCommand(
        target: MCFunctionAST.Selector,
        intensity?: number,
        seconds?: number,
        shakeType?: MCFunctionAST.CameraShakeType
    ): MCFunctionAST.CameraShakeCommand {
        return MCFunctionAST.createCameraShakeAddCommand(target, intensity, seconds, shakeType);
    }

    export function createCameraShakeStopCommand(
        target?: MCFunctionAST.Selector
    ): MCFunctionAST.CameraShakeCommand {
        return MCFunctionAST.createCameraShakeStopCommand(target);
    }

    /** Simple structured blocks use the common AST and Selector. */
    export function createTellCommand(target: MCFunctionAST.Selector, message: string): MCFunctionAST.TellCommand {
        return MCFunctionAST.createTellCommand(target, message);
    }
    export function createTimeCommand(action: MCFunctionAST.TimeAction, preset?: MCFunctionAST.TimePreset,
        ticks?: number, queryKind?: MCFunctionAST.TimeQueryKind): MCFunctionAST.TimeCommand {
        return MCFunctionAST.createTimeCommand(action, preset, ticks, queryKind);
    }
    export function createWeatherCommand(weather: MCFunctionAST.WeatherType,
        duration?: number): MCFunctionAST.WeatherCommand {
        return MCFunctionAST.createWeatherCommand(weather, duration);
    }
    export function createDifficultyCommand(difficulty: MCFunctionAST.DifficultyType): MCFunctionAST.DifficultyCommand {
        return MCFunctionAST.createDifficultyCommand(difficulty);
    }
    export function createHudCommand(target: MCFunctionAST.Selector, visibility: MCFunctionAST.HudVisibility,
        element?: MCFunctionAST.HudElement): MCFunctionAST.HudCommand {
        return MCFunctionAST.createHudCommand(target, visibility, element);
    }
    export function createInputPermissionCommand(target: MCFunctionAST.Selector,
        permission: MCFunctionAST.InputPermissionType,
        state: MCFunctionAST.InputPermissionState): MCFunctionAST.InputPermissionCommand {
        return MCFunctionAST.createInputPermissionCommand(target, permission, state);
    }

    export function createEnchantCommand(
        target: MCFunctionAST.Selector,
        idKind: MCFunctionAST.EnchantmentIdKind,
        enchantmentName?: string,
        enchantmentNumber?: number,
        level?: number
    ): MCFunctionAST.EnchantCommand {
        return MCFunctionAST.createEnchantCommand(
            target, idKind, enchantmentName, enchantmentNumber, level);
    }

    export function createGameRuleCommand(
        action: MCFunctionAST.GameRuleAction, ruleId?: string,
        booleanValue?: boolean, integerValue?: number, enumValue?: string
    ): MCFunctionAST.GameRuleCommand {
        return MCFunctionAST.createGameRuleCommand(action, ruleId, booleanValue, integerValue, enumValue);
    }

    export function createRawCommand(text: string): MCFunctionAST.RawCommand {
        return MCFunctionAST.createRawCommand(text);
    }

    /** Reuse the Particle ID and optional Position input types. */
    export function createParticleCommand(
        particleId: string,
        position?: MCFunctionAST.Position
    ): MCFunctionAST.ParticleCommand {
        return MCFunctionAST.createParticleCommand(particleId, position);
    }

    export function createPlaySoundCommand(
        soundId: string, target?: MCFunctionAST.Selector,
        position?: MCFunctionAST.Position, volume?: number,
        pitch?: number, minimumVolume?: number
    ): MCFunctionAST.PlaySoundCommand {
        return MCFunctionAST.createPlaySoundCommand(soundId, target, position, volume, pitch, minimumVolume);
    }

    export function createStopSoundCommand(
        target: MCFunctionAST.Selector, soundId?: string
    ): MCFunctionAST.StopSoundCommand {
        return MCFunctionAST.createStopSoundCommand(target, soundId);
    }

    export function createMusicCommand(
        action: MCFunctionAST.MusicAction, trackId?: string,
        volume?: number, fadeSeconds?: number,
        repeatMode?: MCFunctionAST.MusicRepeatMode
    ): MCFunctionAST.MusicCommand {
        return MCFunctionAST.createMusicCommand(action, trackId, volume, fadeSeconds, repeatMode);
    }

    export function createSayCommand(message: string): MCFunctionAST.SayCommand {
        return MCFunctionAST.createSayCommand(message);
    }

    export function createMcFunctionCommand(functionId: string): MCFunctionAST.McFunctionCommand {
        return MCFunctionAST.createMcFunctionCommand(functionId);
    }


    export function createGiveCommand(
        target: MCFunctionAST.Selector,
        itemId: string,
        amount?: number,
        data?: number,
        components?: MCFunctionAST.ItemCommandComponents
    ): MCFunctionAST.GiveCommand {
        let item = MCFunctionAST.createItemStack(itemId, amount, data);
        item.components = components;
        return MCFunctionAST.createGiveCommand(target, item);
    }

    // Compatibility helper for older call sites.
    export function createGiveCommandWithComponents(
        target: MCFunctionAST.Selector,
        itemId: string,
        amount: number,
        data: number,
        components: MCFunctionAST.ItemCommandComponents
    ): MCFunctionAST.GiveCommand {
        return MCFunctionAST.createGiveCommand(
            target,
            MCFunctionAST.createItemStackWithComponents(
                itemId, amount, data, components
            )
        );
    }


    export function createSummonSimpleCommand(
        entityId: string,
        nameTag?: string,
        spawnPosition?: MCFunctionAST.Position
    ): MCFunctionAST.SummonCommand {
        return MCFunctionAST.createSummonSimpleCommand(
            entityId, nameTag, spawnPosition
        );
    }

    export function createSummonAdvancedCommand(
        entityId: string,
        spawnPosition: MCFunctionAST.Position,
        orientation?: MCFunctionAST.SummonOrientation,
        spawnEvent?: string,
        nameTag?: string
    ): MCFunctionAST.SummonCommand {
        return MCFunctionAST.createSummonAdvancedCommand(
            entityId, spawnPosition, orientation, spawnEvent, nameTag
        );
    }

    /** Unified EFFECT Block Adapter -> AST path. */
    export function createEffectCommand(
        target: MCFunctionAST.Selector,
        mode: MCFunctionAST.EffectMode,
        effectId?: string,
        durationMode?: MCFunctionAST.EffectDurationMode,
        seconds?: number,
        amplifier?: number,
        hideParticles?: boolean
    ): MCFunctionAST.EffectCommand {
        return MCFunctionAST.createEffectCommand(
            target,
            mode,
            effectId,
            durationMode,
            seconds,
            amplifier,
            hideParticles
        );
    }

    /** Legacy adapter helper retained for internal/source compatibility. */
    export function createEffectAddCommand(
        target: MCFunctionAST.Selector,
        effectId: string,
        seconds: number,
        amplifier: number,
        hideParticles: boolean
    ): MCFunctionAST.EffectCommand {
        return MCFunctionAST.createEffectAddCommand(
            target, effectId, seconds, amplifier, hideParticles
        );
    }

    /** Legacy adapter helper retained for internal/source compatibility. */
    export function createEffectInfiniteCommand(
        target: MCFunctionAST.Selector,
        effectId: string,
        amplifier: number,
        hideParticles: boolean
    ): MCFunctionAST.EffectCommand {
        return MCFunctionAST.createEffectInfiniteCommand(
            target, effectId, amplifier, hideParticles
        );
    }

    /** Legacy adapter helper retained for internal/source compatibility. */
    export function createEffectClearAllCommand(
        target: MCFunctionAST.Selector
    ): MCFunctionAST.EffectCommand {
        return MCFunctionAST.createEffectClearAllCommand(target);
    }

    /** Legacy adapter helper retained for internal/source compatibility. */
    export function createEffectClearSpecificCommand(
        target: MCFunctionAST.Selector,
        effectId: string
    ): MCFunctionAST.EffectCommand {
        return MCFunctionAST.createEffectClearSpecificCommand(target, effectId);
    }


    export function createTeleportCommand(
        target: MCFunctionAST.Selector,
        destination: MCFunctionAST.TeleportDestination,
        orientation?: MCFunctionAST.TeleportOrientation,
        checkForBlocks?: boolean
    ): MCFunctionAST.TeleportCommand {
        return MCFunctionAST.createTeleportCommand(
            target, destination, orientation, checkForBlocks
        );
    }

    /** Shared named-player / selector target, preserving canonical TP AST. */
    export function createTeleportReferenceCommand(
        target: MCFunctionAST.PlayerTarget,
        destination: MCFunctionAST.TeleportDestination,
        orientation?: MCFunctionAST.TeleportOrientation,
        checkForBlocks?: boolean
    ): MCFunctionAST.TeleportCommand {
        return MCFunctionAST.createTeleportReferenceCommand(
            target, destination, orientation, checkForBlocks
        );
    }

    export function createTeleportSelfCommand(
        destination: MCFunctionAST.TeleportDestination,
        orientation?: MCFunctionAST.TeleportOrientation,
        checkForBlocks?: boolean
    ): MCFunctionAST.TeleportCommand {
        return MCFunctionAST.createTeleportSelfCommand(
            destination, orientation, checkForBlocks
        );
    }

    export function createTeleportToPositionCommand(
        target: MCFunctionAST.Selector,
        destination: MCFunctionAST.Position,
        checkForBlocks: boolean
    ): MCFunctionAST.TeleportCommand {
        return MCFunctionAST.createTeleportToPositionCommand(
            target, destination, checkForBlocks
        );
    }

    export function createTeleportToEntityCommand(
        target: MCFunctionAST.Selector,
        destination: MCFunctionAST.Selector,
        checkForBlocks: boolean
    ): MCFunctionAST.TeleportCommand {
        return MCFunctionAST.createTeleportToEntityCommand(
            target, destination, checkForBlocks
        );
    }

    export function createTeleportWithRotationCommand(
        target: MCFunctionAST.Selector,
        destination: MCFunctionAST.Position,
        rotation: MCFunctionAST.Rotation,
        checkForBlocks: boolean
    ): MCFunctionAST.TeleportCommand {
        return MCFunctionAST.createTeleportWithRotationCommand(
            target, destination, rotation, checkForBlocks
        );
    }

    export function createTeleportFacingPositionCommand(
        target: MCFunctionAST.Selector,
        destination: MCFunctionAST.Position,
        facingPosition: MCFunctionAST.Position,
        checkForBlocks: boolean
    ): MCFunctionAST.TeleportCommand {
        return MCFunctionAST.createTeleportFacingPositionCommand(
            target, destination, facingPosition, checkForBlocks
        );
    }

    export function createTeleportFacingEntityCommand(
        target: MCFunctionAST.Selector,
        destination: MCFunctionAST.Position,
        facingEntity: MCFunctionAST.Selector,
        checkForBlocks: boolean
    ): MCFunctionAST.TeleportCommand {
        return MCFunctionAST.createTeleportFacingEntityCommand(
            target, destination, facingEntity, checkForBlocks
        );
    }

    export function createTagCommand(
        target: MCFunctionAST.Selector,
        action: MCFunctionAST.TagActionKind,
        name?: string
    ): MCFunctionAST.TagCommand {
        return MCFunctionAST.createTagCommand(target, action, name);
    }

    export function createGameModeCommand(
        gameMode: MCFunctionAST.GameMode,
        target?: MCFunctionAST.Selector
    ): MCFunctionAST.GameModeCommand {
        return MCFunctionAST.createGameModeCommand(gameMode, target);
    }

    export function createKillCommand(
        target?: MCFunctionAST.Selector
    ): MCFunctionAST.KillCommand {
        return MCFunctionAST.createKillCommand(target);
    }

    export function createClearCommand(
        target?: MCFunctionAST.Selector,
        itemId?: string,
        data?: number,
        maxCount?: number
    ): MCFunctionAST.ClearCommand {
        return MCFunctionAST.createClearCommand(
            target, itemId, data, maxCount
        );
    }

    export function createSetBlockCommand(
        position: MCFunctionAST.Position,
        blockId: string,
        blockStates?: MCFunctionAST.BlockStates,
        mode?: MCFunctionAST.SetBlockMode
    ): MCFunctionAST.SetBlockCommand {
        return MCFunctionAST.createSetBlockCommand(
            position, blockId, blockStates, mode
        );
    }

    export function createFillCommand(
        from: MCFunctionAST.Position,
        to: MCFunctionAST.Position,
        blockId: string,
        blockStates?: MCFunctionAST.BlockStates,
        mode?: MCFunctionAST.FillMode,
        replaceBlockId?: string,
        replaceBlockStates?: MCFunctionAST.BlockStates
    ): MCFunctionAST.FillCommand {
        return MCFunctionAST.createFillCommand(
            from, to, blockId, blockStates, mode, replaceBlockId, replaceBlockStates
        );
    }

    export function createCloneCommand(
        begin: MCFunctionAST.Position,
        end: MCFunctionAST.Position,
        destination: MCFunctionAST.Position,
        maskKind?: MCFunctionAST.CloneMaskKind,
        cloneMode?: MCFunctionAST.CloneMode,
        filterBlockId?: string,
        filterBlockStates?: MCFunctionAST.BlockStates
    ): MCFunctionAST.CloneCommand {
        return MCFunctionAST.createCloneCommand(
            begin, end, destination, maskKind, cloneMode, filterBlockId, filterBlockStates
        );
    }

}
