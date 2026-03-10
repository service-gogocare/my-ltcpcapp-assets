// src/services/authService.ts

import { GOOGLE_APPS_SCRIPT_URL } from '../constants';

/**
 * 驗證身分證格式
 */
export const validateIdFormat = (id: string): boolean => {
  const regex = /^[A-Z][1289]\d{8}$/;
  return regex.test(id.toUpperCase().trim());
};

/**
 * 統一使用 POST 呼叫 GAS，避免 GET 的 CORS 重定向問題
 */
async function callGasApi(payload: Record<string, any>): Promise<any> {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
        redirect: 'follow',
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        return { status: 'success', raw: text };
    }
}

export const checkUserExists = async (id: string): Promise<boolean> => {
    try {
        const data = await callGasApi({ action: 'checkUser', id: id.toUpperCase().trim() });
        return data.exists === true;
    } catch (error) {
        console.error('[AuthService] checkUserExists 失敗:', error);
        return false;
    }
};

export const registerPendingUser = async (id: string): Promise<void> => {
    try {
        await callGasApi({ action: 'register', id: id.toUpperCase().trim() });
    } catch (error) {
        console.error('[AuthService] registerPendingUser 失敗:', error);
    }
};

export const verifyRegistration = async (id: string): Promise<boolean> => {
    try {
        const data = await callGasApi({ action: 'verifyRegistration', id: id.toUpperCase().trim() });
        return data.exists === true;
    } catch (error) {
        console.error('[AuthService] verifyRegistration 失敗:', error);
        return false;
    }
};