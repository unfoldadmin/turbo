"use client";

import { useRegister } from "@/lib/hooks/useAuth";
import { fieldApiError } from "@/lib/forms";
import { registerFormSchema } from "@/lib/validation";
import { ApiError } from "@/lib/api-client";
import { FormFooter } from "@frontend/ui/forms/form-footer";
import { FormHeader } from "@frontend/ui/forms/form-header";
import { SubmitField } from "@frontend/ui/forms/submit-field";
import { TextField } from "@frontend/ui/forms/text-field";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

export type RegisterFormSchema = z.infer<typeof registerFormSchema>;

export function RegisterForm() {
  const { formState, handleSubmit, register, setError } =
    useForm<RegisterFormSchema>({
      resolver: zodResolver(registerFormSchema),
    });

  const registerMutation = useRegister();

  return (
    <>
      <FormHeader
        title='Create new account in Turbo'
        description='Get an access to internal application'
      />

      <form
        onSubmit={handleSubmit(async (data) => {
          try {
            await registerMutation.mutateAsync({
              username: data.username,
              email: data.email,
              first_name: data.firstName,
              last_name: data.lastName,
              password: data.password,
              password_retype: data.passwordRetype,
            });

            // 注册成功后跳转到登录页面
            signIn();
          } catch (error: any) {
            // 处理错误 - fetch API 使用 ApiError
            if (error instanceof ApiError && error.data) {
              const errorData = error.data;
              fieldApiError("username", "username", errorData, setError);
              fieldApiError("email", "email", errorData, setError);
              fieldApiError("first_name", "firstName", errorData, setError);
              fieldApiError("last_name", "lastName", errorData, setError);
              fieldApiError("password", "password", errorData, setError);
              fieldApiError(
                "password_retype",
                "passwordRetype",
                errorData,
                setError
              );
            }
          }
        })}
      >
        <TextField
          type='text'
          register={register("username")}
          formState={formState}
          label='Username'
          placeholder='Unique username'
        />

        <TextField
          type='text'
          register={register("email")}
          formState={formState}
          label='Email'
          placeholder='Your email address'
        />

        <TextField
          type='text'
          register={register("firstName")}
          formState={formState}
          label='First name'
          placeholder='Your first name (optional)'
        />

        <TextField
          type='text'
          register={register("lastName")}
          formState={formState}
          label='Last name'
          placeholder='Your last name (optional)'
        />

        <TextField
          type='password'
          register={register("password")}
          formState={formState}
          label='Password'
          placeholder='Your new password'
        />

        <TextField
          type='password'
          register={register("passwordRetype")}
          formState={formState}
          label='Retype password'
          placeholder='Verify password'
        />

        <SubmitField isLoading={registerMutation.isPending}>
          {registerMutation.isPending ? "Creating account..." : "Sign up"}
        </SubmitField>
      </form>

      <FormFooter
        cta='Already have an account?'
        link='/login'
        title='Sign in'
      />
    </>
  );
}
