/**
 * Preview-only internal tag allocator.
 *
 * Internal tags are runtime implementation details only. They must never be
 * emitted by the .mcfunction Compiler or exposed as user-authored Preview data.
 *
 * Format:
 *   _cbi_<purpose>_<opaque token>
 *
 * Examples:
 *   _cbi_qv_K7F2Q9   query viewer
 *   _cbi_qt_K7F2Q9   query target snapshot
 *   _cbi_so_P4M8XZ   summon pre-existing entities
 *   _cbi_sn_P4M8XZ   summon newly-created entity
 *
 * The token is intentionally opaque rather than meaningful. This is not
 * cryptography; a per-runtime random seed plus an invocation serial is used to
 * make accidental collisions with user tags and parallel Preview sessions very
 * unlikely while keeping the token safe for Minecraft selectors.
 */
namespace MCFunctionPreview {
    const INTERNAL_TAG_PREFIX = "_cbi_";
    const INTERNAL_TOKEN_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let internalSessionSeed = -1;
    let internalScopeSerial = 0;

    /** Allocate one opaque token shared by all tags in a single Preview action. */
    export function createInternalTagScopeToken(): string {
        if (internalSessionSeed < 0) {
            // Minecraft MakeCode supports Math.randomRange(). Keep the seed
            // within 30 bits so arithmetic remains simple and deterministic.
            internalSessionSeed = Math.randomRange(0, 1073741823);
        }

        internalScopeSerial++;

        // Mix the invocation serial into the per-runtime seed. The modulo is
        // 32^6, matching the six-character token alphabet below.
        let mixed = (
            internalSessionSeed +
            internalScopeSerial * 7919 +
            104729
        ) % 1073741824;

        return encodeInternalToken(mixed);
    }

    /** Build a Minecraft-safe opaque internal tag for a specific purpose. */
    export function createInternalTagName(
        purpose: string,
        token: string
    ): string {
        return INTERNAL_TAG_PREFIX + purpose + "_" + token;
    }

    /** True when a tag belongs to Preview internals rather than user content. */
    export function isInternalPreviewTag(name: string): boolean {
        if (!name || name.length < INTERNAL_TAG_PREFIX.length) return false;
        return name.substr(0, INTERNAL_TAG_PREFIX.length) == INTERNAL_TAG_PREFIX;
    }

    /** Remove one internal tag from every player/entity that currently has it. */
    export function cleanupInternalTag(tag: string): void {
        if (!isInternalPreviewTag(tag)) return;

        player.execute(
            "tag @a[tag=" + tag + "] remove " + tag
        );
        player.execute(
            "tag @e[type=!minecraft:player,tag=" + tag + "] remove " + tag
        );
    }

    function encodeInternalToken(value: number): string {
        let token = "";
        let current = value;

        for (let i = 0; i < 6; i++) {
            let index = current % 32;
            token = INTERNAL_TOKEN_ALPHABET.charAt(index) + token;
            current = Math.floor(current / 32);
        }

        return token;
    }
}
