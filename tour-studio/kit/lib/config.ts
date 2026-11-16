import { T } from "@/lib/tour-strings";

/** Everything that names the product or the seller lives here, so a rename is one edit. */
export const PRODUCT_NAME = "Produs Demo"; // provisional names are fine; nothing else may hard-code it
export const COMPANY_NAME = "Firma Demo"; // the invented customer whose data fills the mock screens
export const CONTACT_EMAIL = "contact@example.com";
export const DEMO_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`${T.demoSubject} ${PRODUCT_NAME}`)}`;
