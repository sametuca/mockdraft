import express, { Request, Response } from 'express';
import { OpenAPI, OpenAPIV3 } from 'openapi-types';
import { Server } from 'http';
import jsf from 'json-schema-faker';
import { faker } from '@faker-js/faker';
import chalk from 'chalk';
import cors from 'cors';
import { generatePostmanCollection } from './postman';
import { generateDashboard } from './dashboard';

// Register faker with json-schema-faker for x-faker support
jsf.extend('faker', () => faker);

// Configure json-schema-faker options
jsf.option({
    alwaysFakeOptionals: true,
    failOnInvalidTypes: false,
    failOnInvalidFormat: false,
    useDefaultValue: true,
    useExamplesValue: true,
});

// Delay middleware for latency simulation
function delayMiddleware(minMs: number = 500, maxMs: number = 1500) {
    return (req: Request, _res: Response, next: express.NextFunction) => {
        const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
        console.log(chalk.yellow(`⏱️  Delaying ${req.method} ${req.url} by ${delay}ms`));
        setTimeout(() => next(), delay);
    };
}

// Chaos middleware for random failures
function chaosMiddleware(failureRate: number = 0.1) {
    return (req: Request, res: Response, next: express.NextFunction) => {
        const random = Math.random();
        if (random < failureRate) {
            console.log(chalk.red(`💥 Chaos: ${req.method} ${req.url} - Returning 500 error (${Math.round(failureRate * 100)}% chance)`));
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Simulated server failure (chaos mode)',
                timestamp: new Date().toISOString()
            });
            return;
        }
        next();
    };
}

export function createMockApp(api: OpenAPI.Document, enableDelay = false, enableChaos = false): express.Express {
    const app = express();

    // Enable CORS for all routes
    app.use(cors());

    app.use(express.json());

    // Add delay middleware if enabled
    if (enableDelay) {
        app.use(delayMiddleware());
    }

    // Add chaos middleware if enabled
    if (enableChaos) {
        app.use(chaosMiddleware());
    }

    // Log requests
    app.use((req, _res, next) => {
        console.log(`${chalk.gray(new Date().toISOString())} | ${req.method} ${req.url}`);
        next();
    });

    const paths = api.paths || {};

    Object.entries(paths).forEach(([pathName, pathItem]) => {
        if (!pathItem) return;

        // Convert OpenAPI path parameters {param} to Express :param
        const expressPath = pathName.replace(/\{([^}]+)\}/g, ':$1');

        const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'] as const;

        methods.forEach((method) => {
            // We need to assume it's V3 mainly, but access generically
            const operation = (pathItem as any)[method] as OpenAPIV3.OperationObject | undefined;

            if (operation) {
                // Removed verbose log: console.log(`Registering route: ...`);

                app[method](expressPath, async (_req: Request, res: Response) => {
                    try {
                        // Find a successful response (200, 201, or default)
                        const responses = operation.responses || {};
                        const successCode = Object.keys(responses).find(
                            (code) => code.startsWith('2') || code === 'default'
                        );

                        if (!successCode) {
                            res.status(500).json({ error: 'No success response defined in schema' });
                            return;
                        }

                        const response = responses[successCode] as OpenAPIV3.ResponseObject;

                        // Check for content/application/json
                        const content = response.content?.['application/json'];

                        if (content && content.schema) {
                            // Generate fake data
                            const fakeData = await jsf.resolve(content.schema);
                            res.status(parseInt(successCode) || 200).json(fakeData);
                        } else {
                            // No content defined, just send status
                            res.status(parseInt(successCode) || 200).send();
                        }
                    } catch (error) {
                        console.error('Error generating mock data:', error);
                        res.status(500).json({ error: 'Failed to generate mock data' });
                    }
                });
            }
        });
    });

    return app;
}

export function startMockServer(api: OpenAPI.Document, port: number, enableDelay = false, enableChaos = false): Server {
    const app = createMockApp(api, enableDelay, enableChaos);

    // Add Postman collection export endpoint
    app.get('/_postman/collection.json', (_req: Request, res: Response) => {
        try {
            const baseUrl = `http://localhost:${port}`;
            const collection = generatePostmanCollection(api, baseUrl);
            res.setHeader('Content-Disposition', 'attachment; filename="collection.json"');
            res.json(collection);
            console.log(chalk.cyan('📦 Postman collection exported'));
        } catch (error) {
            console.error('Error generating Postman collection:', error);
            res.status(500).json({ error: 'Failed to generate Postman collection' });
        }
    });

    // Add Dashboard endpoint
    app.get('/_mockdraft', (_req: Request, res: Response) => {
        const html = generateDashboard(api, port, enableDelay, enableChaos);
        res.send(html);
    });

    const server = app.listen(port, () => {
        console.log(chalk.green(`\n🚀 MockDraft server running at http://localhost:${port}`));
        console.log(chalk.dim(`   Serving mock API for: ${api.info.title} v${api.info.version}`));
        if (enableDelay) {
            console.log(chalk.yellow(`   ⏱️  Latency simulation: ENABLED (500-1500ms)`));
        }
        if (enableChaos) {
            console.log(chalk.red(`   💥 Chaos mode: ENABLED (10% random failures)`));
        }
        console.log(chalk.bold('\n🔗 Available Endpoints:'));

        const paths = api.paths || {};
        Object.entries(paths).forEach(([pathName, pathItem]) => {
            if (!pathItem) return;
            const methods = ['get', 'post', 'put', 'delete', 'patch'] as const;

            methods.forEach((method) => {
                if ((pathItem as any)[method]) {
                    const methodStr = method.toUpperCase().padEnd(6);
                    let color = chalk.white;
                    if (method === 'get') color = chalk.blue;
                    if (method === 'post') color = chalk.green;
                    if (method === 'put') color = chalk.yellow;
                    if (method === 'delete') color = chalk.red;

                    console.log(`   ${color(methodStr)} http://localhost:${port}${pathName}`);
                }
            });
        });

        console.log(chalk.cyan(`\n📦 Postman Collection: http://localhost:${port}/_postman/collection.json`));
        const dashboardUrl = `http://localhost:${port}/_mockdraft`;
        console.log(chalk.magenta(`✨ Dashboard:          ${dashboardUrl}`));
        console.log(''); // Empty line

        // Open dashboard in browser
        import('open').then((open) => {
            open.default(dashboardUrl).catch(() => {
                // Ignore error if browser fails to open (e.g. in headless environment)
            });
        });
    });

    return server;
}
