import typescript from '@rollup/plugin-typescript';
import * as path from 'path';

const externalId = path.resolve( __dirname, '../src/index.ts' );

export default {
  input: 'playground/src/playground.ts',
  output: {
    file: 'playground/dist/playground.js',
    format: 'umd',
    name: "PretzelJSPlayGround",
    paths: {
      PretzelJS: externalId
    },
    globals: {
      [externalId]: 'PretzelJS'
    }
  },
  external: [externalId],
  plugins: [typescript({
  })]
};