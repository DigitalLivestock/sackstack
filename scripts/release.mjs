#!/usr/bin/env node
/**
 * Automated release script for Sack Stack.
 *
 * Usage:
 *   node scripts/release.mjs <patch|minor|major|x.y.z> [--dry-run] [--no-git]
 *
 * What it does:
 *   1. Bumps the version in package.json.
 *   2. Syncs APP_VERSION constants in src/routes/__root.tsx and src/routes/about.tsx.
 *   3. Rewrites CHANGELOG.md: promotes [Unreleased] to a dated release section,
 *      creates a fresh empty [Unreleased] block, and updates the compare/tag links.
 *   4. Creates a git commit and an annotated tag `vX.Y.Z` (unless --no-git).
 *
 * After running, push with:  git push && git push --tags
 * A GitHub Actions workflow (.github/workflows/release.yml) then publishes the release.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const noGit = args.includes("--no-git");
const bumpArg = args.find((a) => !a.startsWith("--"));

if (!bumpArg) {
  console.error("Usage: node scripts/release.mjs <patch|minor|major|x.y.z> [--dry-run] [--no-git]");
  process.exit(1);
}

const REPO = "DigitalLivestock/sackstack";

function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}
function write(rel, content) {
  if (dryRun) {
    console.log(`[dry-run] would write ${rel}`);
    return;
  }
  writeFileSync(resolve(root, rel), content);
}

function bumpVersion(current, kind) {
  if (/^\d+\.\d+\.\d+$/.test(kind)) return kind;
  const [maj, min, pat] = current.split(".").map(Number);
  if (kind === "major") return `${maj + 1}.0.0`;
  if (kind === "minor") return `${maj}.${min + 1}.0`;
  if (kind === "patch") return `${maj}.${min}.${pat + 1}`;
  throw new Error(`Unknown bump: ${kind}`);
}

// 1. package.json
const pkg = JSON.parse(read("package.json"));
const currentVersion = pkg.version;
const nextVersion = bumpVersion(currentVersion, bumpArg);
console.log(`Bumping ${currentVersion} → ${nextVersion}`);

pkg.version = nextVersion;
write("package.json", JSON.stringify(pkg, null, 2) + "\n");

// 2. APP_VERSION constants
for (const file of ["src/routes/__root.tsx", "src/routes/about.tsx"]) {
  const src = read(file);
  const next = src.replace(
    /const APP_VERSION = "[^"]+";/,
    `const APP_VERSION = "${nextVersion}";`,
  );
  if (src === next) {
    console.warn(`Warning: no APP_VERSION found in ${file}`);
  }
  write(file, next);
}

// 3. CHANGELOG.md
const today = new Date().toISOString().slice(0, 10);
const changelog = read("CHANGELOG.md");

const unreleasedRe = /## \[Unreleased\]\n([\s\S]*?)(?=\n## \[|\n---\n\n## \[)/;
const match = changelog.match(unreleasedRe);
if (!match) {
  console.error("Could not find [Unreleased] section in CHANGELOG.md");
  process.exit(1);
}
const unreleasedBody = match[1].trim();
if (!unreleasedBody || /^(### \w+\n- N\/A\s*)+$/.test(unreleasedBody)) {
  console.warn("Warning: [Unreleased] appears empty. Continuing anyway.");
}

const emptyUnreleased =
  "## [Unreleased]\n\n" +
  "### Added\n- N/A\n\n" +
  "### Changed\n- N/A\n\n" +
  "### Fixed\n- N/A\n\n" +
  "### Removed\n- N/A\n\n---\n\n";

const newRelease = `## [${nextVersion}] — ${today}\n\n${unreleasedBody}\n\n---\n\n`;

let updated = changelog.replace(
  /## \[Unreleased\]\n[\s\S]*?\n---\n\n/,
  emptyUnreleased + newRelease,
);

// Update reference links at the bottom.
const unreleasedLinkRe = /^\[Unreleased\]: .*$/m;
updated = updated.replace(
  unreleasedLinkRe,
  `[Unreleased]: https://github.com/${REPO}/compare/v${nextVersion}...HEAD`,
);
// Insert the new version link right after the [Unreleased] link line.
updated = updated.replace(
  /^(\[Unreleased\]: .*\n)/m,
  `$1[${nextVersion}]: https://github.com/${REPO}/releases/tag/v${nextVersion}\n`,
);

write("CHANGELOG.md", updated);

// 4. Git commit + tag
if (!noGit && !dryRun) {
  try {
    execSync(
      `git add package.json CHANGELOG.md src/routes/__root.tsx src/routes/about.tsx`,
      { stdio: "inherit", cwd: root },
    );
    execSync(`git commit -m "chore(release): v${nextVersion}"`, {
      stdio: "inherit",
      cwd: root,
    });
    execSync(`git tag -a v${nextVersion} -m "Release v${nextVersion}"`, {
      stdio: "inherit",
      cwd: root,
    });
    console.log(`\n✔ Tagged v${nextVersion}. Push with:  git push && git push --tags`);
  } catch (err) {
    console.error("Git step failed:", err.message);
    console.error("Files are updated. Commit and tag manually if needed.");
    process.exit(1);
  }
} else {
  console.log(`\n✔ Files updated for v${nextVersion} (git step skipped).`);
}
