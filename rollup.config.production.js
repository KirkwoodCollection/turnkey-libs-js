import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { visualizer } from 'rollup-plugin-visualizer';
import copy from 'rollup-plugin-copy';

const packageJson = require('./package.json');

const external = [
  ...Object.keys(packageJson.peerDependencies || {}),
  'react/jsx-runtime'
];

const commonPlugins = [
  peerDepsExternal(),
  resolve({
    browser: true,
    preferBuiltins: false
  }),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.build.json',
    exclude: ['**/*.test.ts', '**/*.test.tsx', '**/*.stories.tsx', 'tests/**/*']
  })
];

export default [
  // ESM build
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist/esm',
      format: 'es',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src'
    },
    external,
    plugins: [
      ...commonPlugins,
      copy({
        targets: [
          { src: 'README.md', dest: 'dist' },
          { src: 'CHANGELOG.md', dest: 'dist' },
          { src: 'package.json', dest: 'dist' }
        ]
      })
    ]
  },
  
  // CommonJS build
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist/cjs',
      format: 'cjs',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src',
      exports: 'named'
    },
    external,
    plugins: commonPlugins
  },
  
  // UMD build for CDN usage
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/umd/turnkey-libs.umd.js',
      format: 'umd',
      name: 'TurnkeyLibs',
      globals: {
        'react': 'React',
        'react-dom': 'ReactDOM'
      },
      sourcemap: true
    },
    external,
    plugins: [
      ...commonPlugins,
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true
        },
        mangle: {
          reserved: ['TurnkeyLibs']
        },
        format: {
          comments: false
        }
      }),
      visualizer({
        filename: 'dist/bundle-analysis.html',
        open: false,
        gzipSize: true
      })
    ]
  },
  
  // Minified UMD build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/umd/turnkey-libs.umd.min.js',
      format: 'umd',
      name: 'TurnkeyLibs',
      globals: {
        'react': 'React',
        'react-dom': 'ReactDOM'
      },
      sourcemap: true
    },
    external,
    plugins: [
      ...commonPlugins,
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true,
          passes: 2
        },
        mangle: {
          reserved: ['TurnkeyLibs']
        },
        format: {
          comments: false
        }
      })
    ]
  },
  
  // Core-only ESM build (without React dependencies)
  {
    input: 'src/core/index.ts',
    output: {
      dir: 'dist/core-esm',
      format: 'es',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src/core'
    },
    external: [],
    plugins: commonPlugins
  },
  
  // Core-only CommonJS build (without React dependencies)
  {
    input: 'src/core/index.ts',
    output: {
      dir: 'dist/core-cjs',
      format: 'cjs',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src/core',
      exports: 'named'
    },
    external: [],
    plugins: commonPlugins
  }
];