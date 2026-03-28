export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function formatPrice(amount: number | string): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(Number(amount));
}

export function generateOrderNumber(): string {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
  return `MP${y}${m}${d}${rand}`;
}

export function generateTicketNumber(): string {
  const rand = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
  return `TKT-${rand}`;
}

/**
 * Formats a numeric string into Turkey phone format: 0 (5XX) XXX XX XX
 */
export function formatTurkeyPhone(input: string): string {
  let val = input.replace(/\D/g, "");
  
  // Ensure it starts with 05
  if (val.length < 2) {
    val = "05";
  } else if (!val.startsWith("05")) {
    if (val.startsWith("5")) {
      val = "0" + val;
    } else {
      val = "05";
    }
  }
  
  // Max 11 digits
  if (val.length > 11) val = val.slice(0, 11);

  let formatted = val;
  if (val.length > 1) formatted = val.slice(0, 1) + " (" + val.slice(1, 4);
  if (val.length > 4) {
    formatted = formatted + ") " + val.slice(4, 7);
  }
  if (val.length > 7) {
    formatted = formatted + " " + val.slice(7, 9);
  }
  if (val.length > 9) {
    formatted = formatted + " " + val.slice(9, 11);
  }
  
  return formatted;
}

/**
 * Strips all non-numeric characters for database storage
 */
export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Parses a Turkish address string into neighbourhood and street components.
 * Specifically looks for "Mah." or "Mahallesi" patterns.
 */
export function parseTurkeyAddress(fullStreet: string) {
  const match = fullStreet.match(/^(.*?)\s+Mah\.?\s*,?\s*(.*)$/i) || 
                fullStreet.match(/^(.*?)\s+Mahallesi\s*,?\s*(.*)$/i);
  
  if (match) return { neighbourhood: match[1], street: match[2] };
  return { neighbourhood: "", street: fullStreet };
}
