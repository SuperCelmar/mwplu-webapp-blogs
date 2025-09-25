## Components UX Description

Describes each component involved in the blog feature, their UX behavior.


### 1. Company Context Manager

Multiple state behavior:
- First it'll check the database if we have a record or not of the Company Context. This can be found in the `public.company_context` table.

#### A. If none: 
    Load the welcome interface that has small message and just a button to start the company context manager.

    Once the user click on "Ajouter le contexte", This will open up the company context as the form, with the:
        - Name
        - Mission
        - Tone
        - Messaging
        - Brand Voice Guidelines
        - Active checkbox
    And the Preview.

    The Save Button will verify that all those fields are completed, And then push them along with the user (either admin or editors user.id) to the `public.company_context` table. Upon receiving the success response, you can process to step B

#### B. If there's a record:
    Load the latest record that is active from `public.company_context` table.
    Render the company context in a nice component with all the details. 
    An edit button is available for editors and admins.

    - The edit button will make the Company Context reappeared with prefilled data from the last record, the same from step A. Ready to be edited.  


### 2. Blog Editor

This component allows the user to create their article very easily, by adding all the necessary details of SEO or meta data, and also have the description and all.

- UI: A big chunk of the screen is dedicated to the content of the article, and the other half dedicated to the preview.

On top we would have 3 buttons: "Valider Metadonnée", "Enregistrer Brouillon", and "Enregistrer l'article".

The button "Valider Metadonnée" on top; will open up a pop up screen, with fields input like SEO, meta description, Slug (this will be used to make the canonical URL), category, tags. And also a cover image as

And has two buttons: "Valider SEO" and "Enregistrer"

##### Behavior:

- Upon Clicking on "Enregistrer" of the pop up, it'll close the pop up, and we will have the button "Enregistrer l'article" that will be now clickable. Clicking to this button will send all the details to the respective tables in the database.

- If the data in the pop up window has not been filled, you cannot click on "Enregistrer l'article" will only throw a notification error that metadata info is not filled. If fields are completed it will set the article status to "ready". It will show a notification that article has succesfully set "ready" and will go back to the dashboard after one sec.

- Clicking on "Enregistrer Brouillon" will save all the progress of that article as a draft in the database. It will show a notification that the draft has been saved, and it will redirect the page to the dashboard after one 1 sec.


##### Preview Carousel (Blog Editor)

This enhancement replaces the current preview column with a compact carousel that helps the editor quickly validate how the article will look across key contexts.

- UI: The right side of the editor shows a small carousel with navigation arrows and pagination dots. Keyboard navigation is available (Left/Right arrows). The carousel cycles through 4 previews.

Slides:

1. Article Page Preview
    - Mirrors the article page: title, cover image, and rendered markdown content (lightweight markdown renderer in v1; falls back to plain text if disabled).
    - Uses tokens for spacing, typography, and colors.
    - Respects theme (light/dark) automatically.

2. Listing Row Preview
    - Simulates how the article will appear in the blog listing: cover image thumbnail, title, excerpt.
    - Validates truncation (title and excerpt) and line clamps to avoid overflow.

3. SEO (Google) Snippet Preview
    - Shows meta title, canonical URL (`/blog/<slug>`), and meta description with SEO-like truncation and ellipsis.
    - Fallbacks: `meta_title || title`, `meta_description || excerpt`.

4. X/Twitter Card Preview
    - Simulates a Summary Large Image card: big image, title, description, and site/handle.
    - Fallbacks: `twitter_*` → `og_*` → article fields (`cover_image_url`, `title`, `excerpt`).

Behavior:

- The carousel updates live as the editor types or edits metadata.
- If metadata is missing, the preview uses sane fallbacks and displays subtle hints (e.g., "Aucune description SEO" in muted text) without blocking editing.
- No external calls to Google or X/Twitter; previews are simulated for speed and privacy.
- Accessibility: Focusable controls, `aria-label` on arrows and dots, and visible focus states according to tokens.

Validation & Gating:

- The button "Enregistrer l'article" remains gated by metadata rules already defined. The SEO slide provides visual feedback but does not change gating logic.
- The SEO slide mirrors the values from the modal. Saving metadata updates the preview state.

Notes:

- SERP URL: use the site origin configured in the app (`window.location.origin`) combined with `/blog/<slug>`.
- Card Type: Summary Large Image is the default template.
- Performance: Renders lightweight content; avoids heavy images by constraining preview image sizes.

