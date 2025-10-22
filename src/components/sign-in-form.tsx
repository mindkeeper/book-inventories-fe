import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField } from "./ui/form";
import { useSignIn } from "@/hooks/auth";
import { Link } from "react-router";

const SignInSchema = z.object({
  email: z.email({ error: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 6 characters long" }),
});
type TSignIn = z.infer<typeof SignInSchema>;

export function SigninForm({ ...props }: React.ComponentProps<typeof Card>) {
  const { mutateAsync, error, isError } = useSignIn();

  const form = useForm<TSignIn>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: TSignIn) => {
    mutateAsync(data);
  };

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Sign in to your account</CardTitle>
        <CardDescription>
          Enter your email below to Sign in to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <Field data-invalid={!!form.formState.errors.email}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input id="email" type="email" {...field} />
                    {form.formState.errors.email && (
                      <FieldError>
                        {form.formState.errors.email.message}
                      </FieldError>
                    )}
                  </Field>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <Field data-invalid={!!form.formState.errors.password}>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input id="password" type="password" {...field} />
                    <FieldDescription>
                      Must be at least 6 characters long.
                    </FieldDescription>
                  </Field>
                )}
              />

              <FieldGroup>
                <Field>
                  <FieldError>{isError ? error?.message : ""}</FieldError>
                  <Button type="submit">Sign in</Button>
                  <FieldDescription className="px-6 text-center">
                    Don't have an account? <Link to="/sign-up">Sign up</Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </FieldGroup>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
