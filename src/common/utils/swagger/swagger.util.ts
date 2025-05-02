import path from 'node:path';
import type { Router } from 'express';
import swaggerJsDoc from 'swagger-jsdoc';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';
import swaggerUi from 'swagger-ui-express';
import { CONFIG } from '#app/config';

const swaggerOptions = {
	definition: {
		openapi: '3.0.0', // OpenAPI version,
		info: {
			title: CONFIG.APP.NAME,
			version: CONFIG.APP.VERSION,
			description: CONFIG.APP.DESCRIPTION,
		},
		servers: [
			{
				url: `http://${CONFIG.APP.HOST}:${CONFIG.APP.PORT}/api`,
				description: 'Local server',
			},
		],
	},
	apis: [
		path.join(process.cwd(), 'src/modules/**/*.swagger.yaml'),
		path.join(process.cwd(), 'src/common/utils/swagger/components.yaml'),
		path.join(process.cwd(), 'src/common/utils/swagger/security.yaml'),
	],
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

export function configSwaggerV1(
	router: Router,
	swaggerDoc: swaggerUi.JsonObject = swaggerSpec,
): void {
	const theme = new SwaggerTheme();
	const darkTheme = theme.getDefaultConfig(SwaggerThemeNameEnum.DARK);
	router.use(
		'/docs',
		swaggerUi.serve,
		swaggerUi.setup(swaggerDoc, darkTheme),
	);
}
