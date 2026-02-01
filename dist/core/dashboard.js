"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDashboard = generateDashboard;
function generateDashboard(api, port, enableDelay, enableChaos) {
    const title = api.info.title;
    const version = api.info.version;
    const paths = api.paths || {};
    let endpointsHtml = '';
    Object.entries(paths).forEach(([pathName, pathItem]) => {
        if (!pathItem)
            return;
        const methods = ['get', 'post', 'put', 'delete', 'patch'];
        methods.forEach((method) => {
            if (pathItem[method]) {
                const methodStr = method.toUpperCase();
                let badgeClass = 'bg-gray-500';
                if (method === 'get')
                    badgeClass = 'bg-blue-500';
                if (method === 'post')
                    badgeClass = 'bg-green-500';
                if (method === 'put')
                    badgeClass = 'bg-yellow-500';
                if (method === 'delete')
                    badgeClass = 'bg-red-500';
                const summary = pathItem[method].summary || '';
                endpointsHtml += `
                <div class="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg scale-hover">
                    <div class="flex items-center space-x-4">
                        <span class="px-2 py-1 text-xs font-bold text-white rounded uppercase ${badgeClass} w-16 text-center">${methodStr}</span>
                        <code class="text-sm font-mono text-gray-700">${pathName}</code>
                        <span class="text-sm text-gray-500 truncate max-w-xs">${summary}</span>
                    </div>
                    <a href="http://localhost:${port}${pathName}" target="_blank" class="text-blue-500 hover:text-blue-700 text-sm font-medium">Test &rarr;</a>
                </div>
                `;
            }
        });
    });
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - MockDraft Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .scale-hover { transition: transform 0.1s ease-in-out; }
        .scale-hover:hover { transform: scale(1.01); }
    </style>
</head>
<body class="bg-gray-50 min-h-screen text-gray-800 font-sans">
    <div class="max-w-4xl mx-auto py-10 px-4">
        
        <!-- Header -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">MockDraft Dashboard</h1>
                <p class="text-gray-500 mt-1">Mocking <span class="font-semibold text-gray-800">${title}</span> v${version}</p>
            </div>
            <div class="flex space-x-2">
                <a href="/_postman/collection.json" class="flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition font-medium text-sm">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Postman Collection
                </a>
            </div>
        </div>

        <!-- Status Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div class="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex items-center space-x-3">
                <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div>
                    <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</h3>
                    <p class="font-bold text-gray-800">Online</p>
                </div>
            </div>

            <div class="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex items-center space-x-3">
                <div class="w-10 h-10 rounded-full ${enableDelay ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'} flex items-center justify-center">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                    <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Latency Sim</h3>
                    <p class="font-bold text-gray-800">${enableDelay ? 'Enabled (500-1500ms)' : 'Disabled'}</p>
                </div>
            </div>

            <div class="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex items-center space-x-3">
                <div class="w-10 h-10 rounded-full ${enableChaos ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'} flex items-center justify-center">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div>
                    <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Chaos Mode</h3>
                    <p class="font-bold text-gray-800">${enableChaos ? 'Enabled (10% Fail)' : 'Disabled'}</p>
                </div>
            </div>
        </div>

        <!-- Endpoints List -->
        <div class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h2 class="font-bold text-gray-700">Available Endpoints</h2>
                <span class="text-xs font-medium text-gray-400">Autogenerated from OpenAPI</span>
            </div>
            <div class="p-4 space-y-3">
                ${endpointsHtml || '<div class="text-center text-gray-400 py-8">No endpoints found in definition.</div>'}
            </div>
        </div>

        <div class="mt-8 text-center text-gray-400 text-sm">
            Powered by <a href="#" class="text-blue-500 hover:underline">MockDraft</a> • <a href="http://localhost:${port}/_mockdraft" class="hover:text-blue-500">Refresh Dashboard</a>
        </div>

    </div>
</body>
</html>
    `;
}
//# sourceMappingURL=dashboard.js.map