# Scheme Configuration Files

This directory contains versioned JSON configuration files for government credit-linked and subsidy schemes.

## Adding a New Scheme

1. Copy `_template.json` to `<scheme_id>.json`.
2. Populate scheme metadata, eligibility rules, and financial parameters.
3. Validate JSON against `SchemeConfigSchema` defined in `src/engine/scheme/types.ts`.
4. The Scheme Engine auto-discovers all `.json` files in this directory at startup.

## Configuration Schema Reference

| Field | Type | Description |
|---|---|---|
| `schemeId` | string | Unique identifier for the scheme |
| `name` | string | Full official name of the scheme |
| `eligibility.categories` | Array<SocialCategory> | Allowed social categories (GENERAL, SC, ST, OBC, MINORITY) |
| `eligibility.gender` | Array<Gender> | Allowed genders (MALE, FEMALE, OTHER) |
| `eligibility.ageMin` | number | Minimum age requirement |
| `eligibility.ageMax` | number | Maximum age requirement |
| `eligibility.businessCategories` | Array<BusinessCategory> | Eligible business types |
| `financial.maxLoanAmount` | number | Maximum loan ceiling in ₹ |
| `financial.interestRate` | number | Annual interest rate % |
| `financial.subsidyPercentage` | number | Capital subsidy % |
| `financial.maxSubsidy` | number | Maximum subsidy cap in ₹ |
| `financial.marginPercentage` | number | Required margin money % |
