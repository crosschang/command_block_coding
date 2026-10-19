/** Validator for currently restored commands and shared Selector/Item values. */
namespace MCFunctionValidator {
    export enum ValidationLevel {
        Error = 0,
        Warning = 1,
        Info = 2
    }

    export interface ValidationIssue {
        level: ValidationLevel;
        code: string;
        message: string;
    }

    function addIssue(
        issues: ValidationIssue[],
        level: ValidationLevel,
        code: string,
        message: string
    ): void {
        issues.push({ level: level, code: code, message: message });
    }

    function appendIssues(target: ValidationIssue[], source: ValidationIssue[]): void {
        for (let i = 0; i < source.length; i++) target.push(source[i]);
    }

    function countFilter(selector: MCFunctionAST.Selector, key: string): number {
        let count = 0;
        for (let i = 0; i < selector.filters.length; i++) {
            if (selector.filters[i].key == key) count++;
        }
        return count;
    }

    function countPositiveFilter(selector: MCFunctionAST.Selector, key: string): number {
        let count = 0;
        for (let i = 0; i < selector.filters.length; i++) {
            let filter = selector.filters[i];
            if (filter.key == key && !filter.inverted) count++;
        }
        return count;
    }

    function validateSingleFilter(
        selector: MCFunctionAST.Selector,
        key: string,
        label: string,
        issues: ValidationIssue[]
    ): void {
        if (countFilter(selector, key) > 1) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "SELECTOR_DUPLICATE_" + key,
                label + " condition can only be used once."
            );
        }
    }

    export function validateSelector(selector: MCFunctionAST.Selector): ValidationIssue[] {
        let issues: ValidationIssue[] = [];

        validateSingleFilter(selector, "x", "X", issues);
        validateSingleFilter(selector, "y", "Y", issues);
        validateSingleFilter(selector, "z", "Z", issues);
        validateSingleFilter(selector, "dx", "dX", issues);
        validateSingleFilter(selector, "dy", "dY", issues);
        validateSingleFilter(selector, "dz", "dZ", issues);
        validateSingleFilter(selector, "r", "max distance", issues);
        validateSingleFilter(selector, "rm", "min distance", issues);
        validateSingleFilter(selector, "c", "count", issues);
        validateSingleFilter(selector, "m", "gamemode", issues);
        validateSingleFilter(selector, "l", "max level", issues);
        validateSingleFilter(selector, "lm", "min level", issues);
        validateSingleFilter(selector, "rx", "X rotation max", issues);
        validateSingleFilter(selector, "rxm", "X rotation min", issues);
        validateSingleFilter(selector, "ry", "Y rotation max", issues);
        validateSingleFilter(selector, "rym", "Y rotation min", issues);

        if (
            selector.base == MCFunctionAST.SelectorBase.Initiator &&
            (selector.filters.length > 0 || selector.scores.length > 0 || selector.hasItems.length > 0)
        ) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "SELECTOR_INITIATOR_CONDITION",
                "@initiator cannot use selector conditions."
            );
        }

        if (
            countFilter(selector, "type") > 0 &&
            (selector.base == MCFunctionAST.SelectorBase.AllPlayers ||
             selector.base == MCFunctionAST.SelectorBase.NearestPlayer)
        ) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "SELECTOR_TYPE_BASE",
                "type cannot be used with @a or @p."
            );
        }

        if (countFilter(selector, "type") > 1 && countPositiveFilter(selector, "type") > 0) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "SELECTOR_TYPE_MULTIPLE",
                "When type is repeated, only negated type conditions are allowed."
            );
        }

        if (countFilter(selector, "name") > 1 && countPositiveFilter(selector, "name") > 0) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "SELECTOR_NAME_MULTIPLE",
                "When name is repeated, only negated name conditions are allowed."
            );
        }

        for (let i = 0; i < selector.scores.length; i++) {
            for (let j = i + 1; j < selector.scores.length; j++) {
                if (selector.scores[i].objective == selector.scores[j].objective) {
                    addIssue(
                        issues,
                        ValidationLevel.Error,
                        "SELECTOR_SCORE_DUPLICATE",
                        "The same scoreboard objective cannot be repeated."
                    );
                }
            }
        }

        for (let i = 0; i < selector.filters.length; i++) {
            if (selector.filters[i].key == "type") {
                let entityId = selector.filters[i].value;
                if (!isSafeIdToken(entityId)) {
                    addIssue(
                        issues,
                        ValidationLevel.Error,
                        "SELECTOR_TYPE_ID_INVALID",
                        "Selector type entity ID is empty or contains invalid command characters."
                    );
                } else {
                    validateEntityRegistryId(entityId, issues);
                }
            }
        }

        for (let i = 0; i < selector.hasItems.length; i++) {
            let itemId = selector.hasItems[i].itemId;
            if (!isSafeIdToken(itemId)) {
                addIssue(
                    issues,
                    ValidationLevel.Error,
                    "SELECTOR_HASITEM_ID_INVALID",
                    "Selector hasitem item ID is empty or contains invalid command characters."
                );
            } else {
                validateItemRegistryId(itemId, issues);
            }
        }

        return issues;
    }

    function isIntegerValue(value: number): boolean {
        return Math.floor(value) == value;
    }

    function isSafeIdToken(value: string): boolean {
        if (!value || value.length == 0) return false;

        for (let i = 0; i < value.length; i++) {
            let ch = value.charAt(i);
            if (
                ch == " " || ch == "\t" || ch == "\r" || ch == "\n" ||
                ch == "\"" || ch == "\\" || ch == "{" || ch == "}" ||
                ch == "[" || ch == "]"
            ) return false;
        }

        return true;
    }

    function containsString(values: string[], value: string, endExclusive: number): boolean {
        for (let i = 0; i < endExclusive; i++) {
            if (values[i] == value) return true;
        }
        return false;
    }

    function hasControlCharacters(value: string): boolean {
        if (value == undefined) return true;
        for (let i = 0; i < value.length; i++) {
            let ch = value.charAt(i);
            if (ch == "\r" || ch == "\n" || ch == "\t") return true;
        }
        return false;
    }

    /** Native gamerule tokens are versioned; unknown names are not automatically invalid. */
    function isGameRuleIdToken(value: string): boolean {
        if (!value || value.length == 0) return false;
        for (let i = 0; i < value.length; i++) {
            let c = value.charAt(i);
            if (!((c >= "a" && c <= "z") || (c >= "A" && c <= "Z") ||
                (c >= "0" && c <= "9") || c == "_")) return false;
        }
        return true;
    }

    export function validateGameRuleCommand(command: MCFunctionAST.GameRuleCommand): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        let action = command.action;
        if (action != MCFunctionAST.GameRuleAction.List &&
            action != MCFunctionAST.GameRuleAction.Query &&
            action != MCFunctionAST.GameRuleAction.SetBoolean &&
            action != MCFunctionAST.GameRuleAction.SetInteger &&
            action != MCFunctionAST.GameRuleAction.SetEnum) {
            addIssue(issues, ValidationLevel.Error, "GAMERULE_ACTION_INVALID", "Invalid gamerule action.");
            return issues;
        }
        if (action == MCFunctionAST.GameRuleAction.List) {
            if (command.ruleId != undefined || command.booleanValue != undefined ||
                command.integerValue != undefined || command.enumValue != undefined) {
                addIssue(issues, ValidationLevel.Error, "GAMERULE_LIST_EXTRA_ARGUMENT", "GAMERULE list accepts no extra arguments.");
            }
            return issues;
        }
        if (!isGameRuleIdToken(command.ruleId)) {
            addIssue(issues, ValidationLevel.Error, "GAMERULE_ID_INVALID", "Gamerule name must be a nonempty native command token.");
            return issues;
        }
        let kind = MCFunctionGameruleRegistry.valueKindOf(command.ruleId);
        if (kind == 0) {
            addIssue(issues, ValidationLevel.Warning, "GAMERULE_ID_UNKNOWN",
                "Gamerule " + command.ruleId + " is not in the current Bedrock versioned native Registry. Future/Education-specific rules are preserved; runtime support is unverified.");
        }
        if (action == MCFunctionAST.GameRuleAction.Query) {
            if (command.booleanValue != undefined || command.integerValue != undefined || command.enumValue != undefined) {
                addIssue(issues, ValidationLevel.Error, "GAMERULE_QUERY_EXTRA_ARGUMENT", "GAMERULE query cannot set a value.");
            }
            return issues;
        }
        if (action == MCFunctionAST.GameRuleAction.SetBoolean) {
            if (command.booleanValue == undefined || command.integerValue != undefined || command.enumValue != undefined) {
                addIssue(issues, ValidationLevel.Error, "GAMERULE_BOOLEAN_VALUE_INVALID", "Boolean gamerule requires exactly one true/false literal.");
            }
            if (kind != 0 && kind != 1) {
                addIssue(issues, ValidationLevel.Error, "GAMERULE_TYPE_MISMATCH", "Known gamerule " + command.ruleId + " is not a Boolean rule.");
            }
        } else if (action == MCFunctionAST.GameRuleAction.SetInteger) {
            let v = command.integerValue;
            if (v == undefined || !(v - v == 0) || Math.floor(v) != v ||
                command.booleanValue != undefined || command.enumValue != undefined) {
                addIssue(issues, ValidationLevel.Error, "GAMERULE_INTEGER_VALUE_INVALID", "Integer gamerule requires exactly one finite whole number.");
            }
            if (kind != 0 && kind != 2) {
                addIssue(issues, ValidationLevel.Error, "GAMERULE_TYPE_MISMATCH", "Known gamerule " + command.ruleId + " is not an Integer rule.");
            }
            if (v != undefined && Math.floor(v) == v && v - v == 0 &&
                MCFunctionGameruleRegistry.outsideDocumentedIntegerRange(command.ruleId, v)) {
                addIssue(issues, ValidationLevel.Warning, "GAMERULE_INTEGER_TARGET_RANGE",
                    "Value is outside the documented Bedrock range for " + command.ruleId + "; final version/runtime check required.");
            }
        } else if (action == MCFunctionAST.GameRuleAction.SetEnum) {
            if (!isGameRuleIdToken(command.enumValue) ||
                command.booleanValue != undefined || command.integerValue != undefined) {
                addIssue(issues, ValidationLevel.Error, "GAMERULE_ENUM_VALUE_INVALID", "Enum gamerule requires exactly one nonempty enum value.");
            }
            if (kind != 0 && kind != 3) {
                addIssue(issues, ValidationLevel.Error, "GAMERULE_TYPE_MISMATCH", "Known gamerule " + command.ruleId + " is not an Enum rule.");
            }
            if (kind == 3 && isGameRuleIdToken(command.enumValue) &&
                !MCFunctionGameruleRegistry.isDocumentedEnumValue(command.ruleId, command.enumValue)) {
                addIssue(issues, ValidationLevel.Warning, "GAMERULE_ENUM_UNKNOWN_VALUE",
                    "Enum value " + command.enumValue + " is not documented for " + command.ruleId + "; preserved for version compatibility.");
            }
        }
        return issues;
    }

    /** Name-based native enchantment values and numeric legacy command form. */
    function isEnchantNameToken(name: string): boolean {
        if (!name || name.length == 0) return false;
        for (let i = 0; i < name.length; i++) {
            let c = name.charAt(i);
            if (!((c >= "a" && c <= "z") || (c >= "0" && c <= "9") || c == "_")) return false;
        }
        return true;
    }

    export function validateEnchantCommand(command: MCFunctionAST.EnchantCommand): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        if (!command.target) {
            addIssue(issues, ValidationLevel.Error, "ENCHANT_TARGET_MISSING", "ENCHANT requires a player target Selector.");
        } else {
            appendIssues(issues, validateSelector(command.target));
            if (command.target.base == MCFunctionAST.SelectorBase.AllEntities ||
                command.target.base == MCFunctionAST.SelectorBase.Initiator) {
                addIssue(issues, ValidationLevel.Warning, "ENCHANT_TARGET_PLAYER_REQUIRED",
                    "ENCHANT acts on players holding an eligible item; target must resolve to a player.");
            }
        }
        if (command.idKind == MCFunctionAST.EnchantmentIdKind.Name) {
            if (!isEnchantNameToken(command.enchantmentName) || command.enchantmentNumber != undefined) {
                addIssue(issues, ValidationLevel.Error, "ENCHANT_ID_INVALID", "Name enchantment must be a nonempty native identifier (a-z, 0-9, _).");
            } else if (!MCFunctionEnchantmentRegistry.isKnown(command.enchantmentName)) {
                addIssue(issues, ValidationLevel.Warning, "ENCHANT_ID_UNKNOWN",
                    "Native enchantment " + command.enchantmentName + " is not in this Bedrock Registry; value is preserved for other versions.");
            }
        } else if (command.idKind == MCFunctionAST.EnchantmentIdKind.Numeric) {
            let n = command.enchantmentNumber;
            if (n == undefined || !(n - n == 0) || Math.floor(n) != n || n < 0 ||
                command.enchantmentName != undefined && command.enchantmentName.length > 0) {
                addIssue(issues, ValidationLevel.Error, "ENCHANT_NUMERIC_ID_INVALID", "Numeric enchantment ID must be a nonnegative finite integer.");
            } else {
                addIssue(issues, ValidationLevel.Info, "ENCHANT_NUMERIC_ID_UNVERIFIED",
                    "Numeric enchantment ID has no verified version-specific mapping in this Registry; verify in the target runtime.");
            }
        } else {
            addIssue(issues, ValidationLevel.Error, "ENCHANT_ID_KIND_INVALID", "Unsupported enchantment ID kind.");
        }
        if (command.level != undefined) {
            let level = command.level;
            if (!(level - level == 0) || Math.floor(level) != level || level < 1) {
                addIssue(issues, ValidationLevel.Error, "ENCHANT_LEVEL_INVALID", "ENCHANT level must be a positive finite integer.");
            } else if (command.idKind == MCFunctionAST.EnchantmentIdKind.Name &&
                       MCFunctionEnchantmentRegistry.isKnown(command.enchantmentName)) {
                let maxLevel = MCFunctionEnchantmentRegistry.maxLevelOf(command.enchantmentName);
                if (maxLevel > 0 && level > maxLevel) {
                    addIssue(issues, ValidationLevel.Error, "ENCHANT_LEVEL_OUT_OF_RANGE",
                        "Known enchantment " + command.enchantmentName + " supports level 1 to " + maxLevel + ".");
                }
            }
        }
        return issues;
    }

    /** Particle effect identifiers: preserve unknown valid IDs but reject broken tokens. */
    function isParticleIdToken(value: string): boolean {
        if (!value || value.length == 0) return false;
        let colon = -1;
        for (let i = 0; i < value.length; i++) {
            let ch = value.charAt(i);
            let allowed =
                (ch >= "a" && ch <= "z") ||
                (ch >= "0" && ch <= "9") ||
                ch == "_" || ch == "-" || ch == "." || ch == "/";
            if (ch == ":") {
                if (colon >= 0 || i == 0 || i == value.length - 1) return false;
                colon = i;
            } else if (!allowed) {
                return false;
            }
        }
        return true;
    }

    /** Warning/Info never block export or Preview. Unknown particles may be silent. */
    export function validateParticleCommand(
        command: MCFunctionAST.ParticleCommand
    ): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        if (!isParticleIdToken(command.particleId)) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "PARTICLE_ID_INVALID",
                "Particle ID must be a nonempty Minecraft identifier without spaces or invalid characters."
            );
        } else if (MCFunctionRegistryLookup.isCustomNamespace(command.particleId)) {
            addIssue(
                issues,
                ValidationLevel.Info,
                "PARTICLE_ID_CUSTOM_NAMESPACE",
                "Particle ID " + command.particleId + " uses a custom namespace. Preview and export will continue; the resource pack must define this particle."
            );
        } else if (!MCFunctionRegistryLookup.isKnownParticle(command.particleId)) {
            addIssue(
                issues,
                ValidationLevel.Warning,
                "PARTICLE_ID_UNKNOWN",
                "Particle ID " + command.particleId + " is not in the current Bedrock Registry. Preview and export will continue; runtime feedback is not reliable."
            );
        }
        if (command.position) {
            appendIssues(issues, validatePosition(command.position));
        }
        return issues;
    }

    /** Accept dotted Bedrock sound IDs and resource-pack custom identifiers. */
    function isAudioIdToken(value: string): boolean {
        if (!value || value.length == 0) return false;
        let colons = 0;
        for (let i = 0; i < value.length; i++) {
            let c = value.charAt(i);
            let allowed = (c >= "a" && c <= "z") || (c >= "0" && c <= "9") ||
                c == "_" || c == "-" || c == "." || c == "/";
            if (c == ":") {
                colons++;
                if (colons > 1 || i == 0 || i == value.length - 1) return false;
            } else if (!allowed) return false;
        }
        return true;
    }

    function validateSoundId(value: string, issues: ValidationIssue[], prefix: string): void {
        if (!isAudioIdToken(value)) {
            addIssue(issues, ValidationLevel.Error, prefix + "_ID_INVALID", "Audio ID contains invalid characters or is empty.");
        } else if (MCFunctionRegistryLookup.isCustomNamespace(value)) {
            addIssue(issues, ValidationLevel.Info, prefix + "_ID_CUSTOM_NAMESPACE", "Custom audio ID " + value + " requires matching pack content.");
        } else if (prefix == "SOUND" && !MCFunctionRegistryLookup.isKnownSound(value)) {
            addIssue(issues, ValidationLevel.Warning, "SOUND_ID_UNKNOWN", "Sound " + value + " is not in the current Sound Registry; audio content or version may differ.");
        } else if (prefix == "MUSIC" && !MCFunctionRegistryLookup.isKnownMusicTrack(value)) {
            addIssue(issues, ValidationLevel.Warning, "MUSIC_ID_UNKNOWN", "Music track " + value + " is not in the current Music Registry; audio content or version may differ.");
        }
    }

    function validateAudioNumber(issues: ValidationIssue[], value: number, name: string, min: number, max: number): void {
        if (value == undefined) return;
        if (!(value >= min && value <= max)) {
            addIssue(issues, ValidationLevel.Error, name + "_OUT_OF_RANGE", name + " must be a finite number between " + min + " and " + max + ".");
        }
    }

    export function validatePlaySoundCommand(command: MCFunctionAST.PlaySoundCommand): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        validateSoundId(command.soundId, issues, "SOUND");
        if (command.target) appendIssues(issues, validateSelector(command.target));
        if (command.position) appendIssues(issues, validatePosition(command.position));
        validateAudioNumber(issues, command.volume, "SOUND_VOLUME", 0, 1);
        validateAudioNumber(issues, command.pitch, "SOUND_PITCH", 0, 256);
        validateAudioNumber(issues, command.minimumVolume, "SOUND_MIN_VOLUME", 0, 1);
        return issues;
    }

    export function validateStopSoundCommand(command: MCFunctionAST.StopSoundCommand): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        if (!command.target) {
            addIssue(issues, ValidationLevel.Error, "STOPSOUND_TARGET_MISSING", "STOPSOUND requires a player target.");
        } else appendIssues(issues, validateSelector(command.target));
        if (command.soundId != undefined) validateSoundId(command.soundId, issues, "SOUND");
        return issues;
    }

    export function validateMusicCommand(command: MCFunctionAST.MusicCommand): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        if (command.action == MCFunctionAST.MusicAction.Play || command.action == MCFunctionAST.MusicAction.Queue) {
            validateSoundId(command.trackId, issues, "MUSIC");
            if (command.repeatMode != undefined &&
                command.repeatMode != MCFunctionAST.MusicRepeatMode.PlayOnce &&
                command.repeatMode != MCFunctionAST.MusicRepeatMode.Loop) {
                addIssue(issues, ValidationLevel.Error, "MUSIC_REPEAT_INVALID", "Music repeat must be play_once or loop.");
            }
        } else if (command.action != MCFunctionAST.MusicAction.Stop && command.action != MCFunctionAST.MusicAction.Volume) {
            addIssue(issues, ValidationLevel.Error, "MUSIC_ACTION_INVALID", "Unknown music action.");
        }
        if (command.action == MCFunctionAST.MusicAction.Volume && command.volume == undefined) {
            addIssue(issues, ValidationLevel.Error, "MUSIC_VOLUME_MISSING", "MUSIC VOLUME requires a numeric value.");
        }
        if (command.action == MCFunctionAST.MusicAction.Stop &&
            (command.trackId != undefined || command.volume != undefined || command.repeatMode != undefined)) {
            addIssue(issues, ValidationLevel.Error, "MUSIC_STOP_EXTRA_ARGUMENT", "MUSIC STOP accepts only optional fade seconds.");
        }
        if (command.action == MCFunctionAST.MusicAction.Volume &&
            (command.trackId != undefined || command.fadeSeconds != undefined || command.repeatMode != undefined)) {
            addIssue(issues, ValidationLevel.Error, "MUSIC_VOLUME_EXTRA_ARGUMENT", "MUSIC VOLUME accepts only a volume value.");
        }
        // Conservative compile-time ranges; Minecraft performs final target/version checks.
        // /music docs specify a float but do not publish a universal maximum.
        // Do not hard-block future/target-specific numeric values by assuming one.
        if (command.volume != undefined && !(command.volume >= 0 && (command.volume - command.volume) == 0)) {
            addIssue(issues, ValidationLevel.Error, "MUSIC_VOLUME_INVALID", "Music volume must be a finite nonnegative number.");
        }
        if (command.fadeSeconds != undefined && !(command.fadeSeconds >= 0 && (command.fadeSeconds - command.fadeSeconds) == 0)) {
            addIssue(issues, ValidationLevel.Error, "MUSIC_FADE_INVALID", "Music fade seconds must be a finite nonnegative number.");
        }
        return issues;
    }

    function validateBlockRegistryId(
        blockId: string,
        issues: ValidationIssue[]
    ): void {
        if (!isSafeIdToken(blockId)) return;

        if (MCFunctionRegistryLookup.isCustomNamespace(blockId)) {
            addIssue(
                issues,
                ValidationLevel.Info,
                "BLOCK_ID_CUSTOM_NAMESPACE",
                "Block ID " + blockId + " uses a custom namespace and is not checked against the vanilla Registry."
            );
            return;
        }

        if (!MCFunctionRegistryLookup.isKnownBlock(blockId)) {
            addIssue(
                issues,
                ValidationLevel.Warning,
                "BLOCK_ID_UNKNOWN",
                "Block ID " + blockId + " is not present in the current Bedrock Registry. Preview and export will continue."
            );
        }
    }

    function validateEntityRegistryId(
        entityId: string,
        issues: ValidationIssue[]
    ): void {
        if (!isSafeIdToken(entityId)) return;

        if (MCFunctionRegistryLookup.isCustomNamespace(entityId)) {
            addIssue(
                issues,
                ValidationLevel.Info,
                "ENTITY_ID_CUSTOM_NAMESPACE",
                "Entity ID " + entityId + " uses a custom namespace and is not checked against the vanilla Registry."
            );
            return;
        }

        if (!MCFunctionRegistryLookup.isKnownEntity(entityId)) {
            addIssue(
                issues,
                ValidationLevel.Warning,
                "ENTITY_ID_UNKNOWN",
                "Entity ID " + entityId + " is not present in the current Bedrock Registry. Preview and export will continue."
            );
        }
    }

    export function validateEntityEventForOwner(
        entityId: string,
        eventId: string,
        spawnContext: boolean
    ): ValidationIssue[] {
        let issues: ValidationIssue[] = [];

        if (!isSafeIdToken(entityId) || !isSafeIdToken(eventId)) return issues;
        if (MCFunctionRegistryLookup.isCustomNamespace(entityId)) return issues;
        if (!MCFunctionRegistryLookup.isKnownEntity(entityId)) return issues;
        if (!MCFunctionEntityEventRegistry.hasOwnerData(entityId)) return issues;

        if (!MCFunctionEntityEventRegistry.isDefinedForOwner(entityId, eventId)) {
            addIssue(
                issues,
                ValidationLevel.Warning,
                "ENTITY_EVENT_NOT_DEFINED_FOR_OWNER",
                "Event " + eventId + " is not defined for " + entityId + " in the current vanilla entity metadata. Preview and export will continue for version/add-on compatibility."
            );
            return issues;
        }

        if (spawnContext && !MCFunctionEntityEventRegistry.isSpawnRecommended(entityId, eventId)) {
            addIssue(
                issues,
                ValidationLevel.Info,
                "SUMMON_EVENT_NOT_SPAWN_RECOMMENDED",
                "Event " + eventId + " is defined for " + entityId + " but is not marked spawn-recommended in the current vanilla metadata. It may intentionally create an unusual initialization state."
            );
        }

        return issues;
    }

    function validateItemRegistryId(
        itemId: string,
        issues: ValidationIssue[]
    ): void {
        if (!isSafeIdToken(itemId)) return;

        if (MCFunctionRegistryLookup.isCustomNamespace(itemId)) {
            addIssue(
                issues,
                ValidationLevel.Info,
                "ITEM_ID_CUSTOM_NAMESPACE",
                "Item ID " + itemId + " uses a custom namespace and is not checked against the vanilla Registry."
            );
            return;
        }

        if (!MCFunctionRegistryLookup.isKnownItem(itemId)) {
            addIssue(
                issues,
                ValidationLevel.Warning,
                "ITEM_ID_UNKNOWN",
                "Item ID " + itemId + " is not present in the current Bedrock Registry. Preview and export will continue."
            );
        }
    }

    function blockStateKindName(kind: MCFunctionBlockStateRegistry.ValueKind): string {
        if (kind == MCFunctionBlockStateRegistry.ValueKind.String) return "text";
        if (kind == MCFunctionBlockStateRegistry.ValueKind.Number) return "number";
        if (kind == MCFunctionBlockStateRegistry.ValueKind.Boolean) return "boolean";
        return "unknown";
    }

    function astBlockStateKind(
        entry: MCFunctionAST.BlockStateEntry
    ): MCFunctionBlockStateRegistry.ValueKind {
        if (entry.kind == MCFunctionAST.BlockStateValueKind.String) {
            return MCFunctionBlockStateRegistry.ValueKind.String;
        }
        if (entry.kind == MCFunctionAST.BlockStateValueKind.Number) {
            return MCFunctionBlockStateRegistry.ValueKind.Number;
        }
        if (entry.kind == MCFunctionAST.BlockStateValueKind.Boolean) {
            return MCFunctionBlockStateRegistry.ValueKind.Boolean;
        }
        return MCFunctionBlockStateRegistry.ValueKind.Unknown;
    }

    function validateKnownBlockStateValue(
        entry: MCFunctionAST.BlockStateEntry,
        issues: ValidationIssue[]
    ): void {
        let expected = MCFunctionBlockStateRegistry.getValueKind(entry.key);
        if (expected == MCFunctionBlockStateRegistry.ValueKind.Unknown) return;

        let actual = astBlockStateKind(entry);
        if (actual != expected) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "BLOCK_STATE_TYPE_MISMATCH",
                "Block state " + entry.key + " requires a " + blockStateKindName(expected) + " value."
            );
            return;
        }

        let allowed = false;
        if (actual == MCFunctionBlockStateRegistry.ValueKind.String) {
            allowed = MCFunctionBlockStateRegistry.isAllowedStringValue(entry.key, entry.stringValue);
        } else if (actual == MCFunctionBlockStateRegistry.ValueKind.Number) {
            allowed = MCFunctionBlockStateRegistry.isAllowedNumberValue(entry.key, entry.numberValue);
        } else if (actual == MCFunctionBlockStateRegistry.ValueKind.Boolean) {
            allowed = MCFunctionBlockStateRegistry.isAllowedBooleanValue(entry.key, entry.booleanValue);
        }

        if (!allowed) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "BLOCK_STATE_VALUE_INVALID",
                "Block state " + entry.key + " has a value outside the current Bedrock Registry values."
            );
        }
    }

    export function validateBlockStates(
        states: MCFunctionAST.BlockStates,
        blockId?: string
    ): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        let canCheckVanillaBlock = false;
        let contextBlockId = blockId || "";

        if (contextBlockId && isSafeIdToken(contextBlockId) && !MCFunctionRegistryLookup.isCustomNamespace(contextBlockId)) {
            canCheckVanillaBlock = MCFunctionRegistryLookup.isKnownBlock(contextBlockId);
        }

        for (let i = 0; i < states.entries.length; i++) {
            let entry = states.entries[i];
            let safeKey = isSafeIdToken(entry.key);

            if (!safeKey) {
                addIssue(
                    issues,
                    ValidationLevel.Error,
                    "BLOCK_STATE_KEY_INVALID",
                    "Block-state key is empty or contains invalid command characters."
                );
            }

            for (let j = 0; j < i; j++) {
                if (states.entries[j].key == entry.key) {
                    addIssue(
                        issues,
                        ValidationLevel.Error,
                        "BLOCK_STATE_KEY_DUPLICATE",
                        "The same block-state key cannot be repeated."
                    );
                    break;
                }
            }

            if (
                entry.kind != MCFunctionAST.BlockStateValueKind.String &&
                entry.kind != MCFunctionAST.BlockStateValueKind.Number &&
                entry.kind != MCFunctionAST.BlockStateValueKind.Boolean
            ) {
                addIssue(
                    issues,
                    ValidationLevel.Error,
                    "BLOCK_STATE_VALUE_KIND_INVALID",
                    "Unsupported block-state value type."
                );
            }

            if (
                entry.kind == MCFunctionAST.BlockStateValueKind.String &&
                hasControlCharacters(entry.stringValue)
            ) {
                addIssue(
                    issues,
                    ValidationLevel.Error,
                    "BLOCK_STATE_STRING_INVALID",
                    "Block-state text cannot contain tab or line-break characters."
                );
            }

            if (safeKey) {
                if (MCFunctionBlockStateRegistry.isKnownState(entry.key)) {
                    validateKnownBlockStateValue(entry, issues);

                    if (
                        canCheckVanillaBlock &&
                        MCFunctionBlockStateRegistry.hasUsageForBlock(contextBlockId) &&
                        !MCFunctionBlockStateRegistry.isStateAllowedForBlock(contextBlockId, entry.key)
                    ) {
                        addIssue(
                            issues,
                            ValidationLevel.Warning,
                            "BLOCK_STATE_NOT_APPLICABLE",
                            "Block state " + entry.key + " is not listed for " + contextBlockId + " in the current vanilla block metadata."
                        );
                    }
                } else if (canCheckVanillaBlock && MCFunctionBlockStateRegistry.isCatalogComplete()) {
                    addIssue(
                        issues,
                        ValidationLevel.Warning,
                        "BLOCK_STATE_UNKNOWN",
                        "Block state " + entry.key + " is not present in the current vanilla Block State Registry. Preview and export will continue."
                    );
                }
            }
        }

        return issues;
    }

    export function validateSetBlockCommand(
        command: MCFunctionAST.SetBlockCommand
    ): ValidationIssue[] {
        let issues: ValidationIssue[] = [];

        appendIssues(issues, validatePosition(command.position));

        if (!isSafeIdToken(command.blockId)) {
            addIssue(issues, ValidationLevel.Error, "SETBLOCK_BLOCK_INVALID", "SETBLOCK block ID is invalid.");
        } else {
            validateBlockRegistryId(command.blockId, issues);
        }

        if (command.blockStates) {
            appendIssues(issues, validateBlockStates(command.blockStates, command.blockId));
        }

        if (
            command.mode != undefined &&
            command.mode != MCFunctionAST.SetBlockMode.Replace &&
            command.mode != MCFunctionAST.SetBlockMode.Destroy &&
            command.mode != MCFunctionAST.SetBlockMode.Keep
        ) {
            addIssue(issues, ValidationLevel.Error, "SETBLOCK_MODE_INVALID", "Unsupported SETBLOCK mode.");
        }

        return issues;
    }

    export function validateFillCommand(
        command: MCFunctionAST.FillCommand
    ): ValidationIssue[] {
        let issues: ValidationIssue[] = [];

        appendIssues(issues, validatePosition(command.from));
        appendIssues(issues, validatePosition(command.to));

        if (!isSafeIdToken(command.blockId)) {
            addIssue(issues, ValidationLevel.Error, "FILL_BLOCK_INVALID", "FILL block ID is invalid.");
        } else {
            validateBlockRegistryId(command.blockId, issues);
        }

        if (command.blockStates) {
            appendIssues(issues, validateBlockStates(command.blockStates, command.blockId));
        }

        if (
            command.mode != undefined &&
            command.mode != MCFunctionAST.FillMode.Replace &&
            command.mode != MCFunctionAST.FillMode.Destroy &&
            command.mode != MCFunctionAST.FillMode.Hollow &&
            command.mode != MCFunctionAST.FillMode.Keep &&
            command.mode != MCFunctionAST.FillMode.Outline
        ) {
            addIssue(issues, ValidationLevel.Error, "FILL_MODE_INVALID", "Unsupported FILL mode.");
        }

        if (command.replaceBlockId != undefined) {
            if (!isSafeIdToken(command.replaceBlockId)) {
                addIssue(issues, ValidationLevel.Error, "FILL_REPLACE_BLOCK_INVALID", "FILL replacement filter block ID is invalid.");
            } else {
                validateBlockRegistryId(command.replaceBlockId, issues);
            }

            if (command.mode != undefined && command.mode != MCFunctionAST.FillMode.Replace) {
                addIssue(issues, ValidationLevel.Error, "FILL_REPLACE_FILTER_MODE", "A replacement block filter is only valid with FILL replace mode.");
            }
        } else if (command.replaceBlockStates != undefined) {
            addIssue(issues, ValidationLevel.Error, "FILL_REPLACE_STATES_WITHOUT_BLOCK", "Replacement block states require a replacement block ID.");
        }

        if (command.replaceBlockStates) {
            appendIssues(issues, validateBlockStates(command.replaceBlockStates, command.replaceBlockId));
        }

        return issues;
    }

    export function validateCloneCommand(
        command: MCFunctionAST.CloneCommand
    ): ValidationIssue[] {
        let issues: ValidationIssue[] = [];

        appendIssues(issues, validatePosition(command.begin));
        appendIssues(issues, validatePosition(command.end));
        appendIssues(issues, validatePosition(command.destination));

        if (
            command.maskKind != undefined &&
            command.maskKind != MCFunctionAST.CloneMaskKind.Replace &&
            command.maskKind != MCFunctionAST.CloneMaskKind.Masked &&
            command.maskKind != MCFunctionAST.CloneMaskKind.Filtered
        ) {
            addIssue(issues, ValidationLevel.Error, "CLONE_MASK_INVALID", "Unsupported CLONE mask mode.");
        }

        if (
            command.cloneMode != undefined &&
            command.cloneMode != MCFunctionAST.CloneMode.Normal &&
            command.cloneMode != MCFunctionAST.CloneMode.Force &&
            command.cloneMode != MCFunctionAST.CloneMode.Move
        ) {
            addIssue(issues, ValidationLevel.Error, "CLONE_MODE_INVALID", "Unsupported CLONE mode.");
        }

        if (command.maskKind == MCFunctionAST.CloneMaskKind.Filtered) {
            if (!isSafeIdToken(command.filterBlockId)) {
                addIssue(issues, ValidationLevel.Error, "CLONE_FILTER_BLOCK_INVALID", "Filtered CLONE requires a valid filter block ID.");
            } else {
                validateBlockRegistryId(command.filterBlockId, issues);
            }
        } else {
            if (command.filterBlockId != undefined || command.filterBlockStates != undefined) {
                addIssue(issues, ValidationLevel.Error, "CLONE_FILTER_WITHOUT_FILTERED", "CLONE filter block/states are only valid with filtered mask mode.");
            }
        }

        if (command.filterBlockStates) {
            appendIssues(issues, validateBlockStates(command.filterBlockStates, command.filterBlockId));
        }

        return issues;
    }

    export function validateItemStack(item: MCFunctionAST.ItemStack): ValidationIssue[] {
        let issues: ValidationIssue[] = [];

        if (!isSafeIdToken(item.id)) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "ITEM_ID_INVALID",
                "Item ID is empty or contains characters that cannot be used in a command."
            );
        } else {
            validateItemRegistryId(item.id, issues);
        }

        if (item.amount != undefined) {
            if (!isIntegerValue(item.amount)) {
                addIssue(issues, ValidationLevel.Error, "ITEM_AMOUNT_NOT_INTEGER", "Item amount must be an integer.");
            } else if (item.amount <= 0) {
                addIssue(issues, ValidationLevel.Error, "ITEM_AMOUNT_NON_POSITIVE", "Item amount must be at least 1.");
            }
        }

        if (item.data != undefined && !isIntegerValue(item.data)) {
            addIssue(issues, ValidationLevel.Error, "ITEM_DATA_NOT_INTEGER", "Item data must be an integer.");
        }

        if (!item.components) {
            return issues;
        }

        for (let i = 0; i < item.components.canDestroy.length; i++) {
            let blockId = item.components.canDestroy[i];
            if (!isSafeIdToken(blockId)) {
                addIssue(issues, ValidationLevel.Error, "ITEM_CAN_DESTROY_ID_INVALID", "Invalid can_destroy block ID: " + blockId);
            } else {
                validateBlockRegistryId(blockId, issues);
            }
            if (containsString(item.components.canDestroy, blockId, i)) {
                addIssue(issues, ValidationLevel.Warning, "ITEM_CAN_DESTROY_DUPLICATE", "Duplicate can_destroy block: " + blockId);
            }
        }

        for (let i = 0; i < item.components.canPlaceOn.length; i++) {
            let blockId = item.components.canPlaceOn[i];
            if (!isSafeIdToken(blockId)) {
                addIssue(issues, ValidationLevel.Error, "ITEM_CAN_PLACE_ON_ID_INVALID", "Invalid can_place_on block ID: " + blockId);
            } else {
                validateBlockRegistryId(blockId, issues);
            }
            if (containsString(item.components.canPlaceOn, blockId, i)) {
                addIssue(issues, ValidationLevel.Warning, "ITEM_CAN_PLACE_ON_DUPLICATE", "Duplicate can_place_on block: " + blockId);
            }
        }

        if (
            item.components.itemLock != MCFunctionAST.ItemLockMode.None &&
            item.components.itemLock != MCFunctionAST.ItemLockMode.LockInInventory &&
            item.components.itemLock != MCFunctionAST.ItemLockMode.LockInSlot
        ) {
            addIssue(issues, ValidationLevel.Error, "ITEM_LOCK_MODE_INVALID", "Unsupported item_lock mode.");
        }

        return issues;
    }

    export function validateGiveCommand(command: MCFunctionAST.GiveCommand): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        appendIssues(issues, validateSelector(command.target));
        appendIssues(issues, validateItemStack(command.item));
        return issues;
    }



    function isValidCoordinateMode(mode: MCFunctionAST.CoordinateMode): boolean {
        return mode == MCFunctionAST.CoordinateMode.Absolute ||
            mode == MCFunctionAST.CoordinateMode.Relative ||
            mode == MCFunctionAST.CoordinateMode.Local;
    }

    function validateCoordinate(
        coordinate: MCFunctionAST.Coordinate,
        axis: string,
        issues: ValidationIssue[]
    ): void {
        if (!isValidCoordinateMode(coordinate.mode)) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "POSITION_MODE_INVALID_" + axis,
                "Invalid coordinate mode for " + axis + "."
            );
        }
    }

    export function validatePosition(position: MCFunctionAST.Position): ValidationIssue[] {
        let issues: ValidationIssue[] = [];

        validateCoordinate(position.x, "X", issues);
        validateCoordinate(position.y, "Y", issues);
        validateCoordinate(position.z, "Z", issues);

        let localCount = 0;
        if (position.x.mode == MCFunctionAST.CoordinateMode.Local) localCount++;
        if (position.y.mode == MCFunctionAST.CoordinateMode.Local) localCount++;
        if (position.z.mode == MCFunctionAST.CoordinateMode.Local) localCount++;

        if (localCount > 0 && localCount < 3) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "POSITION_LOCAL_MIXED",
                "Local (^) coordinates cannot be mixed with absolute or relative coordinates in one position."
            );
        }

        return issues;
    }

    function validateRotationValue(
        value: MCFunctionAST.RotationValue,
        axis: string,
        issues: ValidationIssue[]
    ): void {
        if (
            value.mode != MCFunctionAST.RotationMode.Absolute &&
            value.mode != MCFunctionAST.RotationMode.Relative
        ) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "ROTATION_MODE_INVALID_" + axis,
                "Invalid rotation mode for " + axis + "."
            );
        }
    }

    export function validateRotation(rotation: MCFunctionAST.Rotation): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        validateRotationValue(rotation.yaw, "YAW", issues);
        validateRotationValue(rotation.pitch, "PITCH", issues);
        return issues;
    }

    export function validateEffectCommand(
        command: MCFunctionAST.EffectCommand
    ): ValidationIssue[] {
        let issues: ValidationIssue[] = [];

        appendIssues(issues, validateSelector(command.target));

        if (
            command.mode != MCFunctionAST.EffectMode.Add &&
            command.mode != MCFunctionAST.EffectMode.ClearAll &&
            command.mode != MCFunctionAST.EffectMode.ClearSpecific
        ) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "EFFECT_MODE_INVALID",
                "Unsupported effect command mode."
            );
            return issues;
        }

        if (command.mode == MCFunctionAST.EffectMode.ClearAll) {
            if (
                command.effectId != undefined ||
                command.durationMode != undefined ||
                command.seconds != undefined ||
                command.amplifier != undefined ||
                command.hideParticles != undefined
            ) {
                addIssue(
                    issues,
                    ValidationLevel.Error,
                    "EFFECT_CLEAR_ALL_HAS_OPTIONS",
                    "Clear all does not accept an effect add tail."
                );
            }
            return issues;
        }

        if (!isSafeIdToken(command.effectId)) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "EFFECT_ID_INVALID",
                "Effect ID is empty or contains invalid command characters."
            );
        } else if (!MCFunctionRegistryLookup.isKnownEffect(command.effectId)) {
            addIssue(
                issues,
                ValidationLevel.Warning,
                "EFFECT_ID_UNKNOWN",
                "Effect value " + command.effectId + " is not present in the current native /effect Registry. Preview and export will continue for version/import compatibility."
            );
        }

        if (command.mode == MCFunctionAST.EffectMode.ClearSpecific) {
            if (
                command.durationMode != undefined ||
                command.seconds != undefined ||
                command.amplifier != undefined ||
                command.hideParticles != undefined
            ) {
                addIssue(
                    issues,
                    ValidationLevel.Error,
                    "EFFECT_CLEAR_SPECIFIC_HAS_OPTIONS",
                    "Clearing a specific effect does not accept duration, amplifier, or particle options."
                );
            }
            return issues;
        }

        // ADD: duration/amplifier/hideParticles are positional optional values.
        if (command.durationMode == undefined) {
            if (
                command.seconds != undefined ||
                command.amplifier != undefined ||
                command.hideParticles != undefined
            ) {
                addIssue(
                    issues,
                    ValidationLevel.Error,
                    "EFFECT_DURATION_REQUIRED_FOR_TAIL",
                    "Effect duration must be present before amplifier or particle options."
                );
            }
            return issues;
        }

        if (
            command.durationMode != MCFunctionAST.EffectDurationMode.Seconds &&
            command.durationMode != MCFunctionAST.EffectDurationMode.Infinite
        ) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "EFFECT_DURATION_MODE_INVALID",
                "Unsupported effect duration mode."
            );
            return issues;
        }

        if (command.durationMode == MCFunctionAST.EffectDurationMode.Seconds) {
            if (!isIntegerValue(command.seconds)) {
                addIssue(
                    issues,
                    ValidationLevel.Error,
                    "EFFECT_SECONDS_NOT_INTEGER",
                    "Effect seconds must be an integer."
                );
            }
        } else if (command.seconds != undefined) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "EFFECT_INFINITE_HAS_SECONDS",
                "Infinite duration must not also contain a seconds value."
            );
        }

        if (command.amplifier != undefined && !isIntegerValue(command.amplifier)) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "EFFECT_AMPLIFIER_NOT_INTEGER",
                "Effect amplifier must be an integer."
            );
        }

        if (command.hideParticles != undefined && command.amplifier == undefined) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "EFFECT_AMPLIFIER_REQUIRED_FOR_HIDE_PARTICLES",
                "Effect amplifier must be present before hide particles."
            );
        }

        return issues;
    }


    export function validateTeleportCommand(
        command: MCFunctionAST.TeleportCommand
    ): ValidationIssue[] {
        let issues: ValidationIssue[] = [];

        // target is optional: omitted target is the Bedrock `tp <destination>`
        // self-teleport form. Validate only when an explicit victim exists.
        if (command.target) {
            appendIssues(issues, validatePlayerReference(command.target, true));
        }

        if (!command.destination) {
            addIssue(issues, ValidationLevel.Error, "TP_DESTINATION_MISSING", "Teleport destination is missing.");
            return issues;
        }

        if (command.destination.kind == MCFunctionAST.TeleportDestinationKind.Entity) {
            if (!command.destination.entity) {
                addIssue(issues, ValidationLevel.Error, "TP_DESTINATION_ENTITY_MISSING", "Teleport destination entity is missing.");
            } else {
                appendIssues(issues, validatePlayerReference(command.destination.entity, true));
            }

            if (command.orientation) {
                addIssue(
                    issues,
                    ValidationLevel.Error,
                    "TP_ENTITY_DESTINATION_HAS_ORIENTATION",
                    "Teleport orientation is only valid with a position destination."
                );
            }
            return issues;
        }

        if (command.destination.kind != MCFunctionAST.TeleportDestinationKind.Position) {
            addIssue(issues, ValidationLevel.Error, "TP_DESTINATION_KIND_INVALID", "Unsupported teleport destination kind.");
            return issues;
        }

        if (!command.destination.position) {
            addIssue(issues, ValidationLevel.Error, "TP_DESTINATION_POSITION_MISSING", "Teleport destination position is missing.");
            return issues;
        }

        appendIssues(issues, validatePosition(command.destination.position));

        if (!command.orientation) {
            return issues;
        }

        if (command.orientation.kind == MCFunctionAST.TeleportOrientationKind.Rotation) {
            if (!command.orientation.rotation) {
                addIssue(issues, ValidationLevel.Error, "TP_ROTATION_MISSING", "Teleport rotation is missing.");
            } else {
                appendIssues(issues, validateRotation(command.orientation.rotation));
            }
        } else if (command.orientation.kind == MCFunctionAST.TeleportOrientationKind.FacingPosition) {
            if (!command.orientation.facingPosition) {
                addIssue(issues, ValidationLevel.Error, "TP_FACING_POSITION_MISSING", "Teleport facing position is missing.");
            } else {
                appendIssues(issues, validatePosition(command.orientation.facingPosition));
            }
        } else if (command.orientation.kind == MCFunctionAST.TeleportOrientationKind.FacingEntity) {
            if (!command.orientation.facingEntity) {
                addIssue(issues, ValidationLevel.Error, "TP_FACING_ENTITY_MISSING", "Teleport facing entity is missing.");
            } else {
                appendIssues(issues, validatePlayerReference(command.orientation.facingEntity, true));
            }
        } else {
            addIssue(issues, ValidationLevel.Error, "TP_ORIENTATION_KIND_INVALID", "Unsupported teleport orientation kind.");
        }

        return issues;
    }

    function hasControlCharacter(value: string): boolean {
        for (let i = 0; i < value.length; i++) {
            let code = value.charCodeAt(i);
            if (code < 32 || code == 127) return true;
        }
        return false;
    }

    function validateSummonOrientation(
        orientation: MCFunctionAST.SummonOrientation,
        issues: ValidationIssue[]
    ): void {
        if (!orientation) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "SUMMON_ORIENTATION_MISSING",
                "SUMMON ADVANCED requires an Orientation reporter. Use no orientation when direction is intentionally omitted."
            );
            return;
        }

        if (orientation.kind == MCFunctionAST.SummonOrientationKind.None) {
            return;
        }

        if (orientation.kind == MCFunctionAST.SummonOrientationKind.Rotation) {
            if (!orientation.rotation) {
                addIssue(
                    issues,
                    ValidationLevel.Error,
                    "SUMMON_ROTATION_MISSING",
                    "Summon rotation is missing."
                );
            } else {
                appendIssues(issues, validateRotation(orientation.rotation));
            }
            return;
        }

        if (orientation.kind == MCFunctionAST.SummonOrientationKind.Facing) {
            if (!orientation.facing) {
                addIssue(
                    issues,
                    ValidationLevel.Error,
                    "SUMMON_FACING_MISSING",
                    "Summon facing target is missing."
                );
                return;
            }

            if (orientation.facing.kind == MCFunctionAST.FacingKind.Position) {
                if (!orientation.facing.position) {
                    addIssue(
                        issues,
                        ValidationLevel.Error,
                        "SUMMON_FACING_POSITION_MISSING",
                        "Summon facing position is missing."
                    );
                } else {
                    appendIssues(issues, validatePosition(orientation.facing.position));
                }
                return;
            }

            if (orientation.facing.kind == MCFunctionAST.FacingKind.Entity) {
                if (!orientation.facing.entitySelector) {
                    addIssue(
                        issues,
                        ValidationLevel.Error,
                        "SUMMON_FACING_ENTITY_MISSING",
                        "Summon facing entity is missing."
                    );
                } else {
                    appendIssues(issues, validateSelector(orientation.facing.entitySelector));
                }
                return;
            }

            addIssue(
                issues,
                ValidationLevel.Error,
                "SUMMON_FACING_KIND_INVALID",
                "Unsupported summon facing kind."
            );
            return;
        }

        addIssue(
            issues,
            ValidationLevel.Error,
            "SUMMON_ORIENTATION_INVALID",
            "Unsupported summon orientation."
        );
    }

    export function validateSummonCommand(
        command: MCFunctionAST.SummonCommand
    ): ValidationIssue[] {
        let issues: ValidationIssue[] = [];

        if (!isSafeIdToken(command.entityId)) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "SUMMON_ENTITY_ID_INVALID",
                "Summon entity ID is empty or contains invalid command characters."
            );
        } else {
            validateEntityRegistryId(command.entityId, issues);
        }

        if (command.nameTag && hasControlCharacter(command.nameTag)) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "SUMMON_NAME_INVALID",
                "Summon name tag cannot contain control characters."
            );
        }

        if (command.form == MCFunctionAST.SummonForm.Simple) {
            if (command.spawnPosition) {
                appendIssues(issues, validatePosition(command.spawnPosition));
            }
            return issues;
        }

        if (command.form != MCFunctionAST.SummonForm.Advanced) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "SUMMON_FORM_INVALID",
                "Unsupported summon form."
            );
            return issues;
        }

        if (!command.spawnPosition) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "SUMMON_POSITION_MISSING",
                "SUMMON ADVANCED requires a spawn position."
            );
        } else {
            appendIssues(issues, validatePosition(command.spawnPosition));
        }

        validateSummonOrientation(command.orientation, issues);

        let hasSpawnEvent = !!command.spawnEvent && command.spawnEvent.length > 0;
        if (
            command.orientation &&
            command.orientation.kind == MCFunctionAST.SummonOrientationKind.None &&
            hasSpawnEvent
        ) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "SUMMON_ORIENTATION_REQUIRED_FOR_EVENT",
                "SUMMON with a spawn event requires an explicit orientation. Choose Rotation, Facing Position, or Facing Entity instead of No Orientation."
            );
        }

        if (command.spawnEvent && command.spawnEvent.length > 0) {
            if (!isSafeIdToken(command.spawnEvent)) {
                addIssue(
                    issues,
                    ValidationLevel.Error,
                    "SUMMON_EVENT_INVALID",
                    "Summon spawn event contains invalid command characters."
                );
            } else {
                appendIssues(
                    issues,
                    validateEntityEventForOwner(command.entityId, command.spawnEvent, true)
                );
            }
        }

        return issues;
    }


    export function validateTagCommand(
        command: MCFunctionAST.TagCommand
    ): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        appendIssues(issues, validateSelector(command.target));

        if (command.action == MCFunctionAST.TagActionKind.List) {
            if (command.name != undefined && command.name.length > 0) {
                addIssue(
                    issues,
                    ValidationLevel.Error,
                    "TAG_LIST_HAS_NAME",
                    "TAG list does not accept a tag name."
                );
            }
            return issues;
        }

        if (
            command.action != MCFunctionAST.TagActionKind.Add &&
            command.action != MCFunctionAST.TagActionKind.Remove
        ) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "TAG_ACTION_INVALID",
                "Unsupported TAG action."
            );
            return issues;
        }

        if (!isSafeIdToken(command.name)) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "TAG_NAME_INVALID",
                "Tag name is empty or contains invalid command characters."
            );
        }

        return issues;
    }

    export function validateGameModeCommand(
        command: MCFunctionAST.GameModeCommand
    ): ValidationIssue[] {
        let issues: ValidationIssue[] = [];

        if (
            command.gameMode != MCFunctionAST.GameMode.Survival &&
            command.gameMode != MCFunctionAST.GameMode.Creative &&
            command.gameMode != MCFunctionAST.GameMode.Adventure &&
            command.gameMode != MCFunctionAST.GameMode.Spectator
        ) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "GAMEMODE_INVALID",
                "Unsupported game mode."
            );
        }

        if (command.target) {
            appendIssues(issues, validateSelector(command.target));
        }

        return issues;
    }

    export function validateKillCommand(
        command: MCFunctionAST.KillCommand
    ): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        if (command.target) {
            appendIssues(issues, validateSelector(command.target));
        }
        return issues;
    }

    export function validateClearCommand(
        command: MCFunctionAST.ClearCommand
    ): ValidationIssue[] {
        let issues: ValidationIssue[] = [];

        if (command.target) {
            appendIssues(issues, validateSelector(command.target));
        }

        if (command.itemId != undefined) {
            if (!isSafeIdToken(command.itemId)) {
                addIssue(
                    issues,
                    ValidationLevel.Error,
                    "CLEAR_ITEM_ID_INVALID",
                    "CLEAR item ID is empty or contains invalid command characters."
                );
            } else {
                validateItemRegistryId(command.itemId, issues);
            }
        } else if (command.data != undefined || command.maxCount != undefined) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "CLEAR_ITEM_REQUIRED",
                "CLEAR item must be present before data or max count."
            );
        }

        if (command.data != undefined && !isIntegerValue(command.data)) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "CLEAR_DATA_NOT_INTEGER",
                "CLEAR data must be an integer."
            );
        }

        if (command.maxCount != undefined && !isIntegerValue(command.maxCount)) {
            addIssue(
                issues,
                ValidationLevel.Error,
                "CLEAR_MAX_COUNT_NOT_INTEGER",
                "CLEAR max count must be an integer."
            );
        }

        return issues;
    }


    /** Camera preset IDs are namespaced resource locations; never sanitize silently. */
    function isCameraPresetId(value: string): boolean {
        if (!value) return false;
        let colon = value.indexOf(":");
        if (colon <= 0 || colon == value.length - 1) return false;
        for (let i = 0; i < value.length; i++) {
            let c = value.charAt(i);
            if (i == colon) continue;
            let allowed = (c >= "a" && c <= "z") || (c >= "0" && c <= "9") ||
                c == "_" || c == "." || c == "-" || (i > colon && c == "/");
            if (!allowed) return false;
        }
        return true;
    }

    /** CAMERA basic: player target, set/clear action, one safe namespaced preset token. */
    function cameraFinite(value: number): boolean {
        return value != undefined && value >= -1e308 && value <= 1e308;
    }
    function validateCameraOffsetNumbers(issues: ValidationIssue[], values: number[]): void {
        for (let i = 0; i < values.length; i++) {
            if (!cameraFinite(values[i])) {
                addIssue(issues, ValidationLevel.Error, "CAMERA_OFFSET_INVALID", "CAMERA offset values must be finite numbers.");
                return;
            }
        }
    }
    function validateCameraEaseValue(ease: MCFunctionAST.CameraEase, issues: ValidationIssue[]): void {
        if (!cameraFinite(ease.seconds) || ease.seconds < 0 ||
            ease.type < 0 || ease.type > 31 || ease.type % 1 != 0) {
            addIssue(issues, ValidationLevel.Error, "CAMERA_EASE_INVALID", "CAMERA ease requires nonnegative finite seconds and a known easing type.");
        }
    }

    export function validateCameraCommand(command: MCFunctionAST.CameraCommand): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        validatePlayerTarget(command.target, "CAMERA", issues);
        if (command.action != MCFunctionAST.CameraAction.Set &&
            command.action != MCFunctionAST.CameraAction.Clear &&
            command.action != MCFunctionAST.CameraAction.Fade &&
            (command.action < MCFunctionAST.CameraAction.Attach || command.action > MCFunctionAST.CameraAction.PlaySpline)) {
            addIssue(issues, ValidationLevel.Error, "CAMERA_ACTION_INVALID", "Unsupported CAMERA action.");
            return issues;
        }
        let hasSetOptions = command.position != undefined || command.rotation != undefined ||
            command.facing != undefined || command.ease != undefined || command.useDefault == true ||
            command.viewOffset != undefined || command.entityOffset != undefined;
        if (command.action == MCFunctionAST.CameraAction.PlaySpline) {
            if (command.presetId != undefined || hasSetOptions || command.fadeTime != undefined ||
                command.fadeColor != undefined || command.entityTarget != undefined || command.fovValue != undefined ||
                command.targetCenterOffset != undefined) {
                addIssue(issues, ValidationLevel.Error, "CAMERA_SPLINE_EXTRA_OPTIONS", "play_spline accepts only a spline name.");
            }
            if (!command.splineName || !command.splineName.trim()) {
                addIssue(issues, ValidationLevel.Error, "CAMERA_SPLINE_NAME_REQUIRED", "play_spline requires a spline name.");
            } else if (command.splineName.indexOf(" ") >= 0 || command.splineName.indexOf("\n") >= 0 ||
                command.splineName.indexOf("\r") >= 0 || command.splineName.indexOf("\t") >= 0) {
                addIssue(issues, ValidationLevel.Error, "CAMERA_SPLINE_NAME_INVALID", "Spline name must be one command token.");
            }
            addIssue(issues, ValidationLevel.Info, "CAMERA_SPLINE_PLATFORM",
                "play_spline requires a registered behavior-pack spline; verify platform/version and experimental requirements.");
            return issues;
        }
        if (command.splineName != undefined) {
            addIssue(issues, ValidationLevel.Error, "CAMERA_SPLINE_UNEXPECTED", "Spline name is only valid for play_spline.");
        }
        if (command.action >= MCFunctionAST.CameraAction.Attach) {
            if (command.presetId != undefined || command.position != undefined || command.rotation != undefined ||
                command.facing != undefined || command.useDefault == true || command.fadeTime != undefined ||
                command.fadeColor != undefined || command.viewOffset != undefined || command.entityOffset != undefined) {
                addIssue(issues, ValidationLevel.Error, "CAMERA_ACTION_EXTRA_OPTIONS", "This CAMERA action cannot contain set/fade options.");
            }
            let needsEntity = command.action == MCFunctionAST.CameraAction.Attach || command.action == MCFunctionAST.CameraAction.TargetEntity;
            if (needsEntity && !command.entityTarget) addIssue(issues, ValidationLevel.Error, "CAMERA_ENTITY_REQUIRED", "An entity target is required.");
            if (!needsEntity && command.entityTarget != undefined) addIssue(issues, ValidationLevel.Error, "CAMERA_ENTITY_UNEXPECTED", "Unexpected entity target.");
            if (command.entityTarget) {
                appendIssues(issues, validateSelector(command.entityTarget));
                addIssue(issues, ValidationLevel.Warning, "CAMERA_ENTITY_SINGLE", "CAMERA entity target must identify one entity.");
            }
            if (command.targetCenterOffset && command.action != MCFunctionAST.CameraAction.TargetEntity) {
                addIssue(issues, ValidationLevel.Error, "CAMERA_TARGET_OFFSET_UNEXPECTED", "Only target_entity accepts target_center_offset.");
            }
            if (command.targetCenterOffset) validateCameraOffsetNumbers(issues,
                [command.targetCenterOffset.x, command.targetCenterOffset.y, command.targetCenterOffset.z]);

            let isFov = command.action == MCFunctionAST.CameraAction.FovSet || command.action == MCFunctionAST.CameraAction.FovClear;
            if (command.action == MCFunctionAST.CameraAction.FovSet) {
                if (!cameraFinite(command.fovValue)) addIssue(issues, ValidationLevel.Error, "CAMERA_FOV_INVALID", "FOV must be a finite number.");
            } else if (command.fovValue != undefined) addIssue(issues, ValidationLevel.Error, "CAMERA_FOV_UNEXPECTED", "Unexpected FOV value.");
            if (!isFov && command.ease != undefined) addIssue(issues, ValidationLevel.Error, "CAMERA_EASE_UNEXPECTED", "Only FOV actions support easing here.");
            if (isFov && command.ease) validateCameraEaseValue(command.ease, issues);
            return issues;
        }
        if (command.action == MCFunctionAST.CameraAction.Fade) {
            if (hasSetOptions || command.presetId != undefined || command.entityTarget != undefined ||
                command.targetCenterOffset != undefined || command.fovValue != undefined) {
                addIssue(issues, ValidationLevel.Error, "CAMERA_FADE_EXTRA_OPTIONS", "CAMERA fade cannot contain set options or a preset.");
            }
            if (command.fadeTime) {
                let times = [command.fadeTime.fadeIn, command.fadeTime.hold, command.fadeTime.fadeOut];
                for (let i = 0; i < times.length; i++) {
                    if (!(times[i] >= 0) || !(times[i] <= 1e308)) {
                        addIssue(issues, ValidationLevel.Error, "CAMERA_FADE_TIME_INVALID", "Fade times must be finite nonnegative seconds.");
                        break;
                    }
                }
            }
            if (command.fadeColor) {
                let colors = [command.fadeColor.red, command.fadeColor.green, command.fadeColor.blue];
                for (let i = 0; i < colors.length; i++) {
                    if (!(colors[i] >= 0 && colors[i] <= 255) || colors[i] % 1 != 0) {
                        addIssue(issues, ValidationLevel.Error, "CAMERA_FADE_COLOR_INVALID", "Fade RGB components must be integers from 0 to 255.");
                        break;
                    }
                }
            }
            return issues;
        }
        if (command.action == MCFunctionAST.CameraAction.Clear) {
            if (hasSetOptions || command.fadeTime != undefined || command.fadeColor != undefined ||
                command.entityTarget != undefined || command.targetCenterOffset != undefined || command.fovValue != undefined) {
                addIssue(issues, ValidationLevel.Error, "CAMERA_CLEAR_EXTRA_OPTIONS",
                    "CAMERA clear cannot include advanced options.");
            }
            if (command.presetId != undefined) {
                addIssue(issues, ValidationLevel.Error, "CAMERA_CLEAR_EXTRA_PRESET",
                    "CAMERA clear cannot include a preset ID.");
            }
            return issues;
        }
        if (command.setOptionSequence != undefined) {
            // The structured SET chain must match one official keyword sequence.
            // Legacy reporters do not carry an order and retain their behavior.
            let expected: MCFunctionAST.CameraSetOptionKind[] = [];
            if (command.ease) expected.push(MCFunctionAST.CameraSetOptionKind.Ease);
            if (command.useDefault) expected.push(MCFunctionAST.CameraSetOptionKind.Default);
            if (command.position) expected.push(MCFunctionAST.CameraSetOptionKind.Position);
            if (command.facing) expected.push(MCFunctionAST.CameraSetOptionKind.Facing);
            if (command.rotation) expected.push(MCFunctionAST.CameraSetOptionKind.Rotation);
            if (command.viewOffset) expected.push(MCFunctionAST.CameraSetOptionKind.ViewOffset);
            if (command.entityOffset) expected.push(MCFunctionAST.CameraSetOptionKind.EntityOffset);
            let actual = command.setOptionSequence;
            let matches = actual.length == expected.length;
            if (matches) for (let i = 0; i < actual.length; i++) {
                if (actual[i] != expected[i]) { matches = false; break; }
            }
            if (!matches) addIssue(issues, ValidationLevel.Error,
                "CAMERA_SET_CHAIN_ORDER", "CAMERA SET options must follow official order, without duplicates or missing inputs.");
            // The modern chain never produces a bare 'ease' clause.
            if (actual.length == 1 && actual[0] == MCFunctionAST.CameraSetOptionKind.Ease)
                addIssue(issues, ValidationLevel.Error,
                    "CAMERA_SET_CHAIN_EASE_ONLY", "CAMERA SET ease needs a following default or camera setting.");
        }
        if (command.fadeTime != undefined || command.fadeColor != undefined) {
            addIssue(issues, ValidationLevel.Error, "CAMERA_SET_FADE_OPTIONS", "CAMERA set cannot use fade options.");
        }
        if (command.useDefault && (command.position || command.rotation || command.facing || command.viewOffset || command.entityOffset)) {
            addIssue(issues, ValidationLevel.Error, "CAMERA_DEFAULT_CONFLICT", "CAMERA default cannot be combined with pos, rot or facing.");
        }
        if (command.facing && command.rotation) {
            addIssue(issues, ValidationLevel.Error, "CAMERA_FACING_ROT_CONFLICT", "CAMERA facing and rot are alternative forms.");
        }
        if (command.facing) {
            if (command.facing.kind == MCFunctionAST.FacingKind.Position && command.facing.position) {
                appendIssues(issues, validatePosition(command.facing.position));
            } else if (command.facing.kind == MCFunctionAST.FacingKind.Entity && command.facing.entitySelector) {
                appendIssues(issues, validateSelector(command.facing.entitySelector));
                if (command.facing.anchor != undefined) addIssue(issues, ValidationLevel.Error,
                    "CAMERA_FACING_ANCHOR_UNSUPPORTED", "CAMERA facing entity has no eyes/feet anchor argument.");
                addIssue(issues, ValidationLevel.Warning, "CAMERA_FACING_ENTITY_SINGLE",
                    "CAMERA facing entity must resolve to a single entity; verify selector count in game.");
            } else addIssue(issues, ValidationLevel.Error, "CAMERA_FACING_INVALID", "CAMERA facing needs a position or an entity.");
        }
        if (command.ease) validateCameraEaseValue(command.ease, issues);
        // Official Stable /camera set grammar has two non-interchangeable branches:
        // position/facing/default OR rotation/offsets. Reject unsupported mixtures.
        if ((command.viewOffset || command.entityOffset) && (command.position || command.facing)) {
            addIssue(issues, ValidationLevel.Error, "CAMERA_SET_BRANCH_CONFLICT",
                "pos/facing cannot be combined with view_offset/entity_offset.");
        }
        if (command.viewOffset) validateCameraOffsetNumbers(issues,
            [command.viewOffset.x, command.viewOffset.y]);
        if (command.entityOffset) validateCameraOffsetNumbers(issues,
            [command.entityOffset.x, command.entityOffset.y, command.entityOffset.z]);
        if (command.entityTarget != undefined || command.targetCenterOffset != undefined || command.fovValue != undefined) {
            addIssue(issues, ValidationLevel.Error, "CAMERA_SET_EXTRA_ACTION_OPTIONS", "CAMERA set does not accept entity tracking or FOV values.");
        }
        if (!isCameraPresetId(command.presetId)) {
            addIssue(issues, ValidationLevel.Error, "CAMERA_PRESET_ID_INVALID",
                "CAMERA preset must be one safe lowercase namespaced ID such as minecraft:free or example:sky.");
        } else if (command.presetId != "minecraft:first_person" &&
            command.presetId != "minecraft:third_person" &&
            command.presetId != "minecraft:third_person_front" &&
            command.presetId != "minecraft:free") {
            addIssue(issues, ValidationLevel.Info, "CAMERA_PRESET_CUSTOM",
                "Custom or version-dependent camera preset; confirm it exists in this world.");
        }
        if (command.position != undefined) {
            appendIssues(issues, validatePosition(command.position));
            let coords = [command.position.x, command.position.y, command.position.z];
            for (let i = 0; i < coords.length; i++) {
                if (coords[i] && ((coords[i].value - coords[i].value) !== 0)) {
                    addIssue(issues, ValidationLevel.Error, "CAMERA_POSITION_NUMBER_INVALID",
                        "CAMERA position coordinates must be finite numbers.");
                    break;
                }
            }
        }
        if (command.rotation != undefined) {
            appendIssues(issues, validateRotation(command.rotation));
            if ((command.rotation.pitch.value - command.rotation.pitch.value) !== 0 || (command.rotation.yaw.value - command.rotation.yaw.value) !== 0) {
                addIssue(issues, ValidationLevel.Error, "CAMERA_ROTATION_NUMBER_INVALID",
                    "CAMERA rotation values must be finite numbers.");
            }
        }
        return issues;
    }

    /** CAMERASHAKE is player-targeted. Validate without normalizing bad values. */
    export function validateCameraShakeCommand(
        command: MCFunctionAST.CameraShakeCommand
    ): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        if (command.action != MCFunctionAST.CameraShakeAction.Add &&
            command.action != MCFunctionAST.CameraShakeAction.Stop) {
            addIssue(issues, ValidationLevel.Error, "CAMERASHAKE_ACTION_INVALID", "CAMERASHAKE action must be add or stop.");
            return issues;
        }
        if (command.action == MCFunctionAST.CameraShakeAction.Add && !command.target) {
            addIssue(issues, ValidationLevel.Error, "CAMERASHAKE_TARGET_REQUIRED", "CAMERASHAKE add requires a player target.");
        }
        if (command.target) {
            appendIssues(issues, validateSelector(command.target));
            if (command.target.base == MCFunctionAST.SelectorBase.AllEntities ||
                command.target.base == MCFunctionAST.SelectorBase.Initiator) {
                addIssue(issues, ValidationLevel.Warning, "CAMERASHAKE_PLAYER_TARGET",
                    "CAMERASHAKE requires players. This selector may select non-player entities or depend on NPC context.");
            }
        }
        if (command.action == MCFunctionAST.CameraShakeAction.Stop) {
            if (command.intensity != undefined || command.seconds != undefined || command.shakeType != undefined) {
                addIssue(issues, ValidationLevel.Error, "CAMERASHAKE_STOP_EXTRA_ARGS",
                    "CAMERASHAKE stop cannot include intensity, seconds, or shake type.");
            }
            return issues;
        }
        if (command.intensity != undefined &&
            (!(command.intensity - command.intensity == 0) || command.intensity < 0 || command.intensity > 4)) {
            addIssue(issues, ValidationLevel.Error, "CAMERASHAKE_INTENSITY_RANGE",
                "CAMERASHAKE intensity must be a finite number from 0 to 4.");
        }
        if (command.seconds != undefined &&
            (!(command.seconds - command.seconds == 0) || command.seconds < 0.01)) {
            addIssue(issues, ValidationLevel.Error, "CAMERASHAKE_SECONDS_RANGE",
                "CAMERASHAKE duration must be a finite number of at least 0.01 seconds.");
        }
        if (command.shakeType != undefined &&
            command.shakeType != MCFunctionAST.CameraShakeType.Positional &&
            command.shakeType != MCFunctionAST.CameraShakeType.Rotational) {
            addIssue(issues, ValidationLevel.Error, "CAMERASHAKE_TYPE_INVALID",
                "CAMERASHAKE type must be positional or rotational.");
        }
        return issues;
    }

    function simpleFiniteInteger(value: number): boolean {
        return value != undefined && value - value == 0 && value == Math.floor(value);
    }
    function validatePlayerTarget(target: MCFunctionAST.Selector, name: string, issues: ValidationIssue[]): void {
        if (!target) {
            addIssue(issues, ValidationLevel.Error, name + "_TARGET_REQUIRED", name + " requires a target.");
            return;
        }
        appendIssues(issues, validateSelector(target));
        if (target.base == MCFunctionAST.SelectorBase.AllEntities ||
            target.base == MCFunctionAST.SelectorBase.Initiator) {
            addIssue(issues, ValidationLevel.Warning, name + "_PLAYER_SELECTOR",
                name + " expects a player target; chosen selector may include nonplayers or require special context.");
        }
    }
    export function validateTellCommand(command: MCFunctionAST.TellCommand): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        validatePlayerTarget(command.target, "TELL", issues);
        if (!command.message || command.message.length == 0 || command.message.indexOf("\n") >= 0 ||
            command.message.indexOf("\r") >= 0) {
            addIssue(issues, ValidationLevel.Error, "TELL_MESSAGE_INVALID", "TELL message must be one nonempty line.");
        }
        return issues;
    }
    export function validateTimeCommand(command: MCFunctionAST.TimeCommand): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        if (command.action == MCFunctionAST.TimeAction.SetPreset) {
            if (command.preset == undefined || command.preset < 0 || command.preset > 5 ||
                command.preset != Math.floor(command.preset))
                addIssue(issues, ValidationLevel.Error, "TIME_PRESET_INVALID", "Invalid time preset.");
        } else if (command.action == MCFunctionAST.TimeAction.SetTicks || command.action == MCFunctionAST.TimeAction.AddTicks) {
            if (!simpleFiniteInteger(command.ticks))
                addIssue(issues, ValidationLevel.Error, "TIME_TICKS_INTEGER", "Time ticks must be an integer.");
        } else if (command.action == MCFunctionAST.TimeAction.Query) {
            if (command.queryKind == undefined || command.queryKind < 0 || command.queryKind > 2 ||
                command.queryKind != Math.floor(command.queryKind)) {
                addIssue(issues, ValidationLevel.Error, "TIME_QUERY_KIND_INVALID", "TIME QUERY requires daytime, gametime or day.");
            }
        } else addIssue(issues, ValidationLevel.Error, "TIME_ACTION_INVALID", "Invalid time action.");
        return issues;
    }
    export function validateWeatherCommand(command: MCFunctionAST.WeatherCommand): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        if (command.weather < 0 || command.weather > 2 || command.weather != Math.floor(command.weather))
            addIssue(issues, ValidationLevel.Error, "WEATHER_TYPE_INVALID", "Invalid weather type.");
        if (command.duration != undefined && (!simpleFiniteInteger(command.duration) || command.duration < 0))
            addIssue(issues, ValidationLevel.Error, "WEATHER_DURATION_INVALID", "Weather duration must be a nonnegative integer in seconds.");
        return issues;
    }
    export function validateDifficultyCommand(command: MCFunctionAST.DifficultyCommand): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        if (command.difficulty < 0 || command.difficulty > 3 || command.difficulty != Math.floor(command.difficulty))
            addIssue(issues, ValidationLevel.Error, "DIFFICULTY_INVALID", "Invalid difficulty enum.");
        return issues;
    }
    export function validateHudCommand(command: MCFunctionAST.HudCommand): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        validatePlayerTarget(command.target, "HUD", issues);
        if (command.visibility != MCFunctionAST.HudVisibility.Hide && command.visibility != MCFunctionAST.HudVisibility.Reset)
            addIssue(issues, ValidationLevel.Error, "HUD_VISIBILITY_INVALID", "Invalid HUD visibility.");
        if (command.element != undefined && (command.element < 0 || command.element > 13 ||
            command.element != Math.floor(command.element)))
            addIssue(issues, ValidationLevel.Error, "HUD_ELEMENT_INVALID", "Invalid HUD element.");
        return issues;
    }
    export function validateInputPermissionCommand(command: MCFunctionAST.InputPermissionCommand): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        validatePlayerTarget(command.target, "INPUTPERMISSION", issues);
        if (command.permission < 0 || command.permission > 10 || command.permission != Math.floor(command.permission))
            addIssue(issues, ValidationLevel.Error, "INPUTPERMISSION_TYPE_INVALID", "Invalid permission.");
        if (command.state != MCFunctionAST.InputPermissionState.Enabled &&
            command.state != MCFunctionAST.InputPermissionState.Disabled)
            addIssue(issues, ValidationLevel.Error, "INPUTPERMISSION_STATE_INVALID", "Invalid state.");
        return issues;
    }

    /** Shared player target: retain a structured Selector or a literal player name. */
    export function validatePlayerReference(target: MCFunctionAST.PlayerTarget,
        allowEntitySelectors?: boolean): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        if (!target) {
            addIssue(issues, ValidationLevel.Error, "PLAYER_TARGET_MISSING", "Player target is required.");
            return issues;
        }
        if (target.kind == MCFunctionAST.PlayerTargetKind.Selector) {
            if (!target.selector || target.name != undefined) {
                addIssue(issues, ValidationLevel.Error, "PLAYER_TARGET_SELECTOR_INVALID", "Selector player target must contain only a Selector.");
            } else {
                appendIssues(issues, validateSelector(target.selector));
                if ((target.selector.base == MCFunctionAST.SelectorBase.AllEntities && !allowEntitySelectors) ||
                    target.selector.base == MCFunctionAST.SelectorBase.Initiator) {
                    addIssue(issues, ValidationLevel.Warning, "PLAYER_TARGET_SELECTOR_CONTEXT", "The selector must resolve to players and may need a special execution context.");
                }
            }
        } else if (target.kind == MCFunctionAST.PlayerTargetKind.Name) {
            if (target.selector != undefined || !target.name || target.name.trim().length == 0) {
                addIssue(issues, ValidationLevel.Error, "PLAYER_TARGET_NAME_INVALID", "A named player target requires a nonempty name and no Selector.");
            } else if (target.name.indexOf("\n") >= 0 || target.name.indexOf("\r") >= 0) {
                addIssue(issues, ValidationLevel.Error, "PLAYER_TARGET_NAME_LINE_BREAK", "Player names cannot contain line breaks.");
            } else if (target.name.charAt(0) == "@") {
                addIssue(issues, ValidationLevel.Error, "PLAYER_TARGET_USE_SELECTOR", "Use a Selector block for @a, @p, @s, and other selectors.");
            }
        } else {
            addIssue(issues, ValidationLevel.Error, "PLAYER_TARGET_KIND_INVALID", "Unknown player target type.");
        }
        return issues;
    }

    export function validateSpawnPointCommand(command: MCFunctionAST.SpawnPointCommand): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        if (command.mode != MCFunctionAST.SpawnPointMode.Default &&
            command.mode != MCFunctionAST.SpawnPointMode.TargetCurrent &&
            command.mode != MCFunctionAST.SpawnPointMode.TargetAt) {
            addIssue(issues, ValidationLevel.Error, "SPAWNPOINT_MODE_INVALID", "Unknown spawnpoint form.");
        }
        if (command.mode == MCFunctionAST.SpawnPointMode.Default) {
            if (command.target || command.position) {
                addIssue(issues, ValidationLevel.Error, "SPAWNPOINT_DEFAULT_EXTRA", "Default spawnpoint takes no target or position.");
            }
        } else {
            appendIssues(issues, validatePlayerReference(command.target));
        }
        if (command.mode == MCFunctionAST.SpawnPointMode.TargetCurrent && command.position) {
            addIssue(issues, ValidationLevel.Error, "SPAWNPOINT_UNEXPECTED_POSITION", "Target-current spawnpoint cannot include a position.");
        }
        if (command.mode == MCFunctionAST.SpawnPointMode.TargetAt && !command.position) {
            addIssue(issues, ValidationLevel.Error, "SPAWNPOINT_POSITION_REQUIRED", "A position is required for this spawnpoint form.");
        }
        if (command.position) appendIssues(issues, validatePosition(command.position));
        return issues;
    }

    export function validateSetWorldSpawnCommand(command: MCFunctionAST.SetWorldSpawnCommand): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        if (command.mode == MCFunctionAST.SetWorldSpawnMode.Current) {
            if (command.position) addIssue(issues, ValidationLevel.Error, "SETWORLDSPAWN_UNEXPECTED_POSITION", "Current-position form takes no position.");
        } else if (command.mode == MCFunctionAST.SetWorldSpawnMode.At) {
            if (!command.position) addIssue(issues, ValidationLevel.Error, "SETWORLDSPAWN_POSITION_REQUIRED", "A position is required for this form.");
        } else {
            addIssue(issues, ValidationLevel.Error, "SETWORLDSPAWN_MODE_INVALID", "Unknown setworldspawn form.");
        }
        if (command.position) appendIssues(issues, validatePosition(command.position));
        return issues;
    }

    export function validateClearSpawnPointCommand(command: MCFunctionAST.ClearSpawnPointCommand): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        if (command.mode == MCFunctionAST.ClearSpawnPointMode.Default) {
            if (command.target) {
                addIssue(issues, ValidationLevel.Error, "CLEARSPAWNPOINT_DEFAULT_EXTRA", "Default clearspawnpoint takes no target.");
            }
            // Bedrock/Education accepts this in chat, but command blocks require a target.
            addIssue(issues, ValidationLevel.Warning, "CLEARSPAWNPOINT_CONTEXT_TARGET", "Specify a player target when running clearspawnpoint from a command block.");
        } else if (command.mode == MCFunctionAST.ClearSpawnPointMode.Target) {
            appendIssues(issues, validatePlayerReference(command.target));
        } else {
            addIssue(issues, ValidationLevel.Error, "CLEARSPAWNPOINT_MODE_INVALID", "Unknown clearspawnpoint form.");
        }
        return issues;
    }

    export function validateCommand(command: MCFunctionAST.CommandNode): ValidationIssue[] {
        let issues: ValidationIssue[] = [];

        if (command.kind == MCFunctionAST.CommandKind.SpawnPoint) {
            appendIssues(issues, validateSpawnPointCommand(<MCFunctionAST.SpawnPointCommand>command));
        }
        if (command.kind == MCFunctionAST.CommandKind.SetWorldSpawn) {
            appendIssues(issues, validateSetWorldSpawnCommand(<MCFunctionAST.SetWorldSpawnCommand>command));
        }
        if (command.kind == MCFunctionAST.CommandKind.ClearSpawnPoint) {
            appendIssues(issues, validateClearSpawnPointCommand(<MCFunctionAST.ClearSpawnPointCommand>command));
        }

        if (command.kind == MCFunctionAST.CommandKind.Raw) {
            let raw = <MCFunctionAST.RawCommand>command;
            if (!raw.raw || raw.raw.length == 0) {
                addIssue(issues, ValidationLevel.Error, "RAW_EMPTY_COMMAND", "RAW COMMAND cannot be empty.");
            }
        }

        if (command.kind == MCFunctionAST.CommandKind.Say) {
            let say = <MCFunctionAST.SayCommand>command;
            if (!say.message || say.message.length == 0) {
                addIssue(issues, ValidationLevel.Error, "SAY_EMPTY_MESSAGE", "SAY message cannot be empty.");
            }
        }

        if (command.kind == MCFunctionAST.CommandKind.McFunction) {
            let fn = <MCFunctionAST.McFunctionCommand>command;
            if (!fn.functionId || fn.functionId.length == 0) {
                addIssue(issues, ValidationLevel.Error, "FUNCTION_EMPTY_ID", "Function ID cannot be empty.");
            }
        }

        if (command.kind == MCFunctionAST.CommandKind.Enchant) {
            appendIssues(issues, validateEnchantCommand(<MCFunctionAST.EnchantCommand>command));
        }
        if (command.kind == MCFunctionAST.CommandKind.Camera) {
            appendIssues(issues, validateCameraCommand(<MCFunctionAST.CameraCommand>command));
        }
        if (command.kind == MCFunctionAST.CommandKind.CameraShake) {
            appendIssues(issues, validateCameraShakeCommand(<MCFunctionAST.CameraShakeCommand>command));
        }
        if (command.kind == MCFunctionAST.CommandKind.Tell) {
            appendIssues(issues, validateTellCommand(<MCFunctionAST.TellCommand>command));
        }
        if (command.kind == MCFunctionAST.CommandKind.Time) {
            appendIssues(issues, validateTimeCommand(<MCFunctionAST.TimeCommand>command));
        }
        if (command.kind == MCFunctionAST.CommandKind.Weather) {
            appendIssues(issues, validateWeatherCommand(<MCFunctionAST.WeatherCommand>command));
        }
        if (command.kind == MCFunctionAST.CommandKind.Difficulty) {
            appendIssues(issues, validateDifficultyCommand(<MCFunctionAST.DifficultyCommand>command));
        }
        if (command.kind == MCFunctionAST.CommandKind.Hud) {
            appendIssues(issues, validateHudCommand(<MCFunctionAST.HudCommand>command));
        }
        if (command.kind == MCFunctionAST.CommandKind.InputPermission) {
            appendIssues(issues, validateInputPermissionCommand(<MCFunctionAST.InputPermissionCommand>command));
        }
        if (command.kind == MCFunctionAST.CommandKind.Gamerule) {
            appendIssues(issues, validateGameRuleCommand(<MCFunctionAST.GameRuleCommand>command));
        }
        if (command.kind == MCFunctionAST.CommandKind.PlaySound) {
            appendIssues(issues, validatePlaySoundCommand(<MCFunctionAST.PlaySoundCommand>command));
        }
        if (command.kind == MCFunctionAST.CommandKind.StopSound) {
            appendIssues(issues, validateStopSoundCommand(<MCFunctionAST.StopSoundCommand>command));
        }
        if (command.kind == MCFunctionAST.CommandKind.Music) {
            appendIssues(issues, validateMusicCommand(<MCFunctionAST.MusicCommand>command));
        }
        if (command.kind == MCFunctionAST.CommandKind.Particle) {
            appendIssues(issues, validateParticleCommand(<MCFunctionAST.ParticleCommand>command));
        }

        if (command.kind == MCFunctionAST.CommandKind.Give) {
            appendIssues(issues, validateGiveCommand(<MCFunctionAST.GiveCommand>command));
        }

        if (command.kind == MCFunctionAST.CommandKind.Teleport) {
            appendIssues(issues, validateTeleportCommand(<MCFunctionAST.TeleportCommand>command));
        }

        if (command.kind == MCFunctionAST.CommandKind.Summon) {
            appendIssues(issues, validateSummonCommand(<MCFunctionAST.SummonCommand>command));
        }

        if (command.kind == MCFunctionAST.CommandKind.Effect) {
            appendIssues(issues, validateEffectCommand(<MCFunctionAST.EffectCommand>command));
        }

        if (command.kind == MCFunctionAST.CommandKind.Tag) {
            appendIssues(issues, validateTagCommand(<MCFunctionAST.TagCommand>command));
        }

        if (command.kind == MCFunctionAST.CommandKind.GameMode) {
            appendIssues(issues, validateGameModeCommand(<MCFunctionAST.GameModeCommand>command));
        }

        if (command.kind == MCFunctionAST.CommandKind.Kill) {
            appendIssues(issues, validateKillCommand(<MCFunctionAST.KillCommand>command));
        }

        if (command.kind == MCFunctionAST.CommandKind.Clear) {
            appendIssues(issues, validateClearCommand(<MCFunctionAST.ClearCommand>command));
        }

        if (command.kind == MCFunctionAST.CommandKind.SetBlock) {
            appendIssues(issues, validateSetBlockCommand(<MCFunctionAST.SetBlockCommand>command));
        }

        if (command.kind == MCFunctionAST.CommandKind.Fill) {
            appendIssues(issues, validateFillCommand(<MCFunctionAST.FillCommand>command));
        }

        if (command.kind == MCFunctionAST.CommandKind.Clone) {
            appendIssues(issues, validateCloneCommand(<MCFunctionAST.CloneCommand>command));
        }

        return issues;
    }

    export function hasError(issues: ValidationIssue[]): boolean {
        for (let i = 0; i < issues.length; i++) {
            if (issues[i].level == ValidationLevel.Error) return true;
        }
        return false;
    }
}
