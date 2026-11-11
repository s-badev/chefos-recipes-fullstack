export function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}
export function validRegistration(name: string, email: string, password: string) {
  return name.trim().length > 0 && name.trim().length <= 100 && validEmail(email.trim()) && password.length >= 8 && password.length <= 256;
}
