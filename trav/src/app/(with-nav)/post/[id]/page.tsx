import { PostDetailScreen } from "@/features/posts/PostDetailScreen";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return <PostDetailScreen id={id} />;
}
