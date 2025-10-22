import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBook } from "@/hooks/books";
import { useNavigate, useParams } from "react-router";

function BookDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading, isError } = useBook(String(id));
  const book = data?.data;

  return (
    <div className="p-4">
      <div className="mb-4">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          ← Back to list
        </Button>
      </div>

      {isLoading && <div>Loading book...</div>}
      {isError && <div className="text-red-600">Failed to load book.</div>}
      {!isLoading && book && (
        <Card>
          <CardHeader>
            <CardTitle>{book.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Author:</span> {book.author}
              </div>
              <div>
                <span className="font-medium">Genre:</span> {book.genre?.name}
              </div>
              <div className="text-muted-foreground">
                <span className="font-medium">Published:</span> {book.published}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default BookDetail;