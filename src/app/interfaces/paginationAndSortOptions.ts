export type Toptions = {
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  fields?: string;
};

export type ToptionsResult = {
  page: number;
  take: number;
  skip: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
};
