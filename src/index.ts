import { Parser } from './parser/index.js';
import { ValidationResult } from './ast/index.js';
import { MERMAID_VERSION_INFO } from './version.js';

/**
 * Get Mermaid version compatibility information
 * @returns Version information about which Mermaid version this validator was tested against
 */
export function getMermaidVersionInfo(): { validatedAgainst: string; lastValidated: string; cliVersion: string } {
  return MERMAID_VERSION_INFO;
}

/**
 * Validates Mermaid diagram syntax and returns detailed results
 * @param mermaidCode - The Mermaid diagram code to validate
 * @param targetMermaidVersion - Optional Mermaid version to check compatibility against
 * @returns ValidationResult with validation status, errors, and AST
 */
export function validateMermaid(mermaidCode: string, targetMermaidVersion?: string): ValidationResult {
  // Handle non-string inputs
  if (typeof mermaidCode !== 'string') {
    return {
      isValid: false,
      diagramType: 'unknown',
      errors: [{
        line: 1,
        column: 1,
        message: 'Input must be a string',
        code: 'INVALID_INPUT_TYPE'
      }]
    };
  }

  if (!mermaidCode || mermaidCode.trim().length === 0) {
    return {
      isValid: false,
      diagramType: 'unknown',
      errors: [{
        line: 1,
        column: 1,
        message: 'Empty mermaid code',
        code: 'EMPTY_INPUT'
      }]
    };
  }

  try {
    const parser = new Parser(mermaidCode);
    const result = parser.parse();
    
    // Check version compatibility if specified
    if (targetMermaidVersion && !isMermaidVersionSupported(targetMermaidVersion)) {
      result.errors.push({
        line: 1,
        column: 1,
        message: `This validator was tested against Mermaid ${getMermaidVersionInfo().validatedAgainst}, but you're requesting validation for version ${targetMermaidVersion}. Compatibility cannot be guaranteed.`,
        code: 'VERSION_MISMATCH',
        suggestion: `Use Mermaid version ${getMermaidVersionInfo().validatedAgainst} or update this validator to support version ${targetMermaidVersion}`
      });
      result.isValid = false;
    }
    
    return result;
  } catch (error) {
    const errorResult: ValidationResult = {
      isValid: false,
      diagramType: 'unknown',
      errors: [{
        line: 1,
        column: 1,
        message: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
        code: 'VALIDATION_ERROR'
      }]
    };
    
    return errorResult;
  }
}

/**
 * Simple validation that returns only boolean result
 * @param mermaidCode - The Mermaid diagram code to validate
 * @returns true if valid, false otherwise
 */
export function isValidMermaid(mermaidCode: string): boolean {
  return validateMermaid(mermaidCode).isValid;
}

/**
 * Get the diagram type from Mermaid code
 * @param mermaidCode - The Mermaid diagram code
 * @returns The diagram type (flowchart, sequence, etc.)
 */
export function getDiagramType(mermaidCode: string): string {
  return validateMermaid(mermaidCode).diagramType;
}

/**
 * Check if a specific Mermaid version is supported by this validator
 * @param version - The Mermaid version to check (e.g., "11.12.0")
 * @returns true if the version is supported, false otherwise
 */
export function isMermaidVersionSupported(version: string): boolean {
  const supportedVersion = getMermaidVersionInfo().validatedAgainst;
  
  // For now, we only support the exact version we were validated against
  // In the future, this could be expanded to support version ranges
  return version === supportedVersion;
}

// Export types for TypeScript users
export type { ValidationResult, ValidationError } from './ast/index.js';
export { TokenType } from './lexer/index.js';
