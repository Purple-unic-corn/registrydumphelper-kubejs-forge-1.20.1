# Installation Guide - Registry Dump Helper

## 📦 Quick Installation

### For Users (Just want to use it)

1. **Download pre-built JAR:**

   - Download `registrydumphelper-1.20.1-forge-1.0.3.jar` from releases

2. **Install the files:**

   ```
   minecraft/
   ├── mods/
   │   └── registrydumphelper-1.20.1-forge-1.0.3.jar  ← Copy here
   └── kubejs/
       └── server_scripts/
           └── registryDump.js                         ← Copy here
   ```

3. **Start Minecraft and load a world**

4. **Wait 2-3 seconds** - files generate automatically!

5. **Find your files in the instance root:**
   ```
   exports/                              ← In instance root, NOT in kubejs/
   ├── biomes.json                       ← Auto-generated
   ├── entities.json                     ← Auto-generated
   ├── structures.json                   ← Auto-generated
   ├── registry-data-all.json            ← Combined data (generated first)
   ├── registry-dump.summary.json
   └── _probe.json
   ```

### Full path example:

```
C:\Users\<username>\curseforge\minecraft\Instances\<YourInstance>\exports\
```

## 🛠️ For Developers (Build from source)

### Prerequisites

- Java 17 or later
- Gradle (included via wrapper)

### Build the helper mod:

```bash
# Windows
gradlew.bat jar

# Linux/Mac
./gradlew jar
```

Built JAR will be in: `build/libs/registrydumphelper-1.20.1-forge-1.0.3.jar`

### Project Structure

```
registrydumphelper-release/
├── registrydumphelper-1.20.1-forge-1.0.3.jar  # Pre-built mod (v1.0.3)
├── registryDump.js                             # KubeJS script
├── README.md                                   # Full documentation
├── INSTALLATION.md                             # This file
├── CHANGELOG.md                                # Version history
├── build.gradle                                # Gradle build config
├── settings.gradle                             # Gradle settings
├── gradlew.bat                                 # Windows Gradle wrapper
├── gradle/                                     # Gradle wrapper files
│   └── wrapper/
└── src/                                        # Source code
    └── main/
        ├── java/
        │   └── registrydumphelper/
        │       ├── RegistryDumpPlugin.java        # KubeJS plugin + auto-split
        │       └── RegistryUtilBinding.java       # JSON splitting logic
        └── resources/
            ├── kubejs.plugins.txt                  # Plugin registration
            ├── pack.mcmeta                         # Resource pack metadata
            └── META-INF/
                └── mods.toml                       # Forge mod metadata
```

## ⚙️ How It Works (v1.0.3)

### Automatic Split Process

Due to KubeJS 6+ limitations (removed `java()` global access), the mod uses a two-stage approach:

1. **JavaScript Stage** (registryDump.js):

   - Collects data from Minecraft registries
   - Writes combined file via `JsonIO.write()` → `registry-data-all.json`

2. **Java Stage** (RegistryDumpPlugin):
   - Spawns background thread `RegistryDump-AutoSplit`
   - Waits up to 30 seconds for `registry-data-all.json` to appear
   - Automatically calls `splitRegistryDataAll()` to parse and split the file
   - Creates individual files: `biomes.json`, `entities.json`, `structures.json`

### What you'll see in logs:

```
[INFO]: ✓ Created exports directory at startup
[INFO]: KubeJS RegistryUtil binding registered v1.0.3
[INFO]: [registryDump] BIOMES: 81
[INFO]: [registryDump] ENTITIES: 143
[INFO]: [registryDump] STRUCTURES: 38
[INFO]: ✓ Detected registry-data-all.json, auto-splitting...
[INFO]: [RegistryUtil] ✓ Created biomes.json
[INFO]: [RegistryUtil] ✓ Created entities.json
[INFO]: [RegistryUtil] ✓ Created structures.json
[INFO]: [RegistryUtil] ✓✓✓ Split completed successfully!
```

## ✅ Requirements

### Minecraft Version

- Minecraft: 1.20.1
- Forge: 47.4.0 (or compatible)
- KubeJS: 2001.6.5-build.16 or later (KubeJS 6+)

### Compatibility

This mod should work with:

- Any Minecraft 1.20.1 Forge installation
- KubeJS 6+ (version 2001.6.5-build.16 or later)
- Other mods (no known conflicts)

**Note:** This version is specifically designed for KubeJS 6+ which has different security restrictions than KubeJS 5.

## 🐛 Troubleshooting

### Files not generating?

1. ✅ Check that `exports/` folder exists **in instance root** (not in `kubejs/`)
2. ✅ Verify `mods/registrydumphelper-1.20.1-forge-1.0.3.jar` exists
3. ✅ Check that `registry-data-all.json` exists in `exports/`
4. ⏱️ **Wait 5 seconds** after world loads (auto-split runs in background)
5. 🔍 Check logs for `✓ Detected registry-data-all.json, auto-splitting...`

### Only registry-data-all.json exists?

Auto-split hasn't run yet:

- Wait 5 more seconds
- Check logs for "auto-splitting" message
- If not in logs, restart Minecraft

### Wrong export location?

Files should be in **instance root**, example:

```
✅ C:\Users\...\Instances\Unicorn\exports\biomes.json
❌ C:\Users\...\Instances\Unicorn\kubejs\exports\biomes.json
```

### Old version installed?

If you have `registrydumphelper-1.0.1.jar`:

1. Delete the old JAR from `mods/`
2. Install `registrydumphelper-1.20.1-forge-1.0.3.jar`
3. Restart Minecraft

### Check logs for errors:

Look in `logs/latest.log`:

**Good signs:**

- `KubeJS RegistryUtil binding registered v1.0.3`
- `✓ Detected registry-data-all.json, auto-splitting...`
- `✓✓✓ Split completed successfully!`

**Expected messages (not errors):**

- `global.RegistryUtil exists: false` ← Normal, KubeJS 6+ limitation
- `Using emergency text-based fallback` ← Correct behavior
- `WARNING: splitRegistryData not available` ← JavaScript limitation, Java handles it

## 📝 License

GNU General Public License v3 - Free software licensed under GPL v3.

## 🤝 Contributing

Feel free to:

- Report issues
- Submit pull requests
- Suggest improvements
- Fork and modify

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Version:** 1.0.3  
**Date:** November 9, 2025  
**Minecraft:** 1.20.1  
**Forge:** 47.4.0  
**KubeJS:** 2001.6.5-build.16 (KubeJS 6+)
