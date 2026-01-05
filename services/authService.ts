
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzgWKSWufG7-N_tnxoOj9Iv-SelKfP7cu7XW--ZOA2BlfNxrMoUVmH9kMRRfov2k1lG5A/exec';

/**
 * Validates the format of a Taiwan ID card.
 */
export const validateIdFormat = (id: string): boolean => {
  const regex = /^[A-Z][129]\d{8}$/;
  return regex.test(id.toUpperCase().trim());
};

/**
 * Common fetch wrapper for GET requests to GAS
 */
async function callGasApi(params: Record<string, string>): Promise<any> {
    const query = new URLSearchParams({ ...params, t: Date.now().toString() }).toString();
    const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?${query}`, {
        method: 'GET',
        mode: 'cors',
        redirect: 'follow',
        cache: 'no-cache'
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
}

/**
 * Checks if the user ID exists and is verified in any of the databases.
 */
export const checkUserExists = async (id: string): Promise<boolean> => {
  try {
    const upperId = id.toUpperCase().trim();
    const data = await callGasApi({ action: 'checkUser', id: upperId });
    return data.exists === true;
  } catch (error) {
    console.error('[AuthService] checkUserExists 異常:', error);
    return false;
  }
};

/**
 * Records an ID as "Pending" in the new registration sheet.
 */
export const registerPendingUser = async (id: string): Promise<void> => {
    try {
        const upperId = id.toUpperCase().trim();
        await callGasApi({ action: 'registerPending', id: upperId });
        console.log(`[AuthService] 已記錄待驗證學員: ${upperId}`);
    } catch (error) {
        console.error('[AuthService] registerPendingUser 失敗:', error);
    }
};

/**
 * Updates a pending user's status to "Verified".
 */
export const verifyRegistration = async (id: string): Promise<boolean> => {
    try {
        const upperId = id.toUpperCase().trim();
        const data = await callGasApi({ action: 'verifyRegistration', id: upperId });
        return data.exists === true;
    } catch (error) {
        console.error('[AuthService] verifyRegistration 失敗:', error);
        return false;
    }
};
