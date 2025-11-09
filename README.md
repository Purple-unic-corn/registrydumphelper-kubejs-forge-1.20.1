# Registry Dump - Návod k použití

## 📋 Přehled

Script pro export registrů z Minecraftu (biomy, entity, struktury) do JSON souborů.

## 🔧 Co je potřeba

### 1. Helper Mod (registrydumphelper-1.0.1.jar)

- **Umístění:** `mods/registrydumphelper-1.0.1.jar`
- **Účel:** Poskytuje přístup k Java NIO API pro zápis souborů (KubeJS má ClassFilter omezení)
- **Zkompilovaný:** ✅ Ano (15:09:43)
- **Zkopírovaný do mods:** ✅ Ano

### 2. KubeJS Script (registryDump.js)

- **Umístění:** `kubejs/server_scripts/registryDump.js`
- **Funkce:**
  - Sbírá data z Minecraft registrů (BIOME, ENTITY_TYPE, STRUCTURE)
  - Exportuje je do JSON formátu
  - Podporuje více metod spuštění

### 3. Export složka

- **Umístění:** `kubejs/exports/`
- **Vytvořena:** ✅ Ano
- **Vygenerované soubory:**
  - `biomes.json` (81 biomů)
  - `entities.json` (143 entit)
  - `structures.json` (38 struktur)
  - `registry-dump.summary.json` (statistiky)
  - `_probe.json` (status check)

## 🚀 Jak používat

### Metoda 1: Automatický dump při startu

Script se automaticky spustí při načtení serveru (`ServerEvents.loaded`).

### Metoda 2: Chat příkaz

V Minecraft chatu napiš:

```
!dumpregs
```

### Metoda 3: Manuální reload

V Minecraftu:

```
/reload
```

Po reloadu počkej ~1 sekundu, dump se spustí automaticky.

## ⚠️ DŮLEŽITÉ - První spuštění

### Problém: Helper mod nebyl načten při startu

Pokud vidíš v logu:

```
[registryDump] WARNING: RegistryUtil.writeJsonFile not available!
```

**Řešení:**

1. **RESTARTUJ MINECRAFT SERVER** (celý server, ne jen /reload)
2. Po restartu se helper mod načte správně
3. Dump se spustí automaticky nebo použij `!dumpregs`

### Ověření, že helper mod funguje

V logu by mělo být:

```
[INFO]: KubeJS RegistryUtil binding registered v1.0.1
[INFO]: [registryDump] Using RegistryUtil.writeJsonFile (Java NIO)...
[INFO]: [registryDump] biomes.json: OK (81 entries)
[INFO]: [registryDump] entities.json: OK (143 entries)
[INFO]: [registryDump] structures.json: OK (38 entries)
```

## 📁 Výstupní soubory

### biomes.json

Obsahuje všechny biomy ve formátu:

```json
[
  {
    "id": "minecraft:plains",
    "name": "Plains",
    "category": "plains",
    "temperature": 0.8,
    "precipitation": "rain"
  },
  ...
]
```

### entities.json

Obsahuje všechny typy entit:

```json
[
  {
    "id": "minecraft:zombie",
    "category": "monster",
    "fireImmune": false,
    "canSpawnFarFromPlayer": true,
    "clientTrackingRange": 8
  },
  ...
]
```

### structures.json

Obsahuje všechny struktury:

```json
[
  {
    "id": "minecraft:village",
    "biomes": ["minecraft:plains", "minecraft:desert", ...],
    "terrainAdaptation": "beard_thin"
  },
  ...
]
```

## 🔄 Emergency Fallback (dočasné řešení)

Pokud helper mod není dostupný, script vytvoří:

- **registry-data-all.json** - všechna data v jednom souboru

Struktura:

```json
{
  "biomes": [...],
  "entities": [...],
  "structures": [...],
  "_metadata": {
    "timestamp": "...",
    "counts": {...},
    "note": "Split this file manually or restart server"
  }
}
```

## 🐛 Řešení problémů

### Soubory se negenerují

1. ✅ Zkontroluj, že složka `kubejs/exports/` existuje
2. ✅ Ověř, že `mods/registrydumphelper-1.0.1.jar` existuje
3. ❗ **RESTARTUJ SERVER** (ne jen /reload)
4. Zkontroluj logy po restartu

### Chyby v logu

- **"Cannot find function type"** - normální, fallback mechanismus
- **"RegistryUtil.writeJsonFile not available"** - potřeba restart serveru
- **"redeclaration of var"** - script má re-entrant guard, ignoruj

### JsonIO nefunguje

JsonIO v KubeJS 2001.6.5 má známé problémy se zápisem polí objektů.
Proto helper mod používá Java NIO API přímo.

## 📊 Statistiky (aktuální dump)

- **Biomy:** 81
- **Entity:** 143
- **Struktury:** 38
- **Celkový čas:** ~77ms
  - Biomy: ~46ms
  - Entity: ~13ms
  - Struktury: ~5ms

## 🔧 Technické detaily

### Použité technologie

- **Minecraft Forge:** 47.4.0
- **KubeJS:** 2001.6.5-build.16
- **Rhino:** JavaScript engine (součást KubeJS)
- **Java NIO:** java.nio.file.Files, java.nio.file.Paths

### Helper Mod komponenty

1. **RegistryDumpPlugin** - KubeJS plugin rozšiřující ClassFilter
2. **RegistryUtilBinding** - Binding pro přístup k registrům a zápis souborů
3. Whitelisted třídy:
   - `net.minecraft.core.registries.*`
   - `net.minecraft.core.Registry*`
   - `java.nio.file.*`
   - `java.util.*`

### Script funkce

- `dumpRegistries()` - hlavní funkce
- `collectIds()` - pomocná funkce pro sběr ID
- `collectFromReg()` - iterace přes registry
- Re-entrant guard: `global.__kjs_registry_dump_running`

## 📝 Poznámky

- Script má DEBUG režim (DEBUG_SCAN=true) - lze vypnout v řádku 68
- Podporuje více eventů: ServerEvents.loaded, PlayerEvents.loggedIn, ServerEvents.tick
- Chat příkaz: `!dumpregs` (bez lomítka)
- Guard zabraňuje paralelním běhům (důležité pro ServerEvents.tick)

## 🎯 Rychlý start checklist

- [ ] Helper mod v `mods/` složce
- [ ] Složka `kubejs/exports/` existuje
- [ ] Server restartován po instalaci helper modu
- [ ] V logu: "KubeJS RegistryUtil binding registered"
- [ ] Spuštěn dump (`!dumpregs` nebo automaticky)
- [ ] Vygenerovány 3 JSON soubory v `exports/`

---

**Verze:** 1.0.1  
**Datum:** 9. listopadu 2025  
**Minecraft:** 1.20.1  
**Forge:** 47.4.0
