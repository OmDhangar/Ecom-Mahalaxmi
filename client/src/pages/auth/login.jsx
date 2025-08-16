import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { loginFormControls } from "@/config";
import { loginUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";

const initialState = {
  emailOrPhone: "", 
  password: "",
};

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLoginSuccess = () => {
    const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/home';
    sessionStorage.removeItem('redirectAfterLogin');
    navigate(redirectPath);
  };

  function onSubmit(event) {
    event.preventDefault();

    dispatch(loginUser(formData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: data?.payload?.message,
        });
        handleLoginSuccess();
      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Login - Shri Mahalaxmi Mobile</title>
        <meta name="description" content="Login to your Shri Mahalaxmi Mobile account to access exclusive deals and manage your orders." />
      </Helmet>
      
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <div className="mb-6 flex justify-center">
            <img 
              src="/fav.png" 
              className="h-24 w-24 object-contain" 
              alt="Shri Mahalaxmi Mobile Logo"
            />
          </div>
          
          <h1 className="text-3xl font-bold text-center text-foreground">
            Sign in to your account
          </h1>
          
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              className="font-medium text-primary hover:underline"
              to="/auth/register"
            >
              Register here
            </Link>
          </p>
        </div>

        <div className="mt-8">
          <CommonForm
            formControls={loginFormControls}
            buttonText={"Sign In"}
            formData={formData}
            setFormData={setFormData}
            onSubmit={onSubmit}
          />
          
          {/* Forgot Password Link */}
          <div className="mt-4 text-center">
            <Link
              to="/auth/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLogin;