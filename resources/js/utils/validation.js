export function sanitize(value) {
    if (typeof value !== 'string') return value;
    return value
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/javascript\s*:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/['"]?['"]?/g, '')
        .trim();
}

export function sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    const result = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            result[key] = sanitize(obj[key]);
        }
    }
    return result;
}

export const RULES = {
    required: (v) => (v !== undefined && v !== null && v !== '' ? null : 'This field is required.'),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Invalid email address.'),
    minLength: (min) => (v) => (!v || v.length >= min ? null : `Minimum ${min} characters required.`),
    maxLength: (max) => (v) => (!v || v.length <= max ? null : `Must not exceed ${max} characters.`),
    passwordMatch: (v, values) => (!v || v === values?.password ? null : 'Passwords do not match.'),
    name: (v) =>
        !v || /^[a-zA-Z\s\-'\.]+$/.test(v) ? null : 'Name may only contain letters, spaces, hyphens, and apostrophes.',
    phone: (v) =>
        !v || /^[\+\d\s\-\(\)\.]+$/.test(v) ? null : 'Phone may only contain digits, spaces, hyphens, and plus signs.',
    numeric: (v) => (!v || /^\d+(\.\d{1,2})?$/.test(v) ? null : 'Must be a valid number.'),
    min: (min) => (v) => (v !== undefined && v !== null && Number(v) >= min ? null : `Minimum value is ${min}.`),
    max: (max) => (v) => (v !== undefined && v !== null && Number(v) <= max ? null : `Maximum value is ${max}.`),
};

export function validate(fields, values) {
    const errors = {};
    for (const [field, rules] of Object.entries(fields)) {
        for (const rule of rules) {
            const error = rule(values[field], values);
            if (error) {
                errors[field] = error;
                break;
            }
        }
    }
    return Object.keys(errors).length > 0 ? errors : null;
}
