export interface Sheet {
  id: string;
  title: string;
  subtitle: string;
  tags: string[];
  content: any[];
  isSaved: boolean;
}

export interface Story {
  id: string;
  title: string;
  subtitle: string;
  content: any;
  tags: string[];
  coverImage: string;
  sheets?: Sheet[];
  createdAt: number;
  updatedAt: number;
}
