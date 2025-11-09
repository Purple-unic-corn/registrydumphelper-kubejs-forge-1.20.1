# Registry Dump - Návod k použití

## 📋 Přehled

Script pro export registrů z Minecraftu (biomy, entity, struktury) do JSON souborů přímo do složky Minecraft instance.

## 🔧 Co je potřeba

### 1. Helper Mod (registrydumphelper-1.20.1-forge-1.0.2.jar)

- **Umístění:** `mods/registrydumphelper-1.20.1-forge-1.0.2.jar`
- **Účel:**
  - Poskytuje přístup k Java NIO API pro zápis souborů (KubeJS 6+ má omezení)
  - Automaticky vytváří složku `exports/` při startu
  - Automaticky rozděluje `registry-data-all.json` na jednotlivé soubory
- **Verze:** 1.0.3

### 2. KubeJS Script (registryDump.js)

- **Umístění:** `kubejs/server_scripts/registryDump.js`
- **Funkce:**
  - Sbírá data z Minecraft registrů (BIOME, ENTITY_TYPE, STRUCTURE)
  - Exportuje data přes JsonIO do `registry-data-all.json`
  - Podporuje více metod spuštění

### 3. Export složka

- **Umístění:** `exports/` (v kořenovém adresáři instance, např. `C:\Users\...\Instances\Unicorn\exports\`)
- **Vytvořena:** ✅ Automaticky při startu modu
- **Vygenerované soubory:**
  - `biomes.json` (81 biomů) - **automaticky rozděleno z registry-data-all.json**
  - `entities.json` (143 entit) - **automaticky rozděleno z registry-data-all.json**
  - `structures.json` (38 struktur) - **automaticky rozděleno z registry-data-all.json**
  - `registry-data-all.json` (kombinovaná data)
  - `registry-dump.summary.json` (statistiky)
  - `_probe.json` (status check)

## 🚀 Jak používat

### Metoda 1: Automatický dump při startu (DOPORUČENO)

Script se automaticky spustí při načtení serveru (`ServerEvents.loaded`).

**Co se stane:**

1. Při načtení světa se automaticky spustí dump
2. Data se zapíší do `exports/registry-data-all.json`
3. **Automaticky** (do 2 sekund) se soubor rozdělí na:
   - `exports/biomes.json`
   - `exports/entities.json`
   - `exports/structures.json`

### Metoda 2: Chat příkaz

V Minecraft chatu napiš:

```
!dumpregs
```

Po spuštění počkej 1-2 sekundy, automaticky se vytvoří všechny soubory.

### Metoda 3: Manuální reload

V Minecraftu:

```
/reload
```

Po reloadu počkej ~2 sekundy, dump a rozdělení proběhne automaticky.

## ⚙️ Jak to funguje (automatické rozdělení)

### KubeJS 6+ Omezení

KubeJS 6+ **nepovoluje** přístup k Java třídám z JavaScriptu (`java()` už není podporováno).
Proto se používá **dvoustupňový proces**:

1. **JavaScript část** (registryDump.js):

   - Sbírá data z registrů
   - Vytvoří kombinovaný soubor `registry-data-all.json` přes JsonIO

2. **Java část** (RegistryDumpPlugin):
   - Spustí vlákno `RegistryDump-AutoSplit`
   - Čeká až 30 sekund na vytvoření `registry-data-all.json`
   - Automaticky ho rozdělí pomocí `splitRegistryDataAll()` metody
   - Vytvoří jednotlivé soubory: `biomes.json`, `entities.json`, `structures.json`

### Co uvidíš v logu

```
[INFO]: ✓ Exports directory already exists: C:\...\Instances\Unicorn\exports
[INFO]: KubeJS RegistryUtil binding registered v1.0.3
[INFO]: [registryDump] Emergency: Written all data to registry-data-all.json
[INFO]: ✓ Detected registry-data-all.json, auto-splitting...
[INFO]: [RegistryUtil] Reading registry-data-all.json...
[INFO]: [RegistryUtil] ✓ Created biomes.json
[INFO]: [RegistryUtil] ✓ Created entities.json
[INFO]: [RegistryUtil] ✓ Created structures.json
[INFO]: [RegistryUtil] ✓✓✓ Split completed successfully!
```

## ⚠️ DŮLEŽITÉ - První spuštění

### Žádné speciální kroky!

Na rozdíl od starších verzí **NENÍ** třeba restartovat server. Vše funguje automaticky:

1. Nainstaluj mod do `mods/` složky
2. Spusť Minecraft
3. Načti svět
4. Počkej 2-3 sekundy
5. ✅ Všechny soubory jsou v `exports/` složce

### Ověření, že funguje správně

V logu by mělo být:

```
[INFO]: KubeJS RegistryUtil binding registered v1.0.3
[INFO]: [registryDump] BIOMES: 81
[INFO]: [registryDump] ENTITIES: 143
[INFO]: [registryDump] STRUCTURES: 38
[INFO]: ✓ Detected registry-data-all.json, auto-splitting...
[INFO]: ✓✓✓ Split completed successfully!
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

## 🔄 Technické pozadí (pro pokročilé)

### Proč kombinovaný soubor + rozdělení?

KubeJS 6+ odstranil podporu `java()` globálního objektu z bezpečnostních důvodů.
To znamená, že JavaScript nemůže přímo volat Java metody, i když jsou registrované jako bindings.

**Řešení:**

- JavaScript používá `JsonIO.write()` (jediná funkční metoda) → vytvoří `registry-data-all.json`
- Java vlákno detekuje vytvoření souboru a automaticky ho rozdělí
- Výsledek: 3 jednotlivé JSON soubory bez nutnosti JavaScript-Java komunikace

### Struktura registry-data-all.json

```json
{
  "biomes": [
    {"id": "minecraft:plains", "name": "Plains", ...},
    ...81 položek...
  ],
  "entities": [
    {"id": "minecraft:zombie", "category": "monster", ...},
    ...143 položek...
  ],
  "structures": [
    {"id": "minecraft:village", "biomes": [...], ...},
    ...38 položek...
  ],
  "_metadata": {
    "timestamp": "...",
    "counts": {"biomes": 81, "entities": 143, "structures": 38},
    "note": "Automatically split by Java mod"
  }
}
```

## 🐛 Řešení problémů

### Soubory se negenerují

1. ✅ Zkontroluj logy - hledej "auto-splitting" nebo "Split completed"
2. ✅ Ověř, že `mods/registrydumphelper-1.20.1-forge-1.0.2.jar` existuje
3. ✅ Zkontroluj, že `exports/registry-data-all.json` existuje
4. ❗ Počkej plných 5 sekund po načtení světa (auto-split běží na pozadí)
5. ✅ Zkontroluj složku `exports/` v kořenovém adresáři instance (ne v `kubejs/exports/`)

### Kde přesně je složka exports?

Správná cesta je **v kořenovém adresáři instance**, ne v `kubejs/`:

```
C:\Users\<username>\curseforge\minecraft\Instances\<NázevInstance>\exports\
```

NIKOLI:

```
C:\Users\<username>\curseforge\minecraft\Instances\<NázevInstance>\kubejs\exports\
```

### Soubory jsou pouze registry-data-all.json, chybí ostatní

Znamená to, že auto-split ještě neproběhl:

- Počkej dalších 5 sekund
- Zkontroluj logy - hledej `✓ Detected registry-data-all.json, auto-splitting...`
- Pokud není v logu, restartuj Minecraft

### Chyby v logu

- **"global.RegistryUtil exists: false"** - normální, KubeJS 6+ omezení
- **"WARNING: splitRegistryData not available"** - normální, JavaScript nemá přístup k bindingům
- **"Using emergency text-based fallback"** - správně! To je záměr
- **"redeclaration of var"** - ignoruj, re-entrant guard

### Starý helper mod (v1.0.1)

Pokud máš v `mods/` starší verzi:

1. Smaž `registrydumphelper-1.0.1.jar`
2. Zkopíruj nový `registrydumphelper-1.20.1-forge-1.0.2.jar`
3. Restartuj Minecraft

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
- **KubeJS:** 2001.6.5-build.16 (KubeJS 6+)
- **Rhino:** JavaScript engine (součást KubeJS)
- **Java NIO:** java.nio.file.Files, java.nio.file.Paths

### Helper Mod komponenty (v1.0.3)

1. **RegistryDumpPlugin** - KubeJS plugin
   - Vytváří `exports/` složku při startu
   - Spouští auto-split vlákno
   - Registruje RegistryUtilBinding (nefunkční v KubeJS 6+, ale pro zpětnou kompatibilitu)
2. **RegistryUtilBinding** - Utility třída

   - `getGameDirectory()` - zjistí kořenový adresář instance
   - `splitRegistryDataAll()` - rozdělí kombinovaný JSON na jednotlivé soubory
   - `findMatchingBracket()` - pomocná metoda pro JSON parsing

3. Whitelisted třídy (ClassFilter):
   - `net.minecraft.core.registries.*`
   - `net.minecraft.core.Registry*`
   - `java.nio.file.*`
   - `java.util.*`

### Script funkce (registryDump.js)

- `dumpRegistries()` - hlavní funkce pro sběr dat
- `collectIds()` - pomocná funkce pro sběr ID
- `collectFromReg()` - iterace přes registry
- Re-entrant guard: `global.__kjs_registry_dump_running`
- **Zápis:** Pouze přes `JsonIO.write()` (jediná funkční metoda v KubeJS 6+)

### Workflow zpracování

```
1. ServerEvents.loaded
   ↓
2. registryDump.js spustí dumpRegistries()
   ↓
3. Sběr dat z registrů (81 biomes, 143 entities, 38 structures)
   ↓
4. JsonIO.write('exports/registry-data-all.json', {...})
   ↓
5. Auto-split vlákno detekuje soubor
   ↓
6. RegistryUtilBinding.splitRegistryDataAll()
   ↓
7. Vytvoření biomes.json, entities.json, structures.json
   ↓
8. ✅ Hotovo
```

## 📝 Poznámky

- Script má DEBUG režim (DEBUG_SCAN=true) - lze vypnout v řádku 68
- Podporuje více eventů: ServerEvents.loaded, PlayerEvents.loggedIn, ServerEvents.tick
- Chat příkaz: `!dumpregs` (bez lomítka)
- Guard zabraňuje paralelním běhům (důležité pro ServerEvents.tick)

## 🎯 Rychlý start checklist

- [ ] Helper mod `registrydumphelper-1.20.1-forge-1.0.2.jar` v `mods/` složce
- [ ] Minecraft spuštěn
- [ ] Svět načten
- [ ] Počkat 2-3 sekundy po načtení
- [ ] V logu: "KubeJS RegistryUtil binding registered v1.0.3"
- [ ] V logu: "✓ Detected registry-data-all.json, auto-splitting..."
- [ ] V logu: "✓✓✓ Split completed successfully!"
- [ ] Zkontrolovat složku `exports/` v kořeni instance
- [ ] ✅ 4 JSON soubory: `biomes.json`, `entities.json`, `structures.json`, `registry-data-all.json`

## 📂 Umístění souborů

**Správná cesta:**

```
<Instance>\
├── mods\
│   └── registrydumphelper-1.20.1-forge-1.0.2.jar
├── kubejs\
│   └── server_scripts\
│       └── registryDump.js
└── exports\          ← TADY jsou výstupní soubory!
    ├── biomes.json
    ├── entities.json
    ├── structures.json
    ├── registry-data-all.json
    ├── registry-dump.summary.json
    └── _probe.json
```

---

**Verze:** 1.0.3  
**Datum:** 9. listopadu 2025  
**Minecraft:** 1.20.1  
**Forge:** 47.4.0  
**KubeJS:** 2001.6.5-build.16 (KubeJS 6+)
