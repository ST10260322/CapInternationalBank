export const calculatePasswordStrength = (password) => {
    let strength = 0;
    let feedback = [];
  
    if (!password) return { strength: 0, label: 'Too weak', color: '#d73a49', feedback: ['Enter a password'] };
  
    // Length check
    if (password.length >= 8) {
      strength += 1;
    } else {
      feedback.push('At least 8 characters');
    }
  
    if (password.length >= 12) {
      strength += 1;
    }
  
    // Lowercase letter
    if (/[a-z]/.test(password)) {
      strength += 1;
    } else {
      feedback.push('Add lowercase letters');
    }
  
    // Uppercase letter
    if (/[A-Z]/.test(password)) {
      strength += 1;
    } else {
      feedback.push('Add uppercase letters');
    }
  
    // Numbers
    if (/\d/.test(password)) {
      strength += 1;
    } else {
      feedback.push('Add numbers');
    }
  
    // Special characters
    if (/[@$!%*?&#]/.test(password)) {
      strength += 1;
    } else {
      feedback.push('Add special characters (@$!%*?&#)');
    }
  
    // Determine strength level
    let label, color;
    if (strength <= 2) {
      label = 'Weak';
      color = '#d73a49';
    } else if (strength <= 4) {
      label = 'Fair';
      color = '#fb8c00';
    } else if (strength <= 5) {
      label = 'Good';
      color = '#fdd835';
    } else {
      label = 'Strong';
      color = '#43a047';
    }
  
    return { strength, label, color, feedback, percentage: (strength / 6) * 100 };
  };