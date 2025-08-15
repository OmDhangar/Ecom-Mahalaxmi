import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { loginFormControls } from "@/config";
import { loginUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

const initialState = {
  emailOrPhone: "", // Changed from email to emailOrPhone
  password: "",
};

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();

    dispatch(loginUser(formData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: data?.payload?.message,
        });
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
          {/* Centered Logo with proper sizing and spacing */}
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
        </div>
      </div>
    </div>
  );
}

export default AuthLogin;