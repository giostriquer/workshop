$ErrorActionPreference = "Stop"

function Fail {
    param([string]$Message)
    throw "native plugin validation failed: $Message"
}

function Has-Property {
    param(
        [Parameter(Mandatory = $true)] $Object,
        [Parameter(Mandatory = $true)] [string] $Name
    )

    return $Object.PSObject.Properties.Name -contains $Name
}

function Read-JsonFile {
    param([Parameter(Mandatory = $true)] [string] $Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        Fail "missing JSON file: $Path"
    }

    try {
        return Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json
    }
    catch {
        Fail "invalid JSON in ${Path}: $($_.Exception.Message)"
    }
}

function Assert-SameFileList {
    param(
        [Parameter(Mandatory = $true)] [string[]] $Expected,
        [Parameter(Mandatory = $true)] [string[]] $Actual,
        [Parameter(Mandatory = $true)] [string] $Context
    )

    $diff = Compare-Object $Expected $Actual
    if ($diff) {
        $details = ($diff | ForEach-Object { "$($_.SideIndicator) $($_.InputObject)" }) -join "; "
        Fail "$Context file list mismatch: $details"
    }
}

# The marketplace ships two plugins: workbench (the process core — agents,
# everyday skills, and the workbench flow layer) and toolkit (optional
# artifact-making utilities). The repo's own working set (.claude/, .codex/,
# .opencode/) and the attic are outside the validator's scope — .claude/ is
# canonical for the pieces this repo runs (change-log, push, wiki-maintainer,
# and the repo-only workbench-drift), mirrored nowhere.

$plugins = @(
    @{
        Name           = "workbench"
        ExpectedSkills = @("audit", "brainstorming", "claim-check", "code-quality-review", "empirical-proof", "file-pr", "fix-ci", "get-pr-comments", "handoff-goal", "qa-sweep", "receiving-code-review", "route-work", "systematic-debugging", "test-driven-development", "using-workbench", "verification-before-completion")
        ExpectedAgents = @("ci-watcher.md", "code-quality-reviewer.md", "pattern-reviewer.md", "spec-reviewer.md", "test-quality-reviewer.md")
    },
    @{
        Name           = "toolkit"
        ExpectedSkills = @("arch-map", "doc-to-html", "ui-demo-video", "writing-skills")
        ExpectedAgents = $null   # no agents directory
    }
)

function Assert-Plugin {
    param([Parameter(Mandatory = $true)] [hashtable] $Spec)

    $name = $Spec.Name
    $root = "plugins/$name"
    $manifest = Read-JsonFile "$root/.claude-plugin/plugin.json"
    $codexManifest = Read-JsonFile "$root/.codex-plugin/plugin.json"
    $cursorManifest = Read-JsonFile "$root/.cursor-plugin/plugin.json"

    if ($manifest.name -ne $name) {
        Fail "$name plugin name must be $name"
    }
    if ($codexManifest.name -ne $name) {
        Fail "Codex $name plugin name must be $name"
    }
    if ($cursorManifest.name -ne $name) {
        Fail "Cursor $name manifest name must be $name"
    }
    if ($codexManifest.version -ne $manifest.version) {
        Fail "Codex $name manifest version must match Claude manifest"
    }
    if ($cursorManifest.version -ne $manifest.version) {
        Fail "Cursor $name manifest version must match Claude manifest"
    }
    foreach ($m in @($manifest, $codexManifest)) {
        if (Has-Property $m "mcpServers") {
            Fail "$name manifests must not contain mcpServers"
        }
    }
    if (Has-Property $codexManifest "apps") {
        Fail "Codex $name manifest must not contain apps"
    }
    if ($codexManifest.skills -ne "./skills") {
        Fail "Codex $name plugin manifest must set skills to ./skills"
    }
    if (-not (Has-Property $codexManifest "interface") -or -not (Has-Property $codexManifest.interface "capabilities")) {
        Fail "Codex $name manifest must declare interface.capabilities"
    }
    $capabilities = @($codexManifest.interface.capabilities)
    if ($capabilities.Count -ne 1 -or $capabilities[0] -ne "Skills") {
        Fail "Codex $name capabilities must be exactly Skills"
    }

    $skillsDir = "$root/skills"
    if (-not (Test-Path -LiteralPath $skillsDir -PathType Container)) {
        Fail "$name must contain a skills directory"
    }
    $actualSkills = @(Get-ChildItem -LiteralPath $skillsDir -Directory | Select-Object -ExpandProperty Name | Sort-Object)
    Assert-SameFileList $Spec.ExpectedSkills $actualSkills "$name skills"
    foreach ($skillName in $Spec.ExpectedSkills) {
        if (-not (Test-Path -LiteralPath "$skillsDir/$skillName/SKILL.md" -PathType Leaf)) {
            Fail "$name skill missing SKILL.md: $skillName"
        }
    }

    if ($null -ne $Spec.ExpectedAgents) {
        $agentDir = "$root/agents"
        if (-not (Test-Path -LiteralPath $agentDir -PathType Container)) {
            Fail "$name must contain an agents directory"
        }
        $actual = @(Get-ChildItem -LiteralPath $agentDir -File | Select-Object -ExpandProperty Name | Sort-Object)
        Assert-SameFileList $Spec.ExpectedAgents $actual "$name agents"
    }
    elseif (Test-Path -LiteralPath "$root/agents" -PathType Container) {
        Fail "$name must not contain an agents directory"
    }

    return $manifest
}

# ── plugin payloads ──

$manifests = @{}
foreach ($spec in $plugins) {
    $manifests[$spec.Name] = Assert-Plugin $spec
}

# ── marketplaces: each host surface lists exactly the two plugins ──

$expectedNames = @($plugins | ForEach-Object { $_.Name } | Sort-Object)

$claudeMarketplace = Read-JsonFile ".claude-plugin/marketplace.json"
$claudePlugins = @($claudeMarketplace.plugins)
Assert-SameFileList $expectedNames @($claudePlugins | ForEach-Object { $_.name } | Sort-Object) "Claude marketplace plugins"
foreach ($entry in $claudePlugins) {
    if ($entry.source -ne "./plugins/$($entry.name)") {
        Fail "$($entry.name) marketplace source must be ./plugins/$($entry.name)"
    }
    if ($entry.version -ne $manifests[$entry.name].version) {
        Fail "$($entry.name) marketplace version must match its plugin manifest"
    }
}

$codexMarketplace = Read-JsonFile ".agents/plugins/marketplace.json"
$codexPlugins = @($codexMarketplace.plugins)
Assert-SameFileList $expectedNames @($codexPlugins | ForEach-Object { $_.name } | Sort-Object) "Codex marketplace plugins"
foreach ($entry in $codexPlugins) {
    if ($entry.source.path -ne "./plugins/$($entry.name)") {
        Fail "Codex $($entry.name) marketplace source path must be ./plugins/$($entry.name)"
    }
    if ($entry.policy.installation -ne "AVAILABLE") {
        Fail "Codex $($entry.name) marketplace installation policy must be AVAILABLE"
    }
    if ($entry.policy.authentication -ne "ON_INSTALL") {
        Fail "Codex $($entry.name) marketplace authentication policy must be ON_INSTALL"
    }
    if (-not (Has-Property $entry "category")) {
        Fail "Codex $($entry.name) marketplace entry must include category"
    }
}

$cursorMarketplace = Read-JsonFile ".cursor-plugin/marketplace.json"
$cursorPlugins = @($cursorMarketplace.plugins)
Assert-SameFileList $expectedNames @($cursorPlugins | ForEach-Object { $_.name } | Sort-Object) "Cursor marketplace plugins"
if ($cursorMarketplace.metadata.pluginRoot -ne "plugins") {
    Fail "Cursor marketplace metadata.pluginRoot must be plugins"
}
foreach ($entry in $cursorPlugins) {
    if ($entry.source -ne $entry.name) {
        Fail "Cursor $($entry.name) marketplace source must be $($entry.name) (relative to metadata.pluginRoot)"
    }
}

if (Test-Path -LiteralPath "plugins/agent-workshop" -PathType Container) {
    Fail "plugins/agent-workshop was deleted 2026-08-11; it must not reappear"
}

Write-Output "native plugin validation ok"
