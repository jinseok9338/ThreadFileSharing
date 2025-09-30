/* eslint-disable @typescript-eslint/no-explicit-any */

import * as csv from "fast-csv";
import * as fs from "fs";
import { forEach, set } from "lodash-es";
import * as path from "path";
import { createLogger } from "vite";

const logger = createLogger("info", { prefix: "[language]" });

const _dirname = path.resolve();

const schema: any = {
	category: "category",
	key: "key",
};

const writeFile = (langPath: string, data: { [key: string]: object }) => {
	forEach(data, (localize: any, lang: string) => {
		const filePath = path.join(_dirname, langPath, `translation.${lang}.json`);
		fs.writeFileSync(filePath, JSON.stringify(localize, null, 2));
	});
};

export default function languageUpdate(config: II18nConfig) {
	config.support.forEach((lang) => {
		if (schema[lang] === undefined) {
			schema[lang] = lang;
		}
	});

	const localize: any = {};
	config.support.forEach((lang) => {
		localize[lang] = {};
	});

	const csvFilePath = path.join(_dirname, config.csvFile);

	fs.createReadStream(csvFilePath)
		.pipe(csv.parse({ headers: true }))
		.on("data", (row: any) => {
			try {
				const key = [...row[schema.category].split("."), row[schema.key]];

				if (
					!Number.isNaN(parseInt(row[schema.key])) &&
					typeof parseInt(row[schema.key]) === "number"
				) {
					logger.warn(
						`${row[schema.category]}-${
							row[schema.key]
						} is not valid. Change the key or category.`,
					);
					return;
				}

				config.support.forEach((lang) => {
					if (row[lang] !== undefined) {
						const processedValue = row[lang].replace(/\\n/g, "\n");
						set(localize[lang], key, processedValue);
					}
				});
			} catch (error) {
				console.error("Error processing row:", row, error);
			}
		})
		.on("end", () => {
			try {
				writeFile(config.outputPath, localize);
				logger.info(`${config.csvFile} has been processed.`, {
					timestamp: true,
				});
			} catch (error) {
				console.error("Error writing files:", error);
			}
		})
		.on("error", (error) => {
			console.error("Error reading CSV file:", error);
		});
}
