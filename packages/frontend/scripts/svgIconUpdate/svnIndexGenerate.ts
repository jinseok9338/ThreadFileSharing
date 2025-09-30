import fs from "fs";
import path from "path";
import { createLogger } from "vite";
import fileExporter from "./fileExporter";

const _dirname = path.resolve();

const logger = createLogger("info", { prefix: "[svg icon]" });

function getAllDirectoryNames(srcPath: string): string[] {
	const directories: string[] = [srcPath];

	// 재귀적으로 폴더를 탐색하는 함수
	function readDirectories(currentPath: string) {
		// 현재 경로의 모든 파일 및 폴더 읽기
		const entries = fs.readdirSync(currentPath, { withFileTypes: true });

		// 각 항목에 대해 반복
		for (const entry of entries) {
			// 폴더인 경우
			if (entry.isDirectory()) {
				const dirPath = path.join(currentPath, entry.name);
				directories.push(dirPath);
				// 현재 폴더 내부를 재귀적으로 탐색
				readDirectories(dirPath);
			}
		}
	}

	readDirectories(srcPath);
	return directories;
}

function svgIndexGenerate(srcPath: string) {
	logger.info(`${srcPath} has been changed.`, { timestamp: true });

	if (!fs.existsSync(path.join(_dirname, srcPath))) {
		logger.error(`${srcPath} does not exist.`, { timestamp: true });
		return;
	}

	const directoryArray = getAllDirectoryNames(srcPath);
	directoryArray.forEach((directory) => {
		fileExporter(directory, ".svg");
	});
}

export default svgIndexGenerate;
