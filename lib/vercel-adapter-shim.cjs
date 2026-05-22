"use strict";

/**
 * Next.js 16.2.x passes only { phase, nextVersion } to adapter modifyConfig, but the
 * Vercel adapter expects projectDir when preview comments are enabled. Forward with cwd.
 */
const realAdapterPath = process.env.NEXT_ADAPTER_PATH;

if (!realAdapterPath) {
  module.exports = {
    name: "Passthrough",
    modifyConfig(config) {
      return config;
    },
  };
} else {
  const real = require(realAdapterPath);

  module.exports = {
    name: real.name ?? "Vercel",
    async modifyConfig(config, ctx) {
      if (typeof real.modifyConfig !== "function") {
        return config;
      }
      return real.modifyConfig(config, {
        ...ctx,
        projectDir: ctx.projectDir ?? process.cwd(),
      });
    },
    onBuildComplete: real.onBuildComplete,
  };
}
