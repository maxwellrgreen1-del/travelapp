/**
 * Post image pipeline — validate → Storage (`post-media` bucket) → `post_media` rows.
 */

export { attachPrimaryPostImageFromFile } from "@/features/media/attachPrimaryPostImage";
export type { AttachPrimaryPostImageFail, AttachPrimaryPostImageOk, AttachPrimaryPostImageResult } from "@/features/media/attachPrimaryPostImage";

export { attachPostGalleryImagesFromFiles } from "@/features/media/attachPostGalleryImages";
export type { AttachPostGalleryImagesResult, GalleryImageFailure } from "@/features/media/attachPostGalleryImages";
