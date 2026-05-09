export type Course = {
  id: string;
  name: string;
  duration: string;
  seats: number;
};

export type Review = {
  id: string;
  student: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type Placement = {
  id: string;
  year: number;
  placementRate: number;
  averageSalaryLpa: number;
  highestSalaryLpa: number;
};

export type College = {
  id: string;
  name: string;
  location: string;
  fees: number;
  rating: number;
  overview: string;
  placementRate: number;
  averageSalaryLpa: number;
  establishedYear: number;
  courses?: Course[];
  reviews?: Review[];
  placements?: Placement[];
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type Question = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
  answers: Array<{
    id: string;
    body: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
    };
  }>;
};

export type CollegeTrackingStatus = "LONG_LIST" | "SHORT_LIST" | "WANT_TO_APPLY" | "APPLIED";
