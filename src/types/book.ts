export type Book = {
  id: string;
  title: string;
  author: string;
  published: string;
  genre: {
    id: string;
    name: string;
  };
};

export type TBookSchema = {
  title?: string;
  author?: string;
  published?: string;
  genreId?: string;
};

export type TBookUpdateSchma = {
  id: string;
  data: TBookSchema;
};
