param(
    [switch]$Apply,
    [switch]$SkipGenerate
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}
$Root = Split-Path -Parent $PSScriptRoot
$SourceDir = Join-Path $Root 'registry\source\bedrock'
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$Headers = @{ 'User-Agent' = 'command-block-coding-audio-registry/0.0.41' }
$SoundsUrl = 'https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/sounds/sound_definitions.json'
$MusicUrl = 'https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/sounds/music_definitions.json'

function Get-OfficialJson([string]$Url) {
    $Args = @{ Uri = $Url; Headers = $Headers; Method = 'Get'; ErrorAction = 'Stop' }
    if ($PSVersionTable.PSVersion.Major -le 5) { $Args.UseBasicParsing = $true }
    $Response = Invoke-WebRequest @Args
    return ($Response.Content | ConvertFrom-Json)
}
function Get-ValidIds([string[]]$Values) {
    return @($Values | Where-Object { $_ -match '^[a-z0-9_./:-]+$' -and $_ -notmatch '(^:|:$|::|\s)' } | Sort-Object -Unique)
}
function Make-Registry([string]$Kind, [string[]]$Ids, [string[]]$Urls, [string]$Details) {
    $SourceList = @($Urls | ForEach-Object { [string]$_ })
    return [ordered]@{
        schemaVersion = 1
        platform = 'bedrock'
        coverage = 'mojang-resource-pack-current-at-fetch'
        source = [ordered]@{
            kind = $Details
            provider = 'Mojang/bedrock-samples'
            urls = $SourceList
            fetchedAtUtc = [DateTime]::UtcNow.ToString('o')
        }
        notes = @(
            'This file lists content from the upstream sample resource pack, not a guarantee that each ID works in the installed Minecraft Education release.',
            'Unknown/custom IDs are kept as authorable Direct Input values.',
            'Do not hand-edit generated TypeScript; use the generator.'
        )
        entries = @($Ids | ForEach-Object { [ordered]@{ id = [string]$_ } })
    }
}

function Merge-ObservedRuntimeEntries([string]$ExistingPath, $GeneratedData) {
    # Official Mojang catalog is primary; preserve separately annotated Education
    # runtime observations when the downloaded source does not list them.
    if (-not (Test-Path $ExistingPath)) { return $GeneratedData }
    $Old = Get-Content -Raw -Encoding UTF8 $ExistingPath | ConvertFrom-Json
    $Seen = @{}
    foreach ($Entry in @($GeneratedData.entries)) { $Seen[[string]$Entry.id] = $true }
    $Merged = New-Object 'System.Collections.Generic.List[object]'
    foreach ($Entry in @($GeneratedData.entries)) { [void]$Merged.Add($Entry) }
    foreach ($Entry in @($Old.entries)) {
        $Id = [string]$Entry.id
        if (-not ($Entry.PSObject.Properties.Name -contains 'verifiedBy')) { continue }
        if (-not $Seen.ContainsKey($Id)) {
            [void]$Merged.Add($Entry)
            $Seen[$Id] = $true
            Write-Host "Preserved Education-observed audio ID: $Id"
        }
    }
    $GeneratedData.entries = @($Merged | Sort-Object { [string]$_.id })
    $GeneratedData.notes += 'Observed Education IDs not present in upstream remain separately annotated, never relabeled as official Mojang entries.'
    return $GeneratedData
}

Write-Host 'Fetching Mojang audio definitions...'
$SoundDefinitions = Get-OfficialJson $SoundsUrl
$MusicDefinitions = Get-OfficialJson $MusicUrl

$SoundRoot = $SoundDefinitions.PSObject.Properties['sound_definitions']
if ($null -eq $SoundRoot -or $null -eq $SoundRoot.Value) {
    throw 'Mojang sound_definitions.json has no sound_definitions map. Registry unchanged.'
}
$Sounds = @(Get-ValidIds @($SoundRoot.Value.PSObject.Properties | ForEach-Object { [string]$_.Name }))
$MusicValues = New-Object 'System.Collections.Generic.List[string]'
foreach ($Property in $MusicDefinitions.PSObject.Properties) {
    $Event = $Property.Value.PSObject.Properties['event_name']
    if ($null -ne $Event) {
        [void]$MusicValues.Add([string]$Event.Value)
    }
}
# /music play accepts record tracks as well as Minecraft background music events.
foreach ($Id in $Sounds) {
    if ($Id.StartsWith('record.')) { [void]$MusicValues.Add($Id) }
}
$Music = @(Get-ValidIds $MusicValues.ToArray())
if ($Sounds.Count -lt 100 -or $Music.Count -lt 10) {
    throw "Downloaded audio catalog too small ($($Sounds.Count) sounds, $($Music.Count) tracks). Registry unchanged."
}
Write-Host "Official audio candidates: $($Sounds.Count) sounds / $($Music.Count) music tracks"
if (-not $Apply) {
    Write-Host 'Dry run: Registry source unchanged. Run with -Apply to update.'
    return
}

$SoundData = Make-Registry 'sounds' $Sounds @($SoundsUrl) 'resource-pack-sound-definitions'
$MusicData = Make-Registry 'music_tracks' $Music @($MusicUrl,$SoundsUrl) 'music-definitions-events-plus-record-sounds'
$SoundPath = Join-Path $SourceDir 'sounds.json'
$MusicPath = Join-Path $SourceDir 'music_tracks.json'
$SoundData = Merge-ObservedRuntimeEntries $SoundPath $SoundData
$MusicData = Merge-ObservedRuntimeEntries $MusicPath $MusicData
$OldSound = [System.IO.File]::ReadAllText($SoundPath)
$OldMusic = [System.IO.File]::ReadAllText($MusicPath)
try {
    [System.IO.File]::WriteAllText($SoundPath, (($SoundData | ConvertTo-Json -Depth 12) + "`n"), $Utf8NoBom)
    [System.IO.File]::WriteAllText($MusicPath, (($MusicData | ConvertTo-Json -Depth 12) + "`n"), $Utf8NoBom)
    if (-not $SkipGenerate) {
        & (Join-Path $PSScriptRoot 'generate_registry.ps1')
    }
} catch {
    [System.IO.File]::WriteAllText($SoundPath, $OldSound, $Utf8NoBom)
    [System.IO.File]::WriteAllText($MusicPath, $OldMusic, $Utf8NoBom)
    throw
}
Write-Host 'Audio Registry updated. Review changes before committing.'
