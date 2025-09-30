import path from "path";
import type { Plugin } from "vite";
import svgIndexGenerate from "./svnIndexGenerate";

export default function svgIconUpdate(svgPath: string): Plugin {
	return {
		name: "svg-icon-update",
		enforce: "pre",
		configureServer(server) {
			const listener = (file = "") => {
				if (
					file.includes(path.normalize(svgPath)) &&
					path.extname(file) === ".svg"
				) {
					svgIndexGenerate(svgPath);
				}
			};
			server.watcher.on("add", listener);
			server.watcher.on("change", listener);
			server.watcher.on("unlink", listener);
		},
		buildStart(): Promise<void> {
			svgIndexGenerate(svgPath);
			return Promise.resolve();
		},
	};
}
