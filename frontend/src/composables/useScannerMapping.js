/**
 * useScannerMapping.js
 *
 * Shared composable for mapping raw receipt scanner output (heuristics, hints, merchant info)
 * to database entities (categories, accounts, family members).
 * Used by both TransactionsPage.vue and ShoppingPage.vue.
 */

export function useScannerMapping(accountsRef, categoriesRef, membersRef) {

  const catPatterns = {
    food:          /(makan|minum|food|drink|dining|cafe|kopi|restoran|resto|snack|bakery|bakso|mie)/i,
    groceries:     /(grocer|belanja|sembako|bulanan|pasar|dapur|market|supermarket|minimarket|hypermart)/i,
    health:        /(sehat|obat|medis|health|medical|apotek|klinik|pharmacy)/i,
    utilities:     /(listrik|air|utilit|bill|telepon|internet|pulsa|pdam|pln)/i,
    transport:     /(transport|bensin|kendaraan|ojek|gojek|grab|fuel|parkir|toll|bensin|pertamina|shell)/i,
    entertainment: /(hiburan|entertain|cinema|bioskop|games|sport|rekreasi)/i,
    household:     /(rumah|perabot|elektronik|furniture|hardware|home)/i,
    shopping:      /(belanja|shop|fashion|baju|pakaian|sepatu|mall)/i,
  };

  /**
   * Maps scanned category heuristic to an expense category ID in the database.
   * @param {object} scanResult - Result object from scanReceipt()
   * @returns {{ categoryId: string, confidence: 'high'|'low' }}
   */
  function mapCategory(scanResult) {
    const categories = categoriesRef.value || [];
    const expenseCats = categories.filter(c => c.type === 'expense');
    if (!expenseCats.length) return { categoryId: '', confidence: 'low' };

    const catRec = scanResult?.heuristics?.category || scanResult?.merchant?.category || 'groceries';

    for (const [catKey, pattern] of Object.entries(catPatterns)) {
      if (catKey === catRec) {
        const match = expenseCats.find(c => pattern.test(c.name));
        if (match) return { categoryId: match.id, confidence: 'high' };
      }
    }

    // Fallback: match by merchant name
    const merchantName = (scanResult?.merchant?.name || scanResult?.merchantName || '').toLowerCase();
    if (merchantName) {
      for (const [catKey, pattern] of Object.entries(catPatterns)) {
        if (pattern.test(merchantName)) {
          const match = expenseCats.find(c => pattern.test(c.name));
          if (match) return { categoryId: match.id, confidence: 'high' };
        }
      }
    }

    return { categoryId: expenseCats[0].id, confidence: 'low' };
  }

  /**
   * Maps scanned account hints/heuristics to a financial account ID in the database.
   * @param {object} scanResult
   * @returns {{ accountId: string, confidence: 'high'|'low' }}
   */
  function mapAccount(scanResult) {
    const accounts = accountsRef.value || [];
    if (!accounts.length) return { accountId: '', confidence: 'low' };

    const accRec = scanResult?.heuristics?.account || scanResult?.payment?.type;
    const accHint = scanResult?.heuristics?.accountHint || scanResult?.payment?.hint;

    // 1. Explicit account hint (e.g. 'mandiri', 'blu', 'bca')
    if (accHint) {
      const match = accounts.find(a => new RegExp(accHint, 'i').test(a.name));
      if (match) return { accountId: match.id, confidence: 'high' };
    }

    // 2. Account type recommendation
    if (accRec === 'cash') {
      const match = accounts.find(a => /(cash|tunai|dompet|fisik)/i.test(a.name));
      if (match) return { accountId: match.id, confidence: 'high' };
    } else if (accRec === 'wallet') {
      const match = accounts.find(a => /(wallet|gopay|ovo|dana|shopee|link|digital|qris|blu)/i.test(a.name));
      if (match) return { accountId: match.id, confidence: 'high' };
    } else if (accRec === 'bank') {
      const match = accounts.find(a => /(bank|mandiri|bca|bni|bri|cimb|debit|tabungan|livin)/i.test(a.name));
      if (match) return { accountId: match.id, confidence: 'high' };
    }

    // 3. Fallback to first available account
    return { accountId: accounts[0].id, confidence: 'low' };
  }

  /**
   * Maps member hint or raw OCR text to a family member ID.
   * @param {object} scanResult
   * @returns {{ memberId: string, confidence: 'high'|'low' }}
   */
  function mapMember(scanResult) {
    const members = membersRef.value || [];
    if (!members.length) return { memberId: '', confidence: 'low' };

    const memberHint = scanResult?.heuristics?.memberHint || scanResult?.member?.hint;

    if (memberHint) {
      const match = members.find(m => new RegExp(memberHint, 'i').test(m.name));
      if (match) return { memberId: match.id, confidence: 'high' };
    }

    const rawLower = (scanResult?.rawText || '').toLowerCase();
    if (rawLower) {
      const match = members.find(m => rawLower.includes(m.name.toLowerCase()));
      if (match) return { memberId: match.id, confidence: 'high' };
    }

    return { memberId: members[0].id, confidence: 'low' };
  }

  return {
    mapCategory,
    mapAccount,
    mapMember,
  };
}
