/** AUTO-GENERATED FILE. DO NOT EDIT BY HAND.
 * Source: registry/source/bedrock/gamerules.json
 * Generator: tools/generate_registry.ps1 */
namespace MCFunctionGameruleRegistry {
    /** 0=unknown, 1=Boolean, 2=Integer, 3=Enum. */
    export function valueKindOf(ruleId: string): number {
        if (!ruleId) return 0;
        if (ruleId == "commandblockoutput") return 1;
        if (ruleId == "commandblocksenabled") return 1;
        if (ruleId == "dodaylightcycle") return 1;
        if (ruleId == "doentitydrops") return 1;
        if (ruleId == "dofiretick") return 1;
        if (ruleId == "doimmediaterespawn") return 1;
        if (ruleId == "doinsomnia") return 1;
        if (ruleId == "dolimitedcrafting") return 1;
        if (ruleId == "domobloot") return 1;
        if (ruleId == "domobspawning") return 1;
        if (ruleId == "dotiledrops") return 1;
        if (ruleId == "doweathercycle") return 1;
        if (ruleId == "drowningdamage") return 1;
        if (ruleId == "falldamage") return 1;
        if (ruleId == "firedamage") return 1;
        if (ruleId == "freezedamage") return 1;
        if (ruleId == "functioncommandlimit") return 2;
        if (ruleId == "keepinventory") return 1;
        if (ruleId == "maxcommandchainlength") return 2;
        if (ruleId == "mobgriefing") return 1;
        if (ruleId == "naturalregeneration") return 1;
        if (ruleId == "playerssleepingpercentage") return 2;
        if (ruleId == "playerwaypoints") return 3;
        if (ruleId == "projectilescanbreakblocks") return 1;
        if (ruleId == "pvp") return 1;
        if (ruleId == "randomtickspeed") return 2;
        if (ruleId == "recipesunlock") return 1;
        if (ruleId == "respawnblocksexplode") return 1;
        if (ruleId == "sendcommandfeedback") return 1;
        if (ruleId == "showbordereffect") return 1;
        if (ruleId == "showcoordinates") return 1;
        if (ruleId == "showdaysplayed") return 1;
        if (ruleId == "showdeathmessages") return 1;
        if (ruleId == "showrecipemessages") return 1;
        if (ruleId == "showtags") return 1;
        if (ruleId == "spawnradius") return 2;
        if (ruleId == "tntexplodes") return 1;
        if (ruleId == "tntexplosiondropdecay") return 1;
        return 0;
    }
    export function isDocumentedEnumValue(ruleId: string, value: string): boolean {
        if (ruleId == "playerwaypoints") return value == "everyone" || value == "off";
        return true;
    }
    export function outsideDocumentedIntegerRange(ruleId: string, value: number): boolean {
        if (ruleId == "functioncommandlimit") return value < 0 || value > 10000;
        if (ruleId == "randomtickspeed") return value < 0 || value > 4096;
        if (ruleId == "spawnradius") return value < 0 || value > 128;
        return false;
    }
}

