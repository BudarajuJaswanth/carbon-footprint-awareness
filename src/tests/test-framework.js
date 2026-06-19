/**
 * EcoTrace Lightweight Client-Side Test Framework
 */

// Global ledger of test suite execution results
window.testSuites = [];

let currentSuite = null;
let currentTest = null;

export function describe(suiteName, callback) {
  currentSuite = {
    name: suiteName,
    tests: [],
    stats: { passed: 0, failed: 0, total: 0 }
  };
  window.testSuites.push(currentSuite);

  try {
    callback();
  } catch (err) {
    console.error(`Error executing suite "${suiteName}":`, err);
    currentSuite.error = err.message || err;
  } finally {
    currentSuite = null;
  }
}

export function it(testName, callback) {
  if (!currentSuite) {
    throw new Error('Test case "it" must be called within a "describe" block.');
  }

  currentTest = {
    name: testName,
    passed: true,
    error: null
  };
  currentSuite.tests.push(currentTest);
  currentSuite.stats.total++;

  try {
    callback();
    if (currentTest.passed) {
      currentSuite.stats.passed++;
    }
  } catch (err) {
    currentTest.passed = false;
    currentTest.error = err.stack || err.message || String(err);
    currentSuite.stats.failed++;
  } finally {
    currentTest = null;
  }
}

export function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected: ${expected}\nReceived: ${actual}`);
      }
    },
    
    toEqual(expected) {
      const actStr = JSON.stringify(actual);
      const expStr = JSON.stringify(expected);
      if (actStr !== expStr) {
        throw new Error(`Expected structural equality:\nExpected: ${expStr}\nReceived: ${actStr}`);
      }
    },
    
    toBeGreaterThan(limit) {
      if (typeof actual !== 'number' || actual <= limit) {
        throw new Error(`Expected: ${actual} to be greater than ${limit}`);
      }
    },
    
    toBeLessThan(limit) {
      if (typeof actual !== 'number' || actual >= limit) {
        throw new Error(`Expected: ${actual} to be less than ${limit}`);
      }
    },
    
    toThrow(expectedErrorPattern) {
      let threw = false;
      let thrownError = null;
      try {
        actual();
      } catch (err) {
        threw = true;
        thrownError = err;
      }
      
      if (!threw) {
        throw new Error('Expected function to throw, but it executed successfully.');
      }
      
      if (expectedErrorPattern && thrownError) {
        const msg = thrownError.message || String(thrownError);
        if (!msg.includes(expectedErrorPattern)) {
          throw new Error(`Expected thrown error message ("${msg}") to contain: "${expectedErrorPattern}"`);
        }
      }
    }
  };
}
