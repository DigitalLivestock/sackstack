# Changelog

All notable changes to Sack Stack are documented in this file.

This project follows [Semantic Versioning](https://semver.org/) and uses the **MAJOR.MINOR.PATCH** format:

- **MAJOR** — incompatible changes that break existing trip data, exports, share links, or public APIs.
- **MINOR** — new features, improvements, or additions that are backwards compatible.
- **PATCH** — backwards-compatible bug fixes, performance improvements, and minor UI/UX polish.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Added
- Public README with project overview, shields/badges, and getting-started instructions.
- MIT LICENSE file.
- GitHub link in the site footer.
- Open-source and transparency sections on the About and Privacy pages.

### Changed
- N/A

### Fixed
- N/A

### Removed
- N/A

---

## [1.0.0] — 2026-07-13

### Added
- Initial public release of Sack Stack.
- Create and manage multiple trips with custom travel types.
- Add multiple bags per trip and assign them to carriers (people, pets, vehicles, etc.).
- Add items to bags or to an unpacked tray with weight tracking.
- Display and switch between metric and imperial weight units.
- Drag-and-drop item sorting between bags and the unpacked tray.
- Packing checklist view with per-item packed state.
- Printable packing list view.
- JSON import/export for backups and trip portability.
- Share trips via URL fragment encoding (no server involved).
- Custom travel type editor and presets for hiking, normal travel, and car camping.
- Item tags and filtering for faster organization.
- Dark/light theme toggle.
- PWA support with offline-friendly assets and a web manifest.
- Privacy-first architecture: no accounts, no tracking, all data stored in browser `localStorage`.

### Changed
- N/A

### Fixed
- N/A

### Removed
- N/A

---

## How to update this changelog

When you make a change, add an entry under the `[Unreleased]` section in the correct category. Do not edit released sections unless correcting a factual error.

Use the following categories:

| Category | Use when... |
| --- | --- |
| `Added` | You introduce a new feature, page, component, or capability. |
| `Changed` | You update existing behavior, UI, dependencies, or configuration in a non-breaking way. |
| `Fixed` | You fix a bug, typo, or runtime error. |
| `Removed` | You remove a feature, dependency, or file. |
| `Security` | You fix a vulnerability or improve security posture. |
| `Deprecated` | You mark a feature for removal in a future release. |

When releasing a new version, use the automated release script:

```bash
bun run release:patch   # or release:minor / release:major / release 1.2.3
git push && git push --tags
```

The script bumps `package.json`, syncs `APP_VERSION` in `src/routes/__root.tsx` and `src/routes/about.tsx`, rewrites `CHANGELOG.md` (promoting `[Unreleased]` to a dated section and updating link references), then creates a commit and annotated `vX.Y.Z` tag. Pushing the tag triggers `.github/workflows/release.yml`, which publishes a GitHub Release with notes extracted from `CHANGELOG.md`.

Manual fallback if you need to do it by hand:

1. Decide the version bump using Semantic Versioning rules above.
2. Update `version` in `package.json`.
3. Update `APP_VERSION` in `src/routes/__root.tsx` and `src/routes/about.tsx`.
4. Move the `[Unreleased]` entries into a new `[X.Y.Z]` section with today's date.
5. Add a new empty `[Unreleased]` section at the top.
6. Create a Git tag for the release: `git tag vX.Y.Z && git push origin vX.Y.Z`.

---

## Release checklist

Before publishing a new release, verify:

- [ ] `CHANGELOG.md` has been updated with the new version section.
- [ ] `package.json` version matches the new release.
- [ ] `APP_VERSION` constants in `src/routes/__root.tsx` and `src/routes/about.tsx` match the new release.
- [ ] `bun run build` passes with no errors.
- [ ] `bun run lint` passes with no errors.
- [ ] The site has been smoke-tested in the preview environment.
- [ ] A Git tag has been created and pushed for the release.

---

[Unreleased]: https://github.com/DigitalLivestock/sackstack/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/DigitalLivestock/sackstack/releases/tag/v1.0.0
