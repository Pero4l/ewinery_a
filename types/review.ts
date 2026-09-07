import { User } from "./auth";

export interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  status: ReviewStatus;
  moderationNote?: string;
  user?: User;
  userId: string;
  productId: string;
  productName?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ReviewStatus = "PENDING" | "APPROVED" | "HIDDEN";

export interface ModerateReviewDto {
  status: ReviewStatus;
  moderationNote?: string;
}
