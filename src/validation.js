/**
 * Input validation with contextual error messages.
 *
 * @module validation
 */

import { isValidXuid, isValidGamertag, isValidPlayFabId, isValidGuid as isValidUuid } from '@halocache/halo-mcc-common';

/**
 * @param {Array<string>} ids - Array of IDs to validate
 * @param {Function} validator - Validator function for each ID
 * @param {number} maxLength - Maximum array length (default: 100)
 * @returns {Object} Validation result
 */
function validateIdArray(ids, validator, maxLength = 100) {
    const errors = [];

    if (!Array.isArray(ids)) {
        return { valid: false, errors: ['IDs must be an array'] };
    }

    if (ids.length === 0) {
        return { valid: false, errors: ['IDs array cannot be empty'] };
    }

    if (ids.length > maxLength) {
        errors.push(`IDs array cannot exceed ${maxLength} items`);
    }

    ids.forEach((id, index) => {
        if (!validator(id)) {
            errors.push(`Invalid ID at index ${index}: ${id}`);
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validation error with field, value, and operation context.
 */
export class ValidationError extends Error {
    constructor(message, field, value, expectedType) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
        this.value = value;
        this.expectedType = expectedType;
    }
}

/**
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @param {string} methodName - Method name for context
 * @throws {ValidationError} If value is missing or invalid
 */
export function validateRequired(value, fieldName, methodName = '') {
    if (value === null || value === undefined || value === '') {
        const context = methodName ? ` in ${methodName}()` : '';
        throw new ValidationError(
            `${fieldName} is required${context}`,
            fieldName,
            value,
            'non-empty value'
        );
    }
}

/**
 * @param {any} value - Value to validate
 * @param {string} expectedType - Expected type ('string', 'number', 'array', 'object', etc.)
 * @param {string} fieldName - Field name for error message
 * @param {string} methodName - Method name for context
 * @throws {ValidationError} If type doesn't match
 */
export function validateType(value, expectedType, fieldName, methodName = '') {
    const context = methodName ? ` in ${methodName}()` : '';

    let isValid = false;
    switch (expectedType) {
        case 'string':
            isValid = typeof value === 'string';
            break;
        case 'number':
            isValid = typeof value === 'number' && !isNaN(value);
            break;
        case 'array':
            isValid = Array.isArray(value);
            break;
        case 'object':
            isValid = typeof value === 'object' && value !== null && !Array.isArray(value);
            break;
        case 'boolean':
            isValid = typeof value === 'boolean';
            break;
        default:
            isValid = typeof value === expectedType;
    }

    if (!isValid) {
        throw new ValidationError(
            `${fieldName} must be a ${expectedType}${context}. Got: ${typeof value}`,
            fieldName,
            value,
            expectedType
        );
    }
}

/**
 * @param {string} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @param {string} methodName - Method name for context
 * @throws {ValidationError} If string is empty
 */
export function validateNonEmptyString(value, fieldName, methodName = '') {
    validateType(value, 'string', fieldName, methodName);
    if (value.trim().length === 0) {
        const context = methodName ? ` in ${methodName}()` : '';
        throw new ValidationError(
            `${fieldName} cannot be empty${context}`,
            fieldName,
            value,
            'non-empty string'
        );
    }
}

/**
 * @param {Array} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @param {string} methodName - Method name for context
 * @param {number} maxLength - Maximum array length (optional)
 * @throws {ValidationError} If array is empty or exceeds max length
 */
export function validateNonEmptyArray(value, fieldName, methodName = '', maxLength = null) {
    validateType(value, 'array', fieldName, methodName);

    if (value.length === 0) {
        const context = methodName ? ` in ${methodName}()` : '';
        throw new ValidationError(
            `${fieldName} cannot be empty${context}`,
            fieldName,
            value,
            'non-empty array'
        );
    }

    if (maxLength !== null && value.length > maxLength) {
        const context = methodName ? ` in ${methodName}()` : '';
        throw new ValidationError(
            `${fieldName} cannot exceed ${maxLength} items${context}. Got: ${value.length}`,
            fieldName,
            value,
            `array with max ${maxLength} items`
        );
    }
}

/**
 * @param {string} xuid - XUID to validate
 * @param {string} methodName - Method name for context
 * @throws {ValidationError} If XUID is invalid
 */
export function validateXuid(xuid, methodName = '') {
    validateNonEmptyString(xuid, 'xuid', methodName);
    if (!isValidXuid(xuid)) {
        const context = methodName ? ` in ${methodName}()` : '';
        throw new ValidationError(
            `Invalid XUID format${context}. Expected 16-18 digits or the '1' sentinel, got: ${xuid}`,
            'xuid',
            xuid,
            '16-18 digit string, or "1"'
        );
    }
}

/**
 * @param {string} gamertag - Gamertag to validate
 * @param {string} methodName - Method name for context
 * @throws {ValidationError} If gamertag is invalid
 */
export function validateGamertag(gamertag, methodName = '') {
    validateNonEmptyString(gamertag, 'gamertag', methodName);
    if (!isValidGamertag(gamertag)) {
        const context = methodName ? ` in ${methodName}()` : '';
        throw new ValidationError(
            `Gamertag has unsupported characters or length${context}. Got: ${gamertag}`,
            'gamertag',
            gamertag,
            'non-empty string, ≤30 chars, no path separators'
        );
    }
}

/**
 * @param {string} playFabId - PlayFab ID to validate
 * @param {string} methodName - Method name for context
 * @throws {ValidationError} If PlayFab ID is invalid
 */
export function validatePlayFabId(playFabId, methodName = '') {
    validateNonEmptyString(playFabId, 'playFabId', methodName);
    if (!isValidPlayFabId(playFabId)) {
        const context = methodName ? ` in ${methodName}()` : '';
        throw new ValidationError(
            `Invalid PlayFab ID format${context}. Expected 1-16 hexadecimal characters, got: ${playFabId}`,
            'playFabId',
            playFabId,
            '1-16 hexadecimal characters'
        );
    }
}

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
export function validateXuidArray(xuids, methodName = '', maxLength = 1000) {
    validateNonEmptyArray(xuids, 'xuids', methodName, maxLength);
    const validation = validateIdArray(xuids, isValidXuid, maxLength);

    if (!validation.valid) {
        const context = methodName ? ` in ${methodName}()` : '';
        throw new ValidationError(
            `Invalid XUID array${context}: ${validation.errors.join(', ')}`,
            'xuids',
            xuids,
            'array of valid XUIDs'
        );
    }
}

/**
 * @param {Array<string>} playFabIds - Array of PlayFab IDs to validate
 * @param {string} methodName - Method name for context
 * @param {number} maxLength - Maximum array length (default: 100)
 * @throws {ValidationError} If validation fails
 */
export function validatePlayFabIdArray(playFabIds, methodName = '', maxLength = 100) {
    validateNonEmptyArray(playFabIds, 'playFabIds', methodName, maxLength);
    const validation = validateIdArray(playFabIds, isValidPlayFabId, maxLength);

    if (!validation.valid) {
        const context = methodName ? ` in ${methodName}()` : '';
        throw new ValidationError(
            `Invalid PlayFab ID array${context}: ${validation.errors.join(', ')}`,
            'playFabIds',
            playFabIds,
            'array of valid PlayFab IDs'
        );
    }
}

/**
 * @param {any} value - Value to validate
 * @param {Array<any>} allowedValues - Array of allowed values
 * @param {string} fieldName - Field name for error message
 * @param {string} methodName - Method name for context
 * @throws {ValidationError} If value is not in allowed set
 */
export function validateEnum(value, allowedValues, fieldName, methodName = '') {
    if (!allowedValues.includes(value)) {
        const context = methodName ? ` in ${methodName}()` : '';
        throw new ValidationError(
            `Invalid ${fieldName}${context}. Allowed values: ${allowedValues.join(', ')}. Got: ${value}`,
            fieldName,
            value,
            `one of: ${allowedValues.join(', ')}`
        );
    }
}

/**
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @param {string} fieldName - Field name for error message
 * @param {string} methodName - Method name for context
 * @throws {ValidationError} If value is out of range
 */
export function validateRange(value, min, max, fieldName, methodName = '') {
    validateType(value, 'number', fieldName, methodName);

    if (value < min || value > max) {
        const context = methodName ? ` in ${methodName}()` : '';
        throw new ValidationError(
            `${fieldName} must be between ${min} and ${max}${context}. Got: ${value}`,
            fieldName,
            value,
            `number between ${min} and ${max}`
        );
    }
}

/**
 * @param {Object} options - Options object to validate
 * @param {Array<string>} allowedKeys - Array of allowed option keys
 * @param {string} methodName - Method name for context
 * @throws {ValidationError} If options contains invalid keys
 */
export function validateOptions(options, allowedKeys, methodName = '') {
    if (options && typeof options === 'object' && !Array.isArray(options)) {
        const invalidKeys = Object.keys(options).filter(key => !allowedKeys.includes(key));
        if (invalidKeys.length > 0) {
            const context = methodName ? ` in ${methodName}()` : '';
            throw new ValidationError(
                `Invalid option keys${context}: ${invalidKeys.join(', ')}. Allowed keys: ${allowedKeys.join(', ')}`,
                'options',
                options,
                `object with keys: ${allowedKeys.join(', ')}`
            );
        }
    }
}
