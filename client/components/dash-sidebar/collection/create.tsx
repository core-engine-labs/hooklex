"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createCollection } from "@/lib/services/api/collection";
import { useCollections } from "../../../hooks/useCollections";
import { Collection } from "@/types/collection";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  description: z.string().max(200, "Description too long").optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateCollectionDialogProps {
  children: React.ReactNode;
}

export function CreateCollectionDialog({
  children,
}: CreateCollectionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addCollection } = useCollections(10);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);
      if (!newOpen) reset();
    },
    [reset],
  );

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const response = await createCollection({
        name: values.name,
        description: values.description,
      });

      if (response.success && response.data) {
        toast.success("Collection created successfully");
        addCollection(response.data as Collection);
        handleOpenChange(false);
      } else {
        if (response.status === 429) {
          toast.error("Too many requests. Please slow down.");
        } else if (response.status === 403) {
          toast.error(response.message);
        } else if (response.status === 401) {
          toast.error(response.message);
        } else {
          toast.error(response.message || "Failed to create collection");
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* asChild prevents double button wrapping */}
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Collection</DialogTitle>
          <DialogDescription>
            Give your new collection a name and an optional description.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(async (data, e) => {
            e?.preventDefault();
            await onSubmit(data);
          })}
          className="space-y-4"
        >
          <Field orientation="vertical">
            <FieldLabel htmlFor="collection-name">Name</FieldLabel>
            <Input
              id="collection-name"
              placeholder="My Collection"
              {...register("name")}
            />
            {errors.name && (
              <FieldError errors={[{ message: errors.name.message }]} />
            )}
          </Field>

          <Field orientation="vertical">
            <FieldLabel htmlFor="collection-description">
              Description (optional)
            </FieldLabel>
            <Textarea
              id="collection-description"
              placeholder="What is this collection for?"
              className="resize-none"
              {...register("description")}
            />
            {errors.description && (
              <FieldError errors={[{ message: errors.description.message }]} />
            )}
          </Field>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
