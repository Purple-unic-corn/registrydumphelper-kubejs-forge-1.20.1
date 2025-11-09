package registrydumphelper;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

public class RegistryUtilBinding {
    private static List<String> dump(Object registry) throws Exception {
        List<String> out = new ArrayList<>();
        if (registry == null)
            return out;

        // reg.entrySet()
        Method entrySetM = registry.getClass().getMethod("entrySet");
        Object entrySet = entrySetM.invoke(registry);
        if (!(entrySet instanceof Iterable<?> it))
            return out;

        for (Object entry : it) {
            if (entry == null)
                continue;
            Method getKey = entry.getClass().getMethod("getKey");
            Object key = getKey.invoke(entry);
            if (key == null)
                continue;
            try {
                Method location = key.getClass().getMethod("location");
                Object rl = location.invoke(key);
                if (rl != null)
                    out.add(rl.toString());
            } catch (NoSuchMethodException ignored) {
                // Fallback: try getLocation()
                try {
                    Method location = key.getClass().getMethod("getLocation");
                    Object rl = location.invoke(key);
                    if (rl != null)
                        out.add(rl.toString());
                } catch (NoSuchMethodException ignored2) {
                    // ignore
                }
            }
        }
        return out;
    }

    private static Object getRegistry(Object server, String registriesField) throws Exception {
        if (server == null)
            return null;
        // server.registryAccess()
        Method registryAccess = server.getClass().getMethod("registryAccess");
        Object access = registryAccess.invoke(server);

        // Registries.FIELD
        Class<?> registries = Class.forName("net.minecraft.core.registries.Registries");
        Field f = registries.getField(registriesField);
        Object key = f.get(null);

        // access.registryOrThrow(ResourceKey)
        Method registryOrThrow = access.getClass().getMethod("registryOrThrow", key.getClass());
        return registryOrThrow.invoke(access, key);
    }

    public List<String> getBiomes(Object server) {
        try {
            Object reg = getRegistry(server, "BIOME");
            return dump(reg);
        } catch (Throwable t) {
            return List.of();
        }
    }

    public List<String> getEntityTypes(Object server) {
        try {
            Object reg = getRegistry(server, "ENTITY_TYPE");
            return dump(reg);
        } catch (Throwable t) {
            return List.of();
        }
    }

    public List<String> getStructures(Object server) {
        try {
            Object reg = getRegistry(server, "STRUCTURE");
            return dump(reg);
        } catch (Throwable t) {
            return List.of();
        }
    }

    /**
     * Zapíše JSON string do souboru.
     * 
     * @param relativePath Relativní cesta k souboru (např.
     *                     "kubejs/exports/biomes.json")
     * @param jsonContent  JSON string k zapsání
     * @return true pokud úspěch, false při chybě
     */
    public boolean writeJsonFile(String relativePath, String jsonContent) {
        try {
            Path path = Paths.get(relativePath);
            // Vytvoř parent adresáře pokud neexistují
            if (path.getParent() != null) {
                Files.createDirectories(path.getParent());
            }
            // Zapiš soubor
            Files.writeString(path, jsonContent, StandardCharsets.UTF_8);
            return true;
        } catch (Throwable t) {
            System.err.println("[RegistryUtil] Failed to write " + relativePath + ": " + t.getMessage());
            return false;
        }
    }
}
