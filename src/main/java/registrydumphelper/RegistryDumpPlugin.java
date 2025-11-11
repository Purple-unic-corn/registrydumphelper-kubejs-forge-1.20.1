package registrydumphelper;

import dev.latvian.mods.kubejs.KubeJSPlugin;
import dev.latvian.mods.kubejs.script.BindingsEvent;
import dev.latvian.mods.kubejs.script.ScriptType;
import dev.latvian.mods.kubejs.util.ClassFilter;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class RegistryDumpPlugin extends KubeJSPlugin {
    private static final Logger LOGGER = LogManager.getLogger("registrydumphelper");

    @Override
    public void registerClasses(ScriptType type, ClassFilter filter) {
        // Allow essential registry-related classes
        filter.allow("net.minecraft.core.registries.Registries");
        filter.allow("net.minecraft.resources.ResourceKey");
        filter.allow("net.minecraft.resources.ResourceLocation");
        filter.allow("net.minecraft.server.MinecraftServer");
        filter.allow("net.minecraft.core.Registry");
        // Added: direct access + nested impls used by registryAccess() result
        filter.allow("net.minecraft.core.RegistryAccess");
        filter.allow("net.minecraft.core.RegistryAccess$ImmutableRegistryAccess");
        filter.allow("net.minecraft.core.RegistryAccess$1FrozenAccess");
        filter.allow("net.minecraft.world.level.biome.Biome");
        filter.allow("net.minecraft.world.level.levelgen.structure.Structure");
        filter.allow("net.minecraft.world.entity.EntityType");

        // Additional classes needed to iterate registry internals (for STRUCTURE
        // entries esp.)
        // Without these the script reflection stops at Immutable Map and fails to reach
        // entries.
        filter.allow("java.util.Set");
        filter.allow("net.minecraft.core.MappedRegistry");
        filter.allow("net.minecraft.core.MappedRegistry$Entry");
        filter.allow("net.minecraft.core.WritableRegistry");
        filter.allow("net.minecraft.core.Holder");
        filter.allow("net.minecraft.core.Holder$Reference");
        filter.allow("net.minecraft.core.HolderSet");
        filter.allow("net.minecraft.core.HolderSet$Named");
        filter.allow("net.minecraft.world.level.levelgen.structure.StructureType");

        // Java util classes needed for reflection / iteration in binding & script
        // fallbacks
        filter.allow("java.util.Map");
        filter.allow("java.util.function.Consumer");
        filter.allow("java.util.stream.Stream");
        filter.allow("java.util.Iterator");
        filter.allow("java.util.Collection");
        // Allow immutable map implementation used by RegistryAccess
        filter.allow("java.util.ImmutableCollections$MapN");

        // Java NIO for direct file writing (fallback when JsonIO fails)
        filter.allow("java.nio.file.Files");
        filter.allow("java.nio.file.Paths");
        filter.allow("java.nio.file.Path");
        filter.allow("java.nio.charset.StandardCharsets");
    }

    @Override
    public void registerBindings(BindingsEvent event) {
        // Create exports folder at startup
        try {
            java.nio.file.Path exportsDir = java.nio.file.Paths.get("exports");
            if (!java.nio.file.Files.exists(exportsDir)) {
                java.nio.file.Files.createDirectories(exportsDir);
                LOGGER.info("✓ Created exports directory at startup: " + exportsDir.toAbsolutePath());
            } else {
                LOGGER.info("✓ Exports directory already exists: " + exportsDir.toAbsolutePath());
            }
        } catch (Exception e) {
            LOGGER.error("✗ Failed to create exports directory: " + e.getMessage(), e);
        }

        // Register binding
        RegistryUtilBinding binding = new RegistryUtilBinding();
        event.add("RegistryUtil", binding);

        // Register static method for splitting
        event.add("splitRegistryData", (Runnable) RegistryUtilBinding::splitRegistryDataAll);

        // Start background thread that waits for registry-data-all.json creation
        // and automatically splits it into individual files
        new Thread(() -> {
            try {
                java.nio.file.Path allDataFile = java.nio.file.Paths.get("exports/registry-data-all.json");

                // Wait up to 30 seconds for file creation
                for (int i = 0; i < 60; i++) {
                    Thread.sleep(500);
                    if (java.nio.file.Files.exists(allDataFile)) {
                        // File exists, wait a bit for write to complete
                        Thread.sleep(1000);
                        LOGGER.info("✓ Detected registry-data-all.json, auto-splitting...");
                        RegistryUtilBinding.splitRegistryDataAll();
                        break;
                    }
                }
            } catch (Exception e) {
                LOGGER.error("Auto-split thread error: " + e.getMessage());
            }
        }, "RegistryDump-AutoSplit").start();

        LOGGER.info("KubeJS RegistryUtil binding registered v1.0.3");
        LOGGER.info("  Binding class: " + binding.getClass().getName());
        LOGGER.info("  Event type: " + event.getClass().getName());
    }
}
