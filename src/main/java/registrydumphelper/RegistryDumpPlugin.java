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
        // Pro jistotu povol i immutable mapu používanou uvnitř RegistryAccess
        filter.allow("java.util.ImmutableCollections$MapN");

        // Java NIO pro přímý zápis souborů (fallback když JsonIO selže)
        filter.allow("java.nio.file.Files");
        filter.allow("java.nio.file.Paths");
        filter.allow("java.nio.file.Path");
        filter.allow("java.nio.charset.StandardCharsets");
    }

    @Override
    public void registerBindings(BindingsEvent event) {
        event.add("RegistryUtil", new RegistryUtilBinding());
        LOGGER.info("KubeJS RegistryUtil binding registered v1.0.1");
    }
}
