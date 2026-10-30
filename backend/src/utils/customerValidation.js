export const digitsOnly = (value) => String(value ?? '').replace(/\D/g, '');

const hasRepeatedDigits = (value) => /^(\d)\1+$/.test(value);

const calculateCheckDigit = (digits, weights) => {
  const sum = [...digits].reduce((total, digit, index) => total + Number(digit) * weights[index], 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
};

export const isValidCpf = (value) => {
  const cpf = digitsOnly(value);
  if (cpf.length !== 11 || hasRepeatedDigits(cpf)) return false;
  const first = calculateCheckDigit(cpf.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = calculateCheckDigit(cpf.slice(0, 9) + first, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  return cpf === `${cpf.slice(0, 9)}${first}${second}`;
};

export const isValidCnpj = (value) => {
  const cnpj = digitsOnly(value);
  if (cnpj.length !== 14 || hasRepeatedDigits(cnpj)) return false;
  const base = cnpj.slice(0, 12);
  const first = calculateCheckDigit(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = calculateCheckDigit(base + first, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return cnpj === `${base}${first}${second}`;
};
