import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBooks, useDeleteBook } from "@/hooks/books";
import { useGenres } from "@/hooks/genre";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { useDebounceCallback } from "usehooks-ts";
import { Link } from "react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { BookCreateDialog } from "@/components/BookCreateDialog";

const useBookParmas = () =>
  useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(9),
    genre: parseAsString.withDefault(""),
    q: parseAsString.withDefault(""),
  });
function Home() {
  // UI state for filters and pagination
  const [{ page, perPage, genre, q }, setParams] = useBookParmas();
  const genres = useGenres();
  const genreList = genres.data?.data ?? [];

  const books = useBooks({
    genre,
    page,
    perPage,
    q,
  });

  const bookList = books.data?.data?.data ?? [];
  const meta = books.data?.data?.meta;

  const totalPages = meta?.totalPages ?? 1;
  const currentPage = meta?.currentPage ?? 1;

  const canPrev = !!meta?.previousPage && currentPage > 1;
  const canNext = !!meta?.nextPage && currentPage < totalPages;

  const deleteBookMutation = useDeleteBook();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<{ id: string; title: string } | null>(null);

  // Reset to page 1 when changing genre
  const onGenreChange = (value: string) => {
    if (value === "all") {
      setParams({ genre: null, page: null });
    } else {
      setParams({ genre: value, page: null });
    }
  };

  const onPrev = () => {
    if (canPrev) setParams({ page: currentPage - 1 });
  };

  const onNext = () => {
    if (canNext) setParams({ page: currentPage + 1 });
  };

  const onSearch = useDebounceCallback(
    (value: string) => {
      setParams({ q: value, page: null });
    },
    500,
    {
      maxWait: 1000,
    }
  );

  const handleDeleteBook = (bookId: string) => {
    deleteBookMutation.mutate(bookId, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setBookToDelete(null);
      },
      onError: (error) => {
        console.error("Failed to delete book:", error);
      },
    });
  };

  const openDeleteDialog = (bookId: string, bookTitle: string) => {
    setBookToDelete({ id: bookId, title: bookTitle });
    setDeleteDialogOpen(true);
  };
  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <label>Filter by genre:</label>
        <Select value={genre} onValueChange={onGenreChange}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="All genres" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All genres</SelectItem>
            {genreList.map((g) => (
              <SelectItem key={g.id} value={g.keyName}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label>Search:</label>
        <Input
          type="search"
          defaultValue={q}
          onChange={(e) => {
            onSearch(e.target.value);
          }}
          placeholder="Search books..."
          className="w-64"
        />
        
        <BookCreateDialog />
      </div>

      {/* Books list */}
      <div>
        {books.isLoading && <div>Loading books...</div>}
        {books.isError && (
          <div className="text-red-600">Failed to load books.</div>
        )}
        {!books.isLoading && bookList.length === 0 && (
          <div>No books found.</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookList.map((b) => (
            <Card key={b.id}>
              <CardHeader>
                <CardTitle>{b.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  By {b.author}
                </div>
                <div className="text-sm">Genre: {b.genre?.name}</div>
                <div className="text-xs text-gray-500">
                  Published: {b.published}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button size="sm" variant="outline" asChild>
                  <Link to={`/books/${b.id}`}>Details</Link>
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => openDeleteDialog(b.id, b.title)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center gap-2">
        <Button disabled={!canPrev} onClick={onPrev}>
          Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button disabled={!canNext} onClick={onNext}>
          Next
        </Button>
      </div>

        {/* Single Alert Dialog for all delete operations */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the book "{bookToDelete?.title}" from the inventory.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => bookToDelete && handleDeleteBook(bookToDelete.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

export default Home;
