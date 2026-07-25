// Shared helpers still used by ticketApi offline fallbacks.

export function isBackendError(error) {
  if (!error) return true;
  if (!error.response) return true;
  return (
    error.code === 'ERR_NETWORK' ||
    error.message === 'Network Error' ||
    error.response.status === 404 ||
    error.response.status >= 500
  );
}

export function generateQRDataUrl(code) {
  const publicUrl = `${window.location.origin}/artifact/${code}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}&color=2B1B12&bgcolor=FAF6F0`;
}
