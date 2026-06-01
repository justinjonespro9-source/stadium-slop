# Homepage example scorecard images

Drop static assets here and point to them from `lib/home-scorecard-example.ts`:

- `sample-food.jpg` (or `.png`, `.webp`) → `foodImage: "/branding/example-scorecards/sample-food.jpg"`
- `sample-reviewer.jpg` → `reviewerImage: "/branding/example-scorecards/sample-reviewer.jpg"`

Optional alt text: `foodImageAlt`, `reviewerImageAlt`.

If paths are omitted, the homepage module uses emoji (front food well) and initials (front strip + back profile).

- `foodImage` appears on the **front** food photo well.
- `reviewerImage` appears on the **front** reviewer strip and the **back** profile block (square photo).
