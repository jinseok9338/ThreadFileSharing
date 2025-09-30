import path from "path";
import type { Plugin } from "vite";
import languageGenerate from "./languageGenerate";

export default function languageUpdate(config: II18nConfig): Plugin {
	return {
		name: "language-update",
		enforce: "pre",
		configureServer(server) {
			const listener = (file = "") =>
				file.includes(path.normalize(config.csvFile))
					? languageGenerate(config)
					: null;
			server.watcher.on("add", listener);
			server.watcher.on("change", listener);
		},
		buildStart(): Promise<void> {
			languageGenerate(config);
			return Promise.resolve();
		},
	};
}
