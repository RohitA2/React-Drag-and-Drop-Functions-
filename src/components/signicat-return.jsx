import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function SignicatReturn() {
  const [params] = useSearchParams();

  useEffect(() => {
    const status = params.get('status');
    if (status === 'SUCCESS') {
      toast.success('Document signed successfully!');
    } else {
      toast.error('Signing failed or cancelled.');
    }
  }, []);

  return (
    <div className="p-5 text-center">
      <h3>Thank you for signing!</h3>
      <p>Your document signing session has ended.</p>
    </div>
  );
}
