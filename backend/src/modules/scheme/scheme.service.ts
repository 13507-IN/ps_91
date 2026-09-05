import { SchemeEvaluator } from '../../engine/scheme/schemeEvaluator.js';
import { RuleEngine } from '../../engine/scheme/ruleEngine.js';
import type { MatchSchemesInput } from './scheme.schema.js';

export class SchemeService {
  private evaluator: SchemeEvaluator;
  private ruleEngine: RuleEngine;

  constructor() {
    this.ruleEngine = new RuleEngine();
    this.evaluator = new SchemeEvaluator(this.ruleEngine);
  }

  /**
   * Match schemes for user facts & calculate financial benefits
   */
  matchSchemes(input: MatchSchemesInput) {
    return this.evaluator.evaluateSchemes(input);
  }

  /**
   * List all available scheme configurations
   */
  getAllSchemes() {
    return this.ruleEngine.getAllSchemes();
  }

  /**
   * Get single scheme details by ID
   */
  getSchemeById(id: string) {
    const schemes = this.ruleEngine.getAllSchemes();
    const found = schemes.find((s) => s.schemeId.toLowerCase() === id.toLowerCase());
    if (!found) {
      throw new Error(`Scheme with ID '${id}' not found`);
    }
    return found;
  }
}
