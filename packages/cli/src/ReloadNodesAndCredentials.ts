import { watch } from 'chokidar';

import { realpath, access } from 'fs/promises';

import { getInstance as getPushInstance } from '@/Push';
import { LoadNodesAndCredentialsClass } from '@/LoadNodesAndCredentials';
import path from 'path';
import { NodeTypes } from '@/NodeTypes';

const fileExists = async (filePath: string): Promise<boolean> => {
	try {
		await access(filePath);
		return true;
	} catch {
		return false;
	}
};

export const reloadNodesAndCredentials = (
	loadNodesAndCredentials: LoadNodesAndCredentialsClass,
) => {
	loadNodesAndCredentials.packagePaths.forEach(async (i) => {
		const realModulePath = path.join(await realpath(i), path.sep);

		const isLazyLoad =
			(await fileExists(path.join(realModulePath, 'dist/types/nodes.json'))) ||
			(await fileExists(path.join(realModulePath, 'dist/types/credentials.json')));

		const reloader = async () => {
			await loadNodesAndCredentials.reloadNodesFromBasePackage(i);
			await loadNodesAndCredentials.generateTypesForFrontend();
			NodeTypes().updateNodeTypes();
			const pushInstance = getPushInstance();
			pushInstance.send('nodeDescriptionUpdated', undefined);
		};

		let reloadTimeout: NodeJS.Timeout | undefined;

		const reload = () => {
			if (reloadTimeout !== undefined) {
				clearTimeout(reloadTimeout);
			}
			reloadTimeout = setTimeout(reloader, 100);
		};

		watch(i).on('change', async (p) => {
			if (isLazyLoad && !p.endsWith('/nodes.json') && !p.endsWith('/credentials.json')) {
				return;
			} else if (!isLazyLoad && !p.endsWith('.js')) {
				return;
			}

			Object.keys(require.cache).forEach((c) => {
				if (c.startsWith(realModulePath)) {
					delete require.cache[c];
				}
			});

			reload();
		});
	});
};
