// `astro check` can't read .tsrx files, so it types their imports loosely.
// `tsrx-tsc` resolves the real files and checks them.
declare module '*.tsrx'
