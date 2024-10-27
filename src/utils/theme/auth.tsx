// utils/auth.tsx

import { useRouter } from 'next/navigation';
import { useEffect, ComponentType } from 'react';

export const withAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const AuthenticatedComponent: React.FC<P> = (props) => {
    const router = useRouter();
    const email = localStorage.getItem('email');

    useEffect(() => {
      if (!email) {
        // Redirect to the higher authentication page if email is not found
        router.push('/auth/login'); // Replace with your actual higher auth page route
      }
    }, [email, router]);

    // If the email exists, render the wrapped component
    return email ? <WrappedComponent {...props} /> : null; // Render nothing until redirection
  };

  return AuthenticatedComponent;
};
