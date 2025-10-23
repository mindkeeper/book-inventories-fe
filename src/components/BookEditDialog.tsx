import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Form, FormField } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEditBook } from "@/hooks/books";
import { useGenres } from "@/hooks/genre";
import { Edit } from "lucide-react";
import type { Book } from "@/types/book";

// Zod schema for book editing validation
const bookEditSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  author: z.string().min(1, "Author is required").max(255, "Author is too long"),
  published: z.string()
    .min(1, "Published year is required")
    .regex(/^\d{4}$/, "Published year must be a 4-digit year (e.g., 2024)"),
  genreId: z.string().min(1, "Genre is required"),
});

type BookEditFormData = z.infer<typeof bookEditSchema>;

interface BookEditDialogProps {
  book: Book;
  children?: React.ReactNode;
}

export function BookEditDialog({ book, children }: BookEditDialogProps) {
  const [open, setOpen] = useState(false);
  const editBookMutation = useEditBook();
  const { data: genresData, isLoading: genresLoading } = useGenres();
  const genres = genresData?.data ?? [];

  const form = useForm<BookEditFormData>({
    resolver: zodResolver(bookEditSchema),
    defaultValues: {
      title: "",
      author: "",
      published: "",
      genreId: "",
    },
  });

  // Update form values when book data changes or dialog opens
  useEffect(() => {
    if (book && open) {
      form.reset({
        title: book.title,
        author: book.author,
        published: book.published,
        genreId: book.genre.id,
      });
    }
  }, [book, open, form]);

  const onSubmit = (data: BookEditFormData) => {
    editBookMutation.mutate(
      {
        id: book.id,
        data: {
          title: data.title,
          author: data.author,
          published: data.published,
          genreId: data.genreId,
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset();
        },
        onError: (error) => {
          console.error("Failed to update book:", error);
        },
      }
    );
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Book
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Book</DialogTitle>
          <DialogDescription>
            Update the book information. Fill in all the required fields.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <Field data-invalid={!!form.formState.errors.title}>
                    <FieldLabel htmlFor="title">Title</FieldLabel>
                    <Input id="title" placeholder="Enter book title" {...field} />
                    {form.formState.errors.title && (
                      <FieldError>
                        {form.formState.errors.title.message}
                      </FieldError>
                    )}
                  </Field>
                )}
              />
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <Field data-invalid={!!form.formState.errors.author}>
                    <FieldLabel htmlFor="author">Author</FieldLabel>
                    <Input id="author" placeholder="Enter author name" {...field} />
                    {form.formState.errors.author && (
                      <FieldError>
                        {form.formState.errors.author.message}
                      </FieldError>
                    )}
                  </Field>
                )}
              />
              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <Field data-invalid={!!form.formState.errors.published}>
                    <FieldLabel htmlFor="published">Published Year</FieldLabel>
                    <Input 
                      id="published"
                      type="text" 
                      placeholder="e.g., 2024" 
                      {...field} 
                    />
                    {form.formState.errors.published && (
                      <FieldError>
                        {form.formState.errors.published.message}
                      </FieldError>
                    )}
                  </Field>
                )}
              />
              <FormField
                control={form.control}
                name="genreId"
                render={({ field }) => (
                  <Field data-invalid={!!form.formState.errors.genreId}>
                    <FieldLabel htmlFor="genreId">Genre</FieldLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={genresLoading}
                    >
                      <SelectTrigger id="genreId">
                        <SelectValue placeholder="Select a genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {genres.map((genre) => (
                          <SelectItem key={genre.id} value={genre.id.toString()}>
                            {genre.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.genreId && (
                      <FieldError>
                        {form.formState.errors.genreId.message}
                      </FieldError>
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={editBookMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={editBookMutation.isPending}
              >
                {editBookMutation.isPending ? "Updating..." : "Update Book"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}