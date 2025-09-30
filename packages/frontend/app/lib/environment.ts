export interface EnvironmentConfig {
	name: string;
	color: string;
	enabled: boolean;
}

export const ENVIRONMENT_CONFIGS: Record<string, EnvironmentConfig> = {
	local: {
		name: "Local",
		color: "#06b6d4", // 청록색
		enabled: true,
	},
	development: {
		name: "Development",
		color: "#6366f1", // 파란색
		enabled: true,
	},
	staging: {
		name: "Staging",
		color: "#f59e0b", // 주황색
		enabled: true,
	},
	production: {
		name: "Production",
		color: "",
		enabled: false, // 프로덕션 환경은 항상 배너 비활성화
	},
	testing: {
		name: "Testing",
		color: "#8b5cf6", // 보라색
		enabled: true,
	},
	preview: {
		name: "Preview",
		color: "#ef4444", // 빨간색
		enabled: true,
	},
};

export function getEnvironmentConfig(): EnvironmentConfig {
	const envName = import.meta.env.VITE_APP_ENVIRONMENT;
	const envColor = import.meta.env.VITE_APP_ENVIRONMENT_COLOR;
	const envEnabled = import.meta.env.VITE_APP_ENVIRONMENT_BANNER_ENABLED;

	const defaultConfig =
		ENVIRONMENT_CONFIGS[envName] || ENVIRONMENT_CONFIGS.production;

	return {
		name: envName,
		color: envColor ? `#${envColor}` : defaultConfig.color,
		enabled:
			envEnabled !== undefined ? envEnabled !== "false" : defaultConfig.enabled,
	};
}
