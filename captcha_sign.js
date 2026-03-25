/**
 * Xunlei Pan (pan.xunlei.com) captcha_sign generator
 *
 * Reverse-engineered from:
 *   utils.edbbe08f16cd7de65026.js (webpack module 30, drive-util)
 *   function: pubTaUBFgSYTBW70UjOSyFiyBeLDzhZfzZq
 *
 * Algorithm:
 *   base = clientId + client_version + host + deviceId + timestamp
 *   captcha_sign = "1." + chainedMd5(base)
 *
 * where chainedMd5 applies 12 sequential MD5 rounds each with a fixed salt.
 *
 * Verified against known payload:
 *   base   = "Xqp0kJBXWhwaTpB61.92.37pan.xunlei.comce8b565a93e31878b5de6a35764de4781774405676725"
 *   result = "1.baef9f836a5b8188ce3c899f1d32a7ee"  ✓
 */

const crypto = require('crypto');

// Fixed salt chain extracted from webpack modules 10→37→27→12→30→...
const SALT_CHAIN = [
  'V37C+LNz',
  'YB',
  '',
  'WKSxfWEI/MFUUuKTHMPyoU9qoLz',
  'eTuvP7DihT2qXXRltJlS6HA27OBflpu1MWN',
  '/Wd5PYu51kEBhGK4eU9oudq',
  'jMDSaq59FqQu9hADP2ybX8cGw',
  'WiqEcSHJPAELVSe5/o170hxUlHf+',
  'jssSPUNIJje4idBlWi',
  'MXdqh7+flUoEik9sh52J9GTWBzrm6djf',
  '+Ka+PF1JSMLiM4xR6VwO+K1p1DzgwDx',
  'K0P1T9ohT3P2StcoJaXxV',
];

function md5(s) {
  return crypto.createHash('md5').update(s).digest('hex');
}

/**
 * Applies the 12-round MD5 salt chain to an input string.
 * @param {string} input
 * @returns {string} 32-char hex hash
 */
function chainedMd5(input) {
  let h = input;
  for (const salt of SALT_CHAIN) {
    h = md5(h + salt);
  }
  return h;
}

/**
 * Generates captcha_sign for pan.xunlei.com
 *
 * @param {string} clientId    - App client ID, e.g. "Xqp0kJBXWhwaTpB6"
 * @param {string} version     - Client version string, e.g. "1.92.37"
 * @param {string} host        - Page host, e.g. "pan.xunlei.com"
 * @param {string} deviceId    - 32-char hex device fingerprint (from localStorage or generated)
 * @param {number|string} timestamp - Unix ms timestamp (e.g. Date.now())
 * @returns {string} captcha_sign, e.g. "1.baef9f836a5b8188ce3c899f1d32a7ee"
 */
function getCaptchaSign(clientId, version, host, deviceId, timestamp) {
  const base = clientId + version + host + deviceId + String(timestamp);
  return '1.' + chainedMd5(base);
}

// ── Known constants for pan.xunlei.com ──────────────────────────────────────
const CLIENT_ID = 'Xqp0kJBXWhwaTpB6';
const CLIENT_VERSION = '1.92.37';   // may need updating over time
const HOST = 'pan.xunlei.com';

// ── Self-test ────────────────────────────────────────────────────────────────
function selfTest() {
  const DEVICE_ID = 'ce8b565a93e31878b5de6a35764de478';
  const TIMESTAMP = '1774405676725';
  const EXPECTED  = '1.baef9f836a5b8188ce3c899f1d32a7ee';

  const got = getCaptchaSign(CLIENT_ID, CLIENT_VERSION, HOST, DEVICE_ID, TIMESTAMP);
  if (got !== EXPECTED) {
    console.error('[FAIL] captcha_sign mismatch:');
    console.error('  expected:', EXPECTED);
    console.error('  got:     ', got);
    process.exit(1);
  }
  console.log('[PASS] self-test OK:', got);
}

selfTest();

module.exports = { getCaptchaSign, chainedMd5, CLIENT_ID, CLIENT_VERSION, HOST };
