import Button from '../ui/Button';

export default function QRDisplay({ qrDataUrl, qrCode, publicUrl }) {
  if (!qrDataUrl && !qrCode) return null;

  const url = publicUrl || (qrCode ? `${window.location.origin}/artifact/${qrCode}` : null);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `artifact-${qrCode || 'qr'}.png`;
    link.click();
  };

  const handleCopy = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
  };

  return (
    <div className="rounded-2xl border border-[#E2D6C5] bg-[#FAF6F0] p-6 text-center shadow-2xs">
      <h3 className="mb-4 font-display text-sm font-bold text-[#2B1B12]">Artifact QR Code</h3>
      {qrDataUrl ? (
        <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-2xl bg-[#FFFDF9] p-3 border border-[#E2D6C5] shadow-xs">
          <img src={qrDataUrl} alt={`QR code for ${qrCode}`} className="h-44 w-44" />
        </div>
      ) : (
        <div className="mx-auto flex h-48 w-48 items-center justify-center bg-[#EFE5D8] rounded-2xl text-6xl">
          📱
        </div>
      )}
      {qrCode && (
        <p className="mt-3 font-mono text-xs font-bold text-[#5C4233] bg-[#EFE5D8] px-3 py-1 rounded-full inline-block border border-[#D8C8B8]">
          {qrCode}
        </p>
      )}
      {url && (
        <p className="mt-2 break-all text-xs text-[#6E5445]">{url}</p>
      )}
      <div className="mt-4 flex justify-center gap-2">
        {qrDataUrl && (
          <Button type="button" variant="primary" size="sm" onClick={handleDownload}>
            Download QR
          </Button>
        )}
        {url && (
          <Button type="button" variant="secondary" size="sm" onClick={handleCopy}>
            Copy Link
          </Button>
        )}
      </div>
    </div>
  );
}
