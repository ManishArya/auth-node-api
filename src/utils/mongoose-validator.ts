export function isAlphaAndSpace(str: string) {
  if (str === 'null' || str === 'undefined') {
    return false;
  }
  return /^[A-Za-z\s]*$/.test(str);
}

export function isMobileNumber(v: string) {
  if (v === 'undefined' || v === 'null' || v === null || v.trim() === '') {
    return true;
  }
  return /^(0|91)?[7-9]\d{9}$/.test(v);
}

export function isPincode(v: string) {
  if (v === 'null' || v === 'undefined') {
    return false;
  }
  return /^[1-9][0-9]{5}$/.test(v);
}

export function isEmail(v: string) {
  return /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/.test(v);
}
