# Installation Guide - Registry Dump Helper

## 📦 Quick Installation

### For Users (Just want to use it)

1. **Download pre-built JAR:**

   - Download `registrydumphelper-1.0.1.jar` from releases

2. **Install the files:**

   ```
   minecraft/
   ├── mods/
   │   └── registrydumphelper-1.0.1.jar          ← Copy here
   └── kubejs/
       └── server_scripts/
           └── registryDump.js                    ← Copy here
   ```

3. **Restart Minecraft server** (full restart, not /reload)

4. **Trigger the dump:**

   - Wait ~1 second after server loads (automatic)
   - OR type in chat: `!dumpregs`
   - OR use command: `/reload`

5. **Find your files:**
   ```
   kubejs/exports/
   ├── biomes.json
   ├── entities.json
   ├── structures.json
   ├── registry-dump.summary.json
   └── _probe.json
   ```

## 🛠️ For Developers (Build from source)

### Prerequisites

- Java 17 or later
- Gradle (included via wrapper)

### Build the helper mod:

```bash
# Windows
gradlew.bat build

# Linux/Mac
./gradlew build
```

Built JAR will be in: `build/libs/registrydumphelper-1.0.1.jar`

### Project Structure

```
registrydumphelper-release/
├── registrydumphelper-1.0.1.jar    # Pre-built mod
├── registryDump.js                  # KubeJS script
├── README.md                        # Full documentation
├── INSTALLATION.md                  # This file
├── build.gradle                     # Gradle build config
├── settings.gradle                  # Gradle settings
├── gradlew.bat                      # Windows Gradle wrapper
├── gradle/                          # Gradle wrapper files
│   └── wrapper/
└── src/                             # Source code
    └── main/
        ├── java/
        │   └── registrydumphelper/
        │       ├── RegistryDumpPlugin.java        # KubeJS plugin
        │       └── RegistryUtilBinding.java       # Registry access + file writing
        └── resources/
            ├── kubejs.plugins.txt                  # Plugin registration
            ├── pack.mcmeta                         # Resource pack metadata
            └── META-INF/
                └── mods.toml                       # Forge mod metadata
```

## ✅ Requirements

### Minecraft Version

- Minecraft: 1.20.1
- Forge: 47.4.0 (or compatible)
- KubeJS: 2001.6.5-build.16 (or compatible)

### Compatibility

This mod should work with:

- Any Minecraft 1.20.1 Forge installation
- Any version of KubeJS for 1.20.1
- Other mods (no known conflicts)

## 🐛 Troubleshooting

### Files not generating?

1. ✅ Check `kubejs/exports/` folder exists
2. ✅ Verify `mods/registrydumphelper-1.0.1.jar` exists
3. ❗ **RESTART SERVER** (full restart required!)
4. Check logs for: `KubeJS RegistryUtil binding registered v1.0.1`

### Still not working?

Check `logs/latest.log` for errors:

- Should see: `[registryDump] Using RegistryUtil.writeJsonFile (Java NIO)...`
- Should NOT see: `[registryDump] WARNING: RegistryUtil.writeJsonFile not available!`

If you see the WARNING, the helper mod didn't load properly - restart required!

## 📝 License

MIT License - Free to use, modify, and distribute.

## 🤝 Contributing

Feel free to:

- Report issues
- Submit pull requests
- Suggest improvements
- Fork and modify

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Version:** 1.0.1  
**Date:** November 9, 2025  
**Minecraft:** 1.20.1  
**Forge:** 47.4.0
