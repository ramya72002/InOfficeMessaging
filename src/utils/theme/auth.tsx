import { useRouter } from 'next/navigation';
import { useEffect, ComponentType, useState } from 'react';

export const withAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const AuthenticatedComponent: React.FC<P> = (props) => {
    const router = useRouter();
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [email, setEmail] = useState<string | null>(null);

    useEffect(() => {
      const storedEmail = localStorage.getItem('email');
      setEmail(storedEmail);
      if (!storedEmail) {
        // Redirect to the higher authentication page if email is not found
        router.push('/auth/login'); // Replace with your actual higher auth page route
      }
      setIsAuthChecked(true); // Mark as checked after accessing localStorage
    }, [router]);

    // If the authentication check is not yet completed, render nothing
    if (!isAuthChecked) return null;

    // If the email exists, render the wrapped component
    return email ? <WrappedComponent {...props} /> : null; // Render nothing until redirection
  };

  return AuthenticatedComponent;
};
