import api from './apiClient';

export async function getUnlockedModulesByUser(userId) {
  if (!userId) throw new Error('getUnlockedModulesByUser: userId is required');
  // Primary: GET with path param per backend router.get('/getUserModulesByUserId/:userId')
  try {
    const url = `/api/modules/getUserModulesByUserId/${encodeURIComponent(userId)}`;
    console.log('[MyLessons][GET:path] →', url, { userId });
    const res = await api.get(url, { withCredentials: true });
    console.log('[MyLessons][GET:path] status', res?.status, 'dataKeys', Object.keys(res?.data || {}));
    const data = res?.data?.data || res?.data || [];
    console.log('[MyLessons][GET:path] items', Array.isArray(data) ? data.length : 'not-array');
    return Array.isArray(data) ? data : [];
  } catch (err) {
    // Fallbacks: GET with query or POST body, in case of environment differences
    try {
      const urlQ = '/api/modules/getUserModulesByUserId';
      console.log('[MyLessons][GET:query] →', urlQ, { userId });
      const resQ = await api.get(urlQ, { params: { userId }, withCredentials: true });
      console.log('[MyLessons][GET:query] status', resQ?.status);
      const dataQ = resQ?.data?.data || resQ?.data || [];
      console.log('[MyLessons][GET:query] items', Array.isArray(dataQ) ? dataQ.length : 'not-array');
      return Array.isArray(dataQ) ? dataQ : [];
    } catch (_) {
      const urlP = '/api/modules/getUserModulesByUserId';
      console.log('[MyLessons][POST:body] →', urlP, { userId });
      const resP = await api.post(urlP, { userId }, { withCredentials: true });
      console.log('[MyLessons][POST:body] status', resP?.status);
      const dataP = resP?.data?.data || resP?.data || [];
      console.log('[MyLessons][POST:body] items', Array.isArray(dataP) ? dataP.length : 'not-array');
      return Array.isArray(dataP) ? dataP : [];
    }
  }
}

export default {
  getUnlockedModulesByUser,
};


