/**
 * SUMMON runtime preview adapter for Minecraft Education MakeCode.
 *
 * Source of truth remains the normal AST -> Validator -> Compiler path.
 * This file only compensates for the MakeCode player.execute() bridge not
 * accepting the modern SUMMON rotation/facing overloads that Minecraft
 * Education itself accepts in command/function execution.
 *
 * Preview strategy for ADVANCED Rotation/Facing:
 * 1. Temporarily tag all pre-existing entities of the summoned type.
 * 2. Execute the same SUMMON without the orientation clause. Position,
 *    spawnEvent and nameTag still use the normal compiler.
 * 3. At the spawn position, identify the nearest same-type entity that does
 *    not have the old tag and give it a preview-only tag.
 * 4. Reuse the normal Teleport AST + Compiler to apply Rotation/Facing while
 *    keeping the spawn position unchanged.
 * 5. Remove all temporary tags.
 *
 * Exported .mcfunction output is NOT changed by this adapter.
 */
namespace MCFunctionPreview {
    /** Execute SUMMON in MakeCode runtime preview without changing export meaning. */
    export function executeSummon(command: MCFunctionAST.SummonCommand): void {
        if (!FunctionFile.allowCommandExecution()) {
            return;
        }

        let issues = MCFunctionValidator.validateSummonCommand(command);

        if (FunctionFile.capturePreviewAction(issues, function () {
            executeValidatedSummon(command);
        })) {
            return;
        }

        if (MCFunctionValidator.hasError(issues)) {
            for (let i = 0; i < issues.length; i++) {
                if (issues[i].level == MCFunctionValidator.ValidationLevel.Error) {
                    previewSay("ERROR [" + issues[i].code + "]: " + issues[i].message);
                    return;
                }
            }
            return;
        }

        executeValidatedSummon(command);
    }

    function executeValidatedSummon(command: MCFunctionAST.SummonCommand): void {
        // Native Script API route; retain legacy emulation when OFF.
        if (MCFunctionCBX12Bridge.isEnabled()) {
            MCFunctionCBX12Bridge.execute(command);
            return;
        }
        if (!needsOrientationEmulation(command)) {
            executeCompiled(command);
            return;
        }

        executeAdvancedOrientationEmulation(command);
    }

    function needsOrientationEmulation(command: MCFunctionAST.SummonCommand): boolean {
        if (command.form != MCFunctionAST.SummonForm.Advanced) {
            return false;
        }

        if (!command.orientation) {
            return false;
        }

        return command.orientation.kind == MCFunctionAST.SummonOrientationKind.Rotation ||
            command.orientation.kind == MCFunctionAST.SummonOrientationKind.Facing;
    }

    function executeAdvancedOrientationEmulation(
        command: MCFunctionAST.SummonCommand
    ): void {
        let scopeToken = createInternalTagScopeToken();
        let oldTag = createInternalTagName("so", scopeToken);
        let newTag = createInternalTagName("sn", scopeToken);

        let oldEntities = createEntityTypeSelector(command.entityId);
        let newCandidate = createEntityTypeSelector(command.entityId);
        MCFunctionAST.addSelectorFilter(
            newCandidate,
            MCFunctionAST.createSelectorFilter("tag", oldTag, true)
        );
        MCFunctionAST.addSelectorFilter(
            newCandidate,
            MCFunctionAST.createSelectorFilter("c", "1", false)
        );

        let previewTarget = MCFunctionAST.createSelector(MCFunctionAST.SelectorBase.AllEntities);
        MCFunctionAST.addSelectorFilter(
            previewTarget,
            MCFunctionAST.createSelectorFilter("tag", newTag, false)
        );
        MCFunctionAST.addSelectorFilter(
            previewTarget,
            MCFunctionAST.createSelectorFilter("c", "1", false)
        );

        // Mark every same-type entity that existed before this preview summon.
        executePreviewRaw(
            "tag " + MCFunctionCompiler.compileSelector(oldEntities) +
            " add " + oldTag
        );

        // Keep the already-verified orientation EMULATION: first spawn using
        // the legacy player.execute() grammar, then apply the user's real
        // Rotation/Facing through TP below. Never send a modern SUMMON
        // Rotation/Facing argument to player.execute() in this intermediate.
        //
        // This is a PREVIEW-only command: Education chat/.mcfunction use the
        // canonical grammar, which differs from this legacy MakeCode bridge.
        let previewSummonText = compileSummonPreviewIntermediate(command);
        let intermediateSucceeded = previewSummonText.length > 0 &&
            player.execute(previewSummonText);
        if (!intermediateSucceeded) {
            previewSay("SUMMON intermediate Preview failed: " + previewSummonText);
            cleanupInternalTag(oldTag);
            cleanupInternalTag(newTag);
            return;
        }

        // Resolve the newly summoned entity around the intended spawn position.
        // The legacy execute form is intentionally PREVIEW-only; export continues
        // to compile the original modern SUMMON command.
        executePreviewRaw(
            "execute @s " + MCFunctionCompiler.compilePosition(command.spawnPosition) +
            " tag " + MCFunctionCompiler.compileSelector(newCandidate) +
            " add " + newTag
        );

        applyOrientationWithTeleport(command, previewTarget);

        // Always clean Preview-only tags through the shared internal-tag layer.
        // Cleanup does not depend on the entity retaining its original type.
        cleanupInternalTag(oldTag);
        cleanupInternalTag(newTag);
    }

    /**
     * MakeCode player.execute()-ONLY SUMMON intermediate serializer.
     *
     * When a spawn event is present, the previously verified legacy MakeCode
     * parser accepts `entity position event name`, without any orientation.
     * Bedrock/Education chat and canonical .mcfunction MUST NOT use that form.
     *
     * When there is no event, reuse the real Compiler's valid NameTag-first
     * overload rather than duplicating its ordinary command semantics.
     */
    function compileSummonPreviewIntermediate(
        command: MCFunctionAST.SummonCommand
    ): string {
        if (!command.spawnEvent || command.spawnEvent.length == 0) {
            let previewNoEvent = MCFunctionAST.createSummonAdvancedCommand(
                command.entityId,
                command.spawnPosition,
                MCFunctionAST.createSummonNoOrientation(),
                "",
                command.nameTag
            );
            return MCFunctionCompiler.compileCommand(previewNoEvent);
        }

        let result = "summon " + command.entityId + " " +
            MCFunctionCompiler.compilePosition(command.spawnPosition) +
            " " + command.spawnEvent;
        if (command.nameTag && command.nameTag.length > 0) {
            result = result + " " + quoteSummonPreviewName(command.nameTag);
        }
        return result;
    }

    /** Escape only the name token of the legacy Preview SUMMON grammar. */
    function quoteSummonPreviewName(value: string): string {
        let result = "\"";
        for (let i = 0; i < value.length; i++) {
            let ch = value.charAt(i);
            if (ch == "\\" || ch == "\"") result = result + "\\";
            result = result + ch;
        }
        return result + "\"";
    }

    function applyOrientationWithTeleport(
        command: MCFunctionAST.SummonCommand,
        target: MCFunctionAST.Selector
    ): void {
        let orientation = command.orientation;
        let teleportCommand: MCFunctionAST.TeleportCommand;

        if (orientation.kind == MCFunctionAST.SummonOrientationKind.Rotation) {
            teleportCommand = MCFunctionAST.createTeleportWithRotationCommand(
                target,
                command.spawnPosition,
                orientation.rotation,
                false
            );
            executeCompiled(teleportCommand);
            return;
        }

        if (
            orientation.kind == MCFunctionAST.SummonOrientationKind.Facing &&
            orientation.facing
        ) {
            if (orientation.facing.kind == MCFunctionAST.FacingKind.Position) {
                teleportCommand = MCFunctionAST.createTeleportFacingPositionCommand(
                    target,
                    command.spawnPosition,
                    orientation.facing.position,
                    false
                );
                executeCompiled(teleportCommand);
                return;
            }

            if (orientation.facing.kind == MCFunctionAST.FacingKind.Entity) {
                teleportCommand = MCFunctionAST.createTeleportFacingEntityCommand(
                    target,
                    command.spawnPosition,
                    orientation.facing.entitySelector,
                    false
                );
                executeCompiled(teleportCommand);
            }
        }
    }

    function createEntityTypeSelector(entityId: string): MCFunctionAST.Selector {
        let selector = MCFunctionAST.createSelector(MCFunctionAST.SelectorBase.AllEntities);
        MCFunctionAST.addSelectorFilter(
            selector,
            MCFunctionAST.createSelectorFilter("type", entityId, false)
        );
        return selector;
    }

    function executeCompiled(command: MCFunctionAST.CommandNode): void {
        let compiled = MCFunctionCompiler.compileCommand(command);
        if (compiled.length > 0) {
            player.execute(compiled);
        }
    }

    function executePreviewRaw(command: string): void {
        if (command.length > 0) {
            player.execute(command);
        }
    }
}
