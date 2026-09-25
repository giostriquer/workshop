"""Focused export checks: uv run --with pyyaml python -B scripts/export-codex-plugin.test.py"""

import json
from pathlib import Path
import runpy
import subprocess
import sys
import tempfile
import unittest

import yaml


SCRIPT = Path(__file__).with_name("export-codex-plugin.py")
export_plugin = runpy.run_path(str(SCRIPT))["export_plugin"]
BODY = "# Example\n\n```yaml\ndisable-model-invocation: true\n```\n"
SKILL = "---\nname: example\ndescription: Use when asked.\ndisable-model-invocation: true\n---\n" + BODY
SIDECAR = 'interface:\n  display_name: Example\n  short_description: Example skill\npolicy:\n  allow_implicit_invocation: false\n'


class ExportTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory(prefix="codex-export-test-")
        self.addCleanup(temporary.cleanup)
        self.base = Path(temporary.name)
        self.source = self.base / "source/acme"
        self.destination = self.base / "output/acme"
        self.skill = self.source / "skills/example/SKILL.md"
        self.sidecar = self.source / "skills/example/agents/openai.yaml"
        for relative, content in {
            ".codex-plugin/plugin.json": json.dumps({"name": "acme", "skills": "./skills"}),
            ".claude-plugin/plugin.json": '{"name":"acme"}',
            ".cursor-plugin/plugin.json": '{"name":"acme"}',
            "plugin.json": '{"name":"acme"}',
            "skills/example/SKILL.md": SKILL,
            "skills/example/agents/openai.yaml": SIDECAR,
            "skills/example/references/plugin.json": '{"keep":"nested reference"}',
            "agents/reviewer.md": "Read and report.\n",
            "LICENSE": "Example license\n",
        }.items():
            path = self.source / relative
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8")

    def snapshot(self, root):
        return {str(path.relative_to(root)): path.read_bytes()
                for path in root.rglob("*") if path.is_file()}

    def test_cli_preserves_source_and_exports_content_with_codex_policy(self):
        before = self.snapshot(self.source)
        result = subprocess.run([sys.executable, str(SCRIPT), str(self.source), str(self.destination)],
                                capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.snapshot(self.source), before)
        exported = self.snapshot(self.destination)
        expected = {key: value for key, value in before.items()
                    if key not in {".claude-plugin/plugin.json", ".cursor-plugin/plugin.json", "plugin.json"}}
        expected["skills/example/SKILL.md"] = ("---\nname: example\ndescription: Use when asked.\n---\n" + BODY).encode()
        self.assertEqual(exported, expected)
        metadata = yaml.safe_load(exported["skills/example/agents/openai.yaml"])
        self.assertIs(metadata["policy"]["allow_implicit_invocation"], False)

    def test_rejects_missing_or_ineffective_codex_policy_without_creating_output(self):
        for policy in [None, "", "policy: {}\n", "policy:\n  allow_implicit_invocation: true\n",
                       'policy:\n  allow_implicit_invocation: "false"\n',
                       "policy:\n  nested:\n    allow_implicit_invocation: false\n",
                       "policy:\n  allow_implicit_invocation: true\n  allow_implicit_invocation: false\n"]:
            with self.subTest(policy=policy):
                if policy is None:
                    self.sidecar.unlink()
                else:
                    self.sidecar.write_text(policy, encoding="utf-8")
                with self.assertRaises((ValueError, OSError)):
                    export_plugin(self.source, self.destination)
                self.assertFalse(self.destination.exists())
                self.assertEqual(self.skill.read_text(), SKILL)

    def test_ordinary_skills_need_no_sidecar_and_keep_content_exactly(self):
        self.sidecar.unlink()
        skill = "---\nname: example\ndescription: Use when asked.\n---\n" + BODY
        self.skill.write_text(skill, encoding="utf-8")
        export_plugin(self.source, self.destination)
        self.assertEqual((self.destination / "skills/example/SKILL.md").read_text(), skill)

    def test_multiline_invocation_flag_is_rejected_without_changing_metadata(self):
        for value in ("true", "false"):
            with self.subTest(value=value):
                destination = self.base / value / "acme"
                skill = SKILL.replace("disable-model-invocation: true", f"disable-model-invocation:\n  {value}", 1)
                self.skill.write_text(skill, encoding="utf-8")
                with self.assertRaisesRegex(ValueError, "inline"):
                    export_plugin(self.source, destination)
                self.assertFalse(destination.exists())
                self.assertEqual(self.skill.read_text(), skill)

    def test_every_explicit_only_skill_is_converted(self):
        later = self.source / "skills/later"
        (later / "agents").mkdir(parents=True)
        (later / "SKILL.md").write_text(SKILL.replace("name: example", "name: later"), encoding="utf-8")
        (later / "agents/openai.yaml").write_text(SIDECAR, encoding="utf-8")
        (later / "reference.txt").write_text("Keep this resource.\n", encoding="utf-8")
        before = self.snapshot(self.source)
        export_plugin(self.source, self.destination)
        for name in ("example", "later"):
            with self.subTest(skill=name):
                exported = self.destination / "skills" / name
                expected = f"---\nname: {name}\ndescription: Use when asked.\n---\n" + BODY
                self.assertEqual((exported / "SKILL.md").read_text(), expected)
                self.assertEqual((exported / "agents/openai.yaml").read_text(), SIDECAR)
        self.assertEqual((self.destination / "skills/later/reference.txt").read_text(), "Keep this resource.\n")
        self.assertEqual(self.snapshot(self.source), before)

    def test_existing_output_is_preserved(self):
        self.destination.mkdir(parents=True)
        marker = self.destination / "keep.txt"
        marker.write_text("keep", encoding="utf-8")
        with self.assertRaisesRegex(ValueError, "already exists"):
            export_plugin(self.source, self.destination)
        self.assertEqual(marker.read_text(), "keep")
        self.assertEqual(list(self.destination.iterdir()), [marker])

    def test_dangling_destination_symlink_is_preserved_without_creating_target(self):
        target = self.base / "external/acme"
        self.destination.parent.mkdir(parents=True)
        self.destination.symlink_to(target, target_is_directory=True)
        before = self.snapshot(self.source)
        with self.assertRaisesRegex(ValueError, "already exists"):
            export_plugin(self.source, self.destination)
        self.assertFalse(target.exists())
        self.assertTrue(self.destination.is_symlink())
        self.assertEqual(self.destination.readlink(), target)
        self.assertEqual(self.snapshot(self.source), before)

    def test_output_cannot_be_inside_source(self):
        destination = self.source / "nested/acme"
        before = self.snapshot(self.source)
        with self.assertRaisesRegex(ValueError, "outside"):
            export_plugin(self.source, destination)
        self.assertEqual(self.snapshot(self.source), before)
        self.assertFalse(destination.exists())

    def test_crlf_frontmatter_and_body_are_preserved(self):
        self.skill.write_bytes(SKILL.replace("\n", "\r\n").encode())
        export_plugin(self.source, self.destination)
        expected = ("---\nname: example\ndescription: Use when asked.\n---\n" + BODY).replace("\n", "\r\n")
        self.assertEqual((self.destination / "skills/example/SKILL.md").read_bytes(), expected.encode())

    def test_rejects_source_symlinks_without_copying_external_files(self):
        external = self.base / "external.txt"
        external.write_text("outside", encoding="utf-8")
        (self.source / "linked.txt").symlink_to(external)
        with self.assertRaisesRegex(ValueError, "symlinks"):
            export_plugin(self.source, self.destination)
        self.assertFalse(self.destination.exists())


if __name__ == "__main__":
    unittest.main()
