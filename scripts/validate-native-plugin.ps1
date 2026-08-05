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

function Assert-SameFile {
    param(
        [Parameter(Mandatory = $true)] [string] $ExpectedPath,
        [Parameter(Mandatory = $true)] [string] $ActualPath
    )

    if (-not (Test-Path -LiteralPath $ExpectedPath -PathType Leaf)) {
        Fail "missing source file: $ExpectedPath"
    }
    if (-not (Test-Path -LiteralPath $ActualPath -PathType Leaf)) {
        Fail "missing mirrored file: $ActualPath"
    }

    $expectedBytes = [System.IO.File]::ReadAllBytes((Resolve-Path -LiteralPath $ExpectedPath).Path)
    $actualBytes = [System.IO.File]::ReadAllBytes((Resolve-Path -LiteralPath $ActualPath).Path)
    if ([System.Linq.Enumerable]::SequenceEqual($expectedBytes, $actualBytes)) {
        return
    }

    $expectedText = ([System.IO.File]::ReadAllText((Resolve-Path -LiteralPath $ExpectedPath).Path) -replace "`r`n", "`n")
    $actualText = ([System.IO.File]::ReadAllText((Resolve-Path -LiteralPath $ActualPath).Path) -replace "`r`n", "`n")
    if ($expectedText -ne $actualText) {
        Fail "file differs from source: $ActualPath"
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

function Assert-SingleSkill {
    param(
        [Parameter(Mandatory = $true)] [string] $SkillsRoot,
        [Parameter(Mandatory = $true)] [string] $ExpectedName
    )

    if (-not (Test-Path -LiteralPath $SkillsRoot -PathType Container)) {
        Fail "missing skills root: $SkillsRoot"
    }

    $skills = @(Get-ChildItem -LiteralPath $SkillsRoot -Directory | Select-Object -ExpandProperty Name)
    if ($skills.Count -ne 1 -or $skills[0] -ne $ExpectedName) {
        Fail "$SkillsRoot must expose only $ExpectedName"
    }
}

function Assert-OnlyAllowedPluginSkillFiles {
    $pluginRoot = "plugins/agent-workshop"
    $allowedSkillFile = "plugins/agent-workshop/skills/agent-workshop-onboard/SKILL.md"

    $skillFiles = @(Get-ChildItem -LiteralPath $pluginRoot -Recurse -File -Filter "SKILL.md" |
        ForEach-Object { $_.FullName.Replace((Resolve-Path ".").Path + "\", "").Replace("\", "/") })

    if ($skillFiles.Count -ne 1 -or $skillFiles[0] -ne $allowedSkillFile) {
        $details = ($skillFiles -join "; ")
        Fail "plugin payload must contain only the active onboarding SKILL.md; found: $details"
    }
}

function Assert-OnlyAllowedPluginAgents {
    $pluginRoot = "plugins/agent-workshop"
    $allowedAgentFile = "plugins/agent-workshop/skills/agent-workshop-onboard/agents/openai.yaml"
    $allowedAgentDir = "plugins/agent-workshop/skills/agent-workshop-onboard/agents"

    if (Test-Path -LiteralPath "agents" -PathType Container) {
        Fail "root agents/ would expose active plugin agents"
    }
    if (Test-Path -LiteralPath "$pluginRoot/agents" -PathType Container) {
        Fail "$pluginRoot/agents would expose active plugin agents"
    }

    $agentDirs = @(Get-ChildItem -LiteralPath $pluginRoot -Recurse -Directory |
        Where-Object { $_.Name -eq "agents" } |
        ForEach-Object { $_.FullName.Replace((Resolve-Path ".").Path + "\", "").Replace("\", "/") })

    foreach ($dir in $agentDirs) {
        if ($dir -like "*/references/*") {
            continue
        }
        if ($dir -ne $allowedAgentDir) {
            Fail "unexpected active agents directory in plugin payload: $dir"
        }
    }

    $activeAgentFiles = @(Get-ChildItem -LiteralPath $allowedAgentDir -File -ErrorAction SilentlyContinue |
        ForEach-Object { $_.FullName.Replace((Resolve-Path ".").Path + "\", "").Replace("\", "/") })

    if ($activeAgentFiles.Count -ne 1 -or $activeAgentFiles[0] -ne $allowedAgentFile) {
        Fail "Codex skill wrapper must be the only active agent wrapper"
    }
}

function Assert-ToolkitPlugin {
    $root = "plugins/toolkit"
    $manifest = Read-JsonFile "$root/.claude-plugin/plugin.json"
    $codexManifest = Read-JsonFile "$root/.codex-plugin/plugin.json"

    if ($manifest.name -ne "toolkit") {
        Fail "toolkit plugin name must be toolkit"
    }
    if ($codexManifest.name -ne "toolkit") {
        Fail "Codex toolkit plugin name must be toolkit"
    }
    if ($codexManifest.version -ne $manifest.version) {
        Fail "Codex toolkit manifest version must match Claude toolkit manifest"
    }
    if (Has-Property $manifest "mcpServers") {
        Fail "toolkit manifest must not contain mcpServers"
    }
    if (Has-Property $codexManifest "mcpServers") {
        Fail "Codex toolkit manifest must not contain mcpServers"
    }
    if (Has-Property $codexManifest "apps") {
        Fail "Codex toolkit manifest must not contain apps"
    }
    if ($codexManifest.skills -ne "./skills") {
        Fail "Codex toolkit plugin manifest must set skills to ./skills"
    }
    if (-not (Has-Property $codexManifest "interface") -or -not (Has-Property $codexManifest.interface "capabilities")) {
        Fail "Codex toolkit manifest must declare interface.capabilities"
    }
    $capabilities = @($codexManifest.interface.capabilities)
    if ($capabilities.Count -ne 1 -or $capabilities[0] -ne "Skills") {
        Fail "Codex toolkit capabilities must be exactly Skills"
    }
    $skillsDir = "$root/skills"
    if (-not (Test-Path -LiteralPath $skillsDir -PathType Container)) {
        Fail "toolkit must contain a skills directory"
    }
    $expectedSkills = @("claim-check", "code-quality-review", "doc-to-html", "empirical-proof", "get-pr-comments", "handoff-goal", "handoff-pr", "handoff-review", "qa-sweep", "route-work", "ui-demo-video")
    $actualSkills = @(Get-ChildItem -LiteralPath $skillsDir -Directory | Select-Object -ExpandProperty Name | Sort-Object)
    Assert-SameFileList $expectedSkills $actualSkills "toolkit skills"
    foreach ($skillName in $expectedSkills) {
        if (-not (Test-Path -LiteralPath "$skillsDir/$skillName/SKILL.md" -PathType Leaf)) {
            Fail "toolkit skill missing SKILL.md: $skillName"
        }
    }

    $agentDir = "$root/agents"
    if (-not (Test-Path -LiteralPath $agentDir -PathType Container)) {
        Fail "toolkit must contain an agents directory"
    }

    # The toolkit plugin payload is the canonical home for its own pieces; the
    # repo's .claude/ no longer mirrors them, so there is nothing to compare against.
    $expected = @("ci-watcher.md", "code-quality-reviewer.md", "pattern-reviewer.md", "spec-reviewer.md", "test-quality-reviewer.md", "vigil.md")
    $actual = @(Get-ChildItem -LiteralPath $agentDir -File | Select-Object -ExpandProperty Name | Sort-Object)
    Assert-SameFileList $expected $actual "toolkit agents"
}

function Assert-CodexToolkitPlugin {
    $root = "plugins/toolkit"
    $skillsDir = "$root/skills"
    if (-not (Test-Path -LiteralPath $skillsDir -PathType Container)) {
        Fail "Codex toolkit must contain a skills directory"
    }
    $expectedSkills = @("claim-check", "code-quality-review", "doc-to-html", "empirical-proof", "get-pr-comments", "handoff-goal", "handoff-pr", "handoff-review", "qa-sweep", "route-work", "ui-demo-video")
    $actualSkills = @(Get-ChildItem -LiteralPath $skillsDir -Directory | Select-Object -ExpandProperty Name | Sort-Object)
    Assert-SameFileList $expectedSkills $actualSkills "Codex toolkit skills"
}

function Assert-OnboardingBundle {
    param([Parameter(Mandatory = $true)] [string] $ReferenceRoot)

    # The onboarding plugin is a self-contained bundle. It no longer mirrors a
    # universal .claude/ master; it bundles only the pieces onboarding adopts, and
    # `references/catalog.json` is the canonical pack catalog (no separate master).

    # General adoption docs are bundled in full from the source docs/.
    foreach ($name in "conventions", "adoption") {
        foreach ($file in Get-ChildItem -LiteralPath "docs/$name" -File) {
            Assert-SameFile $file.FullName "$ReferenceRoot/docs/$name/$($file.Name)"
        }
    }

    # Bundled origin docs (only for what onboarding adopts) must not go stale
    # against the source docs/ they were copied from.
    foreach ($area in "agents", "skills") {
        foreach ($file in Get-ChildItem -LiteralPath "$ReferenceRoot/docs/$area" -File) {
            Assert-SameFile "docs/$area/$($file.Name)" $file.FullName
        }
    }

    # Every cataloged agent ships a complete bundle: spec, host wrappers, origin doc.
    $catalogAgents = (Read-JsonFile "$ReferenceRoot/catalog.json").agents.PSObject.Properties.Name
    foreach ($agentName in $catalogAgents) {
        $required = @(
            "$ReferenceRoot/agents/$agentName.md",
            "$ReferenceRoot/wrappers/codex/$agentName.toml",
            "$ReferenceRoot/wrappers/gemini/$agentName.md",
            "$ReferenceRoot/wrappers/opencode/$agentName.md",
            "$ReferenceRoot/docs/agents/$agentName.md"
        )
        foreach ($p in $required) {
            if (-not (Test-Path -LiteralPath $p -PathType Leaf)) {
                Fail "cataloged agent $agentName missing bundled file: $p"
            }
        }
    }
}

function Assert-RepoActiveMatchesBundle {
    param([Parameter(Mandatory = $true)] [string] $ReferenceRoot)

    # The few skills/agents the repo runs locally are the same artifact as their
    # onboarding template, so they must stay byte-identical to the bundle copy.
    foreach ($skill in Get-ChildItem -LiteralPath ".claude/skills" -Directory) {
        Assert-SameFile "$($skill.FullName)/SKILL.md" "$ReferenceRoot/skills/$($skill.Name).md"
    }
    foreach ($agent in Get-ChildItem -LiteralPath ".claude/agents" -File) {
        $name = [System.IO.Path]::GetFileNameWithoutExtension($agent.Name)
        Assert-SameFile $agent.FullName "$ReferenceRoot/agents/$name.md"
        Assert-SameFile ".codex/agents/$name.toml" "$ReferenceRoot/wrappers/codex/$name.toml"
        Assert-SameFile ".opencode/agents/$name.md" "$ReferenceRoot/wrappers/opencode/$name.md"
    }
}

# A marketplace repo needs no root plugin.json; the agent-workshop payload manifest
# is the source of truth for the plugin's name and version.
$claudeMarketplace = Read-JsonFile ".claude-plugin/marketplace.json"
$claudeManifest = Read-JsonFile "plugins/agent-workshop/.claude-plugin/plugin.json"
$codexMarketplace = Read-JsonFile ".agents/plugins/marketplace.json"
$codexManifest = Read-JsonFile "plugins/agent-workshop/.codex-plugin/plugin.json"
$toolkitManifest = Read-JsonFile "plugins/toolkit/.claude-plugin/plugin.json"

if ($claudeManifest.name -ne "agent-workshop") {
    Fail "agent-workshop plugin manifest name must be agent-workshop"
}
if (Has-Property $claudeManifest "mcpServers") {
    Fail "agent-workshop plugin manifest must not contain mcpServers"
}
if (Has-Property $claudeManifest "agents") {
    Fail "agent-workshop plugin manifest must not expose agents"
}

$claudePlugins = @($claudeMarketplace.plugins)
if ($claudePlugins.Count -ne 2) {
    Fail "Claude marketplace must contain exactly two plugins (agent-workshop, toolkit)"
}
$onboardEntry = $claudePlugins | Where-Object { $_.name -eq "agent-workshop" }
$toolkitEntry = $claudePlugins | Where-Object { $_.name -eq "toolkit" }
if (-not $onboardEntry) {
    Fail "Claude marketplace must contain the agent-workshop plugin"
}
if (-not $toolkitEntry) {
    Fail "Claude marketplace must contain the toolkit plugin"
}
if ($onboardEntry.source -ne "./plugins/agent-workshop") {
    Fail "agent-workshop marketplace source must be ./plugins/agent-workshop"
}
if ($onboardEntry.version -ne $claudeManifest.version) {
    Fail "agent-workshop marketplace version must match the plugin manifest"
}
if ($toolkitEntry.source -ne "./plugins/toolkit") {
    Fail "toolkit marketplace source must be ./plugins/toolkit"
}
if ($toolkitEntry.version -ne $toolkitManifest.version) {
    Fail "toolkit marketplace version must match its plugin manifest"
}

$codexPlugins = @($codexMarketplace.plugins)
if ($codexPlugins.Count -ne 2) {
    Fail "Codex marketplace must contain exactly two plugins (agent-workshop, toolkit)"
}
$codexOnboardEntry = $codexPlugins | Where-Object { $_.name -eq "agent-workshop" }
$codexToolkitEntry = $codexPlugins | Where-Object { $_.name -eq "toolkit" }
if (-not $codexOnboardEntry) {
    Fail "Codex marketplace must contain the agent-workshop plugin"
}
if (-not $codexToolkitEntry) {
    Fail "Codex marketplace must contain the toolkit plugin"
}
if ($codexOnboardEntry.source.path -ne "./plugins/agent-workshop") {
    Fail "Codex marketplace source path must be ./plugins/agent-workshop"
}
if ($codexOnboardEntry.policy.installation -ne "AVAILABLE") {
    Fail "Codex marketplace installation policy must be AVAILABLE"
}
if ($codexOnboardEntry.policy.authentication -ne "ON_INSTALL") {
    Fail "Codex marketplace authentication policy must be ON_INSTALL"
}
if (-not (Has-Property $codexOnboardEntry "category")) {
    Fail "Codex marketplace entry must include category"
}
if ($codexToolkitEntry.source.path -ne "./plugins/toolkit") {
    Fail "Codex toolkit marketplace source path must be ./plugins/toolkit"
}
if ($codexToolkitEntry.policy.installation -ne "AVAILABLE") {
    Fail "Codex toolkit marketplace installation policy must be AVAILABLE"
}
if ($codexToolkitEntry.policy.authentication -ne "ON_INSTALL") {
    Fail "Codex toolkit marketplace authentication policy must be ON_INSTALL"
}
if (-not (Has-Property $codexToolkitEntry "category")) {
    Fail "Codex toolkit marketplace entry must include category"
}

if ($codexManifest.name -ne "agent-workshop") {
    Fail "Codex plugin name must be agent-workshop"
}
if ($codexManifest.version -ne $claudeManifest.version) {
    Fail "Codex plugin manifest version must match the agent-workshop plugin manifest"
}
if ($codexManifest.skills -ne "./skills") {
    Fail "Codex plugin manifest must set skills to ./skills"
}
if (Has-Property $codexManifest "mcpServers") {
    Fail "Codex plugin manifest must not contain mcpServers"
}
if (Has-Property $codexManifest "apps") {
    Fail "Codex plugin manifest must not contain apps"
}
if (-not (Has-Property $codexManifest "interface") -or -not (Has-Property $codexManifest.interface "capabilities")) {
    Fail "Codex plugin manifest must declare interface.capabilities"
}
$capabilities = @($codexManifest.interface.capabilities)
if ($capabilities.Count -ne 1 -or $capabilities[0] -ne "Skills") {
    Fail "Codex plugin capabilities must be exactly Skills"
}

# Cursor marketplace + per-plugin manifests (parallel host surface).
$cursorMarketplace = Read-JsonFile ".cursor-plugin/marketplace.json"
$cursorPlugins = @($cursorMarketplace.plugins)
if ($cursorPlugins.Count -ne 2) {
    Fail "Cursor marketplace must contain exactly two plugins (agent-workshop, toolkit)"
}
$cursorOnboardEntry = $cursorPlugins | Where-Object { $_.name -eq "agent-workshop" }
$cursorToolkitEntry = $cursorPlugins | Where-Object { $_.name -eq "toolkit" }
if (-not $cursorOnboardEntry) {
    Fail "Cursor marketplace must contain the agent-workshop plugin"
}
if (-not $cursorToolkitEntry) {
    Fail "Cursor marketplace must contain the toolkit plugin"
}
$cursorPluginRoot = $cursorMarketplace.metadata.pluginRoot
if ($cursorPluginRoot -ne "plugins") {
    Fail "Cursor marketplace metadata.pluginRoot must be plugins"
}
if ($cursorOnboardEntry.source -ne "agent-workshop") {
    Fail "Cursor agent-workshop marketplace source must be agent-workshop (relative to metadata.pluginRoot)"
}
if ($cursorToolkitEntry.source -ne "toolkit") {
    Fail "Cursor toolkit marketplace source must be toolkit (relative to metadata.pluginRoot)"
}

$cursorOnboardManifest = Read-JsonFile "plugins/agent-workshop/.cursor-plugin/plugin.json"
$cursorToolkitManifest = Read-JsonFile "plugins/toolkit/.cursor-plugin/plugin.json"
if ($cursorOnboardManifest.name -ne "agent-workshop") {
    Fail "Cursor agent-workshop manifest name must be agent-workshop"
}
if ($cursorOnboardManifest.version -ne $claudeManifest.version) {
    Fail "Cursor agent-workshop manifest version must match the agent-workshop plugin manifest"
}
if ($cursorToolkitManifest.name -ne "toolkit") {
    Fail "Cursor toolkit manifest name must be toolkit"
}
if ($cursorToolkitManifest.version -ne $toolkitManifest.version) {
    Fail "Cursor toolkit manifest version must match its plugin manifest"
}

Assert-SingleSkill "plugins/agent-workshop/skills" "agent-workshop-onboard"
Assert-OnlyAllowedPluginSkillFiles
Assert-OnlyAllowedPluginAgents
Assert-ToolkitPlugin
Assert-CodexToolkitPlugin

$referenceRoot = "plugins/agent-workshop/skills/agent-workshop-onboard/references"

Assert-OnboardingBundle $referenceRoot
Assert-RepoActiveMatchesBundle $referenceRoot

Write-Output "native plugin validation ok"
