import { ReactNode } from "react";

export type Asset = {
  width: string | number;
  height: string | number;
  url: string;
  title: string;
};

export type Chapter = {
  title: string;
  characters: string;
  content: ReactNode;
  images: Asset[];
};
