export interface IScrappingResponse {
  scrappedAt: Date;
  title: string | null;
  description: string | null;
  domain: string | null;
  https: boolean | null;
  lang: string | null;
  image: string | null;
  favicon: string | null;
}

export type TOnlyParam = keyof IScrappingResponse | null;
