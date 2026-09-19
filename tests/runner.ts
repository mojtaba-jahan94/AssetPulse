import { runPortfolioCalculatorTests } from './portfolioCalculator.test.ts';
import { runPriceAdaptersTests } from './priceAdapters.test.ts';
import { runDatabaseTests } from './database.test.ts';

async function main() {
  console.log('====================================================');
  console.log('       AssetPulse Test Suite & Sanity Runner        ');
  console.log('====================================================');

  const startTime = Date.now();

  const results = [
    await runDatabaseTests(),
    await runPriceAdaptersTests(),
    await runPortfolioCalculatorTests()
  ];

  const totalTime = Date.now() - startTime;
  let totalPassed = 0;
  let totalFailed = 0;

  console.log('\n================== SUMMARY =========================');
  for (const r of results) {
    totalPassed += r.passed;
    totalFailed += r.failed;
    const status = r.failed === 0 ? 'PASSED' : 'FAILED';
    console.log(`[${status}] ${r.suite.padEnd(22)}: ${r.passed} passed, ${r.failed} failed`);
  }
  console.log('----------------------------------------------------');
  console.log(`Total Passed: ${totalPassed} | Total Failed: ${totalFailed} | Time: ${totalTime}ms`);
  console.log('====================================================\n');

  if (totalFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
