// Password strength checker utility
import { sha1 } from './crypto';

export interface PasswordStrength {
  score: number;
  feedback: string[];
  category: 'weak' | 'moderate' | 'strong';
  color: string;
  isBreached?: boolean;
  breachCount?: number;
}

const commonPasswords = new Set([
  'password',
  '123456',
  'qwerty',
  'admin',
  'letmein',
  'welcome',
]);

export async function checkPasswordStrength(password: string): Promise<PasswordStrength> {
  const feedback: string[] = [];
  let score = 0;

  // Check length
  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters long');
  } else {
    score += password.length >= 12 ? 2 : 1;
  }

  // Check for uppercase
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add uppercase letters');
  }

  // Check for lowercase
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add lowercase letters');
  }

  // Check for numbers
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add numbers');
  }

  // Check for special characters
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 2;
  } else {
    feedback.push('Add special characters');
  }

  // Check for repeated characters
  if (/(.)\1{2,}/.test(password)) {
    score -= 1;
    feedback.push('Avoid repeated characters');
  }

  // Check for common passwords
  if (commonPasswords.has(password.toLowerCase())) {
    score = 0;
    feedback.push('This is a commonly used password');
  }

  // Check for breaches if password is not empty
  let isBreached = false;
  let breachCount = 0;

  if (password) {
    try {
      const hash = await sha1(password);
      const prefix = hash.slice(0, 5);
      const suffix = hash.slice(5).toUpperCase();

      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      const text = await response.text();
      
      const breaches = text.split('\n').map(line => {
        const [hashSuffix, count] = line.split(':');
        return { hashSuffix: hashSuffix.trim(), count: parseInt(count) };
      });

      const breach = breaches.find(b => b.hashSuffix === suffix);
      if (breach) {
        isBreached = true;
        breachCount = breach.count;
        feedback.push(`This password has been exposed in ${breach.count.toLocaleString()} data breaches`);
        score = Math.max(0, score - 2);
      }
    } catch (error) {
      console.error('Error checking for breaches:', error);
    }
  }

  // Determine category and color
  let category: 'weak' | 'moderate' | 'strong';
  let color: string;

  if (score <= 2) {
    category = 'weak';
    color = '#ef4444';
  } else if (score <= 4) {
    category = 'moderate';
    color = '#eab308';
  } else {
    category = 'strong';
    color = '#22c55e';
  }

  return { score, feedback, category, color, isBreached, breachCount };
}

export function generateStrongPassword(length = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + numbers + special;
  
  // Ensure at least one of each type
  let password = 
    uppercase[Math.floor(Math.random() * uppercase.length)] +
    lowercase[Math.floor(Math.random() * lowercase.length)] +
    numbers[Math.floor(Math.random() * numbers.length)] +
    special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}