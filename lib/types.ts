export type Skill = {
  name: string;
  level: number;
};

export type Project = {
  id: number;
  title: string;
  category: string;
  image: string;
  description: string;
  url?: string;
};

export type Service = {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};
