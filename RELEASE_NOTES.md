# Registry Dump Helper v1.0.3 Release

## 🎉 What's New

This release brings **GPL v3 licensing** and **complete English localization** to make the project more accessible to international developers and modpack creators.

### Major Changes

✅ **License Change**: Migrated from MIT to **GNU General Public License v3**  
✅ **Full English Localization**: All documentation and code comments translated to English  
✅ **Build System Improvements**: Fixed Gradle build configuration for universal compatibility  
✅ **CurseForge Ready**: New specialized README for Minecraft modpack platforms  

## 📦 Downloads

- **registrydumphelper-1.20.1-forge-1.0.3.jar** (9.3 KB) - The mod JAR file
- **registryDump.js** - KubeJS script (copy to `kubejs/server_scripts/`)

## 📋 Installation

1. Download both files from this release
2. Place the JAR in your `mods/` folder
3. Place `registryDump.js` in `kubejs/server_scripts/`
4. Start Minecraft and load a world
5. Wait 2-3 seconds - files automatically generate in the `exports/` folder!

## 🚀 Features

- **Automatic Export** - Runs automatically on server startup
- **Zero Configuration** - Drop and forget, no setup needed
- **Multiple Formats** - Separate JSON files for biomes, entities, and structures
- **KubeJS 6+ Compatible** - Works around KubeJS security restrictions
- **Fast Processing** - Exports ~262 registry entries in ~77ms
- **Chat Commands** - Manual trigger via `!dumpregs` command
- **Manual Reload** - Re-export via `/reload` server command

## 📁 Output Files

The mod creates individual JSON files in the `exports/` folder:

- **biomes.json** - 81 Minecraft biomes with properties
- **entities.json** - 143 entity types with metadata
- **structures.json** - 38 structures with biome assignments
- **registry-data-all.json** - Combined data with metadata
- **registry-dump.summary.json** - Processing statistics
- **_probe.json** - Status check file

## 📊 Technical Details

| Component | Details |
|-----------|---------|
| Minecraft | 1.20.1 |
| Forge | 47.4.0+ |
| KubeJS | 2001.6.5-build.16+ (KubeJS 6+) |
| Java | 17+ |
| License | GNU General Public License v3 |

## 🔧 How It Works

Due to KubeJS 6+ security restrictions, Registry Dump Helper uses a **two-stage process**:

1. **JavaScript Stage** - Collects registry data via `registryDump.js`
2. **Java Stage** - Background thread automatically splits combined JSON into individual files

Result: Clean, organized JSON files in your `exports/` folder within 2-3 seconds!

## 🐛 Troubleshooting

### Files not generating?
- **Wait 5+ seconds** (auto-split runs in background)
- Check server logs for `✓ Detected registry-data-all.json, auto-splitting...`
- Verify `exports/` folder exists in **instance root**, NOT in `kubejs/`

### Only `registry-data-all.json` exists?
- Auto-split hasn't completed yet - wait 5 more seconds
- Check logs for `✓✓✓ Split completed successfully!`

### "global.RegistryUtil exists: false"?
✅ This is **normal** - it's a KubeJS 6+ limitation. Export still works correctly!

## 📝 Changes Since v1.0.2

### Code Changes
- Translations: All Czech comments → English in Java files and KubeJS script
- Build System: Replaced hardcoded local paths with Maven repository dependencies
- Compilation: Excluded deprecated `RegistryDumpHelperMod.java` from build

### Documentation Changes
- README.md: Complete rewrite for clarity and CurseForge compatibility
- PROJECT_INFO.md: Full English translation
- INSTALLATION.md: Updated with GPL v3 license reference
- LICENSE: Changed to GNU GPL v3
- New: README-CURSFORGE.md for marketplace platforms

### No Code Logic Changes
⚠️ **Important**: All code functionality remains identical. Only comments were translated and build configuration was updated for better portability.

## 🔗 Links

- **GitHub Repository**: https://github.com/Purple-unic-corn/registrydumphelper-kubejs-forge-1.20.1
- **License**: GNU General Public License v3 (see LICENSE file)
- **KubeJS Documentation**: https://www.kubejs.com
- **Minecraft Forge**: https://files.minecraftforge.net

## 🙏 Credits

- Built for **Minecraft 1.20.1 Forge** with **KubeJS 6+**
- Two-stage registry export system to work around KubeJS security restrictions
- Automatic JSON splitting with background thread processing

---

**Release Date**: November 11, 2025  
**Version**: 1.0.3  
**License**: GNU General Public License v3
