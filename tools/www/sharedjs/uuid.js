/**
 * Generates a RFC4122 version 4 compliant UUID (Universally Unique Identifier).
 * This method is the standard and recommended way to generate UUIDs in modern browsers.
 *
 * @returns {string} A string representing the generated UUID.
 * @throws {Error} If the crypto API is not available in the browser.
 */
 const crypto=require('crypto')
 
 
 
function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID()
    } else {
        // Fallback for older browsers (less secure and potentially less unique)
        // This fallback is generally discouraged for critical applications
        console.warn(
            'crypto.randomUUID() not available, falling back to less secure method.'
        )
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
            /[xy]/g,
            function (c) {
                var r = (Math.random() * 16) | 0,
                    v = c == 'x' ? r : (r & 0x3) | 0x8
                return v.toString(16)
            }
        )
    }
}

// Example usage:
const myGuid = generateUUID()
console.log(myGuid)
