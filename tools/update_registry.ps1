param(
    [switch]$Apply,
    [switch]$SkipGenerate
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# GitHub and Microsoft endpoints require modern TLS on older Windows PowerShell builds.
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}

$Root = Split-Path -Parent $PSScriptRoot
$SourceDir = Join-Path $Root 'registry\source\bedrock'
$DerivedDir = Join-Path $Root 'registry\derived\bedrock'
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$Headers = @{
    'User-Agent' = 'command_block_codeing-registry-updater/1.4'
    'Accept' = 'application/vnd.github+json, text/plain, */*'
}

$Urls = [ordered]@{
    items            = 'https://raw.githubusercontent.com/MicrosoftDocs/minecraft-creator/refs/heads/main/creator/Commands/enums/Item.md'
    blocks           = 'https://raw.githubusercontent.com/MicrosoftDocs/minecraft-creator/refs/heads/main/creator/Commands/enums/Block.md'
    entity_types     = 'https://raw.githubusercontent.com/MicrosoftDocs/minecraft-creator/refs/heads/main/creator/Commands/enums/EntityType.md'
    entity_listing   = 'https://raw.githubusercontent.com/MicrosoftDocs/minecraft-creator/refs/heads/main/creator/Reference/Content/VanillaListingsReference/Entities.md'
    effects          = 'https://raw.githubusercontent.com/MicrosoftDocs/minecraft-creator/refs/heads/main/creator/Commands/commands/effect.md'
    entity_events    = 'https://raw.githubusercontent.com/MicrosoftDocs/minecraft-creator/refs/heads/main/creator/Commands/enums/EntityEvents.md'
    particles_api    = 'https://api.github.com/repos/Mojang/bedrock-samples/contents/resource_pack/particles?ref=main'
    entity_files_api = 'https://api.github.com/repos/Mojang/bedrock-samples/contents/behavior_pack/entities?ref=main'
    block_metadata    = 'https://raw.githubusercontent.com/Mojang/bedrock-samples/main/metadata/vanilladata_modules/mojang-blocks.json'
}

function Get-WebText([string]$Url) {
    $Params = @{
        Uri = $Url
        Headers = $Headers
        Method = 'Get'
        ErrorAction = 'Stop'
    }
    if ($PSVersionTable.PSVersion.Major -le 5) { $Params['UseBasicParsing'] = $true }
    $Response = Invoke-WebRequest @Params
    return [string]$Response.Content
}

function Remove-JsonComments([string]$Text) {
    # Mojang behavior/resource JSON may contain // or /* */ comments.
    # Windows PowerShell ConvertFrom-Json only accepts strict JSON, so strip
    # comments while preserving comment-like text inside quoted strings.
    $Builder = New-Object System.Text.StringBuilder
    $InString = $false
    $Escape = $false
    $InLineComment = $false
    $InBlockComment = $false

    for ($i = 0; $i -lt $Text.Length; $i++) {
        $Char = $Text[$i]
        $Next = if (($i + 1) -lt $Text.Length) { $Text[$i + 1] } else { [char]0 }

        if ($InLineComment) {
            if ($Char -eq "`r" -or $Char -eq "`n") {
                $InLineComment = $false
                [void]$Builder.Append($Char)
            }
            continue
        }

        if ($InBlockComment) {
            if ($Char -eq '*' -and $Next -eq '/') {
                $InBlockComment = $false
                $i++
            }
            elseif ($Char -eq "`r" -or $Char -eq "`n") {
                # Preserve line breaks for readable parse-error locations.
                [void]$Builder.Append($Char)
            }
            continue
        }

        if ($InString) {
            [void]$Builder.Append($Char)
            if ($Escape) {
                $Escape = $false
            }
            elseif ($Char -eq '\') {
                $Escape = $true
            }
            elseif ($Char -eq '"') {
                $InString = $false
            }
            continue
        }

        if ($Char -eq '"') {
            $InString = $true
            [void]$Builder.Append($Char)
            continue
        }

        if ($Char -eq '/' -and $Next -eq '/') {
            $InLineComment = $true
            $i++
            continue
        }

        if ($Char -eq '/' -and $Next -eq '*') {
            $InBlockComment = $true
            $i++
            continue
        }

        [void]$Builder.Append($Char)
    }

    return $Builder.ToString()
}

function ConvertFrom-Jsonc([string]$Text) {
    return (Remove-JsonComments $Text | ConvertFrom-Json)
}

function Get-UniqueOrdered([object[]]$Values) {
    $Seen = @{}
    $Result = New-Object 'System.Collections.Generic.List[string]'
    foreach ($Value in $Values) {
        $Text = [string]$Value
        if ([string]::IsNullOrWhiteSpace($Text)) { continue }
        if (-not $Seen.ContainsKey($Text)) {
            $Seen[$Text] = $true
            [void]$Result.Add($Text)
        }
    }
    return $Result.ToArray()
}

function Parse-NamespacedEnum([string]$Markdown) {
    $Values = foreach ($Match in [regex]::Matches($Markdown, '`(minecraft:[a-z0-9_]+)`')) {
        $Match.Groups[1].Value
    }
    return @(Get-UniqueOrdered $Values)
}

function Parse-Entities([string]$Markdown) {
    $Out = New-Object 'System.Collections.Generic.List[string]'
    foreach ($Line in ($Markdown -split "`r?`n")) {
        $Trimmed = $Line.Trim()
        if (-not $Trimmed.StartsWith('|')) { continue }
        $Cells = $Trimmed.Split('|')
        if ($Cells.Count -lt 4) { continue }
        $Cell = $Cells[1].Trim()
        if ($Cell -eq 'Identifier' -or $Cell -match '^:?-+:?$') { continue }

        $LinkMatch = [regex]::Match($Cell, '^\[([a-z0-9_]+)\]\([^)]+\)$')
        $Identifier = if ($LinkMatch.Success) { $LinkMatch.Groups[1].Value } else { $Cell.Trim('`') }
        if ($Identifier -notmatch '^[a-z0-9_]+$') { continue }
        if ($Identifier -eq 'undefined_test_only') { continue }
        [void]$Out.Add('minecraft:' + $Identifier)
    }
    return @(Get-UniqueOrdered $Out.ToArray())
}

function Get-MarkdownBacktickListValues([string]$Markdown, [string]$ValuesHeadingRegex, [string]$ValueRegex) {
    # MicrosoftDocs Markdown generators may use *, -, or + as list bullets.
    # Parse the Values section by heading rather than depending on one exact bullet style.
    $Heading = [regex]::Match($Markdown, $ValuesHeadingRegex)
    if (-not $Heading.Success) { return @() }

    $SectionStart = $Heading.Index + $Heading.Length
    $Section = $Markdown.Substring($SectionStart)

    # Stop at the next Markdown heading, if any.
    $NextHeading = [regex]::Match($Section, '(?m)^\s*#{1,6}\s+')
    if ($NextHeading.Success) {
        $Section = $Section.Substring(0, $NextHeading.Index)
    }

    $Values = foreach ($Match in [regex]::Matches(
        $Section,
        '(?m)^\s*[-*+]\s+`(' + $ValueRegex + ')`'
    )) {
        $Match.Groups[1].Value.Trim()
    }

    return @(Get-UniqueOrdered $Values)
}

function Parse-Effects([string]$Markdown) {
    # Current official /effect docs expose the Effect enum under:
    #   ### `Effect`
    #   #### Values
    # Keep the parser tolerant of Markdown list-marker changes.
    $EffectHeading = [regex]::Match($Markdown, '(?mi)^\s*###\s+`?Effect`?\s*$')
    if (-not $EffectHeading.Success) { return @() }

    $EffectSection = $Markdown.Substring($EffectHeading.Index + $EffectHeading.Length)
    return @(Get-MarkdownBacktickListValues         $EffectSection         '(?mi)^\s*####\s+Values\s*$'         '[a-z][a-z0-9_]*')
}

function Parse-EntityEventsEnum([string]$Markdown) {
    return @(Get-MarkdownBacktickListValues         $Markdown         '(?mi)^\s*##\s+Values\s*$'         '[^`]+')
}

function Parse-Particles {
    $Listing = Get-WebText $Urls.particles_api | ConvertFrom-Json
    $Out = New-Object 'System.Collections.Generic.List[string]'
    foreach ($Entry in @($Listing)) {
        if ([string]$Entry.type -ne 'file') { continue }
        if (-not ([string]$Entry.name).EndsWith('.json')) { continue }
        $RawUrl = [string]$Entry.download_url
        if ([string]::IsNullOrWhiteSpace($RawUrl)) { continue }

        try {
            $Data = ConvertFrom-Jsonc (Get-WebText $RawUrl)
            $Identifier = [string]$Data.particle_effect.description.identifier
            if ($Identifier -match '^[a-z0-9_.-]+:[a-z0-9_./-]+$') {
                [void]$Out.Add($Identifier)
            }
        }
        catch {
            Write-Warning "Particle parse failed: $($Entry.name): $($_.Exception.Message)"
        }
    }
    return @(Get-UniqueOrdered $Out.ToArray())
}

function Collect-TypeFamilies([object]$Node, [hashtable]$FamilySet) {
    if ($null -eq $Node) { return }
    if ($Node -is [string] -or $Node -is [ValueType]) { return }

    if ($Node -is [System.Collections.IEnumerable] -and -not ($Node -is [System.Management.Automation.PSCustomObject])) {
        foreach ($Child in $Node) { Collect-TypeFamilies $Child $FamilySet }
        return
    }

    if ($Node -is [System.Management.Automation.PSCustomObject]) {
        foreach ($Property in $Node.PSObject.Properties) {
            if ($Property.Name -eq 'minecraft:type_family' -and $null -ne $Property.Value) {
                $FamilyProperty = $Property.Value.PSObject.Properties['family']
                if ($null -ne $FamilyProperty) {
                    foreach ($Family in @($FamilyProperty.Value)) {
                        $Value = [string]$Family
                        if (-not [string]::IsNullOrWhiteSpace($Value)) { $FamilySet[$Value] = $true }
                    }
                }
            }
            Collect-TypeFamilies $Property.Value $FamilySet
        }
    }
}

function Add-SpawnEventValue([object]$Value, [hashtable]$SpawnEventSet) {
    if ($null -eq $Value) { return }

    if ($Value -is [string]) {
        $EventId = [string]$Value
        if (-not [string]::IsNullOrWhiteSpace($EventId)) { $SpawnEventSet[$EventId] = $true }
        return
    }

    if ($Value -is [System.Collections.IEnumerable] -and -not ($Value -is [System.Management.Automation.PSCustomObject])) {
        foreach ($Child in $Value) { Add-SpawnEventValue $Child $SpawnEventSet }
        return
    }

    if ($Value -is [System.Management.Automation.PSCustomObject]) {
        $EventProperty = $Value.PSObject.Properties['event']
        if ($null -ne $EventProperty -and $EventProperty.Value -is [string]) {
            $EventId = [string]$EventProperty.Value
            if (-not [string]::IsNullOrWhiteSpace($EventId)) { $SpawnEventSet[$EventId] = $true }
        }
    }
}

function Collect-SpawnEventReferences([object]$Node, [hashtable]$SpawnEventSet) {
    if ($null -eq $Node) { return }
    if ($Node -is [string] -or $Node -is [ValueType]) { return }

    if ($Node -is [System.Collections.IEnumerable] -and -not ($Node -is [System.Management.Automation.PSCustomObject])) {
        foreach ($Child in $Node) { Collect-SpawnEventReferences $Child $SpawnEventSet }
        return
    }

    if ($Node -is [System.Management.Automation.PSCustomObject]) {
        foreach ($Property in $Node.PSObject.Properties) {
            if ($Property.Name -eq 'spawn_event') {
                Add-SpawnEventValue $Property.Value $SpawnEventSet
            }
            Collect-SpawnEventReferences $Property.Value $SpawnEventSet
        }
    }
}

function Get-VanillaEntityDerivedData {
    Write-Host 'Downloading Mojang vanilla behavior entity definitions...'
    $Listing = Get-WebText $Urls.entity_files_api | ConvertFrom-Json
    $Files = @($Listing | Where-Object { [string]$_.type -eq 'file' -and ([string]$_.name).EndsWith('.json') })
    if ($Files.Count -lt 80) {
        throw "Entity file listing returned only $($Files.Count) JSON files; expected at least 80."
    }

    $EntityEventMap = @{}
    $FamilyEntityMap = @{}
    $SpawnEventReferenceSet = @{}
    $ParsedCount = 0

    foreach ($Entry in $Files) {
        $RawUrl = [string]$Entry.download_url
        if ([string]::IsNullOrWhiteSpace($RawUrl)) { continue }

        try {
            $Data = ConvertFrom-Jsonc (Get-WebText $RawUrl)
            $EntityRootProperty = $Data.PSObject.Properties['minecraft:entity']
            if ($null -eq $EntityRootProperty) { continue }
            $EntityRoot = $EntityRootProperty.Value

            $DescriptionProperty = $EntityRoot.PSObject.Properties['description']
            if ($null -eq $DescriptionProperty) { continue }
            $IdentifierProperty = $DescriptionProperty.Value.PSObject.Properties['identifier']
            if ($null -eq $IdentifierProperty) { continue }
            $EntityId = [string]$IdentifierProperty.Value
            if ($EntityId -notmatch '^[a-z0-9_.-]+:[a-z0-9_./-]+$') { continue }

            $EventSet = @{}
            $EventsProperty = $EntityRoot.PSObject.Properties['events']
            if ($null -ne $EventsProperty -and $null -ne $EventsProperty.Value) {
                foreach ($EventProperty in $EventsProperty.Value.PSObject.Properties) {
                    $EventId = [string]$EventProperty.Name
                    if (-not [string]::IsNullOrWhiteSpace($EventId)) { $EventSet[$EventId] = $true }
                }
            }
            $EntityEventMap[$EntityId] = @($EventSet.Keys | Sort-Object)

            # Collect explicit vanilla spawn_event references anywhere in the behavior JSON.
            # These references are later intersected with each target entity's own event list.
            Collect-SpawnEventReferences $EntityRoot $SpawnEventReferenceSet

            $FamilySet = @{}
            Collect-TypeFamilies $EntityRoot $FamilySet
            foreach ($Family in $FamilySet.Keys) {
                if (-not $FamilyEntityMap.ContainsKey($Family)) { $FamilyEntityMap[$Family] = @{} }
                $FamilyEntityMap[$Family][$EntityId] = $true
            }

            $ParsedCount++
            if (($ParsedCount % 20) -eq 0) { Write-Host "  parsed $ParsedCount / $($Files.Count) entity files" }
        }
        catch {
            Write-Warning "Entity parse failed: $($Entry.name): $($_.Exception.Message)"
        }
    }

    $Families = @(
        $FamilyEntityMap.Keys | Sort-Object | ForEach-Object {
            [ordered]@{
                id = [string]$_
                entities = @($FamilyEntityMap[$_].Keys | Sort-Object)
            }
        }
    )

    $EntityEvents = @(
        $EntityEventMap.Keys | Sort-Object | ForEach-Object {
            [ordered]@{
                entity = [string]$_
                events = @($EntityEventMap[$_])
            }
        }
    )

    # /summon accepts the EntityEvents argument domain.  Keep every event defined by
    # the owner entity available in the SPAWN EVENT Library, but preserve the former
    # evidence-backed spawn-oriented subset as `recommendedEvents` metadata.
    # `spawnRecommended` is an authoring hint, never a whitelist.
    $SpawnEventCandidateSet = @{}
    foreach ($EventId in $SpawnEventReferenceSet.Keys) { $SpawnEventCandidateSet[$EventId] = $true }
    foreach ($BuiltIn in @('minecraft:entity_spawned', 'minecraft:entity_born', 'minecraft:entity_transformed')) {
        $SpawnEventCandidateSet[$BuiltIn] = $true
    }

    $SpawnEvents = @(
        $EntityEventMap.Keys | Sort-Object | ForEach-Object {
            $EntityId = [string]$_
            $AllEvents = @(@($EntityEventMap[$EntityId]) | Sort-Object)
            if ($AllEvents.Count -gt 0) {
                $Recommended = @(
                    $AllEvents | Where-Object { $SpawnEventCandidateSet.ContainsKey([string]$_) } | Sort-Object
                )
                [ordered]@{
                    entity = $EntityId
                    events = $AllEvents
                    recommendedEvents = $Recommended
                }
            }
        }
    )

    $EntityEventRelationCount = 0
    foreach ($Entry in $EntityEvents) { $EntityEventRelationCount += @($Entry.events).Count }
    $SpawnEventRelationCount = 0
    $SpawnRecommendedRelationCount = 0
    foreach ($Entry in $SpawnEvents) {
        $SpawnEventRelationCount += @($Entry.events).Count
        $SpawnRecommendedRelationCount += @($Entry.recommendedEvents).Count
    }

    return [ordered]@{
        ParsedEntityFiles = $ParsedCount
        Families = $Families
        EntityEvents = $EntityEvents
        SpawnEvents = $SpawnEvents
        EntityEventRelationCount = $EntityEventRelationCount
        SpawnEventRelationCount = $SpawnEventRelationCount
        SpawnRecommendedRelationCount = $SpawnRecommendedRelationCount
        SpawnEventReferenceCount = $SpawnEventReferenceSet.Count
    }
}


function Get-BlockStateRole([string]$StateId) {
    $Id = $StateId.ToLowerInvariant()

    if (
        $Id.Contains('direction') -or $Id.Contains('axis') -or $Id.Contains('rotation') -or
        $Id.Contains('facing') -or $Id.Contains('face') -or $Id.Contains('attachment') -or
        $Id.Contains('hanging')
    ) { return 'orientation' }

    if (
        $Id.Contains('open') -or $Id.Contains('powered') -or $Id.Contains('triggered') -or
        $Id.Contains('pressed') -or $Id.Contains('redstone') -or $Id.Contains('signal') -or
        $Id.Contains('lit') -or $Id.Contains('active') -or $Id.Contains('crafting')
    ) { return 'activation' }

    if (
        $Id.Contains('wall') -or $Id.Contains('upper') -or $Id.Contains('lower') -or
        $Id.Contains('upside') -or $Id.Contains('hinge') -or $Id.Contains('half') -or
        $Id.Contains('connection') -or $Id.Contains('shape') -or $Id.Contains('post')
    ) { return 'structure' }

    if (
        $Id.Contains('age') -or $Id.Contains('growth') -or $Id.Contains('level') -or
        $Id.Contains('count') -or $Id.Contains('stage') -or $Id.Contains('progress') -or
        $Id.Contains('moist') -or $Id.Contains('books_stored') -or $Id.Contains('candles')
    ) { return 'level' }

    if (
        $Id.Contains('color') -or $Id.Contains('type') -or $Id.Contains('variant') -or
        $Id.Contains('material') -or $Id.Contains('thickness') -or $Id.Contains('damage') -or
        $Id.Contains('flower') -or $Id.Contains('wood') -or $Id.Contains('stone')
    ) { return 'variant' }

    if ($Id.Contains('chemistry') -or $Id.Contains('allow_underwater') -or $Id.Contains('deprecated')) {
        return 'special'
    }

    return 'other'
}

function Get-VanillaBlockStateDerivedData {
    Write-Host 'Downloading Mojang vanilla block metadata...'
    $Metadata = Get-WebText $Urls.block_metadata | ConvertFrom-Json
    $Properties = @($Metadata.block_properties)
    $DataItems = @($Metadata.data_items)

    if ($Properties.Count -lt 100) {
        throw "Block metadata contains only $($Properties.Count) block properties; expected at least 100."
    }
    if ($DataItems.Count -lt 500) {
        throw "Block metadata contains only $($DataItems.Count) data items; expected at least 500."
    }

    $PropertyMap = @{}
    foreach ($Property in $Properties) {
        $Name = [string]$Property.name
        if ([string]::IsNullOrWhiteSpace($Name)) { continue }
        $PropertyMap[$Name] = $Property
    }

    $UsedStateSet = @{}
    $BlockEntries = New-Object 'System.Collections.Generic.List[object]'
    $RelationCount = 0

    foreach ($Item in $DataItems) {
        $BlockId = [string]$Item.name
        if ($BlockId -notmatch '^[a-z0-9_.-]+:[a-z0-9_./-]+$') { continue }

        $StateNames = New-Object 'System.Collections.Generic.List[string]'
        $SeenState = @{}
        foreach ($PropertyRef in @($Item.properties)) {
            $StateId = [string]$PropertyRef.name
            if ([string]::IsNullOrWhiteSpace($StateId)) { continue }
            if (-not $PropertyMap.ContainsKey($StateId)) {
                throw "Block $BlockId references missing block property $StateId."
            }
            if (-not $SeenState.ContainsKey($StateId)) {
                $SeenState[$StateId] = $true
                $UsedStateSet[$StateId] = $true
                [void]$StateNames.Add($StateId)
                $RelationCount++
            }
        }

        [void]$BlockEntries.Add([ordered]@{
            id = $BlockId
            states = @($StateNames.ToArray() | Sort-Object)
        })
    }

    $StateEntries = New-Object 'System.Collections.Generic.List[object]'
    foreach ($StateId in @($UsedStateSet.Keys | Sort-Object)) {
        $Property = $PropertyMap[$StateId]
        $RawType = [string]$Property.type
        $Type = if ($RawType -eq 'bool') { 'boolean' } elseif ($RawType -eq 'int') { 'number' } elseif ($RawType -eq 'string') { 'string' } else { '' }
        if ([string]::IsNullOrWhiteSpace($Type)) {
            throw "Unsupported block property type $RawType for $StateId."
        }

        $Values = @($Property.values | ForEach-Object { $_.value })
        if ($Values.Count -eq 0) {
            throw "Block property $StateId has no allowed values."
        }

        [void]$StateEntries.Add([ordered]@{
            id = $StateId
            type = $Type
            values = $Values
            role = Get-BlockStateRole $StateId
        })
    }

    return [ordered]@{
        # PowerShell 5.1 can throw "Argument types do not match" when an
        # array subexpression wraps Generic.List[object] directly. Materialize
        # the generic lists as CLR arrays before placing them in OrderedDictionary.
        States = $StateEntries.ToArray()
        Blocks = @($BlockEntries.ToArray() | Sort-Object { [string]$_.id })
        RelationCount = $RelationCount
        RawPropertyCount = $Properties.Count
        DataItemCount = $DataItems.Count
    }
}

function New-BlockStateSourceObject([object[]]$States) {
    return [ordered]@{
        schemaVersion = 2
        platform = 'bedrock'
        coverage = 'complete-vanilla-used-properties'
        source = [ordered]@{
            kind = 'vanilla-block-metadata-used-properties-derived'
            provider = 'Mojang/bedrock-samples'
            url = $Urls.block_metadata
            fetchedAtUtc = [DateTime]::UtcNow.ToString('o')
        }
        notes = @(
            'Contains only block properties actually referenced by vanilla data_items; Add-on-only definitions are not imported merely because a Creator schema defines them.',
            'Exact state ID, value type, and allowed values are preserved from Mojang metadata.',
            'Role is authoring UI metadata only and is not AST command meaning.',
            'Custom block/state Direct Input remains supported.'
        )
        states = @($States)
    }
}

function New-BlockStateUsageSourceObject([object[]]$Blocks) {
    return [ordered]@{
        schemaVersion = 2
        platform = 'bedrock'
        coverage = 'complete-vanilla-block-usage'
        source = [ordered]@{
            kind = 'vanilla-block-metadata-usage-derived'
            provider = 'Mojang/bedrock-samples'
            url = $Urls.block_metadata
            fetchedAtUtc = [DateTime]::UtcNow.ToString('o')
        }
        notes = @(
            'Maps every parsed vanilla block data_item to the block properties actually attached to that block.',
            'Used for context-aware diagnostics; Registry data does not replace Minecraft Runtime as final content authority.',
            'Custom blocks are not hard-blocked by this vanilla usage map.'
        )
        blocks = @($Blocks)
    }
}

function Load-OldIds([string]$Directory, [string]$Kind) {
    $Path = Join-Path $Directory ($Kind + '.json')
    if (-not (Test-Path $Path)) { return @() }
    try {
        $Data = Get-Content -Raw -Encoding UTF8 $Path | ConvertFrom-Json
        return @($Data.entries | ForEach-Object { [string]$_.id })
    }
    catch { return @() }
}

function Load-OldRelations([string]$Kind) {
    $Path = Join-Path $DerivedDir ($Kind + '.json')
    if (-not (Test-Path $Path)) { return @() }
    try {
        $Data = Get-Content -Raw -Encoding UTF8 $Path | ConvertFrom-Json
        $Out = New-Object 'System.Collections.Generic.List[string]'
        foreach ($Entry in @($Data.entities)) {
            $EntityId = [string]$Entry.entity
            foreach ($EventId in @($Entry.events)) {
                [void]$Out.Add($EntityId + ' -> ' + [string]$EventId)
            }
        }
        return $Out.ToArray()
    }
    catch { return @() }
}

function Convert-Relations([object[]]$EntityEntries) {
    $Out = New-Object 'System.Collections.Generic.List[string]'
    foreach ($Entry in $EntityEntries) {
        $EntityId = [string]$Entry.entity
        foreach ($EventId in @($Entry.events)) {
            [void]$Out.Add($EntityId + ' -> ' + [string]$EventId)
        }
    }
    return $Out.ToArray()
}

function Show-Diff([string]$Kind, [string[]]$Old, [string[]]$New) {
    $OldSet = @{}; foreach ($Value in $Old) { $OldSet[$Value] = $true }
    $NewSet = @{}; foreach ($Value in $New) { $NewSet[$Value] = $true }

    $Added = @($New | Where-Object { -not $OldSet.ContainsKey($_) } | Sort-Object)
    $Removed = @($Old | Where-Object { -not $NewSet.ContainsKey($_) } | Sort-Object)
    Write-Host ('{0,-14}: {1,5} -> {2,5}  +{3} -{4}' -f $Kind, $Old.Count, $New.Count, $Added.Count, $Removed.Count)
    $Added | Select-Object -First 20 | ForEach-Object { Write-Host "  + $_" }
    if ($Added.Count -gt 20) { Write-Host "  ... +$($Added.Count - 20) more" }
    $Removed | Select-Object -First 20 | ForEach-Object { Write-Host "  - $_" }
    if ($Removed.Count -gt 20) { Write-Host "  ... -$($Removed.Count - 20) more" }
}

function New-SourceObject([string[]]$Ids, [string]$Provider, [string]$Url, [string]$SourceKind, [string[]]$Notes) {
    $Entries = @($Ids | ForEach-Object { [ordered]@{ id = $_ } })
    return [ordered]@{
        schemaVersion = 1
        platform = 'bedrock'
        source = [ordered]@{
            kind = $SourceKind
            provider = $Provider
            url = $Url
            fetchedAtUtc = [DateTime]::UtcNow.ToString('o')
        }
        notes = @($Notes)
        entries = $Entries
    }
}

function New-FamilySourceObject([object[]]$Entries) {
    return [ordered]@{
        schemaVersion = 1
        platform = 'bedrock'
        source = [ordered]@{
            kind = 'vanilla-behavior-type-family-derived'
            provider = 'Mojang/bedrock-samples'
            url = $Urls.entity_files_api
            fetchedAtUtc = [DateTime]::UtcNow.ToString('o')
        }
        notes = @(
            'Families are derived from minecraft:type_family components across vanilla behavior entity JSON, including component groups.',
            'Registry is search/autocomplete data, not a whitelist.',
            'Custom family strings remain supported through Direct Input.',
            'Minecraft Education support is NOT inferred from this Bedrock snapshot.'
        )
        entries = @($Entries)
    }
}

function New-EventSourceObject([object[]]$Entries, [string]$Context) {
    $ContextNote = if ($Context -eq 'event') {
        'Used by the EVENT Library for /event entity <target> <eventName>.'
    } else {
        'Used by the SPAWN EVENT Library for /summon ... <spawnEvent>.'
    }
    $SourceKind = if ($Context -eq 'event') {
        'vanilla-behavior-entity-events-derived'
    } else {
        'vanilla-behavior-owner-events-with-spawn-recommendation-derived'
    }
    $ContextNotes = if ($Context -eq 'event') {
        @(
            'Contains all events defined by each vanilla behavior entity JSON.'
        )
    } else {
        @(
            'Contains all events defined by each vanilla behavior entity JSON so /summon authoring does not hide owner events.',
            'recommendedEvents preserves the evidence-backed spawn-oriented subset: documented initialization events plus explicit vanilla spawn_event references.',
            'spawnRecommended is authoring metadata, not a whitelist. Non-recommended owner events may intentionally create unusual initialization states.'
        )
    }
    $Notes = @(
        $ContextNote,
        'Values are grouped by the entity whose behavior JSON defines the event.'
    ) + @($ContextNotes) + @(
        'Minecraft Education support is NOT inferred from this Bedrock snapshot.'
    )
    return [ordered]@{
        schemaVersion = $(if ($Context -eq 'spawn') { 2 } else { 1 })
        platform = 'bedrock'
        source = [ordered]@{
            kind = $SourceKind
            provider = 'Mojang/bedrock-samples'
            url = $Urls.entity_files_api
            fetchedAtUtc = [DateTime]::UtcNow.ToString('o')
        }
        notes = $Notes
        entities = @($Entries)
    }
}

Write-Host 'Downloading official Bedrock Registry sources...'
$Data = [ordered]@{}
$Data.items = @(Parse-NamespacedEnum (Get-WebText $Urls.items))
$Data.blocks = @(Parse-NamespacedEnum (Get-WebText $Urls.blocks))
$CommandEntityTypes = @(Parse-NamespacedEnum (Get-WebText $Urls.entity_types))
$ListingEntities = @(Parse-Entities (Get-WebText $Urls.entity_listing))
$Data.entities = @(Get-UniqueOrdered (@($CommandEntityTypes) + @($ListingEntities)))
$Data.effects = @(Parse-Effects (Get-WebText $Urls.effects))
$Data.particles = @(Parse-Particles)
$OfficialEntityEvents = @(Parse-EntityEventsEnum (Get-WebText $Urls.entity_events))

$Derived = Get-VanillaEntityDerivedData
$BlockStateDerived = Get-VanillaBlockStateDerivedData
$FamilyIds = @($Derived.Families | ForEach-Object { [string]$_.id })
$EntityRelations = @(Convert-Relations @($Derived.EntityEvents))
$SpawnRelations = @(Convert-Relations @($Derived.SpawnEvents))

$Guards = @{ items=500; blocks=500; entities=100; effects=20; particles=80 }
foreach ($Kind in $Data.Keys) {
    if ($Data[$Kind].Count -lt $Guards[$Kind]) {
        throw "$Kind parse returned only $($Data[$Kind].Count); expected at least $($Guards[$Kind]). No files written."
    }
}
if ($CommandEntityTypes.Count -lt 90) {
    throw "Official EntityType enum parse returned only $($CommandEntityTypes.Count); expected at least 90. No files written."
}
if ($ListingEntities.Count -lt 100) {
    throw "Vanilla entity listing parse returned only $($ListingEntities.Count); expected at least 100. No files written."
}
if ($OfficialEntityEvents.Count -lt 200) {
    throw "Official EntityEvents enum parse returned only $($OfficialEntityEvents.Count); expected at least 200. No files written."
}
if ($Derived.ParsedEntityFiles -lt 80) {
    throw "Only $($Derived.ParsedEntityFiles) vanilla entity files parsed; expected at least 80. No files written."
}
if ($FamilyIds.Count -lt 40) {
    throw "Only $($FamilyIds.Count) family values derived; expected at least 40. No files written."
}
if ($Derived.EntityEventRelationCount -lt 200) {
    throw "Only $($Derived.EntityEventRelationCount) entity-event relations derived; expected at least 200. No files written."
}
if ($Derived.SpawnEventRelationCount -lt 200) {
    throw "Only $($Derived.SpawnEventRelationCount) owner spawn-event relations derived; expected at least 200. No files written."
}
if ($Derived.SpawnRecommendedRelationCount -lt 20) {
    throw "Only $($Derived.SpawnRecommendedRelationCount) spawn-recommended relations derived; expected at least 20. No files written."
}
if ($BlockStateDerived.States.Count -lt 100) {
    throw "Only $($BlockStateDerived.States.Count) command-relevant block states derived; expected at least 100. No files written."
}
if ($BlockStateDerived.Blocks.Count -lt 500) {
    throw "Only $($BlockStateDerived.Blocks.Count) vanilla block usage records derived; expected at least 500. No files written."
}
if ($BlockStateDerived.RelationCount -lt 500) {
    throw "Only $($BlockStateDerived.RelationCount) block/state relations derived; expected at least 500. No files written."
}

Write-Host ''
Write-Host 'Diff:'
foreach ($Kind in $Data.Keys) {
    Show-Diff $Kind @(Load-OldIds $SourceDir $Kind) @($Data[$Kind])
}
Show-Diff 'families' @(Load-OldIds $DerivedDir 'families') @($FamilyIds)
Show-Diff 'entity_events' @(Load-OldRelations 'entity_events') @($EntityRelations)
Show-Diff 'spawn_events' @(Load-OldRelations 'spawn_events') @($SpawnRelations)
Write-Host ('{0,-14}: {1}' -f 'entity enum', $CommandEntityTypes.Count)
Write-Host ('{0,-14}: {1}' -f 'entity listing', $ListingEntities.Count)
Write-Host ('{0,-14}: {1}' -f 'official events', $OfficialEntityEvents.Count)
Write-Host ('{0,-14}: {1}' -f 'entity files', $Derived.ParsedEntityFiles)
Write-Host ('{0,-14}: {1}' -f 'spawn refs', $Derived.SpawnEventReferenceCount)
Write-Host ('{0,-14}: {1}' -f 'spawn recommended', $Derived.SpawnRecommendedRelationCount)
Write-Host ('{0,-14}: {1}' -f 'block states', $BlockStateDerived.States.Count)
Write-Host ('{0,-14}: {1}' -f 'block usage', $BlockStateDerived.Blocks.Count)
Write-Host ('{0,-14}: {1}' -f 'state links', $BlockStateDerived.RelationCount)

if (-not $Apply) {
    Write-Host ''
    Write-Host 'Check-only mode. Re-run with -Apply to write snapshots and regenerate libraries.'
    exit 0
}

if (-not (Test-Path $SourceDir)) { New-Item -ItemType Directory -Force -Path $SourceDir | Out-Null }
if (-not (Test-Path $DerivedDir)) { New-Item -ItemType Directory -Force -Path $DerivedDir | Out-Null }

$CommonNotes = @(
    'Registry is search/autocomplete data, not a whitelist.',
    'Custom namespace/direct input remains supported.',
    'Minecraft Education support is NOT inferred from this Bedrock Stable snapshot.'
)
$Specs = [ordered]@{
    items = @('MicrosoftDocs/minecraft-creator', $Urls.items, 'command-enum-item', @('Canonical minecraft:* item IDs only.') + $CommonNotes)
    blocks = @('MicrosoftDocs/minecraft-creator', $Urls.blocks, 'command-enum-block', @('Canonical minecraft:* block IDs only.') + $CommonNotes)
    entities = @('MicrosoftDocs/minecraft-creator', $Urls.entity_types, 'command-enum-entitytype-with-listing-fallback', @('Primary source is the official EntityType command enum.', 'Secondary documented vanilla-listing fallback: ' + $Urls.entity_listing, 'Registry membership does not by itself prove /summon availability or target-platform support.', 'Custom entity namespaces remain supported through Direct Input.') + $CommonNotes)
    effects = @('MicrosoftDocs/minecraft-creator', $Urls.effects, 'command-enum-effect', @('Effect command tokens do not use minecraft: namespace.') + $CommonNotes)
    particles = @('Mojang/bedrock-samples', $Urls.particles_api, 'vanilla-resource-pack-particle-identifiers', @('Identifiers parsed from particle_effect.description.identifier in Mojang bedrock-samples.', 'Some vanilla particles require Molang/entity context and may not visibly work with /particle.') + $CommonNotes)
}

foreach ($Kind in $Data.Keys) {
    $Spec = $Specs[$Kind]
    $Object = New-SourceObject @($Data[$Kind]) $Spec[0] $Spec[1] $Spec[2] @($Spec[3])
    $Json = $Object | ConvertTo-Json -Depth 12
    $Path = Join-Path $SourceDir ($Kind + '.json')
    [System.IO.File]::WriteAllText($Path, $Json + "`n", $Utf8NoBom)
}

$FamilyObject = New-FamilySourceObject @($Derived.Families)
[System.IO.File]::WriteAllText(
    (Join-Path $DerivedDir 'families.json'),
    (($FamilyObject | ConvertTo-Json -Depth 12) + "`n"),
    $Utf8NoBom
)

$EventObject = New-EventSourceObject @($Derived.EntityEvents) 'event'
[System.IO.File]::WriteAllText(
    (Join-Path $DerivedDir 'entity_events.json'),
    (($EventObject | ConvertTo-Json -Depth 12) + "`n"),
    $Utf8NoBom
)

$BlockStateObject = New-BlockStateSourceObject @($BlockStateDerived.States)
[System.IO.File]::WriteAllText(
    (Join-Path $SourceDir 'block_states.json'),
    (($BlockStateObject | ConvertTo-Json -Depth 20) + "`n"),
    $Utf8NoBom
)

$BlockStateUsageObject = New-BlockStateUsageSourceObject @($BlockStateDerived.Blocks)
[System.IO.File]::WriteAllText(
    (Join-Path $DerivedDir 'block_state_usage.json'),
    (($BlockStateUsageObject | ConvertTo-Json -Depth 20) + "`n"),
    $Utf8NoBom
)

# `/event` and `/summon ... spawnEvent` share the EntityEvents command argument domain.
# SPAWN EVENT exposes all owner events and carries the evidence-backed subset as recommendedEvents metadata.
$SpawnObject = New-EventSourceObject @($Derived.SpawnEvents) 'spawn'
[System.IO.File]::WriteAllText(
    (Join-Path $DerivedDir 'spawn_events.json'),
    (($SpawnObject | ConvertTo-Json -Depth 12) + "`n"),
    $Utf8NoBom
)

if (-not $SkipGenerate) {
    & (Join-Path $PSScriptRoot 'generate_registry.ps1')
    if (-not $?) { throw 'Registry generation failed.' }
}

Write-Host 'Registry update complete. Review git diff before commit.'
