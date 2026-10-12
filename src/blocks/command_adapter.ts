/** MakeCode block input -> Minecraft command AST adapter. */
namespace MCFunctionBlocks {
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
