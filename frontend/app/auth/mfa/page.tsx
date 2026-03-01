import { MFAForm } from '@/components/auth/mfa-form';

export const metadata = {
  title: 'Two-Factor Authentication - Healthcare Portal',
  description: 'Complete multi-factor authentication',
};

export default function MFAPage() {
  return <MFAForm />;
}
