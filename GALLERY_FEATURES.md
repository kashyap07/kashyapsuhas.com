# Photo Gallery Enhancements

## New Features

The photo gallery ([/photos/page.tsx](<src/app/(withNav)/photos/page.tsx>)) has been upgraded with a better user experience:

### 1. Enhanced Lightbox

- **shadcn/ui Dialog** integration for smooth, accessible modals
- **Prev/Next navigation** buttons for browsing through images
- **Image counter** showing current position (e.g., "3 of 35")
- **Custom close button** positioned at top-right

### 2. Keyboard Navigation

- **Arrow keys** (← →) to navigate between images
- **Escape key** to close the lightbox
- Works seamlessly with mouse/touch controls

### 3. Improved Gallery Grid

- **Hover effects** with smooth scale animation
- **Overlay gradient** showing image titles on hover
- **Rounded corners** with shadow on hover for depth
- **Responsive masonry layout** (1/2/3 columns based on screen size)

### 4. Better Accessibility

- Proper ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader friendly

### 5. Visual Polish

- Backdrop blur on modal overlay
- Smooth transitions between images
- Info bar with image title and navigation hint
- Responsive design for all screen sizes

## Usage

The gallery automatically picks up images from `galleryImages.ts`. No changes needed to add/remove images - just update that file!

## Technical Details

- Uses Radix UI Dialog primitive (already in dependencies)
- Client-side component with React hooks
- TypeScript strict mode compatible
- Follows existing design system and Tailwind configuration
