import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { registerFormControls } from "@/config";
import { registerUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";

const initialState = {
  userName: "",
  email: "",
  phone: "", // Added phone
  password: "",
};

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();
    dispatch(registerUser(formData)).then((data) => {

      if (data?.payload?.success) {
        toast({
          title: data?.payload?.message,
        });
        navigate("/auth/login");
      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }


  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <Helmet>
        <title>Register - Shri Mahalaxmi Mobile</title>
        <meta name="description" content="Create your account at Shri Mahalaxmi Mobile and start shopping for the latest mobiles and accessories." />
      </Helmet>
      <div className="text-center">
         {/* Centered Logo with proper sizing and spacing */}
                  <div className="mb-6 flex justify-center">
                    <img 
                      src="/fav.png" 
                      className="h-24 w-24 object-contain" 
                      alt="Shri Mahalaxmi Mobile Logo"
                    />
                  </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Create new account
        </h1>
        <p className="mt-2">
          Already have an account
          <Link
            className="font-medium ml-2 text-primary hover:underline"
            to="/auth/login"
          >
            Login
          </Link>
        </p>
      </div>
      <CommonForm
        formControls={registerFormControls}
        buttonText={"Sign Up"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
    </div>
  );
}

export default AuthRegister;
