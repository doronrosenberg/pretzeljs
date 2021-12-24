import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/bundle.js',
      format: 'umd',
      name: "PretzelJS"
    },
    {
      dir: "dist/bundle.esm.js",
      format: "es",
      name: "PretzelJS"
    },
  ],

  plugins: [typescript()]
};