# Changelog

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
