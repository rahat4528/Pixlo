module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  roots: ['<rootDir>/src', '<rootDir>/../tests', '<rootDir>/../ingestion', '<rootDir>/../workers'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleDirectories: ['node_modules', '<rootDir>/node_modules'],
  moduleNameMapper: {
    '^@prisma/client$': '<rootDir>/node_modules/@prisma/client',
    '^fast-xml-parser$': '<rootDir>/node_modules/fast-xml-parser',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'node',
};
