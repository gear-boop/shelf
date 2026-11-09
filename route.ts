import { getBindings } from "@/lib/cf";
import { sameOrigin, fail, json } from "@/lib/http";
import { createSite, slugify } from "@/lib/store";
import { briefFromForm, composeSpec } from "@/lib/spec";
import { isAllowedImage, MAX_BYTES, putImage } from "@/lib/uploads";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("This request came from another origin.", 403);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("Send the brief as multipart form data.");
  }

  const files = form.getAll("image").filter((entry): entry is File => entry instanceof File);
  const image = files[0];
  if (!image || image.size === 0) return fail("Add a photo of your product first.");
  if (!isAllowedImage(image.type)) return fail("Use a JPG, PNG or WebP photo.");
  if (image.size > MAX_BYTES) return fail("That photo is over 8 MB. Try a smaller one.");

  const brief = briefFromForm({
    name: form.get("name"),
    description: form.get("description"),
    audience: form.get("audience"),
    tone: form.get("tone"),
    price: form.get("price"),
    currency: form.get("currency"),
    mode: form.get("mode"),
  });

  if (brief.name.length < 2) return fail("Give your product a name.");

  const slugBase = slugify(brief.name);

  try {
    const { FILES, DB } = await getBindings();
    const spec = composeSpec(brief);
    const uploaded = await putImage(FILES, await image.arrayBuffer(), image.type);

    const site = await createSite(DB, {
      spec,
      name: brief.name,
      imageKey: uploaded.key,
      imageType: uploaded.type,
      source: "local",
      brief,
    });

    return json(
      {
        slug: site.slug,
        token: site.token,
        name: brief.name,
        url: `/s/${site.slug}`,
        slugBase,
      },
      201,
    );
  } catch (error) {
    console.error("generate failed", (error as Error).message);
    return fail("The storefront could not be generated. Try again.", 500);
  }
}
