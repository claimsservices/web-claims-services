# Code Structure Improvements for `task-detail.html`

## Objective
To reduce the length and improve the maintainability of `web-claims-services/html/task-detail.html` by dynamically generating repetitive HTML sections, specifically the image upload galleries.

## Current State
The `task-detail.html` file previously contained numerous repetitive `<div class="col-4 mb-3 text-center">...</div>` blocks for image uploads across different sections (exterior, interior, damage, documents). This led to a very long HTML file, making it harder to read, navigate, and maintain.

## Proposed Solution: Dynamic Generation with JavaScript

Instead of hardcoding each image upload block in the HTML, these sections can be generated programmatically using JavaScript. This approach offers several benefits:
*   **Reduced HTML File Size**: The `task-detail.html` file will become significantly shorter and cleaner.
*   **Improved Maintainability**: Changes to the structure of an image upload block will only need to be made in one place (the JavaScript function) rather than multiple times in the HTML.
*   **Easier Scalability**: Adding or removing image fields becomes a matter of updating a JavaScript configuration, not modifying large chunks of HTML.

### Implementation Steps (Completed)

1.  **Define Image Data in JavaScript**:
    *   **Completed**: A `imageFields` array has been defined in `task-detail-refactored.js`. This array holds the configuration for each image field, including `name`, `altText`, and `section`.

2.  **Create a JavaScript Function for Rendering**:
    *   **Completed**: A `renderImageUploadBlock` function has been created in `task-detail-refactored.js`. This function takes an image field configuration object as input and returns the HTML string for a single image upload block.

3.  **Populate Sections on Page Load**:
    *   **Completed**: A `populateImageSections` function has been created in `task-detail-refactored.js`. This function iterates through the `imageFields` array and appends the dynamically generated HTML to the appropriate sections in `task-detail.html`. The call to this function has been added to the main `DOMContentLoaded` block.

4.  **Remove Hardcoded HTML**:
    *   **Completed**: All hardcoded image upload `div` blocks have been removed from `task-detail.html`. The respective `<div class="row">` elements now contain a placeholder comment `<!-- Images will be dynamically generated here by JavaScript -->`.

5.  **Adjust `renderUploadedImages` Function**:
    *   **Completed**: The `renderUploadedImages` function in `task-detail-refactored.js` has been updated to correctly handle and display images within the new dynamic structure. It now resets the dynamically generated image elements before populating them with loaded data.

6.  **Adjust Event Listeners for Dynamically Created Elements**:
    *   **Completed**: Event listeners for image preview, delete buttons, and edit title buttons in `task-detail-refactored.js` have been updated to use event delegation. This ensures that events are correctly handled for elements that are added to the DOM dynamically.

## Considerations
*   **Performance**: For a very large number of image fields, consider optimizing DOM manipulation (e.g., building a single HTML string and inserting it once, or using document fragments).
*   **Existing Data Loading**: The `loadOrderData` function currently populates image `src` attributes. This logic has been integrated with the dynamic generation, ensuring that existing image URLs are loaded into the correct dynamically created `<img>` tags.