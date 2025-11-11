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
     * Gets the absolute path to game directory from Minecraft server.
     * 
     * @param server MinecraftServer instance
     * @return Path to game directory or null on error
     */
    private static Path getGameDirectory(Object server) {
        try {
            System.out.println("[RegistryUtil] Getting game directory, server = "
                    + (server != null ? server.getClass().getName() : "null"));

            if (server == null) {
                System.out.println("[RegistryUtil] Server is null, using current directory");
                return Paths.get(".").toAbsolutePath().normalize();
            }

            // Try server.getServerDirectory() (Forge 1.20.1)
            try {
                Method getServerDirectory = server.getClass().getMethod("getServerDirectory");
                Object dirObj = getServerDirectory.invoke(server);
                System.out.println("[RegistryUtil] getServerDirectory() returned: " + dirObj);
                if (dirObj != null) {
                    if (dirObj instanceof Path) {
                        Path result = ((Path) dirObj).toAbsolutePath().normalize();
                        System.out.println("[RegistryUtil] Using Path from getServerDirectory: " + result);
                        return result;
                    } else if (dirObj instanceof java.io.File) {
                        Path result = ((java.io.File) dirObj).toPath().toAbsolutePath().normalize();
                        System.out.println("[RegistryUtil] Using File from getServerDirectory: " + result);
                        return result;
                    }
                }
            } catch (NoSuchMethodException e) {
                System.out.println("[RegistryUtil] getServerDirectory() method not found");
            } catch (Exception e) {
                System.err.println("[RegistryUtil] Error calling getServerDirectory(): " + e.getMessage());
            }

            // Try server.getFile("") (older versions)
            try {
                Method getFile = server.getClass().getMethod("getFile", String.class);
                Object dirObj = getFile.invoke(server, "");
                System.out.println("[RegistryUtil] getFile(\"\") returned: " + dirObj);
                if (dirObj instanceof java.io.File) {
                    Path result = ((java.io.File) dirObj).toPath().toAbsolutePath().normalize();
                    System.out.println("[RegistryUtil] Using File from getFile: " + result);
                    return result;
                }
            } catch (NoSuchMethodException e) {
                System.out.println("[RegistryUtil] getFile() method not found");
            } catch (Exception e) {
                System.err.println("[RegistryUtil] Error calling getFile(): " + e.getMessage());
            }

            // Fallback to current directory
            System.out.println("[RegistryUtil] Using fallback: current directory");
            return Paths.get(".").toAbsolutePath().normalize();
        } catch (Throwable t) {
            System.err.println("[RegistryUtil] Failed to get game directory: " + t.getMessage());
            t.printStackTrace();
            return Paths.get(".").toAbsolutePath().normalize();
        }
    }

    /**
     * Writes JSON string to file in game directory.
     * 
     * @param relativePath Relative file path (e.g., "exports/biomes.json")
     * @param jsonContent  JSON string to write
     * @return true if success, false on error
     */
    public boolean writeJsonFile(String relativePath, String jsonContent) {
        return writeJsonFile(relativePath, jsonContent, null);
    }

    /**
     * Writes JSON string to file in game directory.
     * 
     * @param relativePath Relative file path (e.g., "exports/biomes.json")
     * @param jsonContent  JSON string to write
     * @param server       MinecraftServer instance (can be null for fallback)
     * @return true if success, false on error
     */
    public boolean writeJsonFile(String relativePath, String jsonContent, Object server) {
        System.out.println("[RegistryUtil] ========== writeJsonFile START ==========");
        System.out.println("[RegistryUtil] relativePath: " + relativePath);
        System.out
                .println("[RegistryUtil] jsonContent length: " + (jsonContent != null ? jsonContent.length() : "null"));
        System.out.println("[RegistryUtil] server: " + (server != null ? server.getClass().getName() : "null"));

        try {
            // Get game directory
            Path gameDir = getGameDirectory(server);
            if (gameDir == null) {
                System.err.println("[RegistryUtil] ERROR: gameDir is null, using current directory");
                gameDir = Paths.get(".").toAbsolutePath().normalize();
            }

            System.out.println("[RegistryUtil] Game directory resolved to: " + gameDir.toAbsolutePath());

            // Create exports folder if it doesn't exist
            Path exportsDir = gameDir.resolve("exports");
            System.out.println("[RegistryUtil] Exports directory path: " + exportsDir.toAbsolutePath());
            System.out.println("[RegistryUtil] Exports directory exists before creation: " + Files.exists(exportsDir));

            if (!Files.exists(exportsDir)) {
                System.out.println("[RegistryUtil] Creating exports directory...");
                Files.createDirectories(exportsDir);
                System.out.println("[RegistryUtil] ✓ Created exports directory: " + exportsDir.toAbsolutePath());
            } else {
                System.out.println("[RegistryUtil] ✓ Exports directory already exists: " + exportsDir.toAbsolutePath());
            }

            System.out.println("[RegistryUtil] Exports directory exists after creation: " + Files.exists(exportsDir));

            // Create absolute path to file
            Path path = gameDir.resolve(relativePath).normalize();
            System.out.println("[RegistryUtil] Full file path: " + path.toAbsolutePath());

            // Create all parent directories if they don't exist
            if (path.getParent() != null) {
                System.out.println("[RegistryUtil] Creating parent directories: " + path.getParent().toAbsolutePath());
                Files.createDirectories(path.getParent());
                System.out.println("[RegistryUtil] ✓ Parent directory structure verified");
            }

            // Write file
            System.out.println("[RegistryUtil] Writing file...");
            Files.writeString(path, jsonContent, StandardCharsets.UTF_8);
            System.out.println("[RegistryUtil] ✓✓✓ File written successfully: " + path.getFileName());
            System.out.println("[RegistryUtil] ========== writeJsonFile SUCCESS ==========");
            return true;
        } catch (Throwable t) {
            System.err.println("[RegistryUtil] ✗✗✗ FAILED to write " + relativePath + ": " + t.getMessage());
            t.printStackTrace();
            System.err.println("[RegistryUtil] ========== writeJsonFile FAILED ==========");
            return false;
        }
    }

    /**
     * Instance method for calling from JavaScript
     */
    public void splitRegistryData() {
        splitRegistryDataAll();
    }

    /**
     * Splits registry-data-all.json into individual files.
     * Static method for easy calling from JavaScript.
     */
    public static void splitRegistryDataAll() {
        try {
            Path allDataFile = Paths.get("exports/registry-data-all.json");
            if (!Files.exists(allDataFile)) {
                System.err.println("[RegistryUtil] registry-data-all.json does not exist");
                return;
            }

            System.out.println("[RegistryUtil] Reading registry-data-all.json...");
            String content = Files.readString(allDataFile, StandardCharsets.UTF_8);

            // Jednoduchý JSON parser pro naše účely
            // Hledáme "biomes": [array], "entities": [array], "structures": [array]
            String[] sections = { "biomes", "entities", "structures" };

            for (String section : sections) {
                try {
                    int startIdx = content.indexOf("\"" + section + "\"");
                    if (startIdx == -1)
                        continue;

                    int arrayStart = content.indexOf("[", startIdx);
                    if (arrayStart == -1)
                        continue;

                    int arrayEnd = findMatchingBracket(content, arrayStart);
                    if (arrayEnd == -1)
                        continue;

                    String arrayContent = content.substring(arrayStart, arrayEnd + 1);
                    Path outFile = Paths.get("exports/" + section + ".json");
                    Files.writeString(outFile, arrayContent, StandardCharsets.UTF_8);
                    System.out.println("[RegistryUtil] ✓ Created " + section + ".json");
                } catch (Exception e) {
                    System.err.println("[RegistryUtil] Failed to extract " + section + ": " + e.getMessage());
                }
            }

            System.out.println("[RegistryUtil] ✓✓✓ Split completed successfully!");
        } catch (Throwable t) {
            System.err.println("[RegistryUtil] Failed to split registry-data-all.json: " + t.getMessage());
            t.printStackTrace();
        }
    }

    private static int findMatchingBracket(String s, int start) {
        int depth = 0;
        for (int i = start; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '[')
                depth++;
            else if (c == ']') {
                depth--;
                if (depth == 0)
                    return i;
            }
        }
        return -1;
    }
}
