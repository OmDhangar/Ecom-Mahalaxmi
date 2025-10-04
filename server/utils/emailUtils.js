/**
 * Mask email address for privacy
 * Example: john.doe@example.com -> jo***@ex*****.com
 */
const maskEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return '';
  }

  const [localPart, domain] = email.split('@');
  
  if (!localPart || !domain) {
    return '';
  }

  // Mask local part
  let maskedLocal;
  if (localPart.length <= 2) {
    maskedLocal = localPart.charAt(0) + '*';
  } else if (localPart.length <= 4) {
    maskedLocal = localPart.substring(0, 2) + '*'.repeat(localPart.length - 2);
  } else {
    maskedLocal = localPart.substring(0, 2) + '*'.repeat(localPart.length - 4) + localPart.slice(-2);
  }

  // Mask domain
  const [domainName, tld] = domain.split('.');
  let maskedDomain;
  
  if (domainName.length <= 2) {
    maskedDomain = domainName.charAt(0) + '*';
  } else if (domainName.length <= 4) {
    maskedDomain = domainName.substring(0, 2) + '*'.repeat(domainName.length - 2);
  } else {
    maskedDomain = domainName.substring(0, 2) + '*'.repeat(domainName.length - 4) + domainName.slice(-2);
  }

  return `${maskedLocal}@${maskedDomain}.${tld}`;
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Normalize email (lowercase, trim)
 */
const normalizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return '';
  }
  return email.trim().toLowerCase();
};

module.exports = {
  maskEmail,
  isValidEmail,
  normalizeEmail
};
