/** Minecraft command compiler: AST -> .mcfunction command line. */
namespace MCFunctionCompiler {
    export function compileCommand(command: MCFunctionAST.CommandNode): string {
        switch (command.kind) {
            case MCFunctionAST.CommandKind.Scoreboard:
                return compileScoreboard(<MCFunctionAST.ScoreboardCommand>command);
            case MCFunctionAST.CommandKind.Ride:
                return compileRide(<MCFunctionAST.RideCommand>command);
            case MCFunctionAST.CommandKind.Dialogue:
                return compileDialogue(<MCFunctionAST.DialogueCommand>command);
            case MCFunctionAST.CommandKind.PlayAnimation:
                return compilePlayAnimation(<MCFunctionAST.PlayAnimationCommand>command);
            case MCFunctionAST.CommandKind.Fog:
                return compileFog(<MCFunctionAST.FogCommand>command);
            case MCFunctionAST.CommandKind.Damage:
                return compileDamage(<MCFunctionAST.DamageCommand>command);
            case MCFunctionAST.CommandKind.Event:
                return compileEvent(<MCFunctionAST.EventCommand>command);
            case MCFunctionAST.CommandKind.ControlScheme:
                return compileControlScheme(<MCFunctionAST.ControlSchemeCommand>command);
            case MCFunctionAST.CommandKind.AimAssist:
                return compileAimAssist(<MCFunctionAST.AimAssistCommand>command);
            case MCFunctionAST.CommandKind.SpawnPoint:
                return compileSpawnPoint(<MCFunctionAST.SpawnPointCommand>command);

            case MCFunctionAST.CommandKind.SetWorldSpawn:
                return compileSetWorldSpawn(<MCFunctionAST.SetWorldSpawnCommand>command);

            case MCFunctionAST.CommandKind.ClearSpawnPoint:
                return compileClearSpawnPoint(<MCFunctionAST.ClearSpawnPointCommand>command);

            case MCFunctionAST.CommandKind.Raw:
                return compileRaw(<MCFunctionAST.RawCommand>command);

            case MCFunctionAST.CommandKind.Enchant:
                return compileEnchant(<MCFunctionAST.EnchantCommand>command);

            case MCFunctionAST.CommandKind.Camera:
                return compileCamera(<MCFunctionAST.CameraCommand>command);

            case MCFunctionAST.CommandKind.CameraShake:
                return compileCameraShake(<MCFunctionAST.CameraShakeCommand>command);

            case MCFunctionAST.CommandKind.Tell:
                return compileTell(<MCFunctionAST.TellCommand>command);
            case MCFunctionAST.CommandKind.Time:
                return compileTime(<MCFunctionAST.TimeCommand>command);
            case MCFunctionAST.CommandKind.Weather:
                return compileWeather(<MCFunctionAST.WeatherCommand>command);
            case MCFunctionAST.CommandKind.Difficulty:
                return compileDifficulty(<MCFunctionAST.DifficultyCommand>command);
            case MCFunctionAST.CommandKind.Hud:
                return compileHud(<MCFunctionAST.HudCommand>command);
            case MCFunctionAST.CommandKind.InputPermission:
                return compileInputPermission(<MCFunctionAST.InputPermissionCommand>command);

            case MCFunctionAST.CommandKind.Gamerule:
                return compileGameRule(<MCFunctionAST.GameRuleCommand>command);

            case MCFunctionAST.CommandKind.PlaySound:
                return compilePlaySound(<MCFunctionAST.PlaySoundCommand>command);

            case MCFunctionAST.CommandKind.StopSound:
                return compileStopSound(<MCFunctionAST.StopSoundCommand>command);

            case MCFunctionAST.CommandKind.Music:
                return compileMusic(<MCFunctionAST.MusicCommand>command);

            case MCFunctionAST.CommandKind.Particle:
                return compileParticle(<MCFunctionAST.ParticleCommand>command);

            case MCFunctionAST.CommandKind.Say:
                return compileSay(<MCFunctionAST.SayCommand>command);

            case MCFunctionAST.CommandKind.McFunction:
                return compileMcFunction(<MCFunctionAST.McFunctionCommand>command);

            case MCFunctionAST.CommandKind.Give:
                return compileGive(<MCFunctionAST.GiveCommand>command);

            case MCFunctionAST.CommandKind.Teleport:
                return compileTeleport(<MCFunctionAST.TeleportCommand>command);

            case MCFunctionAST.CommandKind.Summon:
                return compileSummon(<MCFunctionAST.SummonCommand>command);

            case MCFunctionAST.CommandKind.Effect:
                return compileEffect(<MCFunctionAST.EffectCommand>command);

            case MCFunctionAST.CommandKind.Tag:
                return compileTag(<MCFunctionAST.TagCommand>command);

            case MCFunctionAST.CommandKind.GameMode:
                return compileGameMode(<MCFunctionAST.GameModeCommand>command);

            case MCFunctionAST.CommandKind.Kill:
                return compileKill(<MCFunctionAST.KillCommand>command);

            case MCFunctionAST.CommandKind.Clear:
                return compileClear(<MCFunctionAST.ClearCommand>command);

            case MCFunctionAST.CommandKind.SetBlock:
                return compileSetBlock(<MCFunctionAST.SetBlockCommand>command);

            case MCFunctionAST.CommandKind.Fill:
                return compileFill(<MCFunctionAST.FillCommand>command);

            case MCFunctionAST.CommandKind.Clone:
                return compileClone(<MCFunctionAST.CloneCommand>command);

            default:
                return "";
        }
    }

    /** Official Bedrock scoreboard commands. AST is never assembled by block UI. */
    function compileScoreboard(command: MCFunctionAST.ScoreboardCommand): string {
        let a = command.action;
        if (a == MCFunctionAST.ScoreboardAction.ObjectiveList) return "scoreboard objectives list";
        if (a == MCFunctionAST.ScoreboardAction.ObjectiveAdd) {
            let line = "scoreboard objectives add " + command.objective + " dummy";
            if (command.displayName != undefined && command.displayName.length > 0) {
                line += " " + quoteCommandString(command.displayName);
            }
            return line;
        }
        if (a == MCFunctionAST.ScoreboardAction.ObjectiveRemove) {
            return "scoreboard objectives remove " + command.objective;
        }
        if (a == MCFunctionAST.ScoreboardAction.ObjectiveDisplay) {
            let slot = command.slot == MCFunctionAST.ScoreboardDisplaySlot.Sidebar ? "sidebar" :
                command.slot == MCFunctionAST.ScoreboardDisplaySlot.List ? "list" : "belowname";
            let line = "scoreboard objectives setdisplay " + slot;
            if (command.objective != undefined && command.objective.length > 0) {
                line += " " + command.objective;
                if (command.sortOrder != undefined && slot != "belowname") {
                    line += command.sortOrder == MCFunctionAST.ScoreboardSortOrder.Ascending
                        ? " ascending" : " descending";
                }
            }
            return line;
        }
        if (a == MCFunctionAST.ScoreboardAction.PlayerList) {
            return "scoreboard players list" + (command.target ? " " + compilePlayerTarget(command.target) : "");
        }
        let target = compilePlayerTarget(command.target);
        if (a == MCFunctionAST.ScoreboardAction.PlayerReset) {
            return "scoreboard players reset " + target +
                (command.objective != undefined && command.objective.length > 0 ? " " + command.objective : "");
        }
        let head = "scoreboard players ";
        if (a == MCFunctionAST.ScoreboardAction.PlayerOperation) {
            let op = "=";
            if (command.operator == MCFunctionAST.ScoreboardMathOperator.Add) op = "+=";
            if (command.operator == MCFunctionAST.ScoreboardMathOperator.Subtract) op = "-=";
            if (command.operator == MCFunctionAST.ScoreboardMathOperator.Multiply) op = "*=";
            if (command.operator == MCFunctionAST.ScoreboardMathOperator.Divide) op = "/=";
            if (command.operator == MCFunctionAST.ScoreboardMathOperator.Modulo) op = "%=";
            if (command.operator == MCFunctionAST.ScoreboardMathOperator.Minimum) op = "<";
            if (command.operator == MCFunctionAST.ScoreboardMathOperator.Maximum) op = ">";
            if (command.operator == MCFunctionAST.ScoreboardMathOperator.Swap) op = "><";
            return head + "operation " + target + " " + command.objective + " " + op +
                " " + compilePlayerTarget(command.source) + " " + command.sourceObjective;
        }
        if (a == MCFunctionAST.ScoreboardAction.PlayerTest) {
            return head + "test " + target + " " + command.objective + " " +
                command.minimum + (command.maximum == undefined ? "" : " " + command.maximum);
        }
        if (a == MCFunctionAST.ScoreboardAction.PlayerRandom) {
            return head + "random " + target + " " + command.objective + " " +
                command.minimum + " " + command.maximum;
        }
        let verb = a == MCFunctionAST.ScoreboardAction.PlayerSet ? "set" :
            a == MCFunctionAST.ScoreboardAction.PlayerAdd ? "add" : "remove";
        return head + verb + " " + target + " " + command.objective + " " + command.count;
    }

    /** Official Bedrock /ride five-action grammar. No leading slash. */
    function compileRide(command: MCFunctionAST.RideCommand): string {
        let base = "ride " + compilePlayerTarget(command.actor);
        if (command.action == MCFunctionAST.RideAction.StopRiding) return base + " stop_riding";
        if (command.action == MCFunctionAST.RideAction.EvictRiders) return base + " evict_riders";
        if (command.action == MCFunctionAST.RideAction.StartRiding) {
            let result = base + " start_riding " + compilePlayerTarget(command.mount);
            if (command.teleportRule != undefined) {
                result += command.teleportRule == MCFunctionAST.RideTeleportRule.TeleportRide
                    ? " teleport_ride" : " teleport_rider";
            }
            if (command.fillType != undefined) {
                result += command.fillType == MCFunctionAST.RideFillType.IfGroupFits
                    ? " if_group_fits" : " until_full";
            }
            return result;
        }
        let result = base + (command.action == MCFunctionAST.RideAction.SummonRider
            ? " summon_rider " : " summon_ride ") + command.entityType;
        if (command.action == MCFunctionAST.RideAction.SummonRide && command.rideRule != undefined) {
            let rules = ["no_ride_change", "reassign_rides", "skip_riders"];
            result += " " + rules[<number>command.rideRule];
        }
        if (command.spawnEvent != undefined) result += " " + command.spawnEvent;
        if (command.nameTag != undefined) result += " " + quoteCommandString(command.nameTag);
        return result;
    }
    /** /dialogue open and change intentionally have different parameter order. */
    function compileDialogue(command: MCFunctionAST.DialogueCommand): string {
        let result = "dialogue " + (command.action == MCFunctionAST.DialogueAction.Open ? "open " : "change ") +
            compilePlayerTarget(command.npc);
        if (command.action == MCFunctionAST.DialogueAction.Open) {
            result += " " + compilePlayerTarget(command.player);
            if (command.sceneName != undefined) result += " " + command.sceneName;
        } else {
            result += " " + command.sceneName;
            if (command.player != undefined) result += " " + compilePlayerTarget(command.player);
        }
        return result;
    }

    function compileB4String(value: string): string {
        if (value.indexOf(" ") >= 0 || value.indexOf("\t") >= 0 ||
            value.indexOf('"') >= 0 || value.indexOf("\\") >= 0) {
            return quoteCommandString(value);
        }
        return value;
    }
    function compilePlayAnimation(command: MCFunctionAST.PlayAnimationCommand): string {
        let result = "playanimation " + compilePlayerTarget(command.target) +
            " " + compileB4String(command.animationId);
        if (command.nextState != undefined) result += " " + compileB4String(command.nextState);
        if (command.blendOutTime != undefined) result += " " + command.blendOutTime;
        if (command.stopExpression != undefined) result += " " +
            quoteCommandString(command.stopExpression);
        if (command.controllerId != undefined) result += " " + compileB4String(command.controllerId);
        return result;
    }
    function compileFog(command: MCFunctionAST.FogCommand): string {
        let result = "fog " + compilePlayerTarget(command.target);
        if (command.action == MCFunctionAST.FogAction.Push) {
            return result + " push " + command.fogId + " " + command.userProvidedId;
        }
        if (command.action == MCFunctionAST.FogAction.Pop) return result + " pop " + command.userProvidedId;
        return result + " remove " + command.userProvidedId;
    }

    function compileDamage(command: MCFunctionAST.DamageCommand): string {
        let result = "damage " + compilePlayerTarget(command.target) + " " + command.amount;
        if (command.cause != undefined) result += " " + command.cause;
        // Education 26.32 source attribution form awaits user syntax verification.
        if (command.action == MCFunctionAST.DamageAction.FromEntity && command.damager) {
            result += " entity " + compilePlayerTarget(command.damager);
        }
        return result;
    }
    function compileEvent(command: MCFunctionAST.EventCommand): string {
        return "event entity " + compilePlayerTarget(command.target) + " " + command.eventId;
    }
    function compileControlScheme(command: MCFunctionAST.ControlSchemeCommand): string {
        let result = "controlscheme " + compilePlayerTarget(command.target);
        if (command.action == MCFunctionAST.ControlSchemeAction.Clear) return result + " clear";
        let names = ["camera_relative", "camera_relative_strafe", "player_relative",
            "player_relative_strafe", "locked_player_relative_strafe"];
        return result + " set " + names[<number>command.scheme];
    }
    function compileAimAssist(command: MCFunctionAST.AimAssistCommand): string {
        let result = "aimassist " + compilePlayerTarget(command.target);
        if (command.action == MCFunctionAST.AimAssistAction.Clear) return result + " clear";
        result += " set";
        if (command.xAngle != undefined) result += " " + command.xAngle;
        if (command.yAngle != undefined) result += " " + command.yAngle;
        if (command.maxDistance != undefined) result += " " + command.maxDistance;
        if (command.targetMode != undefined) result += command.targetMode == MCFunctionAST.AimAssistTargetMode.Angle
            ? " angle" : " distance";
        if (command.presetId != undefined && command.presetId.length > 0) result += " " + command.presetId;
        return result;
    }

    /** Command lines have no leading slash in a .mcfunction. */
    function compileSpawnPoint(command: MCFunctionAST.SpawnPointCommand): string {
        let result = "spawnpoint";
        if (command.mode != MCFunctionAST.SpawnPointMode.Default && command.target) {
            result += " " + compilePlayerTarget(command.target);
        }
        if (command.mode == MCFunctionAST.SpawnPointMode.TargetAt && command.position) {
            result += " " + compilePosition(command.position);
        }
        return result;
    }

    function compileSetWorldSpawn(command: MCFunctionAST.SetWorldSpawnCommand): string {
        return command.mode == MCFunctionAST.SetWorldSpawnMode.At && command.position
            ? "setworldspawn " + compilePosition(command.position) : "setworldspawn";
    }

    function compileClearSpawnPoint(command: MCFunctionAST.ClearSpawnPointCommand): string {
        return command.mode == MCFunctionAST.ClearSpawnPointMode.Target && command.target
            ? "clearspawnpoint " + compilePlayerTarget(command.target) : "clearspawnpoint";
    }

    /** Common target serializer for selectors and literal player names. */
    export function compilePlayerTarget(target: MCFunctionAST.PlayerTarget): string {
        if (target.kind == MCFunctionAST.PlayerTargetKind.Selector) {
            return compileSelector(target.selector);
        }
        let name = target.name || "";
        if (name.indexOf(" ") >= 0 || name.indexOf("\t") >= 0 || name.indexOf('"') >= 0) {
            return quoteCommandString(name);
        }
        return name;
    }

    /** Official /camera forms: ease before pos, facing OR rot, fade is separate. */
    function compileCamera(command: MCFunctionAST.CameraCommand): string {
        let result = "camera " + compileSelector(command.target);
        if (command.action == MCFunctionAST.CameraAction.PlaySpline) return result + " play_spline " + command.splineName;
        if (command.action == MCFunctionAST.CameraAction.Attach) return result + " attach_to_entity " + compileSelector(command.entityTarget);
        if (command.action == MCFunctionAST.CameraAction.Detach) return result + " detach_from_entity";
        if (command.action == MCFunctionAST.CameraAction.TargetEntity) {
            result += " target_entity " + compileSelector(command.entityTarget);
            if (command.targetCenterOffset) result += " target_center_offset " + command.targetCenterOffset.x + " " + command.targetCenterOffset.y + " " + command.targetCenterOffset.z;
            return result;
        }
        if (command.action == MCFunctionAST.CameraAction.RemoveTarget) return result + " remove_target";
        if (command.action == MCFunctionAST.CameraAction.FovSet || command.action == MCFunctionAST.CameraAction.FovClear) {
            result += command.action == MCFunctionAST.CameraAction.FovSet ? " fov_set " + command.fovValue : " fov_clear";
            if (command.ease) result += " " + command.ease.seconds + " " + compileCameraEaseType(command.ease.type);
            return result;
        }
        if (command.action == MCFunctionAST.CameraAction.Clear) return result + " clear";
        if (command.action == MCFunctionAST.CameraAction.Fade) {
            result += " fade";
            if (command.fadeTime) {
                result += " time " + command.fadeTime.fadeIn + " " + command.fadeTime.hold + " " + command.fadeTime.fadeOut;
            }
            if (command.fadeColor) {
                result += " color " + command.fadeColor.red + " " + command.fadeColor.green + " " + command.fadeColor.blue;
            }
            return result;
        }
        result += " set " + command.presetId;
        if (command.ease) result += " ease " + command.ease.seconds + " " + compileCameraEaseType(command.ease.type);
        if (command.useDefault) return result + " default";
        if (command.position) result += " pos " + compilePosition(command.position);
        if (command.facing) {
            result += " facing ";
            if (command.facing.kind == MCFunctionAST.FacingKind.Position) result += compilePosition(command.facing.position);
            else result += compileSelector(command.facing.entitySelector);
        } else if (command.rotation) {
            // /camera uses xRot (pitch) followed by yRot (yaw).
            result += " rot " + compileRotationValue(command.rotation.pitch) + " " + compileRotationValue(command.rotation.yaw);
        }
        if (command.viewOffset) result += " view_offset " + command.viewOffset.x + " " + command.viewOffset.y;
        if (command.entityOffset) result += " entity_offset " + command.entityOffset.x + " " + command.entityOffset.y + " " + command.entityOffset.z;
        return result;
    }

    function compileCameraEaseType(type: MCFunctionAST.CameraEaseType): string {
        let names = ["linear", "in_sine", "out_sine", "in_out_sine",
            "in_quad", "out_quad", "in_out_quad", "in_cubic", "out_cubic", "in_out_cubic",
            "in_quart", "out_quart", "in_out_quart", "in_quint", "out_quint", "in_out_quint",
            "in_expo", "out_expo", "in_out_expo", "in_circ", "out_circ", "in_out_circ",
            "in_back", "out_back", "in_out_back", "in_elastic", "out_elastic", "in_out_elastic",
            "in_bounce", "out_bounce", "in_out_bounce", "spring"];
        return names[<number>type];
    }

    /** Canonical Bedrock syntax; optional args are emitted only as required. */
    function compileCameraShake(command: MCFunctionAST.CameraShakeCommand): string {
        if (command.action == MCFunctionAST.CameraShakeAction.Stop) {
            return "camerashake stop" + (command.target ? " " + compileSelector(command.target) : "");
        }
        let result = "camerashake add " + compileSelector(command.target);
        if (command.intensity != undefined || command.seconds != undefined || command.shakeType != undefined) {
            result += " " + (command.intensity == undefined ? "0.5" : command.intensity);
        }
        if (command.seconds != undefined || command.shakeType != undefined) {
            result += " " + (command.seconds == undefined ? "1" : command.seconds);
        }
        if (command.shakeType != undefined) {
            result += command.shakeType == MCFunctionAST.CameraShakeType.Rotational ? " rotational" : " positional";
        }
        return result;
    }

    function compileTell(command: MCFunctionAST.TellCommand): string {
        return "tell " + compileSelector(command.target) + " " + command.message;
    }
    function compileTime(command: MCFunctionAST.TimeCommand): string {
        if (command.action == MCFunctionAST.TimeAction.Query) {
            let queryNames = ["daytime", "gametime", "day"];
            return "time query " + queryNames[command.queryKind];
        }
        if (command.action == MCFunctionAST.TimeAction.AddTicks) return "time add " + command.ticks;
        if (command.action == MCFunctionAST.TimeAction.SetTicks) return "time set " + command.ticks;
        let names = ["day", "sunrise", "noon", "sunset", "night", "midnight"];
        return "time set " + names[command.preset];
    }
    function compileWeather(command: MCFunctionAST.WeatherCommand): string {
        let names = ["clear", "rain", "thunder"];
        return "weather " + names[command.weather] + (command.duration == undefined ? "" : " " + command.duration);
    }
    function compileDifficulty(command: MCFunctionAST.DifficultyCommand): string {
        let names = ["peaceful", "easy", "normal", "hard"];
        return "difficulty " + names[command.difficulty];
    }
    function compileHud(command: MCFunctionAST.HudCommand): string {
        let names = ["all", "hotbar", "health", "hunger", "armor", "crosshair", "paperdoll",
            "tooltips", "air_bubbles", "progress_bar", "horse_health", "touch_controls", "status_effects", "item_text"];
        return "hud " + compileSelector(command.target) + " " +
            (command.visibility == MCFunctionAST.HudVisibility.Hide ? "hide" : "reset") +
            (command.element == undefined ? "" : " " + names[command.element]);
    }
    function compileInputPermission(command: MCFunctionAST.InputPermissionCommand): string {
        let names = ["movement", "camera", "jump", "lateral_movement", "sneak", "dismount",
            "mount", "move_backward", "move_forward", "move_left", "move_right"];
        return "inputpermission set " + compileSelector(command.target) + " " + names[command.permission] +
            (command.state == MCFunctionAST.InputPermissionState.Enabled ? " enabled" : " disabled");
    }

    function compileRaw(command: MCFunctionAST.RawCommand): string {
        return command.raw;
    }

    /** Bedrock command: particle <effect> [x y z]. No leading slash in .mcfunction. */
    function compileParticle(command: MCFunctionAST.ParticleCommand): string {
        let result = "particle " + command.particleId;
        if (command.position) result = result + " " + compilePosition(command.position);
        return result;
    }

    /** Keep omitted optional args omitted until a later positional argument needs a default. */
    function compilePlaySound(command: MCFunctionAST.PlaySoundCommand): string {
        let result = "playsound " + command.soundId;
        let needsTarget = command.target != undefined || command.position != undefined ||
            command.volume != undefined || command.pitch != undefined || command.minimumVolume != undefined;
        let needsPosition = command.position != undefined || command.volume != undefined ||
            command.pitch != undefined || command.minimumVolume != undefined;
        if (needsTarget) result += " " + (command.target ? compileSelector(command.target) : "@a");
        if (needsPosition) result += " " + (command.position ? compilePosition(command.position) : "~ ~ ~");
        if (command.volume != undefined || command.pitch != undefined || command.minimumVolume != undefined) {
            result += " " + (command.volume == undefined ? "1" : command.volume);
        }
        if (command.pitch != undefined || command.minimumVolume != undefined) {
            result += " " + (command.pitch == undefined ? "1" : command.pitch);
        }
        if (command.minimumVolume != undefined) result += " " + command.minimumVolume;
        return result;
    }

    function compileStopSound(command: MCFunctionAST.StopSoundCommand): string {
        let result = "stopsound " + compileSelector(command.target);
        if (command.soundId != undefined) result += " " + command.soundId;
        return result;
    }

    function compileMusic(command: MCFunctionAST.MusicCommand): string {
        if (command.action == MCFunctionAST.MusicAction.Stop) {
            return "music stop" + (command.fadeSeconds == undefined ? "" : " " + command.fadeSeconds);
        }
        if (command.action == MCFunctionAST.MusicAction.Volume) {
            return "music volume " + command.volume;
        }
        let result = command.action == MCFunctionAST.MusicAction.Queue ? "music queue " : "music play ";
        result += command.trackId;
        if (command.volume != undefined || command.fadeSeconds != undefined || command.repeatMode != undefined) {
            result += " " + (command.volume == undefined ? "1" : command.volume);
        }
        if (command.fadeSeconds != undefined || command.repeatMode != undefined) {
            result += " " + (command.fadeSeconds == undefined ? "0" : command.fadeSeconds);
        }
        if (command.repeatMode != undefined) {
            result += command.repeatMode == MCFunctionAST.MusicRepeatMode.Loop ? " loop" : " play_once";
        }
        return result;
    }

    function compileGameRule(command: MCFunctionAST.GameRuleCommand): string {
        if (command.action == MCFunctionAST.GameRuleAction.List) return "gamerule";
        let result = "gamerule " + command.ruleId;
        if (command.action == MCFunctionAST.GameRuleAction.SetBoolean) {
            return result + (command.booleanValue ? " true" : " false");
        }
        if (command.action == MCFunctionAST.GameRuleAction.SetInteger) {
            return result + " " + command.integerValue;
        }
        if (command.action == MCFunctionAST.GameRuleAction.SetEnum) {
            return result + " " + command.enumValue;
        }
        return result;
    }

    /** Bedrock canonical names and numeric IDs, no arbitrary level insertion. */
    function compileEnchant(command: MCFunctionAST.EnchantCommand): string {
        let token = command.idKind == MCFunctionAST.EnchantmentIdKind.Numeric
            ? "" + command.enchantmentNumber : command.enchantmentName;
        let result = "enchant " + compileSelector(command.target) + " " + token;
        if (command.level != undefined) result = result + " " + command.level;
        return result;
    }

    function compileSay(command: MCFunctionAST.SayCommand): string {
        return "say " + command.message;
    }

    function compileMcFunction(command: MCFunctionAST.McFunctionCommand): string {
        return "function " + command.functionId;
    }


    function compileTag(command: MCFunctionAST.TagCommand): string {
        let result = "tag " + compileSelector(command.target) + " ";

        if (command.action == MCFunctionAST.TagActionKind.List) {
            return result + "list";
        }

        if (command.action == MCFunctionAST.TagActionKind.Add) {
            return result + "add " + command.name;
        }

        return result + "remove " + command.name;
    }

    function compileGameMode(command: MCFunctionAST.GameModeCommand): string {
        let result = "gamemode " + compileGameModeToken(command.gameMode);
        if (command.target) {
            result = result + " " + compileSelector(command.target);
        }
        return result;
    }

    function compileGameModeToken(gameMode: MCFunctionAST.GameMode): string {
        if (gameMode == MCFunctionAST.GameMode.Creative) return "creative";
        if (gameMode == MCFunctionAST.GameMode.Adventure) return "adventure";
        if (gameMode == MCFunctionAST.GameMode.Spectator) return "spectator";
        return "survival";
    }

    function compileKill(command: MCFunctionAST.KillCommand): string {
        if (command.target) {
            return "kill " + compileSelector(command.target);
        }
        return "kill";
    }

    function compileClear(command: MCFunctionAST.ClearCommand): string {
        let result = "clear";

        if (command.target) {
            result = result + " " + compileSelector(command.target);
        } else if (command.itemId != undefined) {
            // Once a later optional slot is present, Bedrock needs the player
            // position occupied. Preserve the UI meaning by targeting self.
            result = result + " @s";
        }

        if (command.itemId == undefined) {
            return result;
        }

        result = result + " " + command.itemId;

        if (command.data == undefined && command.maxCount == undefined) {
            return result;
        }

        let data = command.data;
        if (data == undefined) data = -1;
        result = result + " " + data;

        if (command.maxCount != undefined) {
            result = result + " " + command.maxCount;
        }

        return result;
    }

    function escapeBlockStateText(value: string): string {
        let result = "";
        for (let i = 0; i < value.length; i++) {
            let ch = value.charAt(i);
            if (ch == "\\" || ch == "\"") result = result + "\\";
            result = result + ch;
        }
        return result;
    }

    export function compileBlockStates(states: MCFunctionAST.BlockStates): string {
        let result = "[";

        for (let i = 0; i < states.entries.length; i++) {
            if (i > 0) result = result + ",";

            let entry = states.entries[i];
            result = result + "\"" + escapeBlockStateText(entry.key) + "\"=";

            if (entry.kind == MCFunctionAST.BlockStateValueKind.String) {
                result = result + "\"" + escapeBlockStateText(entry.stringValue) + "\"";
            } else if (entry.kind == MCFunctionAST.BlockStateValueKind.Number) {
                result = result + entry.numberValue;
            } else {
                result = result + (entry.booleanValue ? "true" : "false");
            }
        }

        return result + "]";
    }

    function compileSetBlockMode(mode: MCFunctionAST.SetBlockMode): string {
        if (mode == MCFunctionAST.SetBlockMode.Destroy) return "destroy";
        if (mode == MCFunctionAST.SetBlockMode.Keep) return "keep";
        return "replace";
    }

    function compileFillMode(mode: MCFunctionAST.FillMode): string {
        if (mode == MCFunctionAST.FillMode.Destroy) return "destroy";
        if (mode == MCFunctionAST.FillMode.Hollow) return "hollow";
        if (mode == MCFunctionAST.FillMode.Keep) return "keep";
        if (mode == MCFunctionAST.FillMode.Outline) return "outline";
        return "replace";
    }

    function compileCloneMode(mode: MCFunctionAST.CloneMode): string {
        if (mode == MCFunctionAST.CloneMode.Force) return "force";
        if (mode == MCFunctionAST.CloneMode.Move) return "move";
        return "normal";
    }

    function compileCloneMask(mask: MCFunctionAST.CloneMaskKind): string {
        if (mask == MCFunctionAST.CloneMaskKind.Masked) return "masked";
        if (mask == MCFunctionAST.CloneMaskKind.Filtered) return "filtered";
        return "replace";
    }

    function compileSetBlock(command: MCFunctionAST.SetBlockCommand): string {
        let result =
            "setblock " +
            compilePosition(command.position) +
            " " + command.blockId;

        if (command.blockStates && command.blockStates.entries.length > 0) {
            result = result + " " + compileBlockStates(command.blockStates);
        }

        if (command.mode != undefined) {
            result = result + " " + compileSetBlockMode(command.mode);
        }

        return result;
    }

    function compileFill(command: MCFunctionAST.FillCommand): string {
        let result =
            "fill " +
            compilePosition(command.from) + " " +
            compilePosition(command.to) + " " +
            command.blockId;

        if (command.blockStates && command.blockStates.entries.length > 0) {
            result = result + " " + compileBlockStates(command.blockStates);
        }

        if (command.mode != undefined) {
            result = result + " " + compileFillMode(command.mode);
        } else if (command.replaceBlockId != undefined) {
            // Replacement filters require the positional `replace` token.
            result = result + " replace";
        }

        if (command.replaceBlockId != undefined) {
            result = result + " " + command.replaceBlockId;

            if (command.replaceBlockStates && command.replaceBlockStates.entries.length > 0) {
                result = result + " " + compileBlockStates(command.replaceBlockStates);
            }
        }

        return result;
    }

    function compileClone(command: MCFunctionAST.CloneCommand): string {
        let result =
            "clone " +
            compilePosition(command.begin) + " " +
            compilePosition(command.end) + " " +
            compilePosition(command.destination);

        let hasMask = command.maskKind != undefined;
        let hasMode = command.cloneMode != undefined;

        if (!hasMask && !hasMode) {
            return result;
        }

        let mask = command.maskKind;
        if (mask == undefined) mask = MCFunctionAST.CloneMaskKind.Replace;
        result = result + " " + compileCloneMask(mask);

        if (mask == MCFunctionAST.CloneMaskKind.Filtered) {
            let mode = command.cloneMode;
            if (mode == undefined) mode = MCFunctionAST.CloneMode.Normal;
            result = result + " " + compileCloneMode(mode);
            result = result + " " + command.filterBlockId;

            if (command.filterBlockStates && command.filterBlockStates.entries.length > 0) {
                result = result + " " + compileBlockStates(command.filterBlockStates);
            }

            return result;
        }

        if (command.cloneMode != undefined) {
            result = result + " " + compileCloneMode(command.cloneMode);
        }

        return result;
    }

    function compileGive(command: MCFunctionAST.GiveCommand): string {
        let result =
            "give " +
            compileSelector(command.target) +
            " " + command.item.id;

        let hasComponents = !!command.item.components &&
            MCFunctionAST.hasItemCommandComponents(command.item.components);

        // GIVE optional arguments are positional. Preserve omission when
        // possible, and insert Bedrock defaults only when a later slot exists.
        if (
            command.item.amount == undefined &&
            command.item.data == undefined &&
            !hasComponents
        ) {
            return result;
        }

        let amount = command.item.amount;
        if (amount == undefined) amount = 1;
        result = result + " " + amount;

        if (command.item.data == undefined && !hasComponents) {
            return result;
        }

        let data = command.item.data;
        if (data == undefined) data = 0;
        result = result + " " + data;

        if (hasComponents) {
            result = result + " " + compileItemCommandComponents(command.item.components);
        }

        return result;
    }

    function compileEffect(command: MCFunctionAST.EffectCommand): string {
        let result = "effect " + compileSelector(command.target) + " ";

        if (command.mode == MCFunctionAST.EffectMode.ClearAll) {
            return result + "clear";
        }

        if (command.mode == MCFunctionAST.EffectMode.ClearSpecific) {
            return result + "clear " + command.effectId;
        }

        result = result + command.effectId;

        // Bedrock syntax makes the add tail positional and optional.
        // No duration token means Minecraft's default duration is used.
        if (command.durationMode == undefined) {
            return result;
        }

        if (command.durationMode == MCFunctionAST.EffectDurationMode.Infinite) {
            result = result + " infinite";
        } else {
            result = result + " " + command.seconds;
        }

        if (command.amplifier == undefined) {
            return result;
        }
        result = result + " " + command.amplifier;

        if (command.hideParticles == undefined) {
            return result;
        }

        return result + " " + (command.hideParticles ? "true" : "false");
    }


    function compileItemCommandComponents(
        components: MCFunctionAST.ItemCommandComponents
    ): string {
        let result = "{";
        let hasPrevious = false;

        if (components.canDestroy.length > 0) {
            result = result + "\"minecraft:can_destroy\":{\"blocks\":[";
            for (let i = 0; i < components.canDestroy.length; i++) {
                if (i > 0) result = result + ",";
                result = result + "\"" + components.canDestroy[i] + "\"";
            }
            result = result + "]}";
            hasPrevious = true;
        }

        if (components.canPlaceOn.length > 0) {
            if (hasPrevious) result = result + ",";
            result = result + "\"minecraft:can_place_on\":{\"blocks\":[";
            for (let i = 0; i < components.canPlaceOn.length; i++) {
                if (i > 0) result = result + ",";
                result = result + "\"" + components.canPlaceOn[i] + "\"";
            }
            result = result + "]}";
            hasPrevious = true;
        }

        if (components.itemLock != MCFunctionAST.ItemLockMode.None) {
            if (hasPrevious) result = result + ",";
            result = result + "\"minecraft:item_lock\":{\"mode\":\"";
            if (components.itemLock == MCFunctionAST.ItemLockMode.LockInInventory) {
                result = result + "lock_in_inventory";
            } else {
                result = result + "lock_in_slot";
            }
            result = result + "\"}";
            hasPrevious = true;
        }

        if (components.keepOnDeath) {
            if (hasPrevious) result = result + ",";
            result = result + "\"minecraft:keep_on_death\":{}";
        }

        return result + "}";
    }



    /** Compile a Position AST to Bedrock coordinate syntax. */
    export function compilePosition(position: MCFunctionAST.Position): string {
        return compileCoordinate(position.x) + " " +
            compileCoordinate(position.y) + " " +
            compileCoordinate(position.z);
    }

    function compileCoordinate(coordinate: MCFunctionAST.Coordinate): string {
        if (coordinate.mode == MCFunctionAST.CoordinateMode.Absolute) {
            return "" + coordinate.value;
        }

        if (coordinate.mode == MCFunctionAST.CoordinateMode.Relative) {
            if (coordinate.value == 0) return "~";
            return "~" + coordinate.value;
        }

        if (coordinate.value == 0) return "^";
        return "^" + coordinate.value;
    }

    /** Compile a Rotation AST using Bedrock yaw then pitch order. */
    export function compileRotation(rotation: MCFunctionAST.Rotation): string {
        return compileRotationValue(rotation.yaw) + " " +
            compileRotationValue(rotation.pitch);
    }

    function compileRotationValue(value: MCFunctionAST.RotationValue): string {
        if (value.mode == MCFunctionAST.RotationMode.Absolute) {
            return "" + value.value;
        }

        if (value.value == 0) return "~";
        return "~" + value.value;
    }

    function compileTeleport(command: MCFunctionAST.TeleportCommand): string {
        let result = "tp ";

        // Bedrock exposes two canonical TP families:
        //   tp <destination>
        //   tp <victim> <destination>
        // Keep that distinction in the compiled command instead of forcing @s.
        if (command.target) {
            result = result + compilePlayerTarget(command.target) + " ";
        }

        if (command.destination.kind == MCFunctionAST.TeleportDestinationKind.Entity) {
            result = result + compilePlayerTarget(command.destination.entity);
        } else {
            result = result + compilePosition(command.destination.position);

            if (command.orientation) {
                if (command.orientation.kind == MCFunctionAST.TeleportOrientationKind.Rotation) {
                    result = result + " " + compileRotation(command.orientation.rotation);
                } else if (command.orientation.kind == MCFunctionAST.TeleportOrientationKind.FacingPosition) {
                    result = result + " facing " + compilePosition(command.orientation.facingPosition);
                } else if (command.orientation.kind == MCFunctionAST.TeleportOrientationKind.FacingEntity) {
                    result = result + " facing " + compilePlayerTarget(command.orientation.facingEntity);
                }
            }
        }

        if (command.checkForBlocks != undefined) {
            result = result + " " + (command.checkForBlocks ? "true" : "false");
        }

        return result;
    }

    /**
     * Compile the optional ADVANCED SUMMON tail.
     *
     * Education runtime verification (2026-10-06) showed that when a
     * nameTag is present without an explicit spawnEvent, the parser still
     * needs one argument occupying the spawnEvent slot.  We emit a quoted
     * single-space token (" ") only at compile time for that compatibility
     * case.  The AST continues to store spawnEvent as undefined/empty so
     * command meaning is not polluted by a synthetic event ID.
     */
    function appendSummonOptionalTail(
        result: string,
        spawnEvent: string,
        nameTag: string
    ): string {
        let hasSpawnEvent = !!spawnEvent && spawnEvent.length > 0;
        let hasNameTag = !!nameTag && nameTag.length > 0;

        if (hasSpawnEvent) {
            result = result + " " + spawnEvent;
        } else if (hasNameTag) {
            // Education compatibility placeholder for the omitted spawnEvent.
            result = result + " \" \"";
        }

        if (hasNameTag) {
            result = result + " " + quoteCommandString(nameTag);
        }

        return result;
    }

    function quoteCommandString(value: string): string {
        let result = "\"";
        for (let i = 0; i < value.length; i++) {
            let ch = value.charAt(i);
            if (ch == "\\" || ch == "\"") result = result + "\\";
            result = result + ch;
        }
        return result + "\"";
    }

    function compileSummonOrientation(
        orientation: MCFunctionAST.SummonOrientation
    ): string {
        if (!orientation || orientation.kind == MCFunctionAST.SummonOrientationKind.None) {
            return "";
        }

        if (orientation.kind == MCFunctionAST.SummonOrientationKind.Rotation) {
            return compileRotation(orientation.rotation);
        }

        if (orientation.kind == MCFunctionAST.SummonOrientationKind.Facing && orientation.facing) {
            if (orientation.facing.kind == MCFunctionAST.FacingKind.Position) {
                return "facing " + compilePosition(orientation.facing.position);
            }

            if (orientation.facing.kind == MCFunctionAST.FacingKind.Entity) {
                return "facing " + compileSelector(orientation.facing.entitySelector);
            }
        }

        return "";
    }

    function compileSummon(command: MCFunctionAST.SummonCommand): string {
        let result = "summon " + command.entityId;

        if (command.form == MCFunctionAST.SummonForm.Simple) {
            // Bedrock name-tag overload:
            // summon <entity> <nameTag> [spawnPos]
            // Name may be empty; a position without a name uses the normal spawnPos overload.
            if (command.nameTag && command.nameTag.length > 0) {
                result = result + " " + quoteCommandString(command.nameTag);
            }

            if (command.spawnPosition) {
                result = result + " " + compilePosition(command.spawnPosition);
            }

            return result;
        }

        let hasSpawnEvent = !!command.spawnEvent && command.spawnEvent.length > 0;
        let hasNameTag = !!command.nameTag && command.nameTag.length > 0;
        let hasNoOrientation =
            !command.orientation ||
            command.orientation.kind == MCFunctionAST.SummonOrientationKind.None;

        // Bedrock/Education has a separate name-tag overload:
        // summon <entity> <nameTag> [spawnPos]
        //
        // When ADVANCED explicitly selects No Orientation and has no spawnEvent,
        // preserve that meaning by selecting this overload instead of emitting
        // position + synthetic event/rotation placeholders.
        if (hasNoOrientation && !hasSpawnEvent && hasNameTag) {
            result = result + " " + quoteCommandString(command.nameTag);
            if (command.spawnPosition) {
                result = result + " " + compilePosition(command.spawnPosition);
            }
            return result;
        }

        if (command.spawnPosition) {
            result = result + " " + compilePosition(command.spawnPosition);
        }

        let orientationText = compileSummonOrientation(command.orientation);
        if (orientationText.length > 0) {
            result = result + " " + orientationText;
        }

        return appendSummonOptionalTail(result, command.spawnEvent, command.nameTag);
    }

    /** Compile a structured Selector AST into Bedrock/Education selector syntax. */
    export function compileSelector(selector: MCFunctionAST.Selector): string {
        let result = MCFunctionAST.selectorBaseToken(selector.base);

        if (
            selector.filters.length == 0 &&
            selector.scores.length == 0 &&
            selector.hasItems.length == 0
        ) {
            return result;
        }

        result = result + "[";
        let hasPrevious = false;

        for (let i = 0; i < selector.filters.length; i++) {
            if (hasPrevious) result = result + ",";

            let filter = selector.filters[i];
            result = result + filter.key + "=";
            if (filter.inverted) result = result + "!";
            result = result + filter.value;
            hasPrevious = true;
        }

        if (selector.scores.length > 0) {
            if (hasPrevious) result = result + ",";
            result = result + "scores={";

            for (let i = 0; i < selector.scores.length; i++) {
                if (i > 0) result = result + ",";

                let score = selector.scores[i];
                result = result + score.objective + "=";
                if (score.inverted) result = result + "!";

                if (score.range.hasMin && score.range.hasMax) {
                    if (score.range.min == score.range.max) {
                        result = result + score.range.min;
                    } else {
                        result = result + score.range.min + ".." + score.range.max;
                    }
                } else if (score.range.hasMin) {
                    result = result + score.range.min + "..";
                } else if (score.range.hasMax) {
                    result = result + ".." + score.range.max;
                }
            }

            result = result + "}";
            hasPrevious = true;
        }

        if (selector.hasItems.length > 0) {
            if (hasPrevious) result = result + ",";

            result = result + "hasitem=";
            if (selector.hasItems.length > 1) result = result + "[";

            for (let i = 0; i < selector.hasItems.length; i++) {
                if (i > 0) result = result + ",";

                let hasItem = selector.hasItems[i];
                result = result + "{item=" + hasItem.itemId;

                if (hasItem.quantity.hasMin && hasItem.quantity.hasMax) {
                    result = result + ",quantity=";
                    if (hasItem.quantity.min == hasItem.quantity.max) {
                        result = result + hasItem.quantity.min;
                    } else {
                        result = result + hasItem.quantity.min + ".." + hasItem.quantity.max;
                    }
                } else if (hasItem.quantity.hasMin) {
                    result = result + ",quantity=" + hasItem.quantity.min + "..";
                } else if (hasItem.quantity.hasMax) {
                    result = result + ",quantity=.." + hasItem.quantity.max;
                }

                if (hasItem.hasLocation) {
                    result = result + ",location=" + MCFunctionAST.slotLocationToken(hasItem.location);
                }

                if (hasItem.hasSlot) {
                    result = result + ",slot=";
                    if (hasItem.slot.hasMin && hasItem.slot.hasMax) {
                        if (hasItem.slot.min == hasItem.slot.max) {
                            result = result + hasItem.slot.min;
                        } else {
                            result = result + hasItem.slot.min + ".." + hasItem.slot.max;
                        }
                    } else if (hasItem.slot.hasMin) {
                        result = result + hasItem.slot.min + "..";
                    } else if (hasItem.slot.hasMax) {
                        result = result + ".." + hasItem.slot.max;
                    }
                }

                if (hasItem.hasData) {
                    result = result + ",data=" + hasItem.data;
                }

                result = result + "}";
            }
            if (selector.hasItems.length > 1) result = result + "]";
        }

        result = result + "]";
        return result;
    }
}

