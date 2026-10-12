param(
    [switch]$Check,
    [string]$ExpectedVersion = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$GeneratorVersion = '16.0.0'
if ($ExpectedVersion -and $ExpectedVersion -ne $GeneratorVersion) {
    throw "Registry generator version mismatch. Expected $ExpectedVersion but found $GeneratorVersion."
}
Write-Host "Registry generator v$GeneratorVersion"

$Root = Split-Path -Parent $PSScriptRoot
$SourceDir = Join-Path $Root 'registry\source\bedrock'
$DerivedDir = Join-Path $Root 'registry\derived\bedrock'
$OutDir = Join-Path $Root 'src\libraries'
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$FlatSpecs = @(
    [ordered]@{ Kind='items';     SourceDir=$SourceDir;  Namespace='MCFunctionItemLibrary';     Prefix='item';     ReturnType='string';                         WrapPrefix='';                         WrapSuffix=''; File='item_library.generated.ts' },
    [ordered]@{ Kind='blocks';    SourceDir=$SourceDir;  Namespace='MCFunctionBlockLibrary';    Prefix='block';    ReturnType='MCFunctionFields.BlockValue';    WrapPrefix='MCFunctionFields.block(';    WrapSuffix=')'; File='block_library.generated.ts' },
    [ordered]@{ Kind='entities';  SourceDir=$SourceDir;  Namespace='MCFunctionEntityLibrary';   Prefix='entity';   ReturnType='MCFunctionFields.EntityValue';   WrapPrefix='MCFunctionFields.entity(';   WrapSuffix=')'; File='entity_library.generated.ts' },
    [ordered]@{ Kind='effects';   SourceDir=$SourceDir;  Namespace='MCFunctionEffectLibrary';   Prefix='effect';   ReturnType='MCFunctionFields.EffectValue';   WrapPrefix='MCFunctionFields.effect(';   WrapSuffix=')'; File='effect_library.generated.ts' },
    [ordered]@{ Kind='sounds';    SourceDir=$SourceDir;  Namespace='MCFunctionSoundLibrary'; Prefix='sound'; ReturnType='MCFunctionFields.SoundValue'; WrapPrefix='MCFunctionFields.sound('; WrapSuffix=')'; File='sound_library.generated.ts' },
    [ordered]@{ Kind='music_tracks'; SourceDir=$SourceDir; Namespace='MCFunctionMusicLibrary'; Prefix='track'; ReturnType='MCFunctionFields.MusicTrackValue'; WrapPrefix='MCFunctionFields.musicTrack('; WrapSuffix=')'; File='music_library.generated.ts' },
    [ordered]@{ Kind='particles'; SourceDir=$SourceDir;  Namespace='MCFunctionParticleLibrary'; Prefix='particle'; ReturnType='MCFunctionFields.ParticleValue'; WrapPrefix='MCFunctionFields.particle('; WrapSuffix=')'; File='particle_library.generated.ts' },
    [ordered]@{ Kind='families';  SourceDir=$DerivedDir; Namespace='MCFunctionFamilyLibrary';   Prefix='family';   ReturnType='string';                         WrapPrefix='';                         WrapSuffix=''; File='family_library.generated.ts' }
)

$ReservedWords = @{}
@(
    'break','case','catch','class','const','continue','debugger','default','delete','do','else','enum',
    'export','extends','false','finally','for','function','if','import','in','instanceof','new','null',
    'return','super','switch','this','throw','true','try','typeof','var','void','while','with','as',
    'implements','interface','let','package','private','protected','public','static','yield','any','boolean',
    'constructor','declare','get','module','require','number','set','string','symbol','type','from','of'
) | ForEach-Object { $ReservedWords[$_] = $true }

function Read-FlatRegistryEntries($Spec) {
    $Path = Join-Path $Spec.SourceDir ($Spec.Kind + '.json')
    if (-not (Test-Path $Path)) { throw "Registry source not found: $Path" }

    $Data = Get-Content -Raw -Encoding UTF8 $Path | ConvertFrom-Json
    $Entries = @($Data.entries)

    $Seen = @{}
    foreach ($Entry in $Entries) {
        $Id = [string]$Entry.id
        if ([string]::IsNullOrWhiteSpace($Id)) { throw "Empty id in $Path" }
        if ($Seen.ContainsKey($Id)) { throw "Duplicate id in ${Path}: $Id" }
        $Seen[$Id] = $true
    }
    return $Entries
}

function Read-GroupedRegistry([string]$Kind) {
    $Path = Join-Path $DerivedDir ($Kind + '.json')
    if (-not (Test-Path $Path)) { throw "Registry source not found: $Path" }

    $Data = Get-Content -Raw -Encoding UTF8 $Path | ConvertFrom-Json
    $Entities = @($Data.entities)

    $SeenEntity = @{}
    foreach ($EntityEntry in $Entities) {
        $EntityId = [string]$EntityEntry.entity
        if ([string]::IsNullOrWhiteSpace($EntityId)) { throw "Empty entity id in $Path" }
        if ($SeenEntity.ContainsKey($EntityId)) { throw "Duplicate entity in ${Path}: $EntityId" }
        $SeenEntity[$EntityId] = $true

        $SeenEvent = @{}
        foreach ($EventId in @($EntityEntry.events)) {
            $Value = [string]$EventId
            if ([string]::IsNullOrWhiteSpace($Value)) { throw "Empty event id for $EntityId in $Path" }
            if ($SeenEvent.ContainsKey($Value)) { throw "Duplicate event for ${EntityId} in ${Path}: $Value" }
            $SeenEvent[$Value] = $true
        }

        if ($EntityEntry.PSObject.Properties.Name -contains 'recommendedEvents') {
            $SeenRecommended = @{}
            foreach ($EventId in @($EntityEntry.recommendedEvents)) {
                $Value = [string]$EventId
                if ([string]::IsNullOrWhiteSpace($Value)) { throw "Empty recommended event id for $EntityId in $Path" }
                if ($SeenRecommended.ContainsKey($Value)) { throw "Duplicate recommended event for ${EntityId} in ${Path}: $Value" }
                if (-not $SeenEvent.ContainsKey($Value)) { throw "Recommended event not present in owner events for ${EntityId} in ${Path}: $Value" }
                $SeenRecommended[$Value] = $true
            }
        }
    }
    return $Entities
}

function Get-LocalId([string]$Id) {
    if ($Id.Contains(':')) { return $Id.Substring($Id.IndexOf(':') + 1) }
    return $Id
}

function Get-CamelName([string]$Value) {
    $Local = Get-LocalId $Value
    $Parts = @([regex]::Split($Local, '[^A-Za-z0-9]+') | Where-Object { $_ })
    if ($Parts.Count -eq 0) { return 'value' }

    $Base = $Parts[0].ToLowerInvariant()
    for ($i = 1; $i -lt $Parts.Count; $i++) {
        $Part = $Parts[$i]
        if ($Part.Length -gt 0) {
            $Base += $Part.Substring(0,1).ToUpperInvariant() + $Part.Substring(1)
        }
    }

    if ($Base -match '^[0-9]') { $Base = 'id' + $Base }
    if ($ReservedWords.ContainsKey($Base)) { $Base += 'Value' }
    return $Base
}

function Get-FunctionName($Entry) {
    $Explicit = $null
    if ($Entry.PSObject.Properties.Name -contains 'functionName') {
        $Explicit = [string]$Entry.functionName
    }
    if (-not [string]::IsNullOrWhiteSpace($Explicit)) { return $Explicit }
    return Get-CamelName ([string]$Entry.id)
}

function Get-GroupLabel([string]$EntityId) {
    $Local = Get-LocalId $EntityId
    $Parts = @($Local.Split('_') | Where-Object { $_ })
    $Out = New-Object 'System.Collections.Generic.List[string]'
    foreach ($Part in $Parts) {
        if ($Part.Length -eq 1) {
            [void]$Out.Add($Part.ToUpperInvariant())
        }
        elseif ($Part -match '^[0-9]+$') {
            [void]$Out.Add($Part)
        }
        else {
            [void]$Out.Add($Part.Substring(0,1).ToUpperInvariant() + $Part.Substring(1))
        }
    }
    return ($Out -join ' ')
}

function Get-SafeToken([string]$Value) {
    return ([regex]::Replace($Value.ToLowerInvariant(), '[^a-z0-9_]+', '_')).Trim('_')
}

function Get-BlockId([string]$Kind, [string]$Id) {
    $Safe = Get-SafeToken $Id
    # Preserve the original generated blockId scheme for existing registries.
    # `entities` intentionally remains `entitie`; changing existing IDs would break saved blocks.
    $Singular = if ($Kind -eq 'families') {
        'family'
    }
    elseif ($Kind.EndsWith('s')) {
        $Kind.Substring(0, $Kind.Length - 1)
    }
    else {
        $Kind
    }
    return "mcfunction_${Singular}_registry_${Safe}"
}

function Quote-JsString([string]$Value) {
    return ($Value | ConvertTo-Json -Compress)
}

function Generate-FlatLibrary($Spec) {
    $Entries = @(Read-FlatRegistryEntries $Spec)
    # PowerShell hashtables compare string keys case-insensitively.
    # TypeScript identifiers are case-sensitive, so names such as tallGrass and
    # tallgrass are valid distinct reporter functions. Use .NET dictionaries
    # here to perform the collision check with case-sensitive string equality.
    $UsedNames = New-Object 'System.Collections.Generic.Dictionary[string,string]'
    $UsedBlockIds = New-Object 'System.Collections.Generic.Dictionary[string,string]'
    $Lines = New-Object 'System.Collections.Generic.List[string]'

    $RelativeSource = if ($Spec.SourceDir -eq $DerivedDir) {
        "registry/derived/bedrock/$($Spec.Kind).json"
    } else {
        "registry/source/bedrock/$($Spec.Kind).json"
    }

    @(
        '/**',
        ' * AUTO-GENERATED FILE. DO NOT EDIT BY HAND.',
        ' *',
        " * Source: $RelativeSource",
        ' * Generator: tools/generate_registry.ps1',
        ' *',
        ' * Reporter block text includes the canonical value so MakeCode Toolbox Search',
        ' * can find values without a second custom search UI.',
        ' */',
        '',
        "namespace $($Spec.Namespace) {",
        ''
    ) | ForEach-Object { [void]$Lines.Add($_) }

    for ($Index = 0; $Index -lt $Entries.Count; $Index++) {
        $Entry = $Entries[$Index]
        $Id = [string]$Entry.id
        $FunctionName = Get-FunctionName $Entry
        $BlockId = Get-BlockId $Spec.Kind $Id

        # Audio dotted IDs can collide with underscore IDs after camel-casing
        # or Blockly ID sanitization. Preserve existing registry IDs and add
        # a deterministic, injective UTF-8-hex suffix only for audio collisions.
        if ($Spec.Kind -eq 'sounds' -or $Spec.Kind -eq 'music_tracks') {
            if ($UsedNames.ContainsKey($FunctionName) -or $UsedBlockIds.ContainsKey($BlockId)) {
                $Hex = [System.BitConverter]::ToString([System.Text.Encoding]::UTF8.GetBytes($Id)).Replace('-', '').ToLowerInvariant()
                if ($UsedNames.ContainsKey($FunctionName)) { $FunctionName += 'Id' + $Hex }
                if ($UsedBlockIds.ContainsKey($BlockId)) { $BlockId += '_id_' + $Hex }
            }
        }

        if ($UsedNames.ContainsKey($FunctionName)) {
            throw "Function-name collision in $($Spec.Kind): ${FunctionName}: $($UsedNames[$FunctionName]) / $Id"
        }
        if ($UsedBlockIds.ContainsKey($BlockId)) {
            throw "blockId collision in $($Spec.Kind): ${BlockId}: $($UsedBlockIds[$BlockId]) / $Id"
        }
        $UsedNames[$FunctionName] = $Id
        $UsedBlockIds[$BlockId] = $Id

        $Value = Quote-JsString $Id
        $Expression = $Spec.WrapPrefix + $Value + $Spec.WrapSuffix
        $Weight = 90 - ($Index % 40)

        @(
            '    //% group="Registry"',
            "    //% weight=$Weight",
            "    //% blockId=$BlockId",
            ('    //% block="' + $Spec.Prefix + ' ' + $Id + '"'),
            "    export function $FunctionName(): $($Spec.ReturnType) {",
            "        return $Expression;",
            '    }',
            ''
        ) | ForEach-Object { [void]$Lines.Add($_) }
    }

    [void]$Lines.Add('}')
    [void]$Lines.Add('')
    return (($Lines -join "`n") + "`n")
}


function Read-BlockStateRegistry() {
    $Path = Join-Path $SourceDir 'block_states.json'
    if (-not (Test-Path $Path)) { throw "Registry source not found: $Path" }
    $Data = Get-Content -Raw -Encoding UTF8 $Path | ConvertFrom-Json
    $States = @($Data.states)
    $Seen = @{}
    foreach ($State in $States) {
        $Id = [string]$State.id
        $Type = [string]$State.type
        if ([string]::IsNullOrWhiteSpace($Id)) { throw "Empty block-state id in $Path" }
        if ($Seen.ContainsKey($Id)) { throw "Duplicate block-state id in ${Path}: $Id" }
        if ($Type -ne 'string' -and $Type -ne 'number' -and $Type -ne 'boolean') {
            throw "Unsupported block-state type in ${Path}: $Id -> $Type"
        }
        if (@($State.values).Count -eq 0) { throw "Block-state has no values in ${Path}: $Id" }
        $Seen[$Id] = $true
    }
    return [ordered]@{ Data=$Data; States=$States }
}

function Read-ExpandedBlockStateUsage() {
    $UsagePath = Join-Path $DerivedDir 'block_state_usage.json'
    if (-not (Test-Path $UsagePath)) { throw "Registry source not found: $UsagePath" }
    $UsageData = Get-Content -Raw -Encoding UTF8 $UsagePath | ConvertFrom-Json

    $BlockSpec = $FlatSpecs | Where-Object { $_.Kind -eq 'blocks' } | Select-Object -First 1
    if (-not $BlockSpec) { throw 'Missing blocks flat registry spec.' }
    $BlockIds = @(Read-FlatRegistryEntries $BlockSpec | ForEach-Object { [string]$_.id })

    $Map = @{}
    foreach ($Entry in @($UsageData.blocks)) {
        $States = @($Entry.states | ForEach-Object { [string]$_ })
        $Targets = @()
        if ($Entry.PSObject.Properties.Name -contains 'id' -and -not [string]::IsNullOrWhiteSpace([string]$Entry.id)) {
            $Targets = @([string]$Entry.id)
        }
        elseif ($Entry.PSObject.Properties.Name -contains 'pattern' -and -not [string]::IsNullOrWhiteSpace([string]$Entry.pattern)) {
            $Pattern = [string]$Entry.pattern
            $Targets = @($BlockIds | Where-Object { $_ -like $Pattern })
            if ($Targets.Count -eq 0) { throw "Block-state usage pattern matched no blocks: $Pattern" }
        }
        else {
            throw "Block-state usage entry requires id or pattern in $UsagePath"
        }

        foreach ($BlockId in $Targets) {
            if (-not $Map.ContainsKey($BlockId)) { $Map[$BlockId] = @{} }
            foreach ($StateId in $States) {
                if (-not [string]::IsNullOrWhiteSpace($StateId)) { $Map[$BlockId][$StateId] = $true }
            }
        }
    }

    $Entries = @(
        $Map.Keys | Sort-Object | ForEach-Object {
            [ordered]@{
                id = [string]$_
                states = @($Map[$_].Keys | Sort-Object)
            }
        }
    )
    return [ordered]@{ Data=$UsageData; Blocks=$Entries }
}

function Test-CompleteCoverage($Data, [string]$Prefix) {
    if ($Data.PSObject.Properties.Name -notcontains 'coverage') { return $false }
    $Coverage = [string]$Data.coverage
    return $Coverage.StartsWith($Prefix)
}

function Get-BlockStateGroup([string]$Role) {
    if ($Role -eq 'orientation') { return 'ORIENTATION' }
    if ($Role -eq 'activation') { return 'ACTIVATION' }
    if ($Role -eq 'structure') { return 'STRUCTURE' }
    if ($Role -eq 'level') { return 'LEVEL / GROWTH' }
    if ($Role -eq 'variant') { return 'VARIANT / APPEARANCE' }
    if ($Role -eq 'special') { return 'SPECIAL / EDUCATION' }
    return 'OTHER'
}

function Get-PascalToken([string]$Value) {
    $Parts = @([regex]::Split((Get-SafeToken $Value), '_+') | Where-Object { $_ })
    $Out = ''
    foreach ($Part in $Parts) {
        if ($Part.Length -eq 1) { $Out += $Part.ToUpperInvariant() }
        elseif ($Part.Length -gt 1) { $Out += $Part.Substring(0,1).ToUpperInvariant() + $Part.Substring(1) }
    }
    if ([string]::IsNullOrWhiteSpace($Out)) { $Out = 'Value' }
    if ($Out -match '^[0-9]') { $Out = 'V' + $Out }
    return $Out
}

function Get-EnumMemberName([object]$Value, [string]$Type) {
    if ($Type -eq 'number') {
        $NumberText = [string]$Value
        if ($NumberText.StartsWith('-')) { return 'VNeg' + $NumberText.Substring(1).Replace('.', '_') }
        return 'V' + $NumberText.Replace('.', '_')
    }
    $Name = Get-PascalToken ([string]$Value)
    $Lower = $Name.Substring(0,1).ToLowerInvariant() + $Name.Substring(1)
    if ($ReservedWords.ContainsKey($Lower)) { $Name += 'Value' }
    return $Name
}

function Generate-BlockStateRegistryLookup() {
    $Registry = Read-BlockStateRegistry
    $Usage = Read-ExpandedBlockStateUsage
    $States = @($Registry.States | Sort-Object { [string]$_.id })
    $Blocks = @($Usage.Blocks | Sort-Object { [string]$_.id })
    $CatalogComplete = Test-CompleteCoverage $Registry.Data 'complete-vanilla'
    $UsageComplete = Test-CompleteCoverage $Usage.Data 'complete-vanilla'
    $CatalogLiteral = if ($CatalogComplete) { 'true' } else { 'false' }
    $UsageLiteral = if ($UsageComplete) { 'true' } else { 'false' }

    $Lines = New-Object 'System.Collections.Generic.List[string]'
    @(
        '/**',
        ' * AUTO-GENERATED FILE. DO NOT EDIT BY HAND.',
        ' *',
        ' * Sources:',
        ' * - registry/source/bedrock/block_states.json',
        ' * - registry/derived/bedrock/block_state_usage.json',
        ' * Generator: tools/generate_registry.ps1',
        ' *',
        ' * Runtime metadata for context-aware Block State Definition Validation.',
        ' */',
        '',
        'namespace MCFunctionBlockStateRegistry {',
        '    export enum ValueKind {',
        '        Unknown = -1,',
        '        String = 0,',
        '        Number = 1,',
        '        Boolean = 2',
        '    }',
        '',
        ('    export function isCatalogComplete(): boolean { return ' + $CatalogLiteral + '; }'),
        ('    export function isUsageComplete(): boolean { return ' + $UsageLiteral + '; }'),
        '',
        '    export function getValueKind(stateId: string): ValueKind {'
    ) | ForEach-Object { [void]$Lines.Add($_) }

    foreach ($State in $States) {
        $Kind = if ([string]$State.type -eq 'string') { 'String' } elseif ([string]$State.type -eq 'number') { 'Number' } else { 'Boolean' }
        [void]$Lines.Add('        if (stateId == ' + (Quote-JsString ([string]$State.id)) + ') return ValueKind.' + $Kind + ';')
    }
    @(
        '        return ValueKind.Unknown;',
        '    }',
        '',
        '    export function isKnownState(stateId: string): boolean {',
        '        return getValueKind(stateId) != ValueKind.Unknown;',
        '    }',
        '',
        '    export function isAllowedStringValue(stateId: string, value: string): boolean {'
    ) | ForEach-Object { [void]$Lines.Add($_) }

    foreach ($State in @($States | Where-Object { [string]$_.type -eq 'string' })) {
        $Checks = @($State.values | ForEach-Object { 'value == ' + (Quote-JsString ([string]$_) ) })
        [void]$Lines.Add('        if (stateId == ' + (Quote-JsString ([string]$State.id)) + ') return ' + ($Checks -join ' || ') + ';')
    }
    @(
        '        return false;',
        '    }',
        '',
        '    export function isAllowedNumberValue(stateId: string, value: number): boolean {'
    ) | ForEach-Object { [void]$Lines.Add($_) }

    foreach ($State in @($States | Where-Object { [string]$_.type -eq 'number' })) {
        $Numbers = @($State.values | ForEach-Object { [double]$_ } | Sort-Object)
        $IsContiguousInt = $Numbers.Count -gt 1
        if ($IsContiguousInt) {
            for ($i = 0; $i -lt $Numbers.Count; $i++) {
                if ($Numbers[$i] -ne [Math]::Floor($Numbers[$i]) -or ($i -gt 0 -and $Numbers[$i] -ne ($Numbers[$i - 1] + 1))) {
                    $IsContiguousInt = $false
                    break
                }
            }
        }
        if ($IsContiguousInt) {
            $Check = 'value >= ' + ([string]$Numbers[0]) + ' && value <= ' + ([string]$Numbers[$Numbers.Count - 1]) + ' && Math.floor(value) == value'
        }
        else {
            $Check = (@($State.values | ForEach-Object { 'value == ' + ([string]$_) }) -join ' || ')
        }
        [void]$Lines.Add('        if (stateId == ' + (Quote-JsString ([string]$State.id)) + ') return ' + $Check + ';')
    }
    @(
        '        return false;',
        '    }',
        '',
        '    export function isAllowedBooleanValue(stateId: string, value: boolean): boolean {'
    ) | ForEach-Object { [void]$Lines.Add($_) }

    foreach ($State in @($States | Where-Object { [string]$_.type -eq 'boolean' })) {
        $HasFalse = @($State.values | Where-Object { $_ -eq $false }).Count -gt 0
        $HasTrue = @($State.values | Where-Object { $_ -eq $true }).Count -gt 0
        $Check = if ($HasFalse -and $HasTrue) { 'true' } elseif ($HasTrue) { 'value' } else { '!value' }
        [void]$Lines.Add('        if (stateId == ' + (Quote-JsString ([string]$State.id)) + ') return ' + $Check + ';')
    }

    @(
        '        return false;',
        '    }',
        '',
        '    let usageBlocks: string[] = ['
    ) | ForEach-Object { [void]$Lines.Add($_) }
    foreach ($Block in $Blocks) { [void]$Lines.Add('        ' + (Quote-JsString ([string]$Block.id)) + ',') }
    @(
        '    ];',
        '',
        '    let usageStateLists: string[] = ['
    ) | ForEach-Object { [void]$Lines.Add($_) }
    foreach ($Block in $Blocks) {
        $StateList = (@($Block.states | ForEach-Object { [string]$_ }) -join ',')
        [void]$Lines.Add('        ' + (Quote-JsString $StateList) + ',')
    }
    @(
        '    ];',
        '',
        '    function normalizeVanillaBlockId(value: string): string {',
        '        if (!value) return value;',
        '        if (value.indexOf(":") < 0) return "minecraft:" + value;',
        '        return value;',
        '    }',
        '',
        '    function findSortedIndex(values: string[], value: string): number {',
        '        let low = 0;',
        '        let high = values.length - 1;',
        '        while (low <= high) {',
        '            let middle = Math.floor((low + high) / 2);',
        '            let current = values[middle];',
        '            if (current == value) return middle;',
        '            if (current < value) low = middle + 1;',
        '            else high = middle - 1;',
        '        }',
        '        return -1;',
        '    }',
        '',
        '    export function hasUsageForBlock(blockId: string): boolean {',
        '        return findSortedIndex(usageBlocks, normalizeVanillaBlockId(blockId)) >= 0;',
        '    }',
        '',
        '    export function isStateAllowedForBlock(blockId: string, stateId: string): boolean {',
        '        let index = findSortedIndex(usageBlocks, normalizeVanillaBlockId(blockId));',
        '        if (index < 0) return false;',
        '        let values = "," + usageStateLists[index] + ",";',
        '        return values.indexOf("," + stateId + ",") >= 0;',
        '    }',
        '}',
        ''
    ) | ForEach-Object { [void]$Lines.Add($_) }

    return (($Lines -join "`n") + "`n")
}

function Generate-BlockStateLibrary() {
    $Registry = Read-BlockStateRegistry
    $States = @($Registry.States | Sort-Object { [string]$_.id })

    $HandAuthoredIds = @{}
    @(
        'pillar_axis', 'minecraft:cardinal_direction', 'minecraft:facing_direction',
        'facing_direction', 'direction', 'lever_direction', 'open_bit',
        'button_pressed_bit', 'powered_bit', 'triggered_bit', 'upside_down_bit',
        'door_hinge_bit', 'upper_block_bit', 'in_wall_bit', 'minecraft:vertical_half'
    ) | ForEach-Object { $HandAuthoredIds[$_] = $true }

    $Lines = New-Object 'System.Collections.Generic.List[string]'
    @(
        '/**',
        ' * AUTO-GENERATED FILE. DO NOT EDIT BY HAND.',
        ' *',
        ' * Source: registry/source/bedrock/block_states.json',
        ' * Generator: tools/generate_registry.ps1',
        ' *',
        ' * Adds typed reporters for vanilla Block States not already covered by the',
        ' * stable hand-authored reporter API in block_state_library.ts.',
        ' */',
        '',
        'namespace MCFunctionBlockStateLibrary {',
        ''
    ) | ForEach-Object { [void]$Lines.Add($_) }

    $GeneratedCount = 0
    foreach ($State in $States) {
        $StateId = [string]$State.id
        if ($HandAuthoredIds.ContainsKey($StateId)) { continue }

        $Type = [string]$State.type
        $Role = if ($State.PSObject.Properties.Name -contains 'role') { [string]$State.role } else { 'other' }
        $Group = Get-BlockStateGroup $Role
        $Token = Get-PascalToken $StateId
        $FunctionName = 'state' + $Token
        $EnumName = 'State' + $Token + 'Value'
        $BlockId = 'mcfunction_block_state_registry_' + (Get-SafeToken $StateId)
        $Weight = 90 - ($GeneratedCount % 40)

        if ($Type -eq 'string' -or $Type -eq 'number') {
            [void]$Lines.Add('    export enum ' + $EnumName + ' {')
            $UsedMembers = @{}
            $Index = 0
            foreach ($Value in @($State.values)) {
                $Member = Get-EnumMemberName $Value $Type
                if ($UsedMembers.ContainsKey($Member)) { $Member += 'V' + $Index }
                $UsedMembers[$Member] = $true
                [void]$Lines.Add('        //% block=' + (Quote-JsString ([string]$Value)))
                if ($Type -eq 'number') { [void]$Lines.Add('        ' + $Member + ' = ' + ([string]$Value) + ',') }
                else { [void]$Lines.Add('        ' + $Member + ' = ' + $Index + ',') }
                $Index++
            }
            [void]$Lines.Add('    }')
            [void]$Lines.Add('')
        }

        if ($Type -eq 'string') {
            [void]$Lines.Add('    function text' + $Token + '(value: ' + $EnumName + '): string {')
            $Index = 0
            $FirstValue = [string]$State.values[0]
            $UsedMembers = @{}
            foreach ($Value in @($State.values)) {
                $Member = Get-EnumMemberName $Value $Type
                if ($UsedMembers.ContainsKey($Member)) { $Member += 'V' + $Index }
                $UsedMembers[$Member] = $true
                [void]$Lines.Add('        if (value == ' + $EnumName + '.' + $Member + ') return ' + (Quote-JsString ([string]$Value)) + ';')
                $Index++
            }
            [void]$Lines.Add('        return ' + (Quote-JsString $FirstValue) + ';')
            [void]$Lines.Add('    }')
            [void]$Lines.Add('')
        }

        [void]$Lines.Add('    //% group=' + (Quote-JsString $Group))
        [void]$Lines.Add('    //% weight=' + $Weight)
        [void]$Lines.Add('    //% blockId=' + $BlockId)
        [void]$Lines.Add('    //% block=' + (Quote-JsString ($StateId + ' $value')))
        if ($Type -eq 'boolean') {
            [void]$Lines.Add('    export function ' + $FunctionName + '(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {')
            [void]$Lines.Add('        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState(' + (Quote-JsString $StateId) + ', MCFunctionFields.booleanLiteralValue(value)));')
        }
        elseif ($Type -eq 'number') {
            [void]$Lines.Add('    export function ' + $FunctionName + '(value: ' + $EnumName + '): MCFunctionBlockStateFields.BlockStateEntryValue {')
            [void]$Lines.Add('        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState(' + (Quote-JsString $StateId) + ', value));')
        }
        else {
            [void]$Lines.Add('    export function ' + $FunctionName + '(value: ' + $EnumName + '): MCFunctionBlockStateFields.BlockStateEntryValue {')
            [void]$Lines.Add('        return MCFunctionBlockStateFields.entry(MCFunctionAST.createStringBlockState(' + (Quote-JsString $StateId) + ', text' + $Token + '(value)));')
        }
        [void]$Lines.Add('    }')
        [void]$Lines.Add('')
        $GeneratedCount++
    }

    [void]$Lines.Add('}')
    [void]$Lines.Add('')
    return [ordered]@{ Text=(($Lines -join "`n") + "`n"); Count=$GeneratedCount }
}

function Generate-RegistryLookup() {
    $Lines = New-Object 'System.Collections.Generic.List[string]'
    @(
        '/**',
        ' * AUTO-GENERATED FILE. DO NOT EDIT BY HAND.',
        ' *',
        ' * Sources:',
        ' * - registry/source/bedrock/blocks.json',
        ' * - registry/source/bedrock/entities.json',
        ' * - registry/source/bedrock/items.json',
        ' * - registry/source/bedrock/effects.json',
        ' * - registry/source/bedrock/particles.json',
        ' * - registry/source/bedrock/sounds.json',
        ' * - registry/source/bedrock/music_tracks.json',
        ' * Generator: tools/generate_registry.ps1',
        ' *',
        ' * Hidden runtime lookup used only by Definition Validation.',
        ' * Registry misses never change command meaning by themselves.',
        ' */',
        '',
        'namespace MCFunctionRegistryLookup {'
    ) | ForEach-Object { [void]$Lines.Add($_) }

    $LookupKinds = @(
        [ordered]@{ Kind='blocks'; Name='knownBlockIds' },
        [ordered]@{ Kind='entities'; Name='knownEntityIds' },
        [ordered]@{ Kind='items'; Name='knownItemIds' },
        [ordered]@{ Kind='effects'; Name='knownEffectIds' },
        [ordered]@{ Kind='particles'; Name='knownParticleIds' },
        [ordered]@{ Kind='sounds'; Name='knownSoundIds' },
        [ordered]@{ Kind='music_tracks'; Name='knownMusicTrackIds' }
    )

    foreach ($Lookup in $LookupKinds) {
        $Spec = $FlatSpecs | Where-Object { $_.Kind -eq $Lookup.Kind } | Select-Object -First 1
        if (-not $Spec) { throw "Missing flat registry spec for $($Lookup.Kind)" }
        $Entries = @(Read-FlatRegistryEntries $Spec | Sort-Object { [string]$_.id })

        [void]$Lines.Add('    let ' + $Lookup.Name + ': string[] = [')
        foreach ($Entry in $Entries) {
            [void]$Lines.Add('        ' + (Quote-JsString ([string]$Entry.id)) + ',')
        }
        [void]$Lines.Add('    ];')
        [void]$Lines.Add('')
    }

    @(
        '    function normalizeVanillaId(value: string): string {',
        '        if (!value) return value;',
        '        if (value.indexOf(":") < 0) return "minecraft:" + value;',
        '        return value;',
        '    }',
        '',
        '    function containsSorted(values: string[], value: string): boolean {',
        '        let low = 0;',
        '        let high = values.length - 1;',
        '',
        '        while (low <= high) {',
        '            let middle = Math.floor((low + high) / 2);',
        '            let current = values[middle];',
        '',
        '            if (current == value) return true;',
        '            if (current < value) low = middle + 1;',
        '            else high = middle - 1;',
        '        }',
        '',
        '        return false;',
        '    }',
        '',
        '    export function isCustomNamespace(value: string): boolean {',
        '        if (!value) return false;',
        '        let separator = value.indexOf(":");',
        '        if (separator <= 0) return false;',
        '        return value.indexOf("minecraft:") != 0;',
        '    }',
        '',
        '    export function isKnownBlock(value: string): boolean {',
        '        return containsSorted(knownBlockIds, normalizeVanillaId(value));',
        '    }',
        '',
        '    export function isKnownEntity(value: string): boolean {',
        '        return containsSorted(knownEntityIds, normalizeVanillaId(value));',
        '    }',
        '',
        '    export function isKnownItem(value: string): boolean {',
        '        return containsSorted(knownItemIds, normalizeVanillaId(value));',
        '    }',
        '',
        '    export function isKnownEffect(value: string): boolean {',
        '        return containsSorted(knownEffectIds, value);',
        '    }',
        '',
        '    export function isKnownSound(value: string): boolean {',
        '        return containsSorted(knownSoundIds, value);',
        '    }',
        '',
        '    export function isKnownMusicTrack(value: string): boolean {',
        '        return containsSorted(knownMusicTrackIds, value);',
        '    }',
        '',
        '    export function isKnownParticle(value: string): boolean {',
        '        return containsSorted(knownParticleIds, normalizeVanillaId(value));',
        '    }',
        '}',
        ''
    ) | ForEach-Object { [void]$Lines.Add($_) }

    return (($Lines -join "`n") + "`n")
}

function Generate-EntityEventRegistryLookup() {
    $EventOwners = @(Read-GroupedRegistry 'entity_events' | Sort-Object { [string]$_.entity })
    $SpawnOwners = @(Read-GroupedRegistry 'spawn_events' | Sort-Object { [string]$_.entity })

    $OwnerIds = @($EventOwners | ForEach-Object { [string]$_.entity } | Sort-Object -Unique)
    $Relations = New-Object 'System.Collections.Generic.List[string]'
    foreach ($Entry in $EventOwners) {
        $EntityId = [string]$Entry.entity
        foreach ($EventId in @($Entry.events)) {
            [void]$Relations.Add($EntityId + '|' + [string]$EventId)
        }
    }
    $RelationValues = @($Relations.ToArray() | Sort-Object -Unique)

    $Recommended = New-Object 'System.Collections.Generic.List[string]'
    foreach ($Entry in $SpawnOwners) {
        $EntityId = [string]$Entry.entity
        if (-not ($Entry.PSObject.Properties.Name -contains 'recommendedEvents')) { continue }
        foreach ($EventId in @($Entry.recommendedEvents)) {
            [void]$Recommended.Add($EntityId + '|' + [string]$EventId)
        }
    }
    $RecommendedValues = @($Recommended.ToArray() | Sort-Object -Unique)

    $Lines = New-Object 'System.Collections.Generic.List[string]'
    @(
        '/**',
        ' * AUTO-GENERATED FILE. DO NOT EDIT BY HAND.',
        ' *',
        ' * Sources:',
        ' * - registry/derived/bedrock/entity_events.json',
        ' * - registry/derived/bedrock/spawn_events.json',
        ' * Generator: tools/generate_registry.ps1',
        ' *',
        ' * Owner-scoped Entity Event metadata for Definition Validation.',
        ' * spawnRecommended is an authoring hint, never a whitelist.',
        ' */',
        '',
        'namespace MCFunctionEntityEventRegistry {'
    ) | ForEach-Object { [void]$Lines.Add($_) }

    [void]$Lines.Add('    let knownOwnerEntityIds: string[] = [')
    foreach ($Value in $OwnerIds) { [void]$Lines.Add('        ' + (Quote-JsString $Value) + ',') }
    [void]$Lines.Add('    ];')
    [void]$Lines.Add('')

    [void]$Lines.Add('    let knownOwnerEventRelations: string[] = [')
    foreach ($Value in $RelationValues) { [void]$Lines.Add('        ' + (Quote-JsString $Value) + ',') }
    [void]$Lines.Add('    ];')
    [void]$Lines.Add('')

    [void]$Lines.Add('    let spawnRecommendedRelations: string[] = [')
    foreach ($Value in $RecommendedValues) { [void]$Lines.Add('        ' + (Quote-JsString $Value) + ',') }
    [void]$Lines.Add('    ];')
    [void]$Lines.Add('')

    @(
        '    function normalizeEntityId(value: string): string {',
        '        if (!value) return value;',
        '        if (value.indexOf(":") < 0) return "minecraft:" + value;',
        '        return value;',
        '    }',
        '',
        '    function containsSorted(values: string[], value: string): boolean {',
        '        let low = 0;',
        '        let high = values.length - 1;',
        '',
        '        while (low <= high) {',
        '            let middle = Math.floor((low + high) / 2);',
        '            let current = values[middle];',
        '',
        '            if (current == value) return true;',
        '            if (current < value) low = middle + 1;',
        '            else high = middle - 1;',
        '        }',
        '',
        '        return false;',
        '    }',
        '',
        '    function relationKey(entityId: string, eventId: string): string {',
        '        return normalizeEntityId(entityId) + "|" + eventId;',
        '    }',
        '',
        '    export function hasOwnerData(entityId: string): boolean {',
        '        return containsSorted(knownOwnerEntityIds, normalizeEntityId(entityId));',
        '    }',
        '',
        '    export function isDefinedForOwner(entityId: string, eventId: string): boolean {',
        '        return containsSorted(knownOwnerEventRelations, relationKey(entityId, eventId));',
        '    }',
        '',
        '    export function isSpawnRecommended(entityId: string, eventId: string): boolean {',
        '        return containsSorted(spawnRecommendedRelations, relationKey(entityId, eventId));',
        '    }',
        '}',
        ''
    ) | ForEach-Object { [void]$Lines.Add($_) }

    return [ordered]@{
        Text = (($Lines -join "`n") + "`n")
        OwnerCount = $OwnerIds.Count
        RelationCount = $RelationValues.Count
        RecommendedCount = $RecommendedValues.Count
    }
}

function Generate-GroupedEventLibrary(
    [string]$Kind,
    [string]$Namespace,
    [string]$CategoryName,
    [string]$Prefix,
    [string]$BlockIdPrefix,
    [string]$Color,
    [int]$Weight,
    [string]$Icon,
    [string]$FileName
) {
    $Entities = @(Read-GroupedRegistry $Kind | Sort-Object { [string]$_.entity })
    $Groups = New-Object 'System.Collections.Generic.List[string]'
    [void]$Groups.Add('Direct Input')
    foreach ($EntityEntry in $Entities) {
        if (@($EntityEntry.events).Count -gt 0) {
            [void]$Groups.Add((Get-GroupLabel ([string]$EntityEntry.entity)))
        }
    }
    $GroupJsonItems = @($Groups | ForEach-Object { Quote-JsString ([string]$_) })
    $GroupsJson = '[' + ($GroupJsonItems -join ',') + ']'

    if ($Kind -eq 'entity_events') {
        $CustomBlockIdLine = '    //% blockId=mcfunction_entity_event_custom_id'
        $CustomBlockLine = '    //% block="event custom $eventId"'
    }
    else {
        $CustomBlockIdLine = '    //% blockId=mcfunction_spawn_event_custom_id'
        $CustomBlockLine = '    //% block="spawn event custom $eventId"'
    }

    $Lines = New-Object 'System.Collections.Generic.List[string]'
    @(
        '/**',
        ' * AUTO-GENERATED FILE. DO NOT EDIT BY HAND.',
        ' *',
        " * Source: registry/derived/bedrock/$Kind.json",
        ' * Generator: tools/generate_registry.ps1',
        ' *',
        ' * Values are grouped by vanilla entity for MakeCode Toolbox browsing.',
        ' * Direct/custom input remains available in this generated category.',
        ' */',
        '',
        ('//% color="{0}" weight={1} icon="{2}" block="{3}"' -f $Color, $Weight, $Icon, $CategoryName),
        ("//% groups='" + $GroupsJson + "'"),
        "namespace $Namespace {",
        '',
        '    //% group="Direct Input"',
        '    //% weight=100',
        $CustomBlockIdLine,
        $CustomBlockLine,
        '    //% eventId.shadow="text"',
        '    //% eventId.defl="minecraft:entity_spawned"',
        '    export function custom(eventId: string): string {',
        '        return eventId;',
        '    }',
        ''
    ) | ForEach-Object { [void]$Lines.Add($_) }

    # Keep generated TypeScript symbol collision checks case-sensitive.
    $UsedNames = New-Object 'System.Collections.Generic.Dictionary[string,string]'
    $UsedBlockIds = New-Object 'System.Collections.Generic.Dictionary[string,string]'
    $Total = 0

    foreach ($EntityEntry in $Entities) {
        $EntityId = [string]$EntityEntry.entity
        $RecommendedSet = @{}
        if ($Kind -eq 'spawn_events' -and ($EntityEntry.PSObject.Properties.Name -contains 'recommendedEvents')) {
            foreach ($RecommendedEvent in @($EntityEntry.recommendedEvents)) {
                $RecommendedSet[[string]$RecommendedEvent] = $true
            }
        }

        $Events = @(
            @($EntityEntry.events | ForEach-Object { [string]$_ }) |
                Sort-Object @{ Expression={ if ($RecommendedSet.ContainsKey([string]$_)) { 0 } else { 1 } } }, @{ Expression={ [string]$_ } }
        )
        if ($Events.Count -eq 0) { continue }

        $GroupLabel = Get-GroupLabel $EntityId
        $EntityLocal = Get-LocalId $EntityId
        $EntityCamel = Get-CamelName $EntityId

        for ($Index = 0; $Index -lt $Events.Count; $Index++) {
            $EventId = $Events[$Index]
            $EventCamel = Get-CamelName $EventId
            $FunctionName = $EntityCamel + $EventCamel.Substring(0,1).ToUpperInvariant() + $EventCamel.Substring(1)
            if ($ReservedWords.ContainsKey($FunctionName)) { $FunctionName += 'Value' }

            $BlockId = $BlockIdPrefix + '_' + (Get-SafeToken $EntityId) + '_' + (Get-SafeToken $EventId)
            if ($UsedNames.ContainsKey($FunctionName)) {
                throw "Function-name collision in ${Kind}: ${FunctionName}: $($UsedNames[$FunctionName]) / $EntityId -> $EventId"
            }
            if ($UsedBlockIds.ContainsKey($BlockId)) {
                throw "blockId collision in ${Kind}: ${BlockId}: $($UsedBlockIds[$BlockId]) / $EntityId -> $EventId"
            }
            $UsedNames[$FunctionName] = "$EntityId -> $EventId"
            $UsedBlockIds[$BlockId] = "$EntityId -> $EventId"

            $Value = Quote-JsString $EventId
            $BlockWeight = 90 - ($Index % 40)
            $BlockText = $EntityLocal + ' ' + $Prefix + ' ' + $EventId
            if ($Kind -eq 'spawn_events' -and $RecommendedSet.ContainsKey($EventId)) {
                $BlockText = $EntityLocal + ' recommended spawn event ' + $EventId
            }
            @(
                ('    //% group="' + $GroupLabel + '"'),
                "    //% weight=$BlockWeight",
                "    //% blockId=$BlockId",
                ('    //% block="' + $BlockText + '"'),
                "    export function $FunctionName(): string {",
                "        return $Value;",
                '    }',
                ''
            ) | ForEach-Object { [void]$Lines.Add($_) }
            $Total++
        }
    }

    [void]$Lines.Add('}')
    [void]$Lines.Add('')
    return [ordered]@{ Text=(($Lines -join "`n") + "`n"); Count=$Total; File=$FileName }
}

if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Force -Path $OutDir | Out-Null }

$Changed = New-Object 'System.Collections.Generic.List[string]'
$Counts = [ordered]@{}

foreach ($Spec in $FlatSpecs) {
    $OutPath = Join-Path $OutDir $Spec.File
    $Expected = Generate-FlatLibrary $Spec
    $Actual = if (Test-Path $OutPath) { [System.IO.File]::ReadAllText($OutPath) } else { $null }
    if ($Actual -ne $Expected) {
        [void]$Changed.Add($OutPath.Substring($Root.Length + 1))
        if (-not $Check) { [System.IO.File]::WriteAllText($OutPath, $Expected, $Utf8NoBom) }
    }
    $Counts[$Spec.Kind] = @(Read-FlatRegistryEntries $Spec).Count
}

$LookupOutDir = Join-Path $Root 'src\registry'
if (-not (Test-Path $LookupOutDir)) { New-Item -ItemType Directory -Force -Path $LookupOutDir | Out-Null }
$LookupOutPath = Join-Path $LookupOutDir 'registry_lookup.generated.ts'
$LookupExpected = Generate-RegistryLookup
$LookupActual = if (Test-Path $LookupOutPath) { [System.IO.File]::ReadAllText($LookupOutPath) } else { $null }
if ($LookupActual -ne $LookupExpected) {
    [void]$Changed.Add($LookupOutPath.Substring($Root.Length + 1))
    if (-not $Check) { [System.IO.File]::WriteAllText($LookupOutPath, $LookupExpected, $Utf8NoBom) }
}


$EntityEventLookupOutDir = Join-Path $Root 'src\registry'
if (-not (Test-Path $EntityEventLookupOutDir)) { New-Item -ItemType Directory -Force -Path $EntityEventLookupOutDir | Out-Null }
$EntityEventLookupPath = Join-Path $EntityEventLookupOutDir 'entity_event_registry.generated.ts'
$EntityEventLookupExpected = Generate-EntityEventRegistryLookup
$EntityEventLookupActual = if (Test-Path $EntityEventLookupPath) { [System.IO.File]::ReadAllText($EntityEventLookupPath) } else { $null }
if ($EntityEventLookupActual -ne $EntityEventLookupExpected.Text) {
    [void]$Changed.Add($EntityEventLookupPath.Substring($Root.Length + 1))
    if (-not $Check) { [System.IO.File]::WriteAllText($EntityEventLookupPath, $EntityEventLookupExpected.Text, $Utf8NoBom) }
}
$Counts['event_owners'] = $EntityEventLookupExpected.OwnerCount
$Counts['event_owner_relations'] = $EntityEventLookupExpected.RelationCount
$Counts['spawn_recommended'] = $EntityEventLookupExpected.RecommendedCount

$BlockStateLookupOutDir = Join-Path $Root 'src\registry'
if (-not (Test-Path $BlockStateLookupOutDir)) { New-Item -ItemType Directory -Force -Path $BlockStateLookupOutDir | Out-Null }
$BlockStateLookupPath = Join-Path $BlockStateLookupOutDir 'block_state_registry.generated.ts'
$BlockStateLookupExpected = Generate-BlockStateRegistryLookup
$BlockStateLookupActual = if (Test-Path $BlockStateLookupPath) { [System.IO.File]::ReadAllText($BlockStateLookupPath) } else { $null }
if ($BlockStateLookupActual -ne $BlockStateLookupExpected) {
    [void]$Changed.Add($BlockStateLookupPath.Substring($Root.Length + 1))
    if (-not $Check) { [System.IO.File]::WriteAllText($BlockStateLookupPath, $BlockStateLookupExpected, $Utf8NoBom) }
}

$BlockStateLibraryGenerated = Generate-BlockStateLibrary
$BlockStateLibraryPath = Join-Path $OutDir 'block_state_library.generated.ts'
$BlockStateLibraryActual = if (Test-Path $BlockStateLibraryPath) { [System.IO.File]::ReadAllText($BlockStateLibraryPath) } else { $null }
if ($BlockStateLibraryActual -ne $BlockStateLibraryGenerated.Text) {
    [void]$Changed.Add($BlockStateLibraryPath.Substring($Root.Length + 1))
    if (-not $Check) { [System.IO.File]::WriteAllText($BlockStateLibraryPath, $BlockStateLibraryGenerated.Text, $Utf8NoBom) }
}
$BlockStateCountData = Read-BlockStateRegistry
$Counts['block_states'] = @($BlockStateCountData.States).Count
$Counts['block_state_reporters'] = $BlockStateLibraryGenerated.Count

# 0.0.42 versioned native Gamerule: source JSON owns the typed catalog.
function Generate-GameRuleLibrary {
    $Path = Join-Path $SourceDir 'gamerules.json'
    $Data = Get-Content -Raw -Encoding UTF8 $Path | ConvertFrom-Json
    $Entries = @($Data.entries)
    $Lines = New-Object 'System.Collections.Generic.List[string]'
    @(
        '/** AUTO-GENERATED FILE. DO NOT EDIT BY HAND.',
        ' * Source: registry/source/bedrock/gamerules.json',
        ' * Generator: tools/generate_registry.ps1 */',
        'namespace MCFunctionGameruleLibrary {'
    ) | ForEach-Object { [void]$Lines.Add($_) }
    $SeenNames = @{}
    $SeenIds = @{}
    foreach ($Entry in $Entries) {
        $Id = [string]$Entry.id
        if ($SeenIds.ContainsKey($Id)) { throw "Duplicate gamerule ID: $Id" }
        $SeenIds[$Id] = $true
        if ($Entry.valueKind -notin @('Boolean','Integer','Enum')) { throw "Unsupported gamerule valueKind: $Id" }
        $Name = Get-FunctionName $Entry
        if ($SeenNames.ContainsKey($Name)) { throw "Duplicate gamerule reporter: $Name" }
        $SeenNames[$Name] = $true
        $Group = [string]$Entry.valueKind
        $BlockId = Get-BlockId 'gamerules' $Id
        # IMPORTANT: Add every entry as a separate line. PowerShell's expression
        # parsing may concatenate the strings in a mixed array expression,
        # causing `//%` annotations to comment out the entire TS function.
        [void]$Lines.Add('    //% group="' + $Group + '"')
        [void]$Lines.Add('    //% blockId=' + $BlockId)
        [void]$Lines.Add('    //% block="gamerule ' + $Id + '"')
        [void]$Lines.Add('    export function ' + $Name + '(): GameRuleRef {')
        [void]$Lines.Add('        return new GameRuleRef("' + $Id + '");')
        [void]$Lines.Add('    }')
        [void]$Lines.Add('')
    }
    [void]$Lines.Add('}')
    [void]$Lines.Add('')
    return (($Lines -join "`n") + "`n")
}

function Generate-GameRuleLookup {
    $Path = Join-Path $SourceDir 'gamerules.json'
    $Data = Get-Content -Raw -Encoding UTF8 $Path | ConvertFrom-Json
    $Entries = @($Data.entries)
    $Lines = New-Object 'System.Collections.Generic.List[string]'
    @(
        '/** AUTO-GENERATED FILE. DO NOT EDIT BY HAND.',
        ' * Source: registry/source/bedrock/gamerules.json',
        ' * Generator: tools/generate_registry.ps1 */',
        'namespace MCFunctionGameruleRegistry {',
        '    /** 0=unknown, 1=Boolean, 2=Integer, 3=Enum. */',
        '    export function valueKindOf(ruleId: string): number {',
        '        if (!ruleId) return 0;'
    ) | ForEach-Object { [void]$Lines.Add($_) }
    foreach ($Entry in $Entries) {
        $KindNum = if ($Entry.valueKind -eq 'Boolean') { 1 } elseif ($Entry.valueKind -eq 'Integer') { 2 } else { 3 }
        [void]$Lines.Add('        if (ruleId == "' + $Entry.id + '") return ' + $KindNum + ';')
    }
    @(
        '        return 0;',
        '    }',
        '    export function isDocumentedEnumValue(ruleId: string, value: string): boolean {'
    ) | ForEach-Object { [void]$Lines.Add($_) }
    $EnumEntries = @($Entries | Where-Object { $_.valueKind -eq 'Enum' })
    foreach ($Entry in $EnumEntries) {
        $Tests = @($Entry.allowedValues | ForEach-Object { 'value == "' + [string]$_ + '"' }) -join ' || '
        [void]$Lines.Add('        if (ruleId == "' + $Entry.id + '") return ' + $Tests + ';')
    }
    @(
        '        return true;',
        '    }',
        '    export function outsideDocumentedIntegerRange(ruleId: string, value: number): boolean {'
    ) | ForEach-Object { [void]$Lines.Add($_) }
    foreach ($Entry in $Entries) {
        if ($Entry.valueKind -ne 'Integer') { continue }
        $HasMin = $Entry.PSObject.Properties.Name -contains 'minValue'
        $HasMax = $Entry.PSObject.Properties.Name -contains 'maxValue'
        if (-not $HasMin -and -not $HasMax) { continue }
        $Checks = New-Object 'System.Collections.Generic.List[string]'
        if ($HasMin) { [void]$Checks.Add('value < ' + [string]$Entry.minValue) }
        if ($HasMax) { [void]$Checks.Add('value > ' + [string]$Entry.maxValue) }
        [void]$Lines.Add('        if (ruleId == "' + $Entry.id + '") return ' + ($Checks -join ' || ') + ';')
    }
    @(
        '        return false;',
        '    }',
        '}',
        ''
    ) | ForEach-Object { [void]$Lines.Add($_) }
    return (($Lines -join "`n") + "`n")
}

$GameruleGenerated = Generate-GameRuleLibrary
$GameruleLibraryPath = Join-Path $OutDir 'gamerule_library.generated.ts'
$GameruleLibraryActual = if (Test-Path $GameruleLibraryPath) { [System.IO.File]::ReadAllText($GameruleLibraryPath) } else { $null }
if ($GameruleLibraryActual -ne $GameruleGenerated) {
    [void]$Changed.Add('src/libraries/gamerule_library.generated.ts')
    if (-not $Check) { [System.IO.File]::WriteAllText($GameruleLibraryPath, $GameruleGenerated, $Utf8NoBom) }
}
$GameruleLookupGenerated = Generate-GameRuleLookup
$GameruleLookupPath = Join-Path $LookupOutDir 'gamerule_registry.generated.ts'
$GameruleLookupActual = if (Test-Path $GameruleLookupPath) { [System.IO.File]::ReadAllText($GameruleLookupPath) } else { $null }
if ($GameruleLookupActual -ne $GameruleLookupGenerated) {
    [void]$Changed.Add('src/registry/gamerule_registry.generated.ts')
    if (-not $Check) { [System.IO.File]::WriteAllText($GameruleLookupPath, $GameruleLookupGenerated, $Utf8NoBom) }
}
$Counts['gamerules'] = @((Get-Content -Raw -Encoding UTF8 (Join-Path $SourceDir 'gamerules.json') | ConvertFrom-Json).entries).Count

$GroupedSpecs = @(
    [ordered]@{ Kind='entity_events'; Namespace='MCFunctionEntityEventLibrary'; Category='EVENT'; Prefix='event'; BlockIdPrefix='mcfunction_entity_event'; Color='#E67E22'; Weight=83; Icon='\uf0e7'; File='entity_event_library.generated.ts' },
    [ordered]@{ Kind='spawn_events'; Namespace='MCFunctionSpawnEventLibrary'; Category='SPAWN EVENT'; Prefix='spawn event'; BlockIdPrefix='mcfunction_spawn_event'; Color='#D35400'; Weight=82; Icon='\uf1d8'; File='spawn_event_library.generated.ts' }
)

foreach ($Spec in $GroupedSpecs) {
    $Generated = Generate-GroupedEventLibrary $Spec.Kind $Spec.Namespace $Spec.Category $Spec.Prefix $Spec.BlockIdPrefix $Spec.Color $Spec.Weight $Spec.Icon $Spec.File
    $OutPath = Join-Path $OutDir $Spec.File
    $Actual = if (Test-Path $OutPath) { [System.IO.File]::ReadAllText($OutPath) } else { $null }
    if ($Actual -ne $Generated.Text) {
        [void]$Changed.Add($OutPath.Substring($Root.Length + 1))
        if (-not $Check) { [System.IO.File]::WriteAllText($OutPath, $Generated.Text, $Utf8NoBom) }
    }
    $Counts[$Spec.Kind] = $Generated.Count
}

if ($Check -and $Changed.Count -gt 0) {
    Write-Host 'Generated Registry files are out of date:'
    foreach ($File in $Changed) { Write-Host "  $File" }
    exit 1
}

foreach ($Kind in $Counts.Keys) {
    Write-Host ('{0,-14}: {1}' -f $Kind, $Counts[$Kind])
}

if ($Changed.Count -gt 0 -and -not $Check) {
    Write-Host 'Generated:'
    foreach ($File in $Changed) { Write-Host "  $File" }
}
elseif ($Changed.Count -eq 0) {
    Write-Host 'Generated Registry files are up to date.'
}
