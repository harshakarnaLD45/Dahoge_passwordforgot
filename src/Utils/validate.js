// Einfache Formular-Validierung (wie im Legacy-Bundle).

export const isEmail = (value) => /.+@.+\..+/.test(value.trim());

export const isPhone = (value) => /^[+\d][\d\s\-/().]{5,}$/.test(value.trim());
