# Registry Dump Helper

**Export Minecraft registries (Biomes, Entities, Structures) to JSON files automatically**

## Overview

Registry Dump Helper is a lightweight KubeJS helper mod that automatically exports Minecraft registry data to JSON files. Perfect for modpack creators, data analysis, or content development.

### Features

✅ Automatic export on server startup  
✅ Separate JSON files for biomes, entities, and structures  
✅ KubeJS 6+ compatible (includes security workarounds)  
✅ Zero configuration needed  
✅ Chat commands or manual triggers  
✅ Fast processing (~77ms total)  

## Installation

### Quick Start

1. **Download files from GitHub Releases:**
   - `registrydumphelper-1.20.1-forge-1.0.3.jar`
   - `registryDump.js`

2. **Install:**
   - Copy JAR to: `mods/`
   - Copy JS to: `kubejs/server_scripts/`

3. **Load your world** and wait 2-3 seconds

4. **Find files in:** `<instance root>/exports/`

## Usage

### Automatic (Recommended)
- Runs on server startup automatically
- No action needed!

### Chat Command
```
!dumpregs
```

### Manual Reload
```
/reload
```

## Output Files

All files are saved to `exports/` folder in your instance root:

- **biomes.json** - 81 biomes with properties
- **entities.json** - 143 entity types with metadata  
- **structures.json** - 38 structures with biome assignments
- **registry-data-all.json** - Combined data with metadata

### File Structure

```json
{
  "id": "minecraft:plains",
  "name": "Plains",
  "category": "plains",
  "temperature": 0.8,
  ...properties...
}
```

## Requirements

- **Minecraft:** 1.20.1
- **Forge:** 47.x or later
- **KubeJS:** 2001.6.x (KubeJS 6+)
- **Java:** 17+

## How It Works

Due to KubeJS 6+ security restrictions, Registry Dump Helper uses a two-stage process:

1. **JavaScript Stage** - Collects registry data and creates `registry-data-all.json`
2. **Java Stage** - Background thread automatically splits into individual files

Result: Clean, separate JSON files in 2-3 seconds.

## Troubleshooting

### Files not generating?
- Wait 5+ seconds (auto-split runs in background)
- Check server logs for "auto-splitting" message
- Verify `exports/` folder exists in instance root

### Only `registry-data-all.json` exists?
- Auto-split hasn't completed yet
- Wait 5 more seconds
- Check logs for "Split completed"

### Wrong location?
Files should be in instance root `exports/`, NOT `kubejs/exports/`

### "global.RegistryUtil exists: false"?
✅ This is normal - KubeJS 6+ limitation. Export still works correctly.

## Statistics (v1.0.3)

| Category | Count | Time |
|----------|-------|------|
| Biomes | 81 | ~46ms |
| Entities | 143 | ~13ms |
| Structures | 38 | ~5ms |
| **Total** | **262** | **~77ms** |

## Version History

**v1.0.3** (Latest)
- ✅ Automatic JSON splitting with background thread
- ✅ KubeJS 6+ full compatibility
- ✅ Instance-level exports folder
- ✅ No restart required

**v1.0.2** (Internal)
- Testing different binding methods

**v1.0.1** (Initial)
- Basic registry dump functionality

## License

GNU General Public License v3 - Free software licensed under GPL v3

## Support

For bugs, suggestions, or questions, please visit the GitHub repository:
https://github.com/Purple-unic-corn/registrydumphelper-kubejs-forge-1.20.1

---

**Version:** 1.0.3  
**Updated:** November 11, 2025  
**Minecraft:** 1.20.1  
**Forge:** 47.4.0  
**KubeJS:** 2001.6.5+ (KubeJS 6+)
