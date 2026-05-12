import { notFound, redirect } from "next/navigation";

import { EditPostScreen } from "@/features/posts/EditPostScreen";
import { loadPostForEditPayload } from "@/features/posts/loadPostForEditPayload";
import { createClient } from "@/lib/supabase/server";
import { isPersistentPostId } from "@/lib/postIds";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  if (!isPersistentPostId(id)) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const result = await loadPostForEditPayload(supabase, id, user.id);

  if (result.kind === "not_found") {
    notFound();
  }

  if (result.kind === "forbidden") {
    redirect(`/post/${id}`);
  }

  return <EditPostScreen postId={id} initialData={result.data} />;
}
