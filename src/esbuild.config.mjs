import { build } from 'esbuild';

build({
  entryPoints: [
    './functions/auth/signUp.ts',
    './functions/auth/logIn.ts',
    './functions/auth/otpValidate.ts',
    './functions/auth/postConfirmationTrigger.ts',
    './functions/auth/refreshToken.ts',
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
