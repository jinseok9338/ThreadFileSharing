/* eslint-disable @typescript-eslint/naming-convention */
import fs from "fs";
import path from "path";

const _dirname = path.resolve();

function toCamelCase(str: string): string {
	return str.replace(/([-_][a-z])/gi, ($1) => {
		return $1.toUpperCase().replace("-", "").replace("_", "");
	});
}
function fileExporter(dir: string, extension: string) {
	const directoryPath = path.join(_dirname, dir);

	fs.readdir(directoryPath, (err, files) => {
		if (err) {
			return console.log("Unable to scan directory: " + err);
		}

		const svgFiles = files.filter(
			(file) => path.extname(file).toLowerCase() === extension,
		);

		if (svgFiles.length === 0) return;

		let importStatements = "";
		const exportNames: string[] = [];

		svgFiles.forEach((file) => {
			const baseName = path.basename(file, extension);
			const camelCaseName = toCamelCase(baseName);
			const importName = `${camelCaseName.charAt(0).toUpperCase() + camelCaseName.slice(1)}`;
			importStatements += `import ${importName} from './${file}${
				extension === ".svg" ? "?react'" : "'"
			};\n`;
			exportNames.push(importName);
		});

		const exportStatement = `export {\n  ${exportNames.join(",\n  ")}\n};\n`;

		fs.writeFile(
			path.join(directoryPath, "index.ts"),
			importStatements + "\n" + exportStatement,
			(err) => {
				if (err) throw err;
			},
		);
	});
}

export default fileExporter;
