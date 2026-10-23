import test from 'node:test';
import assert from 'node:assert/strict';
import { getJwtSecret } from '../src/config/security.js';

const withEnvironment = (values, callback) => {
  const previous = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]));
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }

  try {
    callback();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
};

test('uses the configured JWT secret', () => {
  withEnvironment({ NODE_ENV: 'production', JWT_SECRET: 'production-secret' }, () => {
    assert.equal(getJwtSecret(), 'production-secret');
  });
});

test('requires a JWT secret in production', () => {
  withEnvironment({ NODE_ENV: 'production', JWT_SECRET: undefined }, () => {
    assert.throws(getJwtSecret, /JWT_SECRET must be configured in production/);
  });
});

test('uses the development fallback outside production', () => {
  withEnvironment({ NODE_ENV: 'development', JWT_SECRET: undefined }, () => {
    assert.equal(getJwtSecret(), 'dev-secret');
  });
});
