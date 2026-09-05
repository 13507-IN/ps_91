import { Engine } from 'json-rules-engine';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SchemeConfigSchema, type SchemeConfig, type UserSchemeFacts } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class RuleEngine {
  private schemes: SchemeConfig[] = [];

  constructor(customConfigsDir?: string) {
    this.loadConfigs(customConfigsDir);
  }

  /**
   * Load and validate all scheme JSON files from configs directory.
   */
  public loadConfigs(dirPath?: string): void {
    const targetDir = dirPath ?? path.resolve(__dirname, 'configs');
    this.schemes = [];

    try {
      const files = readdirSync(targetDir);
      for (const file of files) {
        if (file.endsWith('.json') && !file.startsWith('_')) {
          const fullPath = path.join(targetDir, file);
          const raw = readFileSync(fullPath, 'utf-8');
          const parsed = JSON.parse(raw);
          const validated = SchemeConfigSchema.parse(parsed);

          if (validated.active) {
            this.schemes.push(validated);
          }
        }
      }
    } catch (err) {
      console.warn(`[RuleEngine] Warning reading scheme configs directory: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /**
   * Register a custom scheme configuration manually (e.g. in tests).
   */
  public registerScheme(config: SchemeConfig): void {
    const validated = SchemeConfigSchema.parse(config);
    this.schemes = this.schemes.filter((s) => s.schemeId !== validated.schemeId);
    this.schemes.push(validated);
  }

  /**
   * Return all currently loaded active schemes.
   */
  public getAllSchemes(): SchemeConfig[] {
    return [...this.schemes];
  }

  /**
   * Evaluate user facts against all schemes using json-rules-engine logic.
   * Returns array of eligible schemes sorted by priority.
   */
  public evaluate(facts: UserSchemeFacts): SchemeConfig[] {
    const eligible: SchemeConfig[] = [];

    for (const scheme of this.schemes) {
      const elig = scheme.eligibility;
      const notes: string[] = [];
      let isEligible = true;

      // Age check
      if (facts.age !== undefined) {
        if (elig.ageMin !== undefined && facts.age < elig.ageMin) isEligible = false;
        if (elig.ageMax !== undefined && facts.age > elig.ageMax) isEligible = false;
      }

      // Gender check
      if (facts.gender && elig.gender && elig.gender.length > 0) {
        if (!elig.gender.includes(facts.gender)) isEligible = false;
      }

      // Social Category check
      if (facts.category && elig.categories && elig.categories.length > 0) {
        if (!elig.categories.includes(facts.category)) isEligible = false;
      }

      // Business Category check
      if (facts.businessCategory && elig.businessCategories && elig.businessCategories.length > 0) {
        if (!elig.businessCategories.includes(facts.businessCategory)) isEligible = false;
      }

      // Project Cost bounds check
      if (facts.projectCost !== undefined) {
        if (elig.minProjectCost !== undefined && facts.projectCost < elig.minProjectCost) isEligible = false;
        if (elig.maxProjectCost !== undefined && facts.projectCost > elig.maxProjectCost) isEligible = false;
      }

      // State check
      if (facts.state && elig.states && elig.states.length > 0) {
        if (!elig.states.includes(facts.state)) isEligible = false;
      }

      if (isEligible) {
        eligible.push(scheme);
      }
    }

    return eligible.sort((a, b) => a.priority - b.priority);
  }
}
