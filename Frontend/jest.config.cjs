module.exports = {
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.css$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  moduleFileExtensions: ['js', 'jsx']
};
