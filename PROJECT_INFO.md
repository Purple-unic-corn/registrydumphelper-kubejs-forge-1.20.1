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
├── 🎮 registrydumphelper-1.20.1-forge-1.0.2.jar  # ✅ Zkompilovaný mod v1.0.3
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
│       │       ├── RegistryDumpHelperMod.java      # Hlavní třída modu (deprecated)
│       │       ├── RegistryDumpPlugin.java         # KubeJS plugin + auto-split
│       │       └── RegistryUtilBinding.java        # JSON splitting + file I/O
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

1. Stáhni `registrydumphelper-1.20.1-forge-1.0.2.jar` a `registryDump.js`
2. Zkopíruj JAR do `mods/`
3. Zkopíruj `registryDump.js` do `kubejs/server_scripts/`
4. Spusť Minecraft a načti svět
5. Počkaj 2-3 sekundy
6. Soubory najdeš v `exports/` (v kořeni instance, NE v kubejs/)

### Pro vývojáře:

```bash
# Windows
gradlew.bat jar

# Linux/Mac
./gradlew jar
```

## 📊 Velikosti souborů

- **registrydumphelper-1.20.1-forge-1.0.2.jar**: ~8.4 KB (v1.0.3)
- **registryDump.js**: ~52 KB
- **Celkem zdrojový kód**: ~18 KB

## 🎯 Co tento balíček obsahuje

### ✅ Připravené k použití:

- Zkompilovaný JAR mod (v1.0.3)
- Funkční KubeJS script
- Automatické rozdělování JSON souborů
- Kompletní dokumentace
- Ukázky výstupů

### ✅ Pro vývojáře:

- Plný zdrojový kód
- Gradle build systém
- Komentovaný kód včetně auto-split logiky
- Build instrukce

### ✅ Pro GitHub:

- README.md (aktualizovaný pro v1.0.3)
- LICENSE (MIT)
- .gitignore
- CHANGELOG.md (verze 1.0.1, 1.0.2, 1.0.3)
- Příklady

## 📋 Požadavky

- Minecraft: 1.20.1
- Forge: 47.4.0+
- KubeJS: 2001.6.5-build.16+ (KubeJS 6+)
- Java: 17+

## 🆕 Co je nového v v1.0.3

### Hlavní změny:

1. **Automatické rozdělování**: Background thread automaticky rozdělí `registry-data-all.json` na jednotlivé soubory
2. **Nové umístění**: Soubory se ukládají do `exports/` v kořeni instance místo `kubejs/exports/`
3. **KubeJS 6+ kompatibilita**: Plná podpora pro KubeJS 6+ včetně obcházení `java()` omezení
4. **Žádný restart**: Není třeba restartovat server, vše funguje okamžitě

### Technické detaily:

- Auto-split thread čeká na vytvoření `registry-data-all.json`
- Jednoduchý JSON parser s bracket matching
- Vytváří 3 individuální soubory automaticky do 2 sekund
- Obchází KubeJS 6+ binding access omezení

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
