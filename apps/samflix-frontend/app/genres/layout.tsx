import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Genres | Samflix",
  description: "Browse movies and TV series by genre on Samflix",
};

export default function GenresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
