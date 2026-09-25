# /// script
# requires-python = ">=3.10"
# dependencies = ["PyYAML==6.0.3"]
# ///
"""Export a shared plugin for OpenAI ingestion without changing its source."""

import argparse
import json
from pathlib import Path
import re
import shutil
import tempfile

import yaml


class UniqueKeyLoader(yaml.SafeLoader):
    def construct_mapping(self, node, deep=False):
        keys = [self.construct_object(key, deep=deep) for key, _ in node.value]
        if any(not isinstance(key, str) for key in keys):
            raise ValueError("plugin metadata keys must be strings")
        if len(keys) != len(set(keys)):
            raise ValueError("duplicate YAML keys are not supported in plugin exports")
        return super().construct_mapping(node, deep=deep)


def codex_skill(path):
    text = path.read_bytes().decode("utf-8")
    match = re.match(r"\A---\r?\n(.*?)^---[ \t]*(?:\r?\n|\Z)", text, re.M | re.S)
    if not match:
        raise ValueError(f"{path}: missing skill frontmatter")
    frontmatter = yaml.load(match[1], Loader=UniqueKeyLoader)
    if not isinstance(frontmatter, dict):
        raise ValueError(f"{path}: frontmatter must be a mapping")
    key = "disable-model-invocation"
    if key not in frontmatter:
        return text
    disabled = frontmatter[key]
    if not isinstance(disabled, bool):
        raise ValueError(f"{path}: {key} must be a boolean")
    if disabled:
        sidecar = path.parent / "agents/openai.yaml"
        metadata = yaml.load(sidecar.read_text(encoding="utf-8"), Loader=UniqueKeyLoader)
        policy = metadata.get("policy") if isinstance(metadata, dict) else None
        if not isinstance(policy, dict) or policy.get("allow_implicit_invocation") is not False:
            raise ValueError(f"{sidecar}: policy.allow_implicit_invocation must be false")
    normalized, count = re.subn(
        r"^disable-model-invocation:[ \t]+(?:true|false)[ \t]*(?:#[^\r\n]*)?\r?(?:\n|$)",
        "", match[1], flags=re.M,
    )
    if count != 1:
        raise ValueError(f"{path}: expected one inline {key} field with literal true or false")
    return text[:match.start(1)] + normalized + text[match.end(1):]


def export_plugin(source, destination):
    source = Path(source).resolve()
    destination = Path(destination).absolute()
    if destination.exists() or destination.is_symlink():
        raise ValueError(f"destination already exists: {destination}")
    destination = destination.resolve()
    if destination.is_relative_to(source):
        raise ValueError("destination must be outside the source plugin")
    manifest = json.loads((source / ".codex-plugin/plugin.json").read_text(encoding="utf-8"))
    if destination.name != manifest["name"]:
        raise ValueError("destination folder must match the plugin name")
    for path in source.rglob("*"):
        if path.is_symlink():
            raise ValueError(f"symlinks are not supported in plugin exports: {path}")
    skills = list((source / "skills").glob("*/SKILL.md"))
    if not skills:
        raise ValueError("source plugin has no skills")
    normalized = {path.relative_to(source): codex_skill(path) for path in skills}
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix=".codex-export-", dir=destination.parent) as temporary:
        staged = Path(temporary) / manifest["name"]
        # Other host manifests would advertise this Codex-only copy to those hosts.
        excluded = {".claude-plugin", ".cursor-plugin", "plugin.json"}
        shutil.copytree(source, staged, ignore=lambda directory, names: excluded.intersection(names)
                        if Path(directory) == source else set())
        for relative, text in normalized.items():
            (staged / relative).write_bytes(text.encode("utf-8"))
        shutil.copytree(staged, destination)
    return destination


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Canonical plugin directory")
    parser.add_argument("destination", type=Path, help="New directory named after the plugin")
    args = parser.parse_args()
    try:
        print(export_plugin(args.source, args.destination))
    except (OSError, ValueError, yaml.YAMLError) as error:
        parser.exit(1, f"Codex export failed: {error}\n")


if __name__ == "__main__":
    main()
