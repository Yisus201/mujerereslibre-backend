export const formatWhatsAppUrl = (phone?: string, message?: string) => {
  if (!phone) return '#contacto';
  
  // Clean phone number (remove non-digits)
  let cleaned = phone.replace(/\D/g, '');
  
  // If it's a 10-digit number starting with 3 (Colombian mobile), add 57
  if (cleaned.length === 10 && cleaned.startsWith('3')) {
    cleaned = `57${cleaned}`;
  }
  
  const defaultMsg = '¡Hola! Quiero hacer una donación a la Fundación Mujer eres Libre.';
  const finalMsg = message && message.trim() !== '' ? message : defaultMsg;
  
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(finalMsg)}`;
};
