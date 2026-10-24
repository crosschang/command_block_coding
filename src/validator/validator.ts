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
            addIssue(issues, ValidationLevel.Warning, "CLEARSPAWNPOINT_CONTEXT_TARGET", "Omitted target clears the executing player in chat; command blocks require a target. Verify Preview separately.");
        } else if (command.mode == MCFunctionAST.ClearSpawnPointMode.Target) {
            appendIssues(issues, validatePlayerReference(command.target));
        } else {
            addIssue(issues, ValidationLevel.Error, "CLEARSPAWNPOINT_MODE_INVALID", "Unknown clearspawnpoint form.");
        }
        return issues;
    }

    function isB4SingleLineString(value: string): boolean {
        if (!value || value.trim().length == 0) return false;
        for (let i = 0; i < value.length; i++) {
            let c = value.charCodeAt(i);
            if (c < 32 || c == 127) return false;
        }
        return true;
    }
    /** B4: resource-pack-dependent IDs are validated syntactically, not whitelisted. */
    export function validatePlayAnimationCommand(command: MCFunctionAST.PlayAnimationCommand): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        appendIssues(issues, validatePlayerReference(command.target, true));
        if (!isB4SingleLineString(command.animationId)) {
            addIssue(issues, ValidationLevel.Error, "PLAYANIMATION_ID_INVALID",
                "Animation ID must be a nonempty single-line string.");
        }
        if (command.nextState != undefined && !isB4SingleLineString(command.nextState)) {
            addIssue(issues, ValidationLevel.Error, "PLAYANIMATION_NEXT_STATE_INVALID",
                "Next state must be a nonempty single-line string.");
        }
        if (command.blendOutTime != undefined) {
            if (command.nextState == undefined) addIssue(issues, ValidationLevel.Error,
                "PLAYANIMATION_NEXT_STATE_REQUIRED", "Blend time requires next state first.");
            if (command.blendOutTime - command.blendOutTime != 0 || command.blendOutTime < 0) {
                addIssue(issues, ValidationLevel.Error, "PLAYANIMATION_BLEND_INVALID",
                    "Blend out time must be a finite nonnegative number.");
            }
        }
        if (command.stopExpression != undefined) {
            if (command.blendOutTime == undefined) addIssue(issues, ValidationLevel.Error,
                "PLAYANIMATION_BLEND_REQUIRED", "Stop expression requires blend time first.");
            if (command.stopExpression.length == 0 ||
                command.stopExpression.indexOf("\n") >= 0 || command.stopExpression.indexOf("\r") >= 0) {
                addIssue(issues, ValidationLevel.Error, "PLAYANIMATION_STOP_INVALID",
                    "Stop expression must be a nonempty single-line Molang expression.");
            }
        }
        if (command.controllerId != undefined) {
            if (command.stopExpression == undefined) addIssue(issues, ValidationLevel.Error,
                "PLAYANIMATION_STOP_REQUIRED", "Controller requires preceding stop expression.");
            if (!isB4SingleLineString(command.controllerId)) addIssue(issues, ValidationLevel.Error,
                "PLAYANIMATION_CONTROLLER_INVALID", "Controller must be a nonempty single-line string.");
        }
        if (command.animationId && command.animationId.length > 0) {
            addIssue(issues, ValidationLevel.Info, "PLAYANIMATION_RESOURCE_DEPENDENT",
                "Animation playback depends on the target entity and installed resource packs.");
        }
        return issues;
    }
    export function validateFogCommand(command: MCFunctionAST.FogCommand): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        appendIssues(issues, validatePlayerReference(command.target));
        if (command.action != MCFunctionAST.FogAction.Push &&
            command.action != MCFunctionAST.FogAction.Pop &&
            command.action != MCFunctionAST.FogAction.Remove) {
            addIssue(issues, ValidationLevel.Error, "FOG_ACTION_INVALID", "Unknown fog mode.");
        }
        if (!isSafeCommandId(command.userProvidedId)) {
            addIssue(issues, ValidationLevel.Error, "FOG_USER_ID_INVALID",
                "User-provided fog stack ID must be a safe nonempty token.");
        }
        if (command.action == MCFunctionAST.FogAction.Push) {
            if (!isSafeCommandId(command.fogId)) addIssue(issues, ValidationLevel.Error,
                "FOG_RESOURCE_ID_INVALID", "Push requires a valid fog resource ID.");
            else addIssue(issues, ValidationLevel.Info, "FOG_RESOURCE_DEPENDENT",
                "Fog resource ID must exist in the active resource packs; Preview cannot prove visibility.");
        } else if (command.fogId != undefined) {
            addIssue(issues, ValidationLevel.Error, "FOG_UNEXPECTED_RESOURCE_ID",
                "Pop/remove take only the user-provided stack ID, not a fog resource ID.");
        }
        return issues;
    }

    /** B3: /damage accepts an integer amount and a fixed Bedrock cause enum. */
    export function validateDamageCommand(command: MCFunctionAST.DamageCommand): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        appendIssues(issues, validatePlayerReference(command.target, true));
        if (command.amount == undefined || command.amount - command.amount != 0 ||
            Math.floor(command.amount) != command.amount || command.amount < 0) {
            addIssue(issues, ValidationLevel.Error, "DAMAGE_AMOUNT_INVALID",
                "DAMAGE amount must be a non-negative integer.");
        }
        let validCauses = ["piston", "lava", "campfire", "fire", "anvil", "magma",
            "soul_campfire", "wither", "falling_block", "fireworks", "thorns",
            "none", "contact", "sonic_boom", "override", "entity_attack",
            "projectile", "suffocation", "mace_smash", "fall", "starve",
            "ram_attack", "fire_tick", "stalactite", "drowning",
            "block_explosion", "entity_explosion", "void", "self_destruct",
            "magic", "charging", "stalagmite", "fly_into_wall",
            "lightning", "freezing", "temperature"];
        if (command.cause != undefined && validCauses.indexOf(command.cause) < 0) {
            addIssue(issues, ValidationLevel.Error, "DAMAGE_CAUSE_INVALID",
                "DAMAGE cause must be a known Bedrock damagecause value.");
        }
        if (command.action == MCFunctionAST.DamageAction.Apply) {
            if (command.damager) addIssue(issues, ValidationLevel.Error,
                "DAMAGE_UNEXPECTED_DAMAGER", "Basic DAMAGE cannot include a damager.");
        } else if (command.action == MCFunctionAST.DamageAction.FromEntity) {
            if (command.cause == undefined) addIssue(issues, ValidationLevel.Error,
                "DAMAGE_SOURCE_CAUSE_REQUIRED", "Damage attributed to an entity requires a cause.");
            appendIssues(issues, validatePlayerReference(command.damager, true));
            addIssue(issues, ValidationLevel.Info, "DAMAGE_SOURCE_EDUCATION_SYNTAX_UNVERIFIED",
                "Source form uses 'entity <damager>' from earlier Bedrock documentation; Education 26.32 autocomplete verification remains pending.");
        } else {
            addIssue(issues, ValidationLevel.Error, "DAMAGE_ACTION_INVALID", "Unknown DAMAGE form.");
        }
        return issues;
    }

    /** PXT-safe ID check. A literal command token may not inject whitespace. */
    function isSafeCommandId(value: string): boolean {
        if (!value || value.length == 0) return false;
        for (let i = 0; i < value.length; i++) {
            let c = value.charCodeAt(i);
            let valid = (c >= 48 && c <= 57) || (c >= 65 && c <= 90) ||
                (c >= 97 && c <= 122) || c == 95 || c == 58 ||
                c == 46 || c == 47 || c == 45;
            if (!valid) return false;
        }
        return true;
    }

    /** B3 event IDs may come from add-ons. Owner metadata is advisory only. */
    export function validateEventCommand(command: MCFunctionAST.EventCommand): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        appendIssues(issues, validatePlayerReference(command.target, true));
        if (!isSafeCommandId(command.eventId)) {
            addIssue(issues, ValidationLevel.Error, "EVENT_ID_INVALID",
                "EVENT needs a nonempty ID without spaces or command control characters.");
        }
        if (command.ownerEntityId != undefined && command.ownerEntityId.length > 0) {
            if (!isSafeCommandId(command.ownerEntityId)) {
                addIssue(issues, ValidationLevel.Error, "EVENT_OWNER_HINT_INVALID",
                    "Owner hint must be a valid entity identifier.");
            } else if (!MCFunctionEntityEventRegistry.hasOwnerData(command.ownerEntityId)) {
                addIssue(issues, ValidationLevel.Info, "EVENT_OWNER_CUSTOM",
                    "Owner is absent from current vanilla metadata; custom/add-on events remain allowed.");
            } else if (command.eventId && !MCFunctionEntityEventRegistry.isDefinedForOwner(
                    command.ownerEntityId, command.eventId)) {
                addIssue(issues, ValidationLevel.Warning, "EVENT_OWNER_EVENT_UNLISTED",
                    "EVENT ID is not listed for this owner in current vanilla metadata. Custom or other-version events may still work.");
            }
        } else {
            addIssue(issues, ValidationLevel.Info, "EVENT_OWNER_NOT_VERIFIED",
                "EVENT validity depends on the entity type. An optional owner hint enables Registry checks.");
        }
        return issues;
    }

    /** C1 /controlscheme is legal only with camera-compatible schemes. */
    export function validateControlSchemeCommand(command: MCFunctionAST.ControlSchemeCommand): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        appendIssues(issues, validatePlayerReference(command.target));
        if (command.action == MCFunctionAST.ControlSchemeAction.Clear) {
            if (command.scheme != undefined) addIssue(issues, ValidationLevel.Error,
                "CONTROLSCHEME_CLEAR_EXTRA", "Clear cannot specify a scheme.");
        } else if (command.action == MCFunctionAST.ControlSchemeAction.Set) {
            if (command.scheme == undefined || command.scheme < 0 || command.scheme > 4 ||
                command.scheme != Math.floor(command.scheme)) {
                addIssue(issues, ValidationLevel.Error, "CONTROLSCHEME_SCHEME_INVALID",
                    "Choose a supported control scheme.");
            } else {
                addIssue(issues, ValidationLevel.Info, "CONTROLSCHEME_CAMERA_COMPATIBILITY",
                    "Control scheme depends on the current camera. Test player_relative or camera_relative after camera @s set minecraft:free; default first/third-person cameras only permit locked_player_relative_strafe. Preview cannot confirm movement.");
            }
        } else {
            addIssue(issues, ValidationLevel.Error, "CONTROLSCHEME_ACTION_INVALID", "Unknown control scheme action.");
        }
        return issues;
    }

    /** C1 angles 10-90 and max distance 1-16, per official Aim Assist guide. */
    export function validateAimAssistCommand(command: MCFunctionAST.AimAssistCommand): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        appendIssues(issues, validatePlayerReference(command.target));
        let hasAny = command.xAngle != undefined || command.yAngle != undefined ||
            command.maxDistance != undefined || command.targetMode != undefined || command.presetId != undefined;
        if (command.action == MCFunctionAST.AimAssistAction.Clear) {
            if (hasAny) addIssue(issues, ValidationLevel.Error,
                "AIMASSIST_CLEAR_EXTRA", "Clear cannot include set options.");
        } else if (command.action == MCFunctionAST.AimAssistAction.Set) {
            let hasSettings = command.xAngle != undefined || command.yAngle != undefined ||
                command.maxDistance != undefined || command.targetMode != undefined;
            if (hasSettings && (command.xAngle == undefined || command.yAngle == undefined ||
                command.maxDistance == undefined || command.targetMode == undefined)) {
                addIssue(issues, ValidationLevel.Error, "AIMASSIST_SETTINGS_INCOMPLETE",
                    "This block requires X angle, Y angle, distance, and target mode together.");
            }
            if (command.xAngle != undefined && (command.xAngle - command.xAngle != 0 ||
                command.xAngle < 10 || command.xAngle > 90)) {
                addIssue(issues, ValidationLevel.Error, "AIMASSIST_X_ANGLE_RANGE",
                    "Horizontal angle must be between 10 and 90 degrees.");
            }
            if (command.yAngle != undefined && (command.yAngle - command.yAngle != 0 ||
                command.yAngle < 10 || command.yAngle > 90)) {
                addIssue(issues, ValidationLevel.Error, "AIMASSIST_Y_ANGLE_RANGE",
                    "Vertical angle must be between 10 and 90 degrees.");
            }
            if (command.maxDistance != undefined && (command.maxDistance - command.maxDistance != 0 ||
                command.maxDistance < 1 || command.maxDistance > 16)) {
                addIssue(issues, ValidationLevel.Error, "AIMASSIST_DISTANCE_RANGE",
                    "Maximum target distance must be between 1 and 16 blocks.");
            }
            if (command.targetMode != undefined && command.targetMode != MCFunctionAST.AimAssistTargetMode.Distance &&
                command.targetMode != MCFunctionAST.AimAssistTargetMode.Angle) {
                addIssue(issues, ValidationLevel.Error, "AIMASSIST_TARGET_MODE_INVALID",
                    "AIMASSIST target mode must be distance or angle.");
            }
            if (command.presetId != undefined && command.presetId.length > 0 &&
                !isSafeCommandId(command.presetId)) {
                addIssue(issues, ValidationLevel.Error, "AIMASSIST_PRESET_ID_INVALID",
                    "Preset ID cannot contain spaces or command control characters.");
            }
            addIssue(issues, ValidationLevel.Info, "AIMASSIST_CAMERA_CONTEXT",
                "Target selection is based on player facing, and third-person camera behavior must be checked in game.");
        } else {
            addIssue(issues, ValidationLevel.Error, "AIMASSIST_ACTION_INVALID", "Unknown AIMASSIST action.");
        }
        return issues;
    }

    /** One command token; accept custom IDs, but reject argument injection. */
    function c1Token(value: string): boolean { return isSafeCommandId(value); }
    function c1OptionalName(value: string): boolean {
        return value != undefined && value.length > 0 &&
            value.indexOf("\r") < 0 && value.indexOf("\n") < 0;
    }
    function c1NoExtraRide(cmd: MCFunctionAST.RideCommand): boolean {
        return cmd.mount == undefined && cmd.entityType == undefined &&
            cmd.teleportRule == undefined && cmd.fillType == undefined &&
            cmd.rideRule == undefined && cmd.spawnEvent == undefined && cmd.nameTag == undefined;
    }
    export function validateRideCommand(cmd: MCFunctionAST.RideCommand): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        appendIssues(issues, validatePlayerReference(cmd.actor, true));
        if (cmd.action == MCFunctionAST.RideAction.StartRiding) {
            appendIssues(issues, validatePlayerReference(cmd.mount, true));
            if (cmd.entityType != undefined || cmd.rideRule != undefined ||
                cmd.spawnEvent != undefined || cmd.nameTag != undefined) {
                addIssue(issues, ValidationLevel.Error, "RIDE_START_EXTRA", "start_riding takes two targets and optional teleport/fill rules only.");
            }
            if (cmd.teleportRule != undefined &&
                cmd.teleportRule != MCFunctionAST.RideTeleportRule.TeleportRider &&
                cmd.teleportRule != MCFunctionAST.RideTeleportRule.TeleportRide) {
                addIssue(issues, ValidationLevel.Error, "RIDE_TELEPORT_RULE_INVALID", "Unknown teleport rule.");
            }
            if (cmd.fillType != undefined &&
                cmd.fillType != MCFunctionAST.RideFillType.UntilFull &&
                cmd.fillType != MCFunctionAST.RideFillType.IfGroupFits) {
                addIssue(issues, ValidationLevel.Error, "RIDE_FILL_RULE_INVALID", "Unknown fill rule.");
            }
            if (cmd.fillType != undefined && cmd.teleportRule == undefined) {
                addIssue(issues, ValidationLevel.Error, "RIDE_FILL_REQUIRES_TELEPORT_RULE", "Supply teleportRule before fillType in the positional command.");
            }
        } else if (cmd.action == MCFunctionAST.RideAction.StopRiding ||
                   cmd.action == MCFunctionAST.RideAction.EvictRiders) {
            if (!c1NoExtraRide(cmd)) {
                addIssue(issues, ValidationLevel.Error, "RIDE_NO_ARGUMENT_ACTION_EXTRA", "stop_riding and evict_riders cannot take extra parameters.");
            }
        } else if (cmd.action == MCFunctionAST.RideAction.SummonRider ||
                   cmd.action == MCFunctionAST.RideAction.SummonRide) {
            if (cmd.mount != undefined || cmd.teleportRule != undefined || cmd.fillType != undefined) {
                addIssue(issues, ValidationLevel.Error, "RIDE_SUMMON_EXTRA", "Summon forms cannot take start_riding arguments.");
            }
            if (!c1Token(cmd.entityType)) {
                addIssue(issues, ValidationLevel.Error, "RIDE_ENTITY_ID_INVALID", "Summoned entity type must be a safe ID token.");
            }
            if (cmd.action == MCFunctionAST.RideAction.SummonRider && cmd.rideRule != undefined) {
                addIssue(issues, ValidationLevel.Error, "RIDE_RIDER_RULE_UNEXPECTED", "summon_rider does not take rideRules.");
            }
            if (cmd.rideRule != undefined &&
                cmd.rideRule != MCFunctionAST.RideSummonRule.NoRideChange &&
                cmd.rideRule != MCFunctionAST.RideSummonRule.ReassignRides &&
                cmd.rideRule != MCFunctionAST.RideSummonRule.SkipRiders) {
                addIssue(issues, ValidationLevel.Error, "RIDE_SUMMON_RULE_INVALID", "Unknown rideRules enum.");
            }
            if (cmd.spawnEvent != undefined && !c1Token(cmd.spawnEvent)) {
                addIssue(issues, ValidationLevel.Error, "RIDE_SPAWN_EVENT_INVALID", "Spawn event must be a safe single token.");
            }
            if (cmd.nameTag != undefined && !c1OptionalName(cmd.nameTag)) {
                addIssue(issues, ValidationLevel.Error, "RIDE_NAME_INVALID", "Name tag must be a nonempty single-line string.");
            }
            if (cmd.nameTag != undefined && cmd.spawnEvent == undefined) {
                addIssue(issues, ValidationLevel.Error, "RIDE_NAME_REQUIRES_EVENT", "Supply spawnEvent before nameTag in the positional command.");
            }
            if (cmd.action == MCFunctionAST.RideAction.SummonRide &&
                cmd.spawnEvent != undefined && cmd.rideRule == undefined) {
                addIssue(issues, ValidationLevel.Error, "RIDE_EVENT_REQUIRES_RULE", "Supply rideRules before spawnEvent in summon_ride.");
            }
        } else {
            addIssue(issues, ValidationLevel.Error, "RIDE_ACTION_INVALID", "Unknown ride command action.");
        }
        addIssue(issues, ValidationLevel.Info, "RIDE_CAPACITY_GAME_DEPENDENT",
            "Valid command syntax does not guarantee an entity can ride: seat/capacity/rideable rules and Education runtime vary.");
        return issues;
    }
    export function validateDialogueCommand(cmd: MCFunctionAST.DialogueCommand): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        appendIssues(issues, validatePlayerReference(cmd.npc, true));
        // Official DIALOGUE grammar requires an NPC entity selector, not a player name.
        if (cmd.npc && cmd.npc.kind == MCFunctionAST.PlayerTargetKind.Name) {
            addIssue(issues, ValidationLevel.Error, "DIALOGUE_NPC_SELECTOR_REQUIRED",
                "NPC must be an entity selector (for example @e[type=npc]), not a player name.");
        }
        if (cmd.npc && cmd.npc.kind == MCFunctionAST.PlayerTargetKind.Selector && cmd.npc.selector &&
            (cmd.npc.selector.base == MCFunctionAST.SelectorBase.AllPlayers ||
             cmd.npc.selector.base == MCFunctionAST.SelectorBase.NearestPlayer ||
             cmd.npc.selector.base == MCFunctionAST.SelectorBase.RandomPlayer ||
             cmd.npc.selector.base == MCFunctionAST.SelectorBase.Initiator)) {
            addIssue(issues, ValidationLevel.Error, "DIALOGUE_NPC_PLAYER_SELECTOR", "NPC target cannot use player-only selectors.");
        }
        if (cmd.action == MCFunctionAST.DialogueAction.Open) {
            appendIssues(issues, validatePlayerReference(cmd.player));
        } else if (cmd.action == MCFunctionAST.DialogueAction.Change) {
            if (cmd.player != undefined) appendIssues(issues, validatePlayerReference(cmd.player));
            if (cmd.sceneName == undefined) {
                addIssue(issues, ValidationLevel.Error, "DIALOGUE_SCENE_REQUIRED", "change requires a scene tag.");
            }
        } else {
            addIssue(issues, ValidationLevel.Error, "DIALOGUE_ACTION_INVALID", "Unknown dialogue action.");
        }
        if (cmd.sceneName != undefined && !c1Token(cmd.sceneName)) {
            addIssue(issues, ValidationLevel.Error, "DIALOGUE_SCENE_INVALID", "sceneName must be a single scene tag token.");
        }
        addIssue(issues, ValidationLevel.Info, "DIALOGUE_NPC_RUNTIME_REQUIRED",
            "NPC must exist in a loaded/ticking area; scene tags require a matching behavior-pack dialogue file.");
        return issues;
    }

    /** C2 SCOREBOARD Validator: syntax and context without inspecting mutable world state. */
    export function validateScoreboardCommand(cmd: MCFunctionAST.ScoreboardCommand): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        let a = cmd.action;
        if (a < MCFunctionAST.ScoreboardAction.ObjectiveAdd ||
            a > MCFunctionAST.ScoreboardAction.PlayerRandom) {
            addIssue(issues, ValidationLevel.Error, "SCOREBOARD_ACTION_INVALID", "Unsupported scoreboard action.");
            return issues;
        }
        let isObjectiveAction = a <= MCFunctionAST.ScoreboardAction.ObjectiveDisplay;
        if (!isObjectiveAction && a != MCFunctionAST.ScoreboardAction.PlayerList) {
            if (a != MCFunctionAST.ScoreboardAction.PlayerReset ||
                cmd.objective != undefined && cmd.objective.length > 0) {
                if (!isSafeCommandId(cmd.objective)) {
                    addIssue(issues, ValidationLevel.Error, "SCOREBOARD_OBJECTIVE_INVALID",
                        "Scoreboard objective must be a single, nonempty command token.");
                }
            }
        }
        if (isObjectiveAction) {
            if (a == MCFunctionAST.ScoreboardAction.ObjectiveAdd ||
                a == MCFunctionAST.ScoreboardAction.ObjectiveRemove ||
                (a == MCFunctionAST.ScoreboardAction.ObjectiveDisplay && cmd.objective != undefined && cmd.objective.length > 0)) {
                if (!isSafeCommandId(cmd.objective)) {
                    addIssue(issues, ValidationLevel.Error, "SCOREBOARD_OBJECTIVE_INVALID",
                        "Objective name must be a single command token.");
                }
            }
            if (a == MCFunctionAST.ScoreboardAction.ObjectiveDisplay) {
                if (cmd.slot == undefined || cmd.slot < 0 || cmd.slot > 2) {
                    addIssue(issues, ValidationLevel.Error, "SCOREBOARD_SLOT_INVALID", "Choose sidebar, list, or belowname.");
                }
                if (cmd.sortOrder != undefined &&
                    (cmd.sortOrder < 0 || cmd.sortOrder > 1 ||
                    cmd.slot == MCFunctionAST.ScoreboardDisplaySlot.BelowName || !cmd.objective)) {
                    addIssue(issues, ValidationLevel.Error, "SCOREBOARD_SORT_INVALID",
                        "Sort needs sidebar/list and a selected objective.");
                }
            }
            // The compact add/remove UI keeps its optional display name visible.
            // Never silently discard a display name when "remove" is selected.
            if (a != MCFunctionAST.ScoreboardAction.ObjectiveAdd &&
                cmd.displayName != undefined && cmd.displayName.length > 0) {
                addIssue(issues, ValidationLevel.Error, "SCOREBOARD_DISPLAYNAME_NOT_APPLICABLE",
                    "Display name only applies to objectives add, not remove or list.");
            }
            if (a == MCFunctionAST.ScoreboardAction.ObjectiveAdd &&
                cmd.displayName != undefined && (cmd.displayName.indexOf("\r") >= 0 || cmd.displayName.indexOf("\n") >= 0)) {
                addIssue(issues, ValidationLevel.Error, "SCOREBOARD_DISPLAY_NAME_INVALID",
                    "Display name cannot contain line breaks.");
            }
            return issues;
        }
        if (a == MCFunctionAST.ScoreboardAction.PlayerList && !cmd.target) return issues;
        appendIssues(issues, validatePlayerReference(cmd.target, true));
        if (a == MCFunctionAST.ScoreboardAction.PlayerSet ||
            a == MCFunctionAST.ScoreboardAction.PlayerAdd ||
            a == MCFunctionAST.ScoreboardAction.PlayerRemove) {
            if (cmd.count == undefined ||
                Math.floor(cmd.count) != cmd.count ||
                cmd.count < -2147483648 || cmd.count > 2147483647) {
                addIssue(issues, ValidationLevel.Error, "SCOREBOARD_COUNT_INVALID", "Score count must be a signed 32-bit integer.");
            }
        }
        if (a == MCFunctionAST.ScoreboardAction.PlayerOperation) {
            appendIssues(issues, validatePlayerReference(cmd.source, true));
            if (!isSafeCommandId(cmd.sourceObjective)) {
                addIssue(issues, ValidationLevel.Error, "SCOREBOARD_SOURCE_OBJECTIVE_INVALID", "Source objective must be a command token.");
            }
            if (cmd.operator == undefined || cmd.operator < 0 || cmd.operator > 8) {
                addIssue(issues, ValidationLevel.Error, "SCOREBOARD_OPERATOR_INVALID", "Invalid scoreboard operator.");
            }
            if (cmd.operator == MCFunctionAST.ScoreboardMathOperator.Divide ||
                cmd.operator == MCFunctionAST.ScoreboardMathOperator.Modulo) {
                addIssue(issues, ValidationLevel.Info, "SCOREBOARD_DIVISION_RUNTIME",
                    "Division or modulo by a zero score must be tested against world state.");
            }
        }
        if (a == MCFunctionAST.ScoreboardAction.PlayerTest ||
            a == MCFunctionAST.ScoreboardAction.PlayerRandom) {
            if (!isWildcardScoreNumber(cmd.minimum) ||
                (cmd.maximum != undefined && !isWildcardScoreNumber(cmd.maximum)) ||
                (a == MCFunctionAST.ScoreboardAction.PlayerRandom && cmd.maximum == undefined)) {
                addIssue(issues, ValidationLevel.Error, "SCOREBOARD_RANGE_INVALID",
                    "Test/random bounds must be signed integers or the * wildcard.");
            } else if (cmd.minimum != "*" && cmd.maximum != undefined && cmd.maximum != "*" &&
                +cmd.minimum > +cmd.maximum) {
                addIssue(issues, ValidationLevel.Error, "SCOREBOARD_RANGE_REVERSED", "Minimum cannot exceed maximum.");
            }
        }
        return issues;
    }

    function isWildcardScoreNumber(value: string): boolean {
        if (value == "*") return true;
        if (!value || value.length == 0) return false;
        let start = value.charAt(0) == "-" ? 1 : 0;
        if (start == value.length) return false;
        for (let i = start; i < value.length; i++) {
            let ch = value.charAt(i);
            if (ch < "0" || ch > "9") return false;
        }
        let numeric = +value;
        return numeric >= -2147483648 && numeric <= 2147483647;
    }

    /** C3: canonical syntax validation; Preview capability is NOT a syntax error. */
    export function validateExecuteCommand(cmd: MCFunctionAST.ExecuteCommand): ValidationIssue[] {
        let issues: ValidationIssue[] = [];
        if (!cmd || !cmd.run) {
            addIssue(issues, ValidationLevel.Error, "EXECUTE_RUN_MISSING", "EXECUTE requires a RUN command.");
            return issues;
        }
        if (cmd.run.kind == MCFunctionAST.CommandKind.Execute) {
            // Nested Execute is legal in real Bedrock, but defer to explicit flat chains
            // while the current Preview interpreter handles only a simple RUN.
            addIssue(issues, ValidationLevel.Warning, "EXECUTE_NESTED", "Nested EXECUTE requires separate runtime verification.");
        }
        appendIssues(issues, validateCommand(cmd.run));
        if (!cmd.clauses) {
            addIssue(issues, ValidationLevel.Error, "EXECUTE_CLAUSES_MISSING", "Missing EXECUTE clause list.");
            return issues;
        }
        // EXECUTE clause chaining has no arbitrary editor-only count cap.
        // Continue validating EVERY clause, including those after index 32;
        // errors in a long chain must never be silently ignored.
        for (let i = 0; i < cmd.clauses.length; i++) {
            let c = cmd.clauses[i];
            if (!c || c.kind < 0 || c.kind > MCFunctionAST.ExecuteClauseKind.UnlessScoreCompare) {
                addIssue(issues, ValidationLevel.Error, "EXECUTE_CLAUSE_INVALID", "Invalid EXECUTE clause.");
                continue;
            }
            let k = c.kind;
            if (k == MCFunctionAST.ExecuteClauseKind.As || k == MCFunctionAST.ExecuteClauseKind.At ||
                k == MCFunctionAST.ExecuteClauseKind.IfEntity || k == MCFunctionAST.ExecuteClauseKind.UnlessEntity ||
                k == MCFunctionAST.ExecuteClauseKind.IfScoreMatches || k == MCFunctionAST.ExecuteClauseKind.UnlessScoreMatches ||
                k == MCFunctionAST.ExecuteClauseKind.IfScoreCompare || k == MCFunctionAST.ExecuteClauseKind.UnlessScoreCompare ||
                k == MCFunctionAST.ExecuteClauseKind.PositionedAs || k == MCFunctionAST.ExecuteClauseKind.RotatedAs) {
                appendIssues(issues, validatePlayerReference(c.target, true));
            }
            if (k == MCFunctionAST.ExecuteClauseKind.Positioned ||
                k == MCFunctionAST.ExecuteClauseKind.IfBlock || k == MCFunctionAST.ExecuteClauseKind.UnlessBlock) {
                if (!c.position) addIssue(issues, ValidationLevel.Error, "EXECUTE_POSITION_MISSING", "Position is required.");
                else appendIssues(issues, validatePosition(c.position));
            }
            if (k == MCFunctionAST.ExecuteClauseKind.FacingPosition ||
                k == MCFunctionAST.ExecuteClauseKind.FacingEntity) {
                if (!c.facing || (k == MCFunctionAST.ExecuteClauseKind.FacingPosition && !c.facing.position) ||
                    (k == MCFunctionAST.ExecuteClauseKind.FacingEntity && !c.facing.entitySelector)) {
                    addIssue(issues, ValidationLevel.Error, "EXECUTE_FACING_INVALID", "Facing input is required.");
                } else if (k == MCFunctionAST.ExecuteClauseKind.FacingPosition) {
                    appendIssues(issues, validatePosition(c.facing.position));
                } else {
                    appendIssues(issues, validateSelector(c.facing.entitySelector));
                }
            }
            if (k == MCFunctionAST.ExecuteClauseKind.Rotated) {
                if (!c.rotation) addIssue(issues, ValidationLevel.Error, "EXECUTE_ROTATION_MISSING", "Rotation is required.");
                else appendIssues(issues, validateRotation(c.rotation));
            }
            if (k == MCFunctionAST.ExecuteClauseKind.In &&
                (c.dimension == undefined || c.dimension < 0 || c.dimension > 2))
                addIssue(issues, ValidationLevel.Error, "EXECUTE_DIMENSION_INVALID", "Invalid dimension.");
            if (k == MCFunctionAST.ExecuteClauseKind.Align &&
                (!c.axes || c.axes.length < 1 || c.axes.length > 3 ||
                c.axes.indexOf("x") < 0 && c.axes.indexOf("y") < 0 && c.axes.indexOf("z") < 0 ||
                !executeValidAxes(c.axes))) {
                addIssue(issues, ValidationLevel.Error, "EXECUTE_ALIGN_INVALID", "Align uses unique x, y, z axes only.");
            }
            if (k == MCFunctionAST.ExecuteClauseKind.Anchored &&
                c.anchor != MCFunctionAST.EntityAnchor.Eyes && c.anchor != MCFunctionAST.EntityAnchor.Feet)
                addIssue(issues, ValidationLevel.Error, "EXECUTE_ANCHOR_INVALID", "Anchor must be eyes or feet.");
            if (k == MCFunctionAST.ExecuteClauseKind.IfBlock || k == MCFunctionAST.ExecuteClauseKind.UnlessBlock) {
                if (!c.blockId || !isSafeCommandId(c.blockId))
                    addIssue(issues, ValidationLevel.Error, "EXECUTE_BLOCK_INVALID", "Block ID must be a nonempty token.");
                if (c.blockStates && c.blockStates.entries && c.blockStates.entries.length > 0) {
                    appendIssues(issues, validateBlockStates(c.blockStates, c.blockId));
                }
            }
            if (k == MCFunctionAST.ExecuteClauseKind.IfBlocks || k == MCFunctionAST.ExecuteClauseKind.UnlessBlocks) {
                if (!c.begin || !c.end || !c.destination) {
                    addIssue(issues, ValidationLevel.Error, "EXECUTE_BLOCKS_POSITIONS", "Three positions are required.");
                } else {
                    appendIssues(issues, validatePosition(c.begin));
                    appendIssues(issues, validatePosition(c.end));
                    appendIssues(issues, validatePosition(c.destination));
                }
                if (c.scan != MCFunctionAST.ExecuteScan.All && c.scan != MCFunctionAST.ExecuteScan.Masked)
                    addIssue(issues, ValidationLevel.Error, "EXECUTE_SCAN_INVALID", "Invalid scan mode.");
            }
            if (k == MCFunctionAST.ExecuteClauseKind.IfScoreCompare ||
                k == MCFunctionAST.ExecuteClauseKind.UnlessScoreCompare) {
                if (!c.objective || !isSafeCommandId(c.objective) ||
                    !c.sourceObjective || !isSafeCommandId(c.sourceObjective)) {
                    addIssue(issues, ValidationLevel.Error, "EXECUTE_SCORE_COMPARE_OBJECTIVE",
                        "Both scoreboard objective IDs are required and must be valid tokens.");
                }
                appendIssues(issues, validatePlayerReference(c.sourceTarget, true));
                if (c.scoreComparison == undefined ||
                    MCFunctionAST.executeScoreOperatorToken(c.scoreComparison) == "") {
                    addIssue(issues, ValidationLevel.Error, "EXECUTE_SCORE_COMPARE_OPERATOR",
                        "Invalid score comparison operator.");
                }
            }
            if (k == MCFunctionAST.ExecuteClauseKind.IfScoreMatches ||
                k == MCFunctionAST.ExecuteClauseKind.UnlessScoreMatches) {
                if (!c.objective || !isSafeCommandId(c.objective))
                    addIssue(issues, ValidationLevel.Error, "EXECUTE_SCORE_OBJECTIVE", "Invalid scoreboard objective.");
                if (!c.scoreRange || (!c.scoreRange.hasMin && !c.scoreRange.hasMax) ||
                    (c.scoreRange.hasMin && c.scoreRange.hasMax && c.scoreRange.min > c.scoreRange.max))
                    addIssue(issues, ValidationLevel.Error, "EXECUTE_SCORE_RANGE", "Invalid score range.");
            }
        }
        return issues;
    }
    function executeValidAxes(s: string): boolean {
        for (let i = 0; i < s.length; i++) {
            let ch = s.charAt(i);
            if (ch != "x" && ch != "y" && ch != "z") return false;
            if (s.indexOf(ch) != i) return false;
        }
        return true;
    }

    export function validateCommand(command: MCFunctionAST.CommandNode): ValidationIssue[] {
        if (command.kind == MCFunctionAST.CommandKind.Execute) return validateExecuteCommand(<MCFunctionAST.ExecuteCommand>command);
        let issues: ValidationIssue[] = [];
        if (command.kind == MCFunctionAST.CommandKind.Scoreboard) {
            appendIssues(issues, validateScoreboardCommand(<MCFunctionAST.ScoreboardCommand>command));
        }
        if (command.kind == MCFunctionAST.CommandKind.Ride) {
            appendIssues(issues, validateRideCommand(<MCFunctionAST.RideCommand>command));
        }
        if (command.kind == MCFunctionAST.CommandKind.Dialogue) {
            appendIssues(issues, validateDialogueCommand(<MCFunctionAST.DialogueCommand>command));
        }


        if (command.kind == MCFunctionAST.CommandKind.PlayAnimation) {
            appendIssues(issues, validatePlayAnimationCommand(<MCFunctionAST.PlayAnimationCommand>command));
        }
        if (command.kind == MCFunctionAST.CommandKind.Fog) {
            appendIssues(issues, validateFogCommand(<MCFunctionAST.FogCommand>command));
        }
        if (command.kind == MCFunctionAST.CommandKind.Damage) {
            appendIssues(issues, validateDamageCommand(<MCFunctionAST.DamageCommand>command));
        }
        if (command.kind == MCFunctionAST.CommandKind.Event) {
            appendIssues(issues, validateEventCommand(<MCFunctionAST.EventCommand>command));
        }
        if (command.kind == MCFunctionAST.CommandKind.ControlScheme) {
            appendIssues(issues, validateControlSchemeCommand(<MCFunctionAST.ControlSchemeCommand>command));
        }
        if (command.kind == MCFunctionAST.CommandKind.AimAssist) {
            appendIssues(issues, validateAimAssistCommand(<MCFunctionAST.AimAssistCommand>command));
        }

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
