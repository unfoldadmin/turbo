"use client";

import { useCurrentUser, usePartialUpdateUser } from "@/lib/hooks/useAuth";
import { fieldApiError } from "@/lib/forms";
import { profileFormSchema } from "@/lib/validation";
import { ApiError } from "@/lib/api-client";
import { FormHeader } from "@frontend/ui/forms/form-header";
import { SubmitField } from "@frontend/ui/forms/submit-field";
import { TextField } from "@frontend/ui/forms/text-field";
import { SuccessMessage } from "@frontend/ui/messages/success-message";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

export type ProfileFormSchema = z.infer<typeof profileFormSchema>;

export function ProfileForm() {
  const [success, setSuccess] = useState<boolean>(false);
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const updateUserMutation = usePartialUpdateUser();

  const { formState, handleSubmit, register, setError, reset } =
    useForm<ProfileFormSchema>({
      resolver: zodResolver(profileFormSchema),
      defaultValues: {
        firstName: currentUser?.first_name || "",
        lastName: currentUser?.last_name || "",
      },
    });

  // 当用户数据加载完成后，重置表单
  React.useEffect(() => {
    if (currentUser) {
      reset({
        firstName: currentUser.first_name || "",
        lastName: currentUser.last_name || "",
      });
    }
  }, [currentUser, reset]);

  if (userLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <FormHeader
        title='Update you profile information'
        description='Change your account data'
      />

      <form
        onSubmit={handleSubmit(async (data) => {
          try {
            await updateUserMutation.mutateAsync({
              first_name: data.firstName,
              last_name: data.lastName,
            });

            setSuccess(true);
          } catch (error: any) {
            setSuccess(false);

            if (error instanceof ApiError && error.data) {
              const errorData = error.data;
              fieldApiError("first_name", "firstName", errorData, setError);
              fieldApiError("last_name", "lastName", errorData, setError);
            }
          }
        })}
      >
        {success && (
          <SuccessMessage>Profile has been succesfully updated</SuccessMessage>
        )}

        <TextField
          type='text'
          register={register("firstName")}
          label='First name'
          formState={formState}
        />

        <TextField
          type='text'
          register={register("lastName")}
          label='Last name'
          formState={formState}
        />

        <SubmitField disabled={updateUserMutation.isPending}>
          {updateUserMutation.isPending ? "Updating..." : "Update profile"}
        </SubmitField>
      </form>
    </>
  );
}
