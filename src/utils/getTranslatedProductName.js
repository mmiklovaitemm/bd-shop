/**
 * Get translated product name based on current language
 * @param {string} name - Original product name (e.g., "Earth Ring")
 * @param {object} t - Translation object from useLanguage
 * @returns {string} - Translated name or original if no translation exists
 */
export function getTranslatedProductName(name, t) {
  if (!name) return "";

  // Return translation if exists, otherwise return original name
  return t.productNames?.[name] || name;
}
