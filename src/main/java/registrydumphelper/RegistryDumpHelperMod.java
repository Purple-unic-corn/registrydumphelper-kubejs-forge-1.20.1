package registrydumphelper;

import net.minecraftforge.fml.common.Mod;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

@Mod("registrydumphelper")
public final class RegistryDumpHelperMod {
	private static final Logger LOGGER = LogManager.getLogger("registrydumphelper");

	public RegistryDumpHelperMod() {
		LOGGER.info("Forge mod constructed v1.0.1 (logger active)");
	}
}
