# 📦 Registry Dump Helper - GitHub Release Package

Kompletní balíček připravený pro nahrání na GitHub.

## 📁 Struktura projektu

```
registrydumphelper-release/
│
├── 📄 README.md                          # Kompletní dokumentace
├── 📄 INSTALLATION.md                    # Instalační průvodce
├── 📄 CHANGELOG.md                       # Historie změn
├── 📄 LICENSE                            # MIT License
├── 📄 .gitignore                         # Git ignore pravidla
│
├── 🎮 registrydumphelper-1.0.1.jar      # ✅ Zkompilovaný mod (připravený k použití)
├── 📜 registryDump.js                    # ✅ KubeJS script (do kubejs/server_scripts/)
│
├── 🔨 build.gradle                       # Gradle build konfigurace
├── 🔨 settings.gradle                    # Gradle nastavení
├── 🔨 gradlew.bat                        # Gradle wrapper (Windows)
│
├── 📂 gradle/                            # Gradle wrapper soubory
│   └── wrapper/
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
│
├── 📂 src/                               # Zdrojový kód helper modu
│   └── main/
│       ├── java/
│       │   └── registrydumphelper/
│       │       ├── RegistryDumpHelperMod.java      # Hlavní třída modu
│       │       ├── RegistryDumpPlugin.java         # KubeJS plugin
│       │       └── RegistryUtilBinding.java        # Registry access + file I/O
│       └── resources/
│           ├── kubejs.plugins.txt                   # Plugin registrace
│           ├── pack.mcmeta                          # Resource pack metadata
│           └── META-INF/
│               └── mods.toml                        # Forge mod konfigurace
│
└── 📂 examples/                          # Ukázkové výstupy
    ├── biomes-sample.json
    ├── entities-sample.json
    └── structures-sample.json
```

## 🚀 Quick Start

### Pro běžné uživatele:

1. Stáhni `registrydumphelper-1.0.1.jar` a `registryDump.js`
2. Zkopíruj `registrydumphelper-1.0.1.jar` do `mods/`
3. Zkopíruj `registryDump.js` do `kubejs/server_scripts/`
4. Restartuj server
5. Soubory se vytvoří v `kubejs/exports/`

### Pro vývojáře:

```bash
gradlew.bat build
```

## 📊 Velikosti souborů

- **registrydumphelper-1.0.1.jar**: ~5.7 KB
- **registryDump.js**: ~50 KB
- **Celkem zdrojový kód**: ~15 KB

## 🎯 Co tento balíček obsahuje

### ✅ Připravené k použití:

- Zkompilovaný JAR mod
- Funkční KubeJS script
- Kompletní dokumentace
- Ukázky výstupů

### ✅ Pro vývojáře:

- Plný zdrojový kód
- Gradle build systém
- Komentovaný kód
- Build instrukce

### ✅ Pro GitHub:

- README.md
- LICENSE (MIT)
- .gitignore
- CHANGELOG.md
- Příklady

## 📋 Požadavky

- Minecraft: 1.20.1
- Forge: 47.4.0+
- KubeJS: 2001.6.5-build.16+
- Java: 17+

## 🔧 Build ze zdrojů

```bash
# Windows
gradlew.bat clean build

# Výstup:
# build/libs/registrydumphelper-1.0.1.jar
```

## 📝 Poznámky pro GitHub

### Suggested repository name:

- `minecraft-registry-dump-helper`
- `kubejs-registry-exporter`
- `mc-registry-to-json`

### Suggested tags:

- minecraft
- kubejs
- forge
- registry-dump
- json-export
- minecraft-mod
- data-extraction

### Suggested description:

"KubeJS helper mod for exporting Minecraft registries (biomes, entities, structures) to JSON files. For Minecraft 1.20.1 Forge."

## 📦 Release Checklist

Před nahráním na GitHub:

- [x] Zkompilovaný JAR v kořenové složce
- [x] Kompletní README.md
- [x] LICENSE soubor
- [x] .gitignore
- [x] CHANGELOG.md
- [x] INSTALLATION.md
- [x] Zdrojový kód v src/
- [x] Gradle build soubory
- [x] Ukázkové výstupy v examples/
- [x] Vše otestováno a funkční

## 🎉 Ready to upload!

Tato složka je připravená k:

1. Inicializaci Git repository (`git init`)
2. Nahrání na GitHub
3. Vytvoření první release verze (v1.0.1)

---

**Version:** 1.0.1  
**Created:** November 9, 2025  
**Minecraft:** 1.20.1  
**Forge:** 47.4.0
