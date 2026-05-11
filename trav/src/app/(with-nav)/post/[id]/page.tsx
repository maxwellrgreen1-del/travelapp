import { PostDetailScreen } from "@/features/posts/PostDetailScreen";
import { loadSupabaseTravelPostDetail } from "@/features/posts/loadSupabaseTravelPostDetail";
import { resolveTravelPostDetail } from "@/features/posts/travelPostDetailModel";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const mockDetail = resolveTravelPostDetail(id);
  const detail = mockDetail ?? (await loadSupabaseTravelPostDetail(id));

  return <PostDetailScreen requestedId={id} detail={detail} />;
}
