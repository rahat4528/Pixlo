export type FieldType =
  | 'string'
  | 'text'
  | 'richtext'
  | 'number'
  | 'boolean'
  | 'date'
  | 'media'
  | 'relation'
  | 'json'
  | 'enumeration';

export interface FieldDefinition {
  name: string;
  type: FieldType;
  required?: boolean;
  min?: number;
  max?: number;
  regex?: string;
  enumValues?: string[];
  defaultValue?: any;
}

export interface SchemaDefinition {
  name: string;
  singularName: string;
  pluralName: string;
  fields: FieldDefinition[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  sanitizedData: Record<string, any>;
}

export class SchemaValidator {
  /**
   * Validate a schema definition itself (meta-schema check)
   */
  static validateSchemaDefinition(schema: SchemaDefinition): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!schema.name || schema.name.trim().length === 0) {
      errors.push('Schema name is required.');
    }
    if (!schema.singularName || schema.singularName.trim().length === 0) {
      errors.push('Singular name is required.');
    }
    if (!schema.pluralName || schema.pluralName.trim().length === 0) {
      errors.push('Plural name is required.');
    }
    if (!Array.isArray(schema.fields) || schema.fields.length === 0) {
      errors.push('Schema must declare at least one field.');
    } else {
      const fieldNames = new Set<string>();
      for (const field of schema.fields) {
        if (!field.name || field.name.trim().length === 0) {
          errors.push('Field name is required.');
        } else if (fieldNames.has(field.name)) {
          errors.push(`Duplicate field name: "${field.name}".`);
        } else {
          fieldNames.add(field.name);
        }

        if (field.type === 'enumeration') {
          if (!field.enumValues || field.enumValues.length === 0) {
            errors.push(`Enumeration field "${field.name}" must specify enumValues.`);
          }
        }
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate content entry against dynamic schema definition
   */
  static validateContentEntry(
    schema: SchemaDefinition,
    data: Record<string, any>
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const sanitizedData: Record<string, any> = {};

    for (const field of schema.fields) {
      const val = data[field.name];

      // 1. Required Check
      if (val === undefined || val === null || val === '') {
        if (field.required) {
          errors.push({
            field: field.name,
            message: `Field "${field.name}" is required.`,
          });
          continue;
        } else {
          if (field.defaultValue !== undefined) {
            sanitizedData[field.name] = field.defaultValue;
          }
          continue;
        }
      }

      // 2. Type Checking & Constraints
      switch (field.type) {
        case 'string':
        case 'text':
        case 'richtext': {
          if (typeof val !== 'string') {
            errors.push({ field: field.name, message: `Field "${field.name}" must be a string.` });
            break;
          }
          if (field.min !== undefined && val.length < field.min) {
            errors.push({
              field: field.name,
              message: `Field "${field.name}" length must be at least ${field.min} characters.`,
            });
          }
          if (field.max !== undefined && val.length > field.max) {
            errors.push({
              field: field.name,
              message: `Field "${field.name}" length must not exceed ${field.max} characters.`,
            });
          }
          if (field.regex) {
            const re = new RegExp(field.regex);
            if (!re.test(val)) {
              errors.push({
                field: field.name,
                message: `Field "${field.name}" does not match required format pattern.`,
              });
            }
          }
          sanitizedData[field.name] = val;
          break;
        }

        case 'number': {
          const num = Number(val);
          if (isNaN(num)) {
            errors.push({ field: field.name, message: `Field "${field.name}" must be a valid number.` });
            break;
          }
          if (field.min !== undefined && num < field.min) {
            errors.push({
              field: field.name,
              message: `Field "${field.name}" must be >= ${field.min}.`,
            });
          }
          if (field.max !== undefined && num > field.max) {
            errors.push({
              field: field.name,
              message: `Field "${field.name}" must be <= ${field.max}.`,
            });
          }
          sanitizedData[field.name] = num;
          break;
        }

        case 'boolean': {
          if (typeof val !== 'boolean') {
            errors.push({ field: field.name, message: `Field "${field.name}" must be a boolean.` });
            break;
          }
          sanitizedData[field.name] = val;
          break;
        }

        case 'date': {
          const date = new Date(val);
          if (isNaN(date.getTime())) {
            errors.push({ field: field.name, message: `Field "${field.name}" must be a valid date.` });
            break;
          }
          sanitizedData[field.name] = date.toISOString();
          break;
        }

        case 'enumeration': {
          if (typeof val !== 'string' || !field.enumValues?.includes(val)) {
            errors.push({
              field: field.name,
              message: `Field "${field.name}" must be one of [${field.enumValues?.join(', ')}].`,
            });
            break;
          }
          sanitizedData[field.name] = val;
          break;
        }

        case 'json': {
          if (typeof val !== 'object' || val === null) {
            errors.push({ field: field.name, message: `Field "${field.name}" must be a JSON object or array.` });
            break;
          }
          sanitizedData[field.name] = val;
          break;
        }

        case 'media':
        case 'relation': {
          sanitizedData[field.name] = val;
          break;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData,
    };
  }
}
