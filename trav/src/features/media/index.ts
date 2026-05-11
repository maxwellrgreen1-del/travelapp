/**
 * Post image pipeline — validate → Storage (`post-media` bucket) → `post_media` row.
 * Create Post UI can call `attachPrimaryPostImageFromFile` after `publishTripPost` resolves.
 */

export { attachPrimaryPostImageFromFile } from "@/features/media/attachPrimaryPostImage";
export type { AttachPrimaryPostImageFail, AttachPrimaryPostImageOk, AttachPrimaryPostImageResult } from "@/features/media/attachPrimaryPostImage";
