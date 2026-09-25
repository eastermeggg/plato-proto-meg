import {Config} from '@remotion/cli/config';
import {enableTailwind} from '@remotion/tailwind';
import path from 'path';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

// Fidélité « straight from DS » : on rend les VRAIS composants de src/.
// - Tailwind branché sur la config de l'app (light via fallbacks var()).
// - React / lucide aliasés vers le node_modules de l'app → un seul React,
//   mêmes versions que le produit.
// __dirname résout dans @remotion/cli au moment de l'éval du config ; on prend
// le cwd (= video-assistant/ quand on lance remotion) puis le parent = l'app.
const appRoot = path.resolve(process.cwd(), '..');

Config.overrideWebpackConfig((config) => {
  const withTw = enableTailwind(config);
  return {
    ...withTw,
    resolve: {
      ...withTw.resolve,
      alias: {
        ...(withTw.resolve?.alias ?? {}),
        react: path.join(appRoot, 'node_modules/react'),
        'react-dom': path.join(appRoot, 'node_modules/react-dom'),
        'lucide-react': path.join(appRoot, 'node_modules/lucide-react'),
      },
    },
  };
});
