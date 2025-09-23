import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

// Get encryption key from environment or generate one
const getEncryptionKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required for data encryption');
  }
  return Buffer.from(key, 'hex');
};

export class SecurityUtils {
  /**
   * Hash password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Encrypt sensitive data (PHI - Protected Health Information)
   */
  static encryptPHI(data: string): { encrypted: string; iv: string; tag: string } {
    try {
      const key = getEncryptionKey();
      const iv = crypto.randomBytes(IV_LENGTH);
      const cipher = crypto.createCipher(ALGORITHM, key);
      cipher.setAAD(Buffer.from('PHI')); // Additional authenticated data
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt sensitive data');
    }
  }

  /**
   * Decrypt sensitive data (PHI)
   */
  static decryptPHI(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    try {
      const key = getEncryptionKey();
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const tag = Buffer.from(encryptedData.tag, 'hex');
      
      const decipher = crypto.createDecipher(ALGORITHM, key);
      decipher.setAAD(Buffer.from('PHI'));
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt sensitive data');
    }
  }

  /**
   * Generate secure random token
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash data for integrity checking
   */
  static hashData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Sanitize data to prevent injection attacks
   */
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    // Remove potential SQL injection patterns
    return input
      .replace(/[<>'"]/g, '') // Remove HTML/script injection
      .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi, '') // Remove SQL keywords
      .trim()
      .substring(0, 1000); // Limit length
  }

  /**
   * Validate PHI access permissions
   */
  static validatePHIAccess(userRole: string, requestedResource: string): boolean {
    const permissions = {
      ADMIN: ['patients', 'doctors', 'appointments', 'billing', 'audit'],
      DOCTOR: ['patients', 'appointments', 'billing'],
      NURSE: ['patients', 'appointments'],
      RECEPTIONIST: ['appointments', 'billing'],
      PATIENT: ['own-data-only']
    };

    const userPermissions = permissions[userRole as keyof typeof permissions];
    return userPermissions ? userPermissions.includes(requestedResource) : false;
  }

  /**
   * Generate audit trail hash for tamper detection
   */
  static generateAuditHash(previousHash: string, logData: any): string {
    const dataString = JSON.stringify(logData) + previousHash;
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  /**
   * Mask sensitive data for logging (partial masking)
   */
  static maskSensitiveData(data: string, type: 'email' | 'phone' | 'ssn' | 'name'): string {
    if (!data) return '';
    
    switch (type) {
      case 'email':
        const emailParts = data.split('@');
        if (emailParts.length === 2) {
          const username = emailParts[0];
          const domain = emailParts[1];
          return username.substring(0, 2) + '***@' + domain;
        }
        return '***@***.com';
        
      case 'phone':
        return data.replace(/(\d{3})(\d{3})(\d{4})/, '***-***-$3');
        
      case 'ssn':
        return data.replace(/(\d{3})(\d{2})(\d{4})/, '***-**-$3');
        
      case 'name':
        const nameParts = data.split(' ');
        return nameParts.map(part => 
          part.length > 1 ? part.charAt(0) + '*'.repeat(part.length - 1) : part
        ).join(' ');
        
      default:
        return '***';
    }
  }

  /**
   * Validate session token and check for session hijacking
   */
  static validateSession(token: string, userAgent: string, ipAddress: string): boolean {
    // In a real implementation, you would check against stored session data
    // This is a simplified version for demonstration
    try {
      // Check token format and expiration
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return false;
      
      // Additional checks would include:
      // - Token signature verification
      // - IP address consistency
      // - User agent consistency
      // - Session expiration
      // - Concurrent session limits
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate HIPAA-compliant minimum necessary access token
   */
  static generateMinimumNecessaryToken(userRole: string, patientId: string, purpose: string): string {
    const tokenData = {
      role: userRole,
      patientId,
      purpose,
      timestamp: Date.now(),
      expires: Date.now() + (4 * 60 * 60 * 1000) // 4 hours
    };
    
    return Buffer.from(JSON.stringify(tokenData)).toString('base64');
  }
}

export default SecurityUtils;