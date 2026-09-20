/**
 * Input validation with contextual error messages.
 *
 * @module validation
 */
/**
 * Validation error with field, value, and operation context.
 */
export declare class ValidationError extends Error {
    field: any;
    value: any;
    expectedType: any;
    constructor(message: any, field: any, value: any, expectedType: any);
}
/**
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @param {string} methodName - Method name for context
 * @throws {ValidationError} If value is missing or invalid
 */
export declare function validateRequired(value: any, fieldName: string, methodName?: string): void;
/**
 * @param {any} value - Value to validate
 * @param {string} expectedType - Expected type ('string', 'number', 'array', 'object', etc.)
 * @param {string} fieldName - Field name for error message
 * @param {string} methodName - Method name for context
 * @throws {ValidationError} If type doesn't match
 */
export declare function validateType(value: any, expectedType: string, fieldName: string, methodName?: string): void;
/**
 * @param {string} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @param {string} methodName - Method name for context
 * @throws {ValidationError} If string is empty
 */
export declare function validateNonEmptyString(value: string, fieldName: string, methodName?: string): void;
/**
 * @param {Array} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @param {string} methodName - Method name for context
 * @param {number} maxLength - Maximum array length (optional)
 * @throws {ValidationError} If array is empty or exceeds max length
 */
export declare function validateNonEmptyArray(value: any[], fieldName: string, methodName?: string, maxLength?: number): void;
/**
 * @param {string} xuid - XUID to validate
 * @param {string} methodName - Method name for context
 * @throws {ValidationError} If XUID is invalid
 */
export declare function validateXuid(xuid: string, methodName?: string): void;
/**
 * @param {string} gamertag - Gamertag to validate
 * @param {string} methodName - Method name for context
 * @throws {ValidationError} If gamertag is invalid
 */
export declare function validateGamertag(gamertag: string, methodName?: string): void;
/**
 * @param {string} playFabId - PlayFab ID to validate
 * @param {string} methodName - Method name for context
 * @throws {ValidationError} If PlayFab ID is invalid
 */
export declare function validatePlayFabId(playFabId: string, methodName?: string): void;
/**
 * Validate an array of XUIDs.
 *
 * The default length limit guards against oversized input; it is not a service quota.
 *
 * @param {Array<string>} xuids - Array of XUIDs to validate
 * @param {string} methodName - Method name for context
 * @param {number} maxLength - Runaway guard on array length (default: 1000)
 * @throws {ValidationError} If validation fails
 */
export declare function validateXuidArray(xuids: Array<string>, methodName?: string, maxLength?: number): void;
/**
 * @param {Array<string>} playFabIds - Array of PlayFab IDs to validate
 * @param {string} methodName - Method name for context
 * @param {number} maxLength - Maximum array length (default: 100)
 * @throws {ValidationError} If validation fails
 */
export declare function validatePlayFabIdArray(playFabIds: Array<string>, methodName?: string, maxLength?: number): void;
/**
 * @param {any} value - Value to validate
 * @param {Array<any>} allowedValues - Array of allowed values
 * @param {string} fieldName - Field name for error message
 * @param {string} methodName - Method name for context
 * @throws {ValidationError} If value is not in allowed set
 */
export declare function validateEnum(value: any, allowedValues: Array<any>, fieldName: string, methodName?: string): void;
/**
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @param {string} fieldName - Field name for error message
 * @param {string} methodName - Method name for context
 * @throws {ValidationError} If value is out of range
 */
export declare function validateRange(value: number, min: number, max: number, fieldName: string, methodName?: string): void;
/**
 * @param {Object} options - Options object to validate
 * @param {Array<string>} allowedKeys - Array of allowed option keys
 * @param {string} methodName - Method name for context
 * @throws {ValidationError} If options contains invalid keys
 */
export declare function validateOptions(options: Object, allowedKeys: Array<string>, methodName?: string): void;
