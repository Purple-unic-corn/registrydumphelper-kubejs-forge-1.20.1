# Changelog

## [1.0.3] - 2025-11-09

### 🎉 Major Changes

- **Automatic JSON splitting**: Implemented background thread that automatically splits `registry-data-all.json` into individual files
- **KubeJS 6+ compatibility**: Full support for KubeJS 6+ with its security restrictions
- **Instance-level exports**: Files now save to instance root `exports/` folder instead of `kubejs/exports/`

### Added

- Auto-split thread `RegistryDump-AutoSplit` in `RegistryDumpPlugin`
- `splitRegistryDataAll()` method for parsing and splitting combined JSON
- `findMatchingBracket()` helper method for JSON bracket matching
- `getGameDirectory()` method to detect Minecraft instance path
- Automatic `exports/` folder creation at mod startup
- Instance method `splitRegistryData()` for potential JavaScript calls

### Changed

- **Export location**: Changed from `kubejs/exports/` to `exports/` (instance root)
- **File generation**: Now uses two-stage process:
  1. JavaScript writes `registry-data-all.json` via JsonIO
  2. Java automatically splits it into individual files
- Version bumped to v1.0.3 in logs
- Updated all documentation to reflect new behavior

### Fixed

- ✅ Individual files (`biomes.json`, `entities.json`, `structures.json`) now generate automatically
- ✅ No longer requires restart after installation
- ✅ Works around KubeJS 6+ binding access restrictions
- ✅ Handles "java() is no longer supported" limitation

### Technical Details

- **Why the change?**: KubeJS 6+ removed `java()` global access, preventing JavaScript from calling Java bindings
- **Solution**: Java background thread monitors for file creation and automatically processes it
- **Thread behavior**: Waits up to 30 seconds, checks every 500ms for `registry-data-all.json`
- **Processing**: Uses simple bracket matching to extract JSON arrays without full parser

### Known Limitations

- `global.RegistryUtil exists: false` is expected (KubeJS 6+ limitation)
- JavaScript bindings register but aren't accessible (kept for backward compatibility)
- Requires 1-2 seconds delay for auto-split to complete after data collection

---

## [1.0.2] - 2025-11-09 (Internal)

### Changed

- Experimented with different binding registration methods
- Attempted static method registration as Runnable
- Added instance method wrapper for splitRegistryData

### Issues

- Bindings still not accessible from JavaScript in KubeJS 6+
- Led to v1.0.3 solution with background thread

---

## [1.0.1] - 2025-11-09

### Added

- Initial release
- Registry dump functionality for Minecraft 1.20.1
- Export biomes, entities, and structures to JSON files
- Helper mod for ClassFilter bypass (Java NIO access)
- KubeJS script with multiple trigger methods
- Emergency fallback when helper mod not available
- Re-entrant guard to prevent parallel execution
- Chat command support: `!dumpregs`
- Automatic dump on server load
- Support for manual trigger via `/reload`

### Features

- **Biomes export**: 81+ biomes with full properties
- **Entities export**: 143+ entity types with metadata
- **Structures export**: 38+ structures with biome lists
- **Summary file**: Timing statistics and counts
- **Probe file**: Quick status check

### Technical

- Java NIO file writing (bypasses KubeJS ClassFilter limitations)
- RegistryUtilBinding for direct registry access
- Reflection-based registry iteration
- JSON.stringify for clean formatting
- Automatic directory creation

### Known Issues

- Requires full server restart after mod installation (not just /reload)
- JsonIO fallback creates single combined file instead of three separate files
- Individual files don't generate (fixed in v1.0.3)

### Compatibility

- Minecraft: 1.20.1
- Forge: 47.4.0
- KubeJS: 2001.6.5-build.16
- Java: 17+

---

## Future Plans

- Support for more registry types (items, blocks, dimensions)
- Configuration file for customization
- Filtering options (mod-specific exports)
- Performance optimizations for large mod packs
