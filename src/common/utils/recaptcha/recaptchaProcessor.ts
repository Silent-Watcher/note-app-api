// These options can be added later: "sms"
type StepUpMethod = 'captchaV2';

/**
 * Represents the type of action to take based on a reCAPTCHA score.
 */
export type RecaptchaAction = {
	/**
	 * Action type:
	 * - 'allow': pass through
	 * - 'stepUp': require second factor
	 * - 'manualReview': human evaluation needed
	 */
	type: 'allow' | 'stepUp' | 'manualReview';

	/** The method used for step-up if applicable */
	method?: StepUpMethod;
};

/**
 * Thresholds used to decide the RecaptchaAction based on the score.
 */
export interface RecaptchaThresholds {
	/**
	 * Scores ≥ this value are allowed through without additional checks
	 */
	allow: number;
	/**
	 * Scores ≥ this and < allow require second factor (step-up)
	 */
	stepUp: number;
	/**
	 * Scores < stepUp are flagged for manual review
	 */
}

/**
 * Default thresholds for determining RecaptchaAction.
 */
export const DEFAULT_THRESHOLDS: RecaptchaThresholds = {
	allow: 0.7,
	stepUp: 0.3,
};

/**
 * Decides the appropriate RecaptchaAction based on the provided score.
 *
 * @param score - The reCAPTCHA score to evaluate.
 * @param thresholds - Optional custom thresholds to override defaults.
 * @param stepUpMethod - The step-up method to use if required.
 * @returns A RecaptchaAction representing the required flow.
 */
export function decideRecaptchaAction(
	score: number,
	thresholds: RecaptchaThresholds = DEFAULT_THRESHOLDS,
	stepUpMethod: StepUpMethod = 'captchaV2',
): RecaptchaAction {
	if (score >= thresholds.allow) {
		return { type: 'allow' };
	}

	if (score >= thresholds.stepUp && score < thresholds.allow) {
		return { type: 'stepUp', method: stepUpMethod };
	}

	return { type: 'manualReview' };
}
