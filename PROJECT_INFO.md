# 📦 Registry Dump Helper - GitHub Release Package

Complete package ready for GitHub upload.

## 📁 Project Structure

```
registrydumphelper/
│
├── 📄 README.md                          # Complete documentation
├── 📄 INSTALLATION.md                    # Installation guide
├── 📄 CHANGELOG.md                       # Version history
├── 📄 LICENSE                            # GNU GPL v3 License
├── 📄 .gitignore                         # Git ignore rules
│
├── 🎮 registrydumphelper-1.20.1-forge-1.0.3.jar  # ✅ Compiled mod v1.0.3
├── 📜 registryDump.js                    # ✅ KubeJS script (→ kubejs/server_scripts/)
│
├── 🔨 build.gradle                       # Gradle build configuration
├── 🔨 settings.gradle                    # Gradle settings
├── 🔨 gradlew.bat                        # Gradle wrapper (Windows)
│
├── 📂 gradle/                            # Gradle wrapper files
│   └── wrapper/
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
│
├── 📂 src/                               # Source code for helper mod
│   └── main/
│       ├── java/
│       │   └── registrydumphelper/
│       │       ├── RegistryDumpHelperMod.java      # Main mod class (deprecated)
│       │       ├── RegistryDumpPlugin.java         # KubeJS plugin + auto-split
│       │       └── RegistryUtilBinding.java        # JSON splitting + file I/O
│       └── resources/
│           ├── kubejs.plugins.txt                   # Plugin registration
│           ├── pack.mcmeta                          # Resource pack metadata
│           └── META-INF/
│               └── mods.toml                        # Forge mod configuration
│
├── 📂 examples/                          # Sample outputs
    ├── biomes-sample.json
    ├── entities-sample.json
    └── structures-sample.json

└── 📂 build/                             # Build output (generated)
    └── libs/
        └── registrydumphelper-1.20.1-forge-1.0.3.jar
```

## 🚀 Quick Start

### For Regular Users:

1. Download `registrydumphelper-1.20.1-forge-1.0.3.jar` and `registryDump.js`
2. Copy JAR to `mods/`
3. Copy `registryDump.js` to `kubejs/server_scripts/`
4. Start Minecraft and load a world
5. Wait 2-3 seconds
6. Find files in `exports/` (in instance root, NOT in kubejs/)

### For Developers:

```bash
# Windows
gradlew.bat jar

# Linux/Mac
./gradlew jar

# Output: build/libs/registrydumphelper-1.20.1-forge-1.0.3.jar
```

## 📊 File Sizes

- **registrydumphelper-1.20.1-forge-1.0.3.jar**: ~8.4 KB
- **registryDump.js**: ~52 KB
- **Source code total**: ~18 KB

## 🎯 Package Contents

### ✅ Ready to Use:

- Compiled JAR mod (v1.0.3)
- Functional KubeJS script
- Automatic JSON file splitting
- Complete documentation
- Sample outputs

### ✅ For Developers:

- Full source code
- Gradle build system
- Commented code with auto-split logic
- Build instructions

### ✅ For GitHub:

- README.md (updated for v1.0.3)
- LICENSE (GNU GPL v3)
- .gitignore
- CHANGELOG.md (v1.0.1, v1.0.2, v1.0.3)
- Sample files

## 📋 Requirements

- **Minecraft:** 1.20.1
- **Forge:** 47.4.0+
- **KubeJS:** 2001.6.5-build.16+ (KubeJS 6+)
- **Java:** 17+

## 🆕 What's New in v1.0.3

### Major Changes:

1. **Automatic Splitting**: Background thread automatically splits `registry-data-all.json` into individual files
2. **New Location**: Files saved to `exports/` in instance root instead of `kubejs/exports/`
3. **KubeJS 6+ Support**: Full support for KubeJS 6+ with workarounds for `java()` limitations
4. **No Restart**: Works immediately without server restart

### Technical Details:

- Auto-split thread monitors for `registry-data-all.json` creation
- Simple JSON parser with bracket matching
- Creates 3 individual files automatically within 2 seconds
- Bypasses KubeJS 6+ binding access restrictions

## 🔧 Build from Source

```bash
# Windows
gradlew.bat clean jar

# Linux/Mac
./gradlew clean jar

# Output: build/libs/registrydumphelper-1.20.1-forge-1.0.3.jar
```

## 📝 GitHub Repository Notes

### Suggested Repository Names:

- `minecraft-registry-dump-helper`
- `kubejs-registry-exporter`
- `mc-registry-to-json`

### Suggested Tags:

- minecraft
- kubejs
- forge
- registry-dump
- json-export
- minecraft-mod
- data-extraction
- 1.20.1

### Suggested Description:

"KubeJS helper mod for exporting Minecraft registries (biomes, entities, structures) to JSON. Compatible with Minecraft 1.20.1 Forge and KubeJS 6+."

## 📦 Pre-Upload Checklist

Before uploading to GitHub:

- [x] Compiled JAR in root folder
- [x] Complete README.md
- [x] LICENSE file
- [x] .gitignore
- [x] CHANGELOG.md
- [x] INSTALLATION.md
- [x] Source code in src/
- [x] Gradle build files
- [x] Sample outputs in examples/
- [x] Everything tested and working

## 🎉 Ready for Upload!

This folder is ready for:

1. Git repository initialization (`git init`)
2. Upload to GitHub
3. Release version creation (v1.0.3)
4. CurseForge publication

---

**Version:** 1.0.3  
**Created:** November 9, 2025  
**Minecraft:** 1.20.1  
**Forge:** 47.4.0  
**KubeJS:** 2001.6.5-build.16 (KubeJS 6+)
