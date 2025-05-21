import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import PhotosPage from './app/(withNav)/photos/page'; // Adjusted path to page.tsx

// --- Mocks ---

// Mock galleryImages
const mockGalleryImagesData = [
  { src: '/mock/image1.jpg', title: 'Image 1', width: 720, height: 480 },
  { src: '/mock/image2.jpg', title: 'Image 2', width: 720, height: 480 },
  { src: '/mock/image3.jpg', title: 'Image 3', width: 720, height: 480 },
];

// The actual galleryImages module is at src/app/(withNav)/photos/galleryImages.ts
// So, relative to src/photos.test.tsx, it's ./app/(withNav)/photos/galleryImages
jest.mock('./app/(withNav)/photos/galleryImages', () => ({
  __esModule: true,
  default: mockGalleryImagesData,
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: jest.fn((props) => {
    React.useEffect(() => {
      if (props.onLoadingComplete) {
        const mockImgElement = { parentElement: { style: { backgroundColor: '' } } };
        // Use act to wrap state updates or direct DOM manipulations if any
        act(() => {
          props.onLoadingComplete(mockImgElement);
        });
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array to run once
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} data-testid="next-image-mock" />;
  }),
}));

// Mock ImageAutoHeight component
// ImageAutoHeight is at src/components/ImageAutoHeight.tsx
// Relative to src/photos.test.tsx, it's ./components/ImageAutoHeight
jest.mock('./components/ImageAutoHeight', () => ({
  __esModule: true,
  default: jest.fn((props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} data-testid="image-auto-height-mock" />;
  }),
}));

// Mock CSS module
// photos.module.css is at src/photos.module.css
// Relative to src/photos.test.tsx, it's ./photos.module.css
jest.mock('./photos.module.css', () => ({
  __esModule: true,
  default: { skeleton_placeholder: 'mock-skeleton-class' },
  skeleton_placeholder: 'mock-skeleton-class',
}), { virtual: true }); // virtual: true can be helpful if file doesn't physically exist during test setup in some envs


// --- Tests ---

describe('Photos Page', () => {
  // Helper function to open the modal
  const openModalWithFirstImage = () => {
    // Grid images are instances of the next/image mock
    const gridImages = screen.getAllByTestId('next-image-mock');
    // Filter out the one that might be in the modal if a test previously opened it and didn't clean up well.
    // The grid images are direct children of the skeleton divs.
    const actualGridImages = gridImages.filter(img => img.parentElement?.classList.contains('mock-skeleton-class'));
    fireEvent.click(actualGridImages[0]);
  };


  beforeEach(() => {
    // Reset mocks if they are stateful
    (require('next/image').default as jest.Mock).mockClear();
    (require('./components/ImageAutoHeight').default as jest.Mock).mockClear();
     // Ensure window event listeners are clean before each test if added by component
    // This is a basic cleanup; specific listeners might need more targeted removal if added directly.
    // jest.restoreAllMocks() can also be useful in a global setup or afterEach.
  });

  describe('Skeleton Loader', () => {
    it('renders skeleton placeholders for each image initially', () => {
      render(<PhotosPage />);
      const images = screen.getAllByTestId('next-image-mock');
      
      // Filter for images that are part of the initial grid (not the modal one if it's somehow rendered)
      const gridImages = images.filter(img => img.parentElement?.classList.contains('mock-skeleton-class'));
      expect(gridImages.length).toBe(mockGalleryImagesData.length);

      gridImages.forEach((img, idx) => {
        const parentDiv = img.parentElement;
        expect(parentDiv).toHaveClass('mock-skeleton-class');
        expect(parentDiv).toHaveStyle(`width: ${mockGalleryImagesData[idx].width}px`);
        expect(parentDiv).toHaveStyle(`height: ${mockGalleryImagesData[idx].height}px`);
      });
    });

    it('sets skeleton background to transparent after image loads', () => {
      render(<PhotosPage />);
      const images = screen.getAllByTestId('next-image-mock');
      const gridImages = images.filter(img => img.parentElement?.classList.contains('mock-skeleton-class'));

      gridImages.forEach((img) => {
        const parentDiv = img.parentElement;
        expect(parentDiv?.style.backgroundColor).toBe('transparent');
      });
    });
  });

  describe('Gallery Logic (Open & Display)', () => {
    it('opens an image in the modal view on click, displaying correct title and image', () => {
      render(<PhotosPage />);
      openModalWithFirstImage();
      
      const titleElement = screen.getByText(mockGalleryImagesData[0].title);
      expect(titleElement).toBeVisible();
      
      const modalImage = screen.getByTestId('image-auto-height-mock');
      expect(modalImage).toBeVisible();
      expect(modalImage).toHaveAttribute('src', mockGalleryImagesData[0].src);
      expect(modalImage).toHaveAttribute('alt', mockGalleryImagesData[0].title);
    });

    it('closes the modal when clicking the backdrop', () => {
      render(<PhotosPage />);
      openModalWithFirstImage();

      expect(screen.getByText(mockGalleryImagesData[0].title)).toBeVisible();

      // The backdrop is the div with className starting fixed left-0 top-0 ...
      // It's the first child of the Wrapper with data-description="photos-selected-image-wrapper"
      // Let's try to find it by its role or a more stable selector if possible.
      // The component structure is <Wrapper><div onClick={closeImage}><ImageAutoHeight/><div for title/></Wrapper>
      // The div that has onClick={closeImage} is the one we want.
      const modalWrapperDiv = screen.getByText(mockGalleryImagesData[0].title).closest('div[class*="fixed left-0 top-0"]');
      expect(modalWrapperDiv).not.toBeNull();
      
      if (modalWrapperDiv) {
         fireEvent.click(modalWrapperDiv);
      }
      
      expect(screen.queryByText(mockGalleryImagesData[0].title)).toBeNull();
    });
  });

  describe('Gallery Navigation (Buttons)', () => {
    beforeEach(() => {
      render(<PhotosPage />);
      openModalWithFirstImage();
    });

    it('navigates to the next image and loops correctly', () => {
      const nextButton = screen.getByLabelText('Next image');

      fireEvent.click(nextButton); // Image 1 -> Image 2
      expect(screen.getByText(mockGalleryImagesData[1].title)).toBeVisible();
      expect(screen.getByTestId('image-auto-height-mock')).toHaveAttribute('src', mockGalleryImagesData[1].src);

      fireEvent.click(nextButton); // Image 2 -> Image 3
      expect(screen.getByText(mockGalleryImagesData[2].title)).toBeVisible();
      expect(screen.getByTestId('image-auto-height-mock')).toHaveAttribute('src', mockGalleryImagesData[2].src);
      
      fireEvent.click(nextButton); // Image 3 -> Image 1 (looping)
      expect(screen.getByText(mockGalleryImagesData[0].title)).toBeVisible();
      expect(screen.getByTestId('image-auto-height-mock')).toHaveAttribute('src', mockGalleryImagesData[0].src);
    });

    it('navigates to the previous image and loops correctly', () => {
      const prevButton = screen.getByLabelText('Previous image');

      fireEvent.click(prevButton); // Image 1 -> Image 3 (looping)
      expect(screen.getByText(mockGalleryImagesData[2].title)).toBeVisible();
      expect(screen.getByTestId('image-auto-height-mock')).toHaveAttribute('src', mockGalleryImagesData[2].src);

      fireEvent.click(prevButton); // Image 3 -> Image 2
      expect(screen.getByText(mockGalleryImagesData[1].title)).toBeVisible();
      expect(screen.getByTestId('image-auto-height-mock')).toHaveAttribute('src', mockGalleryImagesData[1].src);

      fireEvent.click(prevButton); // Image 2 -> Image 1
      expect(screen.getByText(mockGalleryImagesData[0].title)).toBeVisible();
      expect(screen.getByTestId('image-auto-height-mock')).toHaveAttribute('src', mockGalleryImagesData[0].src);
    });
  });
  
  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      render(<PhotosPage />);
      openModalWithFirstImage();
    });

    it('navigates with ArrowRight key and loops', () => {
      fireEvent.keyDown(window, { key: 'ArrowRight', code: 'ArrowRight' }); // Image 1 -> Image 2
      expect(screen.getByText(mockGalleryImagesData[1].title)).toBeVisible();

      fireEvent.keyDown(window, { key: 'ArrowRight', code: 'ArrowRight' }); // Image 2 -> Image 3
      expect(screen.getByText(mockGalleryImagesData[2].title)).toBeVisible();
      
      fireEvent.keyDown(window, { key: 'ArrowRight', code: 'ArrowRight' }); // Image 3 -> Image 1 (looping)
      expect(screen.getByText(mockGalleryImagesData[0].title)).toBeVisible();
    });

    it('navigates with ArrowLeft key and loops', () => {
      fireEvent.keyDown(window, { key: 'ArrowLeft', code: 'ArrowLeft' }); // Image 1 -> Image 3 (looping)
      expect(screen.getByText(mockGalleryImagesData[2].title)).toBeVisible();

      fireEvent.keyDown(window, { key: 'ArrowLeft', code: 'ArrowLeft' }); // Image 3 -> Image 2
      expect(screen.getByText(mockGalleryImagesData[1].title)).toBeVisible();

      fireEvent.keyDown(window, { key: 'ArrowLeft', code: 'ArrowLeft' }); // Image 2 -> Image 1
      expect(screen.getByText(mockGalleryImagesData[0].title)).toBeVisible();
    });

    it('closes the modal with Escape key', () => {
      expect(screen.getByText(mockGalleryImagesData[0].title)).toBeVisible(); // Modal is open
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      // Query by text that should disappear.
      // Using queryByText as it returns null if not found, instead of throwing an error.
      expect(screen.queryByText(mockGalleryImagesData[0].title)).toBeNull();
    });
  });
});
