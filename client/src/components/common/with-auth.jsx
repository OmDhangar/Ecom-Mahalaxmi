import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

// Create a React component that wraps the authentication logic
export function WithAuth({ children, onAction }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleAction = (...args) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to continue",
        variant: "destructive",
      });
      navigate('/auth/login');
      return;
    }
    
    // If authenticated, proceed with the original callback
    return onAction(...args);
  };

  return children(handleAction);
}

// Helper function to use the WithAuth component
export const withAuth = (callback) => {
  return (props) => (
    <WithAuth onAction={callback}>
      {(handleAction) => props.children(handleAction)}
    </WithAuth>
  );
};