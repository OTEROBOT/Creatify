/**
 * Bitkub Open API v3 Client Service
 * Supports Real Live Trading with THB on Bitkub Thailand (กลต. รับรอง)
 * Handles HMAC-SHA256 signature, server time synchronization, balances, and real order placement.
 */

// Helper to compute HMAC-SHA256 hex signature using Web Crypto API
export async function computeHmacSha256(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const keyData = enc.encode(secret);
  const msgData = enc.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface BitkubBalanceResponse {
  success: boolean;
  error?: number;
  errorMessage?: string;
  thbBalance: number;
  cryptoBalance: number;
  raw?: Record<string, number>;
}

export interface BitkubOrderResult {
  success: boolean;
  orderId?: string;
  error?: number;
  errorMessage?: string;
  filledPrice?: number;
  qty?: number;
  amountThb?: number;
  feeThb?: number;
  raw?: any;
}

// Bitkub Error Code Descriptions in Thai & English for clear user feedback
export const BITKUB_ERROR_CODES: Record<number, string> = {
  0: 'สำเร็จ (No error)',
  1: 'คำขอไม่ถูกต้อง (Invalid JSON payload)',
  2: 'ขาดพารามิเตอร์ที่จำเป็น (Missing signature/headers)',
  3: 'API Key ไม่ถูกต้อง หรือไม่มีสิทธิ์เข้าถึง (Invalid API Key)',
  4: 'ไม่มีสิทธิ์เข้าถึงหรือยังไม่ได้เปิดสิทธิ์ Trade (API Key unauthorized or missing Trade permission)',
  5: 'IP Address ไม่ตรงกับที่ตั้งค่า Whitelist ไว้ใน Bitkub (Invalid IP)',
  6: 'คำขอหมดอายุ / เวลาเครื่องไม่ตรง (Timestamp expired)',
  7: 'API Secret หรือ Signature ไม่ถูกต้อง (Invalid Signature)',
  8: 'บัญชีถูกระงับ (Account is suspended)',
  9: 'ยอดเงินในกระเป๋าไม่เพียงพอสำหรับการเปิดออเดอร์ (Insufficient balance)',
  10: 'เหรียญหรือคู่เทรดนี้ถูกปิดชั่วคราว (Market is suspended)',
  11: 'คำสั่งซื้อขายต้องมีมูลค่าอย่างน้อย 10 บาท (Minimum order size is 10 THB)',
  12: 'วงเงินคำสั่งซื้อขายเกินขีดจำกัด (Amount exceeds maximum limit)',
  13: 'คำสั่งไม่ถูกต้อง (Invalid order parameters)',
  14: 'ไม่พบเลขออเดอร์ (Order not found)',
  15: 'ออเดอร์ถูกยกเลิกไปแล้ว (Order already cancelled)',
  40: 'ระบบ Bitkub ปิดปรับปรุงชั่วคราว (Maintenance mode)',
};

/**
 * Fetch official Bitkub Server Time to prevent clock skew errors
 */
export async function getBitkubServerTime(): Promise<number> {
  try {
    const res = await fetch('/api/bitkub/v3/servertime');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return typeof data === 'number' ? data : Date.now();
  } catch {
    return Date.now();
  }
}

/**
 * Fetch live Bitkub real-time market ticker for THB pair
 */
export async function getBitkubTicker(symbol: string = 'THB_BTC'): Promise<{
  price: number;
  bid: number;
  ask: number;
  percentChange: number;
  volume24h: number;
} | null> {
  try {
    const res = await fetch(`/api/bitkub/market/ticker?sym=${symbol}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const item = data[symbol];
    if (!item) return null;

    return {
      price: item.last || item.highestBid || 0,
      bid: item.highestBid || item.last,
      ask: item.lowestAsk || item.last,
      percentChange: parseFloat(item.percentChange || '0'),
      volume24h: parseFloat(item.baseVolume || '0'),
    };
  } catch (err) {
    console.warn('Failed to fetch Bitkub ticker via proxy:', err);
    return null;
  }
}

/**
 * Fetch real Bitkub wallet balance (THB and selected coin)
 */
export async function getBitkubBalances(
  apiKey: string,
  apiSecret: string,
  symbol: string = 'THB_BTC'
): Promise<BitkubBalanceResponse> {
  if (!apiKey || !apiSecret) {
    return {
      success: false,
      errorMessage: 'กรุณากรอก API Key และ Secret ก่อนเชื่อมต่อกระเป๋า Bitkub',
      thbBalance: 0,
      cryptoBalance: 0,
    };
  }

  try {
    const timestamp = await getBitkubServerTime();
    const method = 'POST';
    const path = '/api/v3/market/wallet';
    const bodyStr = '{}';

    const payload = `${timestamp}${method}${path}${bodyStr}`;
    const signature = await computeHmacSha256(apiSecret, payload);

    const res = await fetch(`/api/bitkub/v3/market/wallet`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-BTK-APIKEY': apiKey.trim(),
        'X-BTK-TIMESTAMP': timestamp.toString(),
        'X-BTK-SIGN': signature,
      },
      body: bodyStr,
    });

    const data = await res.json();
    if (data.error && data.error !== 0) {
      const desc = BITKUB_ERROR_CODES[data.error] || `Error code: ${data.error}`;
      return {
        success: false,
        error: data.error,
        errorMessage: desc,
        thbBalance: 0,
        cryptoBalance: 0,
      };
    }

    const coin = symbol.replace('THB_', '').toUpperCase();
    const result = data.result || {};
    const thb = parseFloat(result.THB || '0');
    const cryptoBal = parseFloat(result[coin] || '0');

    return {
      success: true,
      thbBalance: thb,
      cryptoBalance: cryptoBal,
      raw: result,
    };
  } catch (err: any) {
    return {
      success: false,
      errorMessage: err.message || 'ไม่สามารถเชื่อมต่อกับ Bitkub API ได้ ตรวจสอบอินเทอร์เน็ตหรือ Proxy',
      thbBalance: 0,
      cryptoBalance: 0,
    };
  }
}

/**
 * Place a REAL Trade Order on Bitkub (Buy with THB or Sell Crypto for THB)
 * Bitkub rules:
 * - Minimum order size is 10 THB
 * - Type: 'market' (Instant match) or 'limit'
 */
export async function placeBitkubRealOrder(params: {
  apiKey: string;
  apiSecret: string;
  symbol: string; // e.g. 'THB_BTC'
  side: 'BUY' | 'SELL';
  amountThbOrQty: number; // for BUY: amount in THB (e.g. 100). for SELL: quantity of coin
  rate?: number; // Price per coin for limit order. Omit for market order.
  orderType?: 'limit' | 'market';
}): Promise<BitkubOrderResult> {
  const { apiKey, apiSecret, symbol, side, amountThbOrQty, rate, orderType = 'market' } = params;

  if (!apiKey || !apiSecret) {
    return {
      success: false,
      errorMessage: 'กรุณาระบุ Bitkub API Key & Secret ให้ครบถ้วนเพื่อส่งคำสั่งเทรดเงินจริง',
    };
  }

  // Bitkub minimum is 10 THB
  if (side === 'BUY' && amountThbOrQty < 10) {
    return {
      success: false,
      errorMessage: 'คำสั่งซื้อบน Bitkub ต้องมีมูลค่าอย่างน้อย 10 บาท (Bitkub Minimum: ฿10)',
    };
  }

  try {
    const timestamp = await getBitkubServerTime();
    const endpointPath =
      side === 'BUY' ? '/api/v3/market/place-bid' : '/api/v3/market/place-ask';
    const method = 'POST';

    // Construct body
    const body: Record<string, any> = {
      sym: symbol,
      amt: amountThbOrQty,
      typ: orderType,
    };
    if (orderType === 'limit' && rate && rate > 0) {
      body.rat = rate;
    }

    const bodyStr = JSON.stringify(body);
    const payload = `${timestamp}${method}${endpointPath}${bodyStr}`;
    const signature = await computeHmacSha256(apiSecret, payload);

    const res = await fetch(`/api/bitkub${endpointPath}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-BTK-APIKEY': apiKey.trim(),
        'X-BTK-TIMESTAMP': timestamp.toString(),
        'X-BTK-SIGN': signature,
      },
      body: bodyStr,
    });

    const data = await res.json();

    if (data.error && data.error !== 0) {
      const desc = BITKUB_ERROR_CODES[data.error] || `รหัสข้อผิดพลาด ${data.error}`;
      return {
        success: false,
        error: data.error,
        errorMessage: desc,
        raw: data,
      };
    }

    const resObj = data.result || {};
    return {
      success: true,
      orderId: resObj.id ? `BTK-${resObj.id}` : `BTK-${Date.now()}`,
      filledPrice: resObj.rat || rate || 0,
      qty: resObj.rec || resObj.amt || 0,
      amountThb: side === 'BUY' ? amountThbOrQty : (resObj.rec || 0),
      feeThb: resObj.fee || +(amountThbOrQty * 0.0025).toFixed(2), // 0.25% Bitkub fee
      raw: resObj,
    };
  } catch (err: any) {
    return {
      success: false,
      errorMessage: err.message || 'ส่งคำสั่งไปยัง Bitkub ไม่สำเร็จ ตรวจสอบการเชื่อมต่อ API',
    };
  }
}
