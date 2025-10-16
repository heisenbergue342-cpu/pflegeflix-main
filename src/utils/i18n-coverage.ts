/**
 * I18N Coverage Check Utility
 * 
 * This utility ensures 100% translation coverage for employer routes.
 * Run this during build to fail if any untranslated keys are detected.
 */

import { translations } from '@/contexts/LanguageContext';

interface CoverageReport {
  total: number;
  missing: string[];
  coverage: number;
  passed: boolean;
}

/**
 * Check if all required keys exist in both DE and EN translations
 */
export function checkTranslationCoverage(requiredNamespaces: string[] = []): CoverageReport {
  const de = translations.de;
  const en = translations.en;
  
  const deKeys = Object.keys(de);
  const enKeys = Object.keys(en);
  
  const missing: string[] = [];
  
  // Check if all DE keys exist in EN
  deKeys.forEach(key => {
    if (!en[key]) {
      missing.push(`EN missing: ${key}`);
    }
  });
  
  // Check if all EN keys exist in DE
  enKeys.forEach(key => {
    if (!de[key]) {
      missing.push(`DE missing: ${key}`);
    }
  });
  
  // If specific namespaces are required, check them
  if (requiredNamespaces.length > 0) {
    requiredNamespaces.forEach(namespace => {
      const hasDeKeys = deKeys.some(k => k.startsWith(namespace));
      const hasEnKeys = enKeys.some(k => k.startsWith(namespace));
      
      if (!hasDeKeys) {
        missing.push(`DE missing namespace: ${namespace}`);
      }
      if (!hasEnKeys) {
        missing.push(`EN missing namespace: ${namespace}`);
      }
    });
  }
  
  const total = Math.max(deKeys.length, enKeys.length);
  const coverage = total > 0 ? ((total - missing.length) / total) * 100 : 100;
  
  return {
    total,
    missing,
    coverage,
    passed: missing.length === 0
  };
}

/**
 * Required namespaces for employer routes (100% coverage required)
 */
export const EMPLOYER_NAMESPACES = [
  'employer.',
  'dashboard.',
  'applicants.',
  'job.',
  'error.'
];

/**
 * Validate employer route translation coverage
 */
export function validateEmployerCoverage(): CoverageReport {
  return checkTranslationCoverage(EMPLOYER_NAMESPACES);
}

/**
 * Log coverage report to console
 */
export function logCoverageReport(report: CoverageReport, context: string = 'Translation'): void {
  console.log(`\n${context} Coverage Report:`);
  console.log(`Total keys: ${report.total}`);
  console.log(`Coverage: ${report.coverage.toFixed(2)}%`);
  
  if (report.missing.length > 0) {
    console.error(`\n❌ Missing translations (${report.missing.length}):`);
    report.missing.forEach(key => console.error(`  - ${key}`));
  } else {
    console.log('✅ All translations present');
  }
  
  console.log(`\nStatus: ${report.passed ? '✅ PASSED' : '❌ FAILED'}\n`);
}

/**
 * Build-time check that throws if coverage is not 100%
 * Use this in your build process to ensure translation completeness
 */
export function assertEmployerCoverage(): void {
  const report = validateEmployerCoverage();
  
  if (!report.passed) {
    logCoverageReport(report, 'Employer Routes');
    throw new Error(
      `Translation coverage check failed: ${report.missing.length} missing translations. ` +
      `Employer routes require 100% translation coverage.`
    );
  }
}
