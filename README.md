# Registry Dump Helper - Complete Guide

**A KubeJS mod for exporting Minecraft registry data (Biomes, Entities, Structures) to JSON**

---

## � Overview

Registry Dump Helper is a lightweight helper mod + KubeJS script that automatically exports Minecraft registry data to JSON files. Perfect for modpack creators, content developers, or anyone needing structured registry information.

### Key Features

✅ **Automatic Export** - Runs automatically on server startup  
✅ **Multiple Formats** - Separate JSON files for biomes, entities, and structures  
✅ **KubeJS 6+ Compatible** - Works around KubeJS security restrictions  
✅ **Zero Configuration** - Drop and forget  
✅ **Easy Access** - Chat commands or manual reload  
✅ **Detailed Data** - Full registry information with properties  

---

## 🚀 Quick Start

### Installation

1. Download both files from releases:
   - `registrydumphelper-1.20.1-forge-1.0.3.jar`
   - `registryDump.js`

2. Install in your instance:
   ```
   minecraft/
   ├── mods/
   │   └── registrydumphelper-1.20.1-forge-1.0.3.jar
   └── kubejs/
       └── server_scripts/
           └── registryDump.js
   ```

3. Start Minecraft and load a world

4. **Wait 2-3 seconds** - files generate automatically!

5. Find your files in the instance root (`exports/` folder)

### Using the Export

Three ways to trigger the export:

#### Method 1: Automatic (Recommended)
- Runs automatically on server load
- No action needed!

#### Method 2: Chat Command
```
!dumpregs
```
Type in chat, wait 1-2 seconds for files to appear.

#### Method 3: Manual Reload
```
/reload
```
After reload completes (~2 seconds), export runs automatically.

---

## 📂 Output Files

All files are saved to the **instance root** in the `exports/` folder:

```
exports/
├── biomes.json                    (81 biomes, auto-generated)
├── entities.json                  (143 entity types, auto-generated)
├── structures.json                (38 structures, auto-generated)
├── registry-data-all.json         (combined data, processed)
├── registry-dump.summary.json     (timing statistics)
└── _probe.json                    (status check)
```

**Full path example:**
```
C:\Users\<username>\curseforge\minecraft\Instances\<YourInstance>\exports\
```

---

## ⚙️ How It Works

### Technical Architecture

Due to KubeJS 6+ security restrictions (removed `java()` global access), Registry Dump Helper uses a **two-stage process**:

#### Stage 1: JavaScript Collection (registryDump.js)
- Collects data from Minecraft registries (BIOME, ENTITY_TYPE, STRUCTURE)
- Writes combined JSON via `JsonIO` → `registry-data-all.json`
- Runs on server load, chat command, or manual reload

#### Stage 2: Automatic Java Processing (RegistryDumpPlugin)
- Background thread `RegistryDump-AutoSplit` monitors for file creation
- Waits up to 30 seconds for `registry-data-all.json`
- Automatically splits it into individual files:
  - `biomes.json`
  - `entities.json`
  - `structures.json`
- Creates summary and probe files

### Server Log Output

```
[INFO]: ✓ Exports directory created: C:\...\Instances\YourInstance\exports
[INFO]: KubeJS RegistryUtil binding registered v1.0.3
[INFO]: [registryDump] Starting dump...
[INFO]: [registryDump] ✓ Written registry-data-all.json
[INFO]: ✓ Detected registry-data-all.json, auto-splitting...
[INFO]: [RegistryUtil] Reading registry-data-all.json...
[INFO]: [RegistryUtil] ✓ Created biomes.json (81 entries)
[INFO]: [RegistryUtil] ✓ Created entities.json (143 entries)
[INFO]: [RegistryUtil] ✓ Created structures.json
[INFO]: [RegistryUtil] ✓✓✓ Split completed successfully!
```

---

## 📁 Output Files & Formats

### `biomes.json` - All Minecraft Biomes (81 entries)

```json
[
  {
    "id": "minecraft:plains",
    "name": "Plains",
    "category": "plains",
    "temperature": 0.8,
    "downfall": 0.4,
    "precipitation": "rain"
  },
  ...
]
```

### `entities.json` - All Entity Types (143 entries)

```json
[
  {
    "id": "minecraft:zombie",
    "category": "monster",
    "fireImmune": false,
    "canSpawnFarFromPlayer": true,
    "clientTrackingRange": 8,
    "updateInterval": 3
  },
  ...
]
```

### `structures.json` - All Structures (38 entries)

```json
[
  {
    "id": "minecraft:village",
    "biomes": ["minecraft:plains", "minecraft:desert", "minecraft:savanna"],
    "terrainAdaptation": "beard_thin"
  },
  ...
]
```

### `registry-data-all.json` - Combined Data

Complete registry data in one file with metadata:

```json
{
  "biomes": [...],
  "entities": [...],
  "structures": [...],
  "_metadata": {
    "timestamp": "2025-11-09T10:30:45.123Z",
    "counts": {"biomes": 81, "entities": 143, "structures": 38},
    "version": "1.0.3"
  }
}
```

---

## 🐛 Troubleshooting

### Problem: Files not generating

**Solution:**
1. Check server logs for "auto-splitting" message
2. Verify `registrydumphelper-1.20.1-forge-1.0.3.jar` exists in `mods/`
3. Verify `exports/registry-data-all.json` was created
4. **Wait 5+ seconds** - auto-split runs in background
5. Check `exports/` is in instance root, NOT in `kubejs/exports/`

### Problem: Only `registry-data-all.json` exists

Auto-split hasn't completed yet:
- Wait another 5 seconds
- Check logs for: `✓ Detected registry-data-all.json, auto-splitting...`
- If not in logs, restart Minecraft

### Problem: "global.RegistryUtil exists: false"

✅ **Normal** - KubeJS 6+ limitation. Export still works correctly using background thread.

### Problem: Chat command `!dumpregs` doesn't work

- Make sure you type: `!dumpregs` (no `/`)
- Wait 1-2 seconds
- Check logs for export messages

---

## ✅ Verification Checklist

- [ ] `registrydumphelper-1.20.1-forge-1.0.3.jar` in `mods/` folder
- [ ] `registryDump.js` in `kubejs/server_scripts/`
- [ ] Minecraft started and world loaded
- [ ] Waited 2-3 seconds after loading
- [ ] Server logs show: "KubeJS RegistryUtil binding registered v1.0.3"
- [ ] Server logs show: "✓ Detected registry-data-all.json, auto-splitting..."
- [ ] Server logs show: "✓✓✓ Split completed successfully!"
- [ ] Found `exports/` folder in instance root
- [ ] Contains: `biomes.json`, `entities.json`, `structures.json`, `registry-data-all.json`

---

## 📊 Statistics (v1.0.3)

| Category | Count | Time |
|----------|-------|------|
| Biomes   | 81    | ~46ms |
| Entities | 143   | ~13ms |
| Structures | 38  | ~5ms  |
| **Total** | **262** | **~77ms** |

---

## 📋 Requirements

- **Minecraft Version:** 1.20.1
- **Forge Version:** 47.x or later
- **KubeJS Version:** 2001.6.x (KubeJS 6+)
- **Java:** Java 17 or later

---

## 🔧 For Developers

### Building from Source

```bash
# Windows
gradlew.bat jar

# Linux/Mac
./gradlew jar
```

**Output:** `build/libs/registrydumphelper-1.20.1-forge-1.0.3.jar`

### Project Structure

```
src/main/java/registrydumphelper/
├── RegistryDumpPlugin.java       # KubeJS plugin + auto-split thread
├── RegistryUtilBinding.java      # JSON splitting & file I/O
└── RegistryDumpHelperMod.java    # (deprecated)

src/main/resources/
├── kubejs.plugins.txt
├── pack.mcmeta
└── META-INF/mods.toml
```

### Key Classes

| Class | Purpose |
|-------|---------|
| `RegistryDumpPlugin` | KubeJS plugin entry, spawns auto-split thread |
| `RegistryUtilBinding` | JSON parsing, file writing, directory detection |
| `RegistryDump-AutoSplit` | Background thread monitoring file creation |

---

## 📝 Version History

### v1.0.3 (Latest - 2025-11-09)

✅ Automatic JSON splitting  
✅ KubeJS 6+ compatibility  
✅ Background thread processing  
✅ Instance-level exports folder  

### v1.0.2 (2025-11-09 - Internal)

- Testing binding registration methods
- (Experimental)

### v1.0.1 (2025-11-09 - Initial)

- Basic registry dump functionality
- Manual file splitting
- Required full server restart

---

## 📂 Installation Paths

### Correct Setup

```
<Instance Root>/
├── mods/
│   └── registrydumphelper-1.20.1-forge-1.0.3.jar
├── kubejs/
│   └── server_scripts/
│       └── registryDump.js
└── exports/                      ← Output files
    ├── biomes.json
    ├── entities.json
    ├── structures.json
    └── registry-data-all.json
```

### Example Path

```
C:\Users\Username\curseforge\minecraft\Instances\MyInstance\exports\
```

---

## ❓ FAQ

**Q: Do I need to restart the server?**  
A: No! Just wait 2-3 seconds after loading.

**Q: Can I use multiple instances?**  
A: Yes! Each instance has its own `exports/` folder.

**Q: What if I update my mods?**  
A: Run `!dumpregs` or `/reload` to re-dump the data.

**Q: Is this safe?**  
A: Yes! It only reads registries and writes to a local folder.

---

## 📜 License

**GNU General Public License v3** - Free software for everyone!

---

## 🤝 Contributing

Found a bug? Have suggestions?  
Visit: [GitHub Repository](https://github.com/Purple-unic-corn/registrydumphelper-kubejs-forge-1.20.1)

---

**Last Updated:** November 11, 2025  
**Version:** 1.0.3  
**Status:** Active Development
