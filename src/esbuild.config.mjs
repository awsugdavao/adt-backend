import { build } from 'esbuild';

build({
  entryPoints: [
    './src/auth/signUp.ts',
    './src/auth/signIn.ts',
    './src/auth/preSignUpTrigger.ts',
  ],
  entryNames: '[name]/index',
  outdir: 'dist',
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node22',
  sourcemap: false,
  minify: false,
  logLevel: 'info',
}).catch(() => process.exit(1));
