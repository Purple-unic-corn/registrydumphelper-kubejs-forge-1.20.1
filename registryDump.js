// kubejs/server_scripts/registryDump.js
// MC 1.20.1 + KubeJS 2001.6.5-build.16
// Exports all registries (biomes, entities, structures) to JSON files

// Wrap all initialization in try-catch to prevent Rhino NullPointerException
(function () {
  try {
    // Reset flag on each reload so dump can retry
    global.__kjs_registry_dump_done = false;

    // Safe initialization - set directly without reading old values
    global.__kjs_registry_dump_attempts = 0;
    global.__kjs_registry_login_tick = -1;
    global.__kjs_registry_max_tick_attempts = 20;
    global.__kjs_registry_delayed_attempt_done = false;
    global.__kjs_registry_tick_stopped = false;
    global.__kjs_registry_chat_retry_counter = -1;
    global.__kjs_registry_chat_retry_max = 2;
    global.__kjs_registry_chat_retry_server = null;
    global.__kjs_registry_chat_last_result_sizes = null;
    global.__kjs_registry_dump_running = false;
    global.__kjs_rd_tmp_srv = null;
    global.__kjs_rd_tmp_ok = false;
  } catch (e) {
    console.log('[registryDump] Initialization error: ' + e);
  }
})();

// Helper function: tries to extract actual MinecraftServer from various wrappers
function resolveMcServer(srv) {
  try {
    if (!srv) return null;
    // If already looks like MC server (has registryAccess/getRegistryAccess), return as-is
    if (
      typeof srv.registryAccess === 'function' ||
      typeof srv.getRegistryAccess === 'function'
    )
      return srv;
    // KubeJS wrappers often have getServer()
    if (typeof srv.getServer === 'function') {
      // Avoid const due to Rhino redeclaration bug
      var inner = srv.getServer();
      if (inner) return inner;
    }
    // Some wrappers hold it under minecraftServer/server
    if (srv.minecraftServer) return srv.minecraftServer;
    if (srv.server) return srv.server;
  } catch (_) {}
  return null;
}

function dumpRegistries(server) {
  // If dump already running, skip (prevents Rhino redeclaration bugs)
  if (global.__kjs_registry_dump_running) return false;
  global.__kjs_registry_dump_running = true;
  if (!server) {
    console.log('[registryDump] server not available');
    global.__kjs_registry_dump_running = false;
    return false;
  }

  try {
    // Note on Rhino redeclaration bug: don't use const multiple times in function during multi-tick/runs
    // Move timing to global variable due to repeated calls (Rhino redeclaration bug)
    global.__kjs_registry_dump_start_ms = Date.now();
    console.log('[registryDump] starting dump...');
    // Debug switches for heavy fallbacks – disabled by default
    // Temporarily enable DEBUG_SCAN for diagnostics of missing structures (disable when done)
    var DEBUG_SCAN = true; // Will scan registryAccess.registries() stream and search by name
    var DEBUG_BRUTE = false; // Deep brute-force via reflection (slow, diagnostics only)
    // Verify target folder exists – skipped (java.io.File blocked by class filter in this build)
    // JsonIO.write below usually creates 'exports' directory automatically.

    // Java API (1.20.1)
    var Registries = global.__RegistryDump_Registries;
    if (!Registries) {
      try {
        // Prefer Java.type – better access to static fields (BIOME etc.) in Rhino
        Registries = Java.type('net.minecraft.core.registries.Registries');
      } catch (rtErr) {
        try {
          Registries =
            Java && typeof Java.loadClass === 'function'
              ? Java.loadClass('net.minecraft.core.registries.Registries')
              : null;
        } catch (lcErr) {
          Registries = null;
        }
      }
      global.__RegistryDump_Registries = Registries;
    }
    try {
      console.log('[registryDump] has Registries=' + !!Registries);
      if (Registries) {
        var hasBiomeField = false,
          hasEntityField = false,
          hasStructureField = false;
        try {
          hasBiomeField = !!Registries.BIOME;
        } catch (_) {}
        try {
          hasEntityField = !!Registries.ENTITY_TYPE;
        } catch (_) {}
        try {
          hasStructureField = !!Registries.STRUCTURE;
        } catch (_) {}
        console.log(
          '[registryDump] Registries fields BIOME=' +
            hasBiomeField +
            ' ENTITY_TYPE=' +
            hasEntityField +
            ' STRUCTURE=' +
            hasStructureField
        );
      }
    } catch (_d1) {}

    // Get actual MinecraftServer (wrappers may have different shapes)
    // Resolved server (avoid name redeclarations)
    var srvResolved = resolveMcServer(server);

    // registryAccess(): 1.20.x | getRegistryAccess(): fallback (avoid 'const' due to Rhino redeclaration bugs)
    var regAccess =
      srvResolved && typeof srvResolved.registryAccess === 'function'
        ? srvResolved.registryAccess()
        : srvResolved && typeof srvResolved.getRegistryAccess === 'function'
        ? srvResolved.getRegistryAccess()
        : null;

    if (!regAccess) {
      console.log(
        '[registryDump] registry access not found on server (cannot read registries)'
      );
      return false;
    }

    // Fallback: if static fields on Registries aren't available, try reflection then manual key creation
    var reflectStaticField = function (className, fieldName) {
      try {
        var Cls = Java.type('java.lang.Class');
        var clazz = Cls.forName(className);
        var fld = clazz.getDeclaredField(fieldName);
        fld.setAccessible(true);
        var val = fld.get(null);
        return val || null;
      } catch (_refl) {
        return null;
      }
    };
    var ResourceKey = null,
      ResourceLocation = null;
    try {
      ResourceKey = Java.type('net.minecraft.resources.ResourceKey');
    } catch (_rke) {}
    try {
      ResourceLocation = Java.type('net.minecraft.resources.ResourceLocation');
    } catch (_rle) {}
    try {
      console.log(
        '[registryDump] has ResourceKey=' +
          !!ResourceKey +
          ' has ResourceLocation=' +
          !!ResourceLocation
      );
    } catch (_dr) {}

    var regKeyOr = function (staticKey, ns, pathOrArr, staticFieldName) {
      if (staticKey) return staticKey;
      // Try: read static field via reflection (BIOME/ENTITY_TYPE/STRUCTURE)
      if (staticFieldName && !staticKey && Registries) {
        try {
          var refl = reflectStaticField(
            'net.minecraft.core.registries.Registries',
            staticFieldName
          );
          if (refl) return refl;
        } catch (_r2) {}
      }
      if (ResourceKey && ResourceLocation) {
        var paths = Array.isArray(pathOrArr) ? pathOrArr : [pathOrArr];
        for (var i = 0; i < paths.length; i++) {
          try {
            var rk = ResourceKey.createRegistryKey(
              new ResourceLocation(ns, paths[i])
            );
            if (rk) return rk;
          } catch (_mk) {}
        }
      }
      return null;
    };

    var BuiltInRegistries = null;
    try {
      BuiltInRegistries = Java.type(
        'net.minecraft.core.registries.BuiltInRegistries'
      );
    } catch (_bir) {}
    var ForgeRegistries = null;
    try {
      ForgeRegistries = Java.type(
        'net.minecraftforge.registries.ForgeRegistries'
      );
    } catch (_fr1) {
      try {
        ForgeRegistries = Java.type(
          'net.neoforged.neoforge.registries.ForgeRegistries'
        );
      } catch (_fr2) {}
    }
    var GameData = null;
    try {
      GameData = Java.type('net.minecraftforge.registries.GameData');
    } catch (_gd1) {
      try {
        GameData = Java.type('net.neoforged.neoforge.registries.GameData');
      } catch (_gd2) {}
    }
    try {
      console.log(
        '[registryDump] has BuiltIn=' +
          !!BuiltInRegistries +
          ' has Forge=' +
          !!ForgeRegistries
      );
    } catch (_d2) {}

    var collectFromReg = function (regObj, label) {
      var arr = [];
      try {
        if (!regObj) {
          console.log('[registryDump] collectFromReg: ' + label + ' is null');
          return [];
        }
        // Primary path: keySet()
        if (regObj.keySet) {
          var keys = regObj.keySet();
          if (keys && keys.iterator) {
            var it = keys.iterator();
            while (it.hasNext()) {
              var rk = it.hasNext() && it.next();
              if (!rk) break;
              try {
                arr.push(String(rk.location()));
              } catch (_kl) {
                arr.push(String(rk));
              }
            }
          }
          // Fallback via forEach Consumer
          if (arr.length === 0 && keys && keys.forEach) {
            try {
              var Consumer = Java.type('java.util.function.Consumer');
              var list = [];
              var cons = new (Java.extend(Consumer))({
                accept: function (rk) {
                  try {
                    list.push(String(rk.location()));
                  } catch (_k2) {
                    list.push(String(rk));
                  }
                },
              });
              keys.forEach(cons);
              if (list.length > 0) arr = list;
            } catch (_cf) {}
          }
        }
        // If nothing loaded and stream API exists
        if (arr.length === 0 && regObj.stream) {
          try {
            // Attempt 1: forEach Consumer instead of toArray (blocked)
            var Consumer2 = null;
            try {
              Consumer2 = Java.type('java.util.function.Consumer');
            } catch (_c0) {
              Consumer2 = null;
            }
            if (Consumer2 && regObj.stream().forEach) {
              var list2 = [];
              var cons2 = new (Java.extend(Consumer2))({
                accept: function (entry) {
                  try {
                    if (
                      BuiltInRegistries &&
                      BuiltInRegistries.BIOME &&
                      BuiltInRegistries.BIOME.getKey &&
                      label.indexOf('BIOME') === 0
                    ) {
                      var rlB = BuiltInRegistries.BIOME.getKey(entry);
                      if (rlB) list2.push(String(rlB));
                    } else if (
                      BuiltInRegistries &&
                      BuiltInRegistries.ENTITY_TYPE &&
                      BuiltInRegistries.ENTITY_TYPE.getKey &&
                      label.indexOf('ENTITY') === 0
                    ) {
                      var rlE = BuiltInRegistries.ENTITY_TYPE.getKey(entry);
                      if (rlE) list2.push(String(rlE));
                    } else if (
                      BuiltInRegistries &&
                      BuiltInRegistries.STRUCTURE &&
                      BuiltInRegistries.STRUCTURE.getKey &&
                      label.indexOf('STRUCTURE') === 0
                    ) {
                      var rlS = BuiltInRegistries.STRUCTURE.getKey(entry);
                      if (rlS) list2.push(String(rlS));
                    }
                  } catch (_se) {}
                },
              });
              regObj.stream().forEach(cons2);
              if (list2.length > 0) arr = list2;
            }
            // Attempt 2: toArray (original)
            if (arr.length === 0) {
              var streamArr = Java.from(regObj.stream().toArray());
              for (var i = 0; i < streamArr.length; i++) {
                var entry = streamArr[i];
                try {
                  if (
                    BuiltInRegistries &&
                    BuiltInRegistries.BIOME &&
                    BuiltInRegistries.BIOME.getKey &&
                    label.indexOf('BIOME') === 0
                  ) {
                    var rlB2 = BuiltInRegistries.BIOME.getKey(entry);
                    if (rlB2) arr.push(String(rlB2));
                  } else if (
                    BuiltInRegistries &&
                    BuiltInRegistries.ENTITY_TYPE &&
                    BuiltInRegistries.ENTITY_TYPE.getKey &&
                    label.indexOf('ENTITY') === 0
                  ) {
                    var rlE2 = BuiltInRegistries.ENTITY_TYPE.getKey(entry);
                    if (rlE2) arr.push(String(rlE2));
                  } else if (
                    BuiltInRegistries &&
                    BuiltInRegistries.STRUCTURE &&
                    BuiltInRegistries.STRUCTURE.getKey &&
                    label.indexOf('STRUCTURE') === 0
                  ) {
                    var rlS2 = BuiltInRegistries.STRUCTURE.getKey(entry);
                    if (rlS2) arr.push(String(rlS2));
                  }
                } catch (_se2) {}
              }
            }
          } catch (_st) {}
        }
      } catch (e) {
        console.log(
          '[registryDump] failed to read registry (' + label + '): ' + e
        );
      }
      arr.sort();
      console.log(
        '[registryDump] collectFromReg ' + label + ' size=' + arr.length
      );
      return arr;
    };

    // Recursive deep brute-force: find Map/registry objects inside wrappers
    var collectByBrute = function (targetLocStrings, lbl) {
      if (!DEBUG_BRUTE) return [];
      var debug = { levels: [] };
      var MapClass = null;
      try {
        MapClass = Java.type('java.util.Map');
      } catch (_mc) {
        MapClass = null;
      }
      var visited = [];
      var maxDepth = 5;
      var results = null;
      var pushDebug = function (depth, obj, note, extra) {
        var info = { depth: depth, note: note, class: null };
        try {
          info.class =
            obj && obj.getClass ? String(obj.getClass().getName()) : null;
        } catch (_) {}
        if (extra) for (var k in extra) info[k] = extra[k];
        debug.levels.push(info);
      };
      var isSame = function (a, b) {
        return a === b;
      };
      var already = function (o) {
        for (var i = 0; i < visited.length; i++) {
          if (isSame(visited[i], o)) return true;
        }
        return false;
      };
      var mark = function (o) {
        visited.push(o);
      };
      var tryRegistryDump = function (reg, labelPrefix) {
        var got = collectFromReg(reg, labelPrefix);
        if (got && got.length > 0) return got;
        return null;
      };
      var matchLoc = function (locStr) {
        for (var i = 0; i < targetLocStrings.length; i++) {
          var ts = String(targetLocStrings[i]);
          if (locStr === ts || (locStr && locStr.indexOf(ts) >= 0)) return true;
        }
        return false;
      };
      var attemptRegistry = function (candidate, labelPrefix) {
        if (!candidate) return null;
        try {
          var k = candidate.key ? candidate.key() : null;
          var locStr = '';
          try {
            locStr =
              k && k.location ? String(k.location()) : k ? String(k) : '';
          } catch (_) {}
          if (matchLoc(locStr)) {
            var r = tryRegistryDump(candidate, lbl + ':BruteReg');
            if (r) return r;
          }
        } catch (_) {}
        return null;
      };
      var deep = function (obj, depth) {
        if (!obj || depth > maxDepth || already(obj)) return;
        mark(obj);
        pushDebug(depth, obj, 'enter');
        // Direct attempt: is it a registry?
        var regTry = attemptRegistry(obj, lbl + ':Direct');
        if (regTry) {
          results = regTry;
          return;
        }
        // Pokud je to Map
        try {
          if (MapClass && obj instanceof MapClass) {
            pushDebug(depth, obj, 'map', {
              size: obj.size ? Number(obj.size()) : null,
            });
            // Nejprve zkus forEach(BiConsumer) – obejde entrySet/iterator blokace
            var usedForEach = false;
            try {
              var BiConsumer = Java.type('java.util.function.BiConsumer');
              if (obj.forEach && BiConsumer) {
                usedForEach = true;
                var any = { count: 0 };
                var cons = new (Java.extend(BiConsumer))({
                  accept: function (k, v) {
                    any.count++;
                    var locStr = '';
                    try {
                      locStr =
                        k && k.location
                          ? String(k.location())
                          : k
                          ? String(k)
                          : '';
                    } catch (_) {}
                    if (matchLoc(locStr)) {
                      var regRes = tryRegistryDump(v, lbl + ':BruteMapForEach');
                      if (!results && regRes) {
                        results = regRes;
                      }
                    }
                    if (!results) deep(v, depth + 1);
                  },
                });
                obj.forEach(cons);
                pushDebug(depth, obj, 'mapForEach', { count: any.count });
                if (results) return;
              }
            } catch (_bicc) {}
            // If forEach failed, try entrySet + iterator
            if (!results) {
              var entrySet = null;
              try {
                entrySet = obj.entrySet ? obj.entrySet() : null;
              } catch (_) {}
              if (entrySet) {
                var it = null;
                try {
                  it = entrySet.iterator ? entrySet.iterator() : null;
                } catch (_) {}
                while (it && it.hasNext && it.hasNext()) {
                  var en = null;
                  try {
                    en = it.next();
                  } catch (_nx) {
                    break;
                  }
                  if (!en) continue;
                  var k = null,
                    v = null;
                  try {
                    k = en.getKey ? en.getKey() : en.key ? en.key() : null;
                  } catch (_) {}
                  try {
                    v = en.getValue
                      ? en.getValue()
                      : en.value
                      ? en.value()
                      : null;
                  } catch (_) {}
                  var locStr = '';
                  try {
                    locStr =
                      k && k.location
                        ? String(k.location())
                        : k
                        ? String(k)
                        : '';
                  } catch (_) {}
                  if (matchLoc(locStr)) {
                    var regRes2 = tryRegistryDump(v, lbl + ':BruteMap');
                    if (regRes2) {
                      results = regRes2;
                      return;
                    }
                  }
                  deep(v, depth + 1);
                  if (results) return;
                }
              }
            }
          }
        } catch (_) {}
        // Recursive field reflection
        try {
          var cls = obj.getClass ? obj.getClass() : null;
          if (cls && cls.getDeclaredFields) {
            var flds = cls.getDeclaredFields();
            for (var i = 0; i < flds.length; i++) {
              var fld = flds[i];
              try {
                fld.setAccessible(true);
              } catch (_) {}
              var val = null;
              try {
                val = fld.get(obj);
              } catch (_) {
                val = null;
              }
              pushDebug(depth, obj, 'field', {
                field: fld.getName ? String(fld.getName()) : String(i),
                isNull: val === null,
              });
              if (!val) continue;
              // If value looks like registry -> attempt
              var regRes2 = attemptRegistry(val, lbl + ':BruteField');
              if (regRes2) {
                results = regRes2;
                return;
              }
              // Pokud je to Map -> rekurze
              try {
                if (MapClass && val instanceof MapClass) {
                  deep(val, depth + 1);
                  if (results) return;
                } else {
                  deep(val, depth + 1);
                  if (results) return;
                }
              } catch (_) {}
            }
          }
        } catch (_) {}
      };
      try {
        deep(regAccess, 0);
      } catch (e) {
        console.log('[registryDump] deep brute error ' + e);
      }
      if (results && results.length > 0) {
        try {
          JsonIO.write('exports/registry-debug.json', debug);
        } catch (_) {}
        return results;
      }
      if (DEBUG_BRUTE) {
        console.log('[registryDump] NO ENTRIES for ' + lbl + ' via BruteDeep');
        try {
          JsonIO.write('exports/registry-debug.json', debug);
        } catch (_) {}
      }
      return [];
    };

    // Last variant: iterate all registries from regAccess.registries() and find by registry name
    var collectByScan = function (targetLocStrings, lbl) {
      if (!DEBUG_SCAN) return [];
      var out = [];
      try {
        var stream = regAccess.registries();
        var entries = null;
        try {
          entries = Java.from(stream.toArray());
        } catch (_ta) {
          try {
            entries = Java.from(stream.toList());
          } catch (_tl) {
            entries = null;
          }
        }
        // Fallback: forEach Consumer via stream
        if (!entries) {
          try {
            var Consumer3 = Java.type('java.util.function.Consumer');
            var list3 = [];
            var cons3 = new (Java.extend(Consumer3))({
              accept: function (en) {
                list3.push(en);
              },
            });
            if (stream && stream.forEach) stream.forEach(cons3);
            if (list3.length > 0) entries = list3;
          } catch (_cf3) {}
        }
        // Fallback: use spliterator if array cannot be materialized (class filter blocks toArray/toList)
        if (!entries) {
          try {
            var spl = stream.spliterator ? stream.spliterator() : null;
            if (spl && spl.tryAdvance) {
              var tmp = [];
              var advFn = function (en) {
                tmp.push(en);
                return true;
              };
              // tryAdvance returns boolean; repeat while returns true
              while (spl.tryAdvance(advFn)) {}
              if (tmp.length > 0) entries = tmp;
            }
          } catch (_sp) {}
        }
        // Another fallback: use direct iterator() via stream/iterable
        if (!entries) {
          try {
            var it = stream && stream.iterator ? stream.iterator() : null;
            if (it && it.hasNext) {
              var list = [];
              while (it.hasNext()) {
                try {
                  list.push(it.next());
                } catch (_nx) {
                  break;
                }
              }
              if (list.length > 0) entries = list;
            }
          } catch (_it) {}
        }
        // Emergency diagnostics: reflect registryAccess fields (bruteforce) if still nothing - prints field names
        if (!entries) {
          try {
            var ClsRA = regAccess.getClass ? regAccess.getClass() : null;
            if (ClsRA && ClsRA.getDeclaredFields) {
              var flds = ClsRA.getDeclaredFields();
              var names = [];
              for (var fi = 0; fi < flds.length; fi++) {
                try {
                  names.push(String(flds[fi].getName()));
                } catch (_fn) {}
              }
              console.log(
                '[registryDump] scan: reflective field list: ' + names.join(',')
              );
            }
          } catch (_rf) {}
        }
        if (!entries) {
          console.log(
            '[registryDump] scan: cannot materialize registries stream'
          );
          return [];
        }
        for (var i = 0; i < entries.length; i++) {
          var en = entries[i];
          if (!en) continue;
          var regObj = null;
          try {
            // Possible shapes: Map.Entry, Pair, custom holder
            regObj = en.getValue
              ? en.getValue()
              : en.value
              ? en.value()
              : en.getSecond
              ? en.getSecond()
              : en.second
              ? en.second()
              : null;
          } catch (_gv) {}
          if (!regObj) continue;
          // Get registry key: preferably from entry.key(), otherwise from registry.key()
          var regKeyOfReg = null;
          try {
            regKeyOfReg = en.getKey
              ? en.getKey()
              : en.key
              ? en.key()
              : en.getFirst
              ? en.getFirst()
              : en.first
              ? en.first()
              : null;
          } catch (_gk) {}
          if (!regKeyOfReg) {
            try {
              regKeyOfReg = regObj.key ? regObj.key() : null;
            } catch (_kk) {}
          }
          var rl = null;
          try {
            rl =
              regKeyOfReg && regKeyOfReg.location
                ? regKeyOfReg.location()
                : null;
          } catch (_kl) {}
          var locStr = rl ? String(rl) : '';
          for (var j = 0; j < targetLocStrings.length; j++) {
            if (locStr === targetLocStrings[j]) {
              var arr = collectFromReg(regObj, lbl + ':Scan');
              if (arr && arr.length > 0) return arr;
            }
          }
        }
      } catch (e) {
        console.log('[registryDump] scan failed for ' + lbl + ': ' + e);
      }
      if (DEBUG_SCAN)
        console.log('[registryDump] NO ENTRIES for ' + lbl + ' via Scan');
      return out;
    };

    var collectIds = function (regKeyConst, builtInReg, forgeRegGetter, lbl) {
      var out = [];
      // 1) RegistryAccess
      try {
        if (regKeyConst) {
          var regObj = regAccess.registryOrThrow(regKeyConst);
          out = collectFromReg(regObj, lbl + ':RegistryAccess');
        }
      } catch (e1) {
        console.log(
          '[registryDump] failed to collect via RegistryAccess: ' + e1
        );
      }
      // 2) BuiltInRegistries fallback
      if ((!out || out.length === 0) && builtInReg) {
        var biOut = collectFromReg(builtInReg, lbl + ':BuiltIn');
        if (biOut && biOut.length > 0) out = biOut;
        else console.log('[registryDump] BuiltIn empty for ' + lbl);
      }
      // 3) Forge/NeoForge registries fallback
      if (
        (!out || out.length === 0) &&
        ForgeRegistries &&
        typeof forgeRegGetter === 'function'
      ) {
        try {
          var fReg = forgeRegGetter(ForgeRegistries);
          if (fReg && typeof fReg.getKeys === 'function') {
            var fKeys = fReg.getKeys();
            var fArr = fKeys
              ? Java.from(fKeys.toArray()).map(function (rl) {
                  return String(rl);
                })
              : [];
            fArr.sort();
            console.log(
              '[registryDump] collectFromReg ' +
                lbl +
                ':Forge size=' +
                fArr.length
            );
            if (fArr.length > 0) out = fArr;
          } else {
            console.log(
              '[registryDump] Forge registry object missing or no getKeys for ' +
                lbl +
                ' -> ' +
                fReg
            );
          }
        } catch (e3) {
          console.log(
            '[registryDump] failed to collect via ForgeRegistries: ' + e3
          );
        }
      }
      // 4) GameData wrapper fallback (Forge/NeoForge) - poskytuje RegistryWrapper
      if (
        (!out || out.length === 0) &&
        GameData &&
        regKeyConst &&
        typeof GameData.getWrapper === 'function'
      ) {
        try {
          var wrapper = GameData.getWrapper(regKeyConst);
          if (wrapper && typeof wrapper.getKeys === 'function') {
            var wKeys = wrapper.getKeys();
            var wArr = wKeys
              ? Java.from(wKeys.toArray()).map(function (rl) {
                  return String(rl);
                })
              : [];
            wArr.sort();
            console.log(
              '[registryDump] collectFromReg ' +
                lbl +
                ':GameData size=' +
                wArr.length
            );
            if (wArr.length > 0) out = wArr;
            else console.log('[registryDump] GameData empty for ' + lbl);
          } else {
            console.log(
              '[registryDump] GameData wrapper missing or no getKeys for ' + lbl
            );
          }
        } catch (e4) {
          console.log('[registryDump] failed to collect via GameData: ' + e4);
        }
      }
      if (!out || out.length === 0)
        console.log(
          '[registryDump] NO ENTRIES for ' + lbl + ' after all sources'
        );
      return out || [];
    };

    var biomeKey = regKeyOr(
      Registries && Registries.BIOME,
      'minecraft',
      ['worldgen/biome', 'biome'],
      'BIOME'
    );
    var entityKey = regKeyOr(
      Registries && Registries.ENTITY_TYPE,
      'minecraft',
      ['entity_type'],
      'ENTITY_TYPE'
    );
    var structureKey = regKeyOr(
      Registries && Registries.STRUCTURE,
      'minecraft',
      ['worldgen/structure', 'structure'],
      'STRUCTURE'
    );
    try {
      console.log(
        '[registryDump] keysPresent biome=' +
          (biomeKey ? 'Y' : 'N') +
          ' entity=' +
          (entityKey ? 'Y' : 'N') +
          ' structure=' +
          (structureKey ? 'Y' : 'N')
      );
    } catch (_dk) {}

    // KubeJS direct API fallback - if Java registries fail, get list via KubeJS registry wrapper
    var kubejsBiomeIds = [];
    var kubejsEntityIds = [];
    var kubejsStructureIds = [];
    try {
      if (
        global &&
        global['Registry'] &&
        typeof global['Registry'] === 'object'
      ) {
        var KJReg = global['Registry'];
        var MapCls1 = null;
        try {
          MapCls1 = Java.type('java.util.Map');
        } catch (_mc1) {}
        var getIfMap = function (mapObj, key) {
          try {
            if (
              MapCls1 &&
              mapObj instanceof MapCls1 &&
              typeof mapObj.get === 'function'
            ) {
              var v = mapObj.get(String(key));
              return v ? v : null;
            } else {
              // Avoid property access if might return null from NativeJavaMap.get
              var tmp = mapObj[key];
              return tmp ? tmp : null;
            }
          } catch (_gi) {
            return null;
          }
        };

        // Safe wrapper retrieval - if anything is null, just skip
        var kjBiome =
          getIfMap(KJReg, 'biome') || getIfMap(KJReg, 'worldgen/biome');
        if (kjBiome && kjBiome.getIds) {
          try {
            kubejsBiomeIds = kjBiome.getIds().map(String);
          } catch (_kb) {}
        }
        var kjEntity =
          getIfMap(KJReg, 'entity_type') ||
          getIfMap(KJReg, 'entity') ||
          getIfMap(KJReg, 'mob');
        if (kjEntity && kjEntity.getIds) {
          try {
            kubejsEntityIds = kjEntity.getIds().map(String);
          } catch (_ke) {}
        }
        var kjStructure =
          getIfMap(KJReg, 'structure') || getIfMap(KJReg, 'worldgen/structure');
        if (kjStructure && kjStructure.getIds) {
          try {
            kubejsStructureIds = kjStructure.getIds().map(String);
          } catch (_ks) {}
        }
      }
    } catch (_kreg) {
      console.log('[registryDump] KubeJS Registry API access error: ' + _kreg);
    }
    if (kubejsBiomeIds.length > 0)
      console.log(
        '[registryDump] KubeJS biome ids size=' + kubejsBiomeIds.length
      );
    if (kubejsEntityIds.length > 0)
      console.log(
        '[registryDump] KubeJS entity ids size=' + kubejsEntityIds.length
      );
    if (kubejsStructureIds.length > 0)
      console.log(
        '[registryDump] KubeJS structure ids size=' + kubejsStructureIds.length
      );

    // Dynamic exploration of all available KubeJS registry wrappers (if global.Registry exists)
    // Goal: determine if there are other names or aliases and store complete map for diagnostics.
    try {
      if (
        global &&
        global['Registry'] &&
        typeof global['Registry'] === 'object'
      ) {
        var allRegObj = global['Registry'];
        var MapCls = null;
        try {
          MapCls = Java.type('java.util.Map');
        } catch (_) {}
        var regKeys = [];
        // If it's a Java Map, use keySet() / iterator instead of Object.keys (avoids NPE in NativeJavaMap.get)
        if (
          MapCls &&
          allRegObj instanceof MapCls &&
          typeof allRegObj.keySet === 'function'
        ) {
          try {
            var ks = allRegObj.keySet();
            if (ks && ks.iterator) {
              var itKs = ks.iterator();
              while (itKs.hasNext()) {
                regKeys.push(String(itKs.next()));
              }
            }
          } catch (_ksErr) {}
        } else {
          try {
            regKeys = Object.keys(allRegObj);
          } catch (_rk) {
            regKeys = [];
          }
        }
        var aggregate = { keys: regKeys.slice(), registries: {} };
        var counts = {};
        for (var ri = 0; ri < regKeys.length; ri++) {
          var rname = String(regKeys[ri]);
          var robj = null;
          try {
            if (
              MapCls &&
              allRegObj instanceof MapCls &&
              typeof allRegObj.get === 'function'
            ) {
              robj = allRegObj.get(rname);
            } else {
              robj = allRegObj[rname];
            }
          } catch (_rget) {
            robj = null;
          }
          if (!robj) continue;
          var ids = [];
          try {
            if (robj.getIds) {
              ids = robj.getIds().map(String);
            } else if (robj.getAll) {
              var tmpAll = robj.getAll();
              if (tmpAll && tmpAll.map) {
                ids = tmpAll.map(String);
              } else if (tmpAll && tmpAll.forEach) {
                var collector = [];
                tmpAll.forEach(function (x) {
                  collector.push(String(x));
                });
                ids = collector;
              }
            }
          } catch (_idsErr) {}
          aggregate.registries[rname] = {
            size: ids.length,
            sample: ids.slice(0, 5),
          };
          counts[rname] = ids.length;
          if (ids.length > 0) {
            var lname = rname.toLowerCase();
            if (
              kubejsBiomeIds.length === 0 &&
              (lname === 'biome' || lname === 'worldgen/biome')
            )
              kubejsBiomeIds = ids;
            else if (
              kubejsEntityIds.length === 0 &&
              (lname === 'entity_type' || lname === 'entity' || lname === 'mob')
            )
              kubejsEntityIds = ids;
            else if (
              kubejsStructureIds.length === 0 &&
              (lname === 'structure' || lname === 'worldgen/structure')
            )
              kubejsStructureIds = ids;
          }
        }
        try {
          JsonIO.write('exports/registry-kubejs-all.json', aggregate);
        } catch (_wagg) {}
        try {
          JsonIO.write('exports/registry-kubejs-counts.json', counts);
        } catch (_wc) {}
        console.log(
          '[registryDump] dynamic KubeJS registry scan keys=' + regKeys.length
        );
      }
    } catch (_dynKJ) {
      console.log('[registryDump] dynamic Registry scan error: ' + _dynKJ);
    }

    var tB0 = Date.now();
    var biomes = collectIds(
      biomeKey,
      BuiltInRegistries && BuiltInRegistries.BIOME,
      function (FR) {
        return FR && FR.BIOMES;
      },
      'BIOME'
    );
    if ((!biomes || biomes.length === 0) && DEBUG_SCAN)
      biomes = collectByScan(
        ['minecraft:worldgen/biome', 'minecraft:biome'],
        'BIOME'
      );
    if ((!biomes || biomes.length === 0) && DEBUG_BRUTE)
      biomes = collectByBrute(
        [
          'minecraft:worldgen/biome',
          'minecraft:biome',
          'worldgen/biome',
          'biome',
        ],
        'BIOME'
      );
    if (
      (!biomes || biomes.length === 0) &&
      kubejsBiomeIds &&
      kubejsBiomeIds.length > 0
    )
      biomes = kubejsBiomeIds;
    var tB1 = Date.now();

    var tE0 = Date.now();
    var entities = collectIds(
      entityKey,
      BuiltInRegistries && BuiltInRegistries.ENTITY_TYPE,
      function (FR) {
        return FR && (FR.ENTITY_TYPES || FR.ENTITIES);
      },
      'ENTITY'
    );
    if ((!entities || entities.length === 0) && DEBUG_SCAN)
      entities = collectByScan(['minecraft:entity_type'], 'ENTITY');
    if ((!entities || entities.length === 0) && DEBUG_BRUTE)
      entities = collectByBrute(
        ['minecraft:entity_type', 'entity_type'],
        'ENTITY'
      );
    if (
      (!entities || entities.length === 0) &&
      kubejsEntityIds &&
      kubejsEntityIds.length > 0
    )
      entities = kubejsEntityIds;
    var tE1 = Date.now();

    var tS0 = Date.now();
    var structures = collectIds(
      structureKey,
      BuiltInRegistries && BuiltInRegistries.STRUCTURE,
      function (FR) {
        return FR && (FR.STRUCTURE_TYPES || FR.STRUCTURES);
      },
      'STRUCTURE'
    );
    if ((!structures || structures.length === 0) && DEBUG_SCAN)
      structures = collectByScan(
        ['minecraft:worldgen/structure', 'minecraft:structure'],
        'STRUCTURE'
      );
    if ((!structures || structures.length === 0) && DEBUG_BRUTE)
      structures = collectByBrute(
        [
          'minecraft:worldgen/structure',
          'minecraft:structure',
          'worldgen/structure',
          'structure',
        ],
        'STRUCTURE'
      );
    if (
      (!structures || structures.length === 0) &&
      kubejsStructureIds &&
      kubejsStructureIds.length > 0
    )
      structures = kubejsStructureIds;
    // Extra Forge direct field fallback (some builds may use different field names)
    if ((!structures || structures.length === 0) && ForgeRegistries) {
      try {
        var frStructReg =
          ForgeRegistries.STRUCTURE ||
          ForgeRegistries.STRUCTURES ||
          ForgeRegistries.STRUCTURE_TYPES;
        if (frStructReg && frStructReg.getKeys) {
          var frKeys = frStructReg.getKeys();
          if (frKeys && frKeys.toArray) {
            var frArr = Java.from(frKeys.toArray()).map(String);
            frArr.sort();
            if (frArr.length > 0) {
              console.log(
                '[registryDump] Forge direct structure registry size=' +
                  frArr.length
              );
              structures = frArr;
            }
          }
        }
      } catch (_frdir) {
        console.log(
          '[registryDump] Forge direct STRUCTURE fallback error: ' + _frdir
        );
      }
    }
    // Extra diagnostika pro struktury
    if (!structures || structures.length === 0) {
      try {
        console.log(
          '[registryDump][diag] STRUCTURES prázdné po primárních pokusech'
        );
        console.log(
          '[registryDump][diag] structureKey=' + (structureKey ? 'OK' : 'NULL')
        );
        try {
          console.log(
            '[registryDump][diag] BuiltInRegistries.STRUCTURE dostupné=' +
              !!(BuiltInRegistries && BuiltInRegistries.STRUCTURE)
          );
        } catch (_dsa) {}
        try {
          console.log(
            '[registryDump][diag] ForgeRegistries STRUCTURE_TYPES=' +
              !!(Java.type
                ? (function () {
                    try {
                      return Java.type(
                        'net.minecraftforge.registries.ForgeRegistries'
                      ).STRUCTURE_TYPES
                        ? true
                        : false;
                    } catch (e) {
                      return false;
                    }
                  })()
                : false)
          );
        } catch (_dfg) {}
        console.log(
          '[registryDump][diag] kubejsStructureIds=' +
            (kubejsStructureIds ? kubejsStructureIds.length : 'null')
        );
        console.log(
          '[registryDump][diag] DEBUG_SCAN=' +
            DEBUG_SCAN +
            ' DEBUG_BRUTE=' +
            DEBUG_BRUTE
        );
      } catch (_dslog) {}
    }
    var tS1 = Date.now();

    // New fallback via RegistryDumpHelper plugin (RegistryUtil binding)
    try {
      if (srvResolved && global && global.RegistryUtil) {
        if ((!biomes || biomes.length === 0) && global.RegistryUtil.getBiomes) {
          var pluginBiomes = global.RegistryUtil.getBiomes(srvResolved);
          if (pluginBiomes && pluginBiomes.length > 0) {
            console.log(
              '[registryDump] plugin RegistryUtil biomes size=' +
                pluginBiomes.length
            );
            biomes = pluginBiomes;
          }
        }
        if (
          (!entities || entities.length === 0) &&
          global.RegistryUtil.getEntityTypes
        ) {
          var pluginEntities = global.RegistryUtil.getEntityTypes(srvResolved);
          if (pluginEntities && pluginEntities.length > 0) {
            console.log(
              '[registryDump] plugin RegistryUtil entities size=' +
                pluginEntities.length
            );
            entities = pluginEntities;
          }
        }
        if (
          (!structures || structures.length === 0) &&
          global.RegistryUtil.getStructures
        ) {
          var pluginStructures = global.RegistryUtil.getStructures(srvResolved);
          if (pluginStructures && pluginStructures.length > 0) {
            console.log(
              '[registryDump] plugin RegistryUtil structures size=' +
                pluginStructures.length
            );
            structures = pluginStructures;
          }
        }
      }
    } catch (_plg) {
      console.log('[registryDump] plugin RegistryUtil fallback error: ' + _plg);
    }

    // Write to JSON files in /exports
    // Only write if we have non-zero values (prevents overwriting valid data with nulls on unsuccessful late attempt)
    if (biomes.length || entities.length || structures.length) {
      console.log(
        '[registryDump] Writing files: biomes=' +
          biomes.length +
          ' entities=' +
          entities.length +
          ' structures=' +
          structures.length
      );

      var writeSuccess = { biomes: false, entities: false, structures: false };

      // Debug: Zkontroluj dostupnost RegistryUtil
      console.log('[registryDump] Checking RegistryUtil availability...');
      console.log(
        '[registryDump] global.RegistryUtil exists: ' + !!global.RegistryUtil
      );
      if (global.RegistryUtil) {
        console.log(
          '[registryDump] RegistryUtil type: ' + typeof global.RegistryUtil
        );
        console.log(
          '[registryDump] RegistryUtil.writeJsonFile exists: ' +
            !!global.RegistryUtil.writeJsonFile
        );
        console.log(
          '[registryDump] RegistryUtil.writeJsonFile type: ' +
            typeof global.RegistryUtil.writeJsonFile
        );
      }

      // Primary method: RegistryUtil.writeJsonFile (Java NIO)
      // Try to use writeJsonFile even if typeof is not 'function' (Java methods may be different type)
      if (global.RegistryUtil && global.RegistryUtil.writeJsonFile) {
        console.log(
          '[registryDump] Using RegistryUtil.writeJsonFile (Java NIO)...'
        );

        try {
          var biomesJson = JSON.stringify(biomes, null, 2);
          writeSuccess.biomes = global.RegistryUtil.writeJsonFile(
            'exports/biomes.json',
            biomesJson,
            mcServer
          );
          console.log(
            '[registryDump] biomes.json: ' +
              (writeSuccess.biomes
                ? 'OK (' + biomes.length + ' entries)'
                : 'FAILED')
          );
        } catch (e) {
          console.log('[registryDump] biomes.json error: ' + e);
        }

        try {
          var entitiesJson = JSON.stringify(entities, null, 2);
          writeSuccess.entities = global.RegistryUtil.writeJsonFile(
            'exports/entities.json',
            entitiesJson,
            mcServer
          );
          console.log(
            '[registryDump] entities.json: ' +
              (writeSuccess.entities
                ? 'OK (' + entities.length + ' entries)'
                : 'FAILED')
          );
        } catch (e) {
          console.log('[registryDump] entities.json error: ' + e);
        }

        try {
          var structuresJson = JSON.stringify(structures, null, 2);
          writeSuccess.structures = global.RegistryUtil.writeJsonFile(
            'exports/structures.json',
            structuresJson,
            mcServer
          );
          console.log(
            '[registryDump] structures.json: ' +
              (writeSuccess.structures
                ? 'OK (' + structures.length + ' entries)'
                : 'FAILED')
          );
        } catch (e) {
          console.log('[registryDump] structures.json error: ' + e);
        }
      } else {
        console.log(
          '[registryDump] WARNING: RegistryUtil.writeJsonFile not available!'
        );
        console.log('[registryDump] Using emergency text-based fallback...');
        console.log(
          '[registryDump] NOTE: exports folder should be created by Java plugin at startup'
        );

        // Emergency fallback: Write all data to single object
        // JsonIO fails on array write, but object with properties works
        try {
          var allData = {
            biomes: biomes,
            entities: entities,
            structures: structures,
            _metadata: {
              timestamp: String(new Date()),
              counts: {
                biomes: biomes.length,
                entities: entities.length,
                structures: structures.length,
              },
              note: 'Split this file manually or restart server to use helper mod',
            },
          };
          JsonIO.write('exports/registry-data-all.json', allData);
          console.log(
            '[registryDump] Emergency: Written all data to registry-data-all.json'
          );
          console.log(
            '[registryDump] IMPORTANT: Restart server and use !dumpregs to generate individual files.'
          );
          writeSuccess.biomes = true;
          writeSuccess.entities = true;
          writeSuccess.structures = true;
        } catch (emergencyErr) {
          console.log(
            '[registryDump] Emergency fallback also failed: ' + emergencyErr
          );
          console.log(
            '[registryDump] CRITICAL: Cannot write files. Restart server with updated helper mod!'
          );
        }
      }
      console.log(
        '[registryDump] Write status: biomes=' +
          writeSuccess.biomes +
          ' entities=' +
          writeSuccess.entities +
          ' structures=' +
          writeSuccess.structures
      );
      try {
        var summary = {
          biomes: biomes.length,
          entities: entities.length,
          structures: structures.length,
          t_biomes_ms: tB1 - tB0,
          t_entities_ms: tE1 - tE0,
          t_structures_ms: tS1 - tS0,
          t_total_ms: Date.now() - (global.__kjs_registry_dump_start_ms || 0),
          ts: String(new Date()),
        };
        JsonIO.write('exports/registry-dump.summary.json', summary);
        JsonIO.write('exports/_probe.json', {
          ok: true,
          ts: summary.ts,
        });
      } catch (e) {
        console.log('[registryDump] write summary/probe: ' + e);
      }

      // Call split function to create individual files
      try {
        // Try various ways to call split function
        if (global.RegistryUtil && global.RegistryUtil.splitRegistryData) {
          console.log(
            '[registryDump] Calling RegistryUtil.splitRegistryData...'
          );
          global.RegistryUtil.splitRegistryData();
          console.log('[registryDump] Split completed!');
        } else if (
          global.splitRegistryData &&
          typeof global.splitRegistryData === 'function'
        ) {
          console.log('[registryDump] Calling global.splitRegistryData...');
          global.splitRegistryData();
          console.log('[registryDump] Split completed!');
        } else {
          console.log(
            '[registryDump] WARNING: splitRegistryData not available (neither RegistryUtil.splitRegistryData nor global.splitRegistryData)'
          );
        }
      } catch (e) {
        console.log('[registryDump] ERROR calling splitRegistryData: ' + e);
      }
    } else {
      console.log('[registryDump] skipped writing JSON (all empty)');
    }

    // Brief summary to logs
    console.log(`[registryDump] BIOMES: ${biomes.length}`);
    console.log(`[registryDump] ENTITIES: ${entities.length}`);
    console.log(`[registryDump] STRUCTURES: ${structures.length}`);
    return true;
  } catch (err) {
    console.log('[registryDump] unexpected error: ' + err);
    return false;
  } finally {
    // Release runtime lock
    global.__kjs_registry_dump_running = false;
  }
}

// Run after world/server load so registries are available
ServerEvents.loaded((event) => {
  if (global.__kjs_registry_dump_done || global.__kjs_registry_dump_running)
    return;
  if (dumpRegistries(event.server)) {
    global.__kjs_registry_dump_done = true;
  }
});

// Later fallback via first server tick

// Backup trigger on player login (if loaded didn't trigger)
PlayerEvents.loggedIn((event) => {
  if (global.__kjs_registry_dump_done || global.__kjs_registry_dump_running)
    return;
  var ok = dumpRegistries(
    event.player && event.player.getServer && event.player.getServer()
  );
  if (ok) {
    global.__kjs_registry_dump_done = true;
  } else {
    console.log(
      '[registryDump] loggedIn attempt failed (registry access not ready)'
    );
    // Initialize delayed dump after 40 ticks
    global.__kjs_registry_login_tick = 0;
  }
});

// Last resort: first server tick
ServerEvents.tick((event) => {
  if (global.__kjs_registry_dump_done || global.__kjs_registry_dump_running)
    return;
  if (!global.__kjs_registry_tick_stopped) {
    global.__kjs_registry_dump_attempts++;
    var ok = dumpRegistries(event.server);
    if (ok) {
      global.__kjs_registry_dump_done = true;
    } else if (
      global.__kjs_registry_dump_attempts >=
      global.__kjs_registry_max_tick_attempts
    ) {
      console.log(
        '[registryDump] stopping fast attempts after ' +
          global.__kjs_registry_max_tick_attempts +
          ' failed tries'
      );
      global.__kjs_registry_tick_stopped = true; // stop quick attempts but don't mark done - leave room for delayed attempt
    } else if (global.__kjs_registry_dump_attempts % 5 === 0) {
      console.log(
        `[registryDump] tick attempts so far: ${global.__kjs_registry_dump_attempts}`
      );
    }
  }
  // Delayed attempt after login: wait 40 ticks, then try once more (if original quick attempts gave up too early)
  if (
    !global.__kjs_registry_delayed_attempt_done &&
    global.__kjs_registry_login_tick >= 0
  ) {
    global.__kjs_registry_login_tick++;
    if (global.__kjs_registry_login_tick === 40) {
      console.log('[registryDump] delayed attempt after 40 ticks');
      var delayedOk = dumpRegistries(event.server);
      global.__kjs_registry_delayed_attempt_done = true;
      if (delayedOk) {
        global.__kjs_registry_dump_done = true;
      } else {
        console.log('[registryDump] delayed attempt failed');
      }
    }
  }
  // Chat retry scheduling: if chat trigger was unsuccessful (empty registries) sets counter = 0 and we wait 20 ticks here
  if (
    global.__kjs_registry_chat_retry_counter >= 0 &&
    !global.__kjs_registry_dump_done
  ) {
    global.__kjs_registry_chat_retry_counter++;
    if (global.__kjs_registry_chat_retry_counter === 20) {
      console.log('[registryDump] chat delayed retry attempt');
      var srv = global.__kjs_registry_chat_retry_server
        ? global.__kjs_registry_chat_retry_server
        : event.server;
      var ok2 = dumpRegistries(srv);
      if (ok2) {
        global.__kjs_registry_dump_done = true;
        console.log('[registryDump] chat delayed retry SUCCESS');
      } else {
        console.log('[registryDump] chat delayed retry still empty');
        // next retry if didn't exceed limit
        if (global.__kjs_registry_chat_retry_max > 0) {
          global.__kjs_registry_chat_retry_max--;
          global.__kjs_registry_chat_retry_counter = 0; // restart timing for next attempt
        } else {
          global.__kjs_registry_chat_retry_counter = -1; // konec
        }
      }
    }
  }
});

// Chat fallback: !dumpregs runs manually (if regular events don't trigger)
PlayerEvents.chat((e) => {
  if (
    String(e.message || '')
      .trim()
      .toLowerCase() !== '!dumpregs'
  )
    return;
  if (global.__kjs_registry_dump_done) {
    e.player.tell('[registryDump] už hotovo (skip)');
    e.cancel();
    return;
  }
  global.__kjs_rd_tmp_srv =
    e.player && e.player.getServer && e.player.getServer();
  var __rd_srvResolvedChat = resolveMcServer(global.__kjs_rd_tmp_srv);
  var canAccess = false;
  try {
    canAccess = !!(
      __rd_srvResolvedChat &&
      (__rd_srvResolvedChat.registryAccess
        ? __rd_srvResolvedChat.registryAccess()
        : __rd_srvResolvedChat.getRegistryAccess
        ? __rd_srvResolvedChat.getRegistryAccess()
        : null)
    );
  } catch (_) {}
  if (!canAccess) {
    e.player.tell(
      '[registryDump] server context not ready, scheduling delayed retry'
    );
    global.__kjs_registry_chat_retry_server = global.__kjs_rd_tmp_srv;
    global.__kjs_registry_chat_retry_counter = 0;
    e.cancel();
    return;
  }
  global.__kjs_rd_tmp_ok = dumpRegistries(global.__kjs_rd_tmp_srv);
  e.player.tell(
    `[registryDump] manual ${global.__kjs_rd_tmp_ok ? 'OK' : 'FAILED'}${
      global.__kjs_rd_tmp_ok ? '' : ' (will retry)'
    }`
  );
  e.cancel();
  if (global.__kjs_rd_tmp_ok) {
    global.__kjs_registry_dump_done = true;
  } else if (global.__kjs_registry_chat_retry_counter < 0) {
    global.__kjs_registry_chat_retry_server = global.__kjs_rd_tmp_srv;
    global.__kjs_registry_chat_retry_counter = 0;
  }
});

// Skipped: Command registration not available in your KubeJS version via unified API - omitted for clean logs.

// Skipped: hooking data events caused errors in your KubeJS version.
