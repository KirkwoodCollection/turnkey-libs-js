const typescript = require('@rollup/plugin-typescript');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const terser = require('@rollup/plugin-terser');

module.exports = [
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
    external: ['react', 'react-dom'],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false, // We generate declarations separately
        declarationMap: false,
        outDir: undefined // Remove outDir conflict
      }),
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs()
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
    external: ['react', 'react-dom'],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false, // Only generate declarations once
        declarationMap: false,
        outDir: undefined // Remove outDir conflict
      }),
      resolve({
        preferBuiltins: false
      }),
      commonjs()
    ]
  },
  // UMD build for CDN
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/umd/turnkey-libs.min.js',
      format: 'umd',
      name: 'TurnkeyLibs',
      sourcemap: true,
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM'
      }
    },
    external: ['react', 'react-dom'],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
        outDir: undefined // Remove outDir conflict
      }),
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      terser({
        format: {
          comments: false
        },
        mangle: {
          keep_fnames: true // Keep function names for better debugging
        }
      })
    ]
  },
  // Core-only ESM build (without React)
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
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
        outDir: undefined // Remove outDir conflict
      }),
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs()
    ]
  },
  // Core-only CommonJS build (without React)
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
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
        outDir: undefined // Remove outDir conflict
      }),
      resolve({
        preferBuiltins: false
      }),
      commonjs()
    ]
  }
];