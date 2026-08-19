# Color Studio 🎨

Color Studio is a web-based color utility for creating color palettes and checking color contrast.

The project focuses on making common color-related tasks simple and accessible through a clean, responsive interface.

## Features

- Generate color palettes with 3 to 7 colors
- Generate palettes from a custom base color
- Copy individual color values
- Save and view generated palettes
- Check foreground and background color contrast
- Calculate contrast ratios
- Check WCAG contrast requirements
- Preview text against selected colors
- Responsive design for desktop, tablet, and mobile
- Accessible keyboard focus states
- Reduced-motion support

## Tech Stack

- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap
- Font Awesome

## Color Palette Generator

The palette generator allows you to create palettes containing between **3 and 7 colors**.

You can:

1. Select a base color.
2. Choose the number of colors.
3. Generate a palette.
4. Copy individual color values.
5. Save palettes for later use.

The palette layout dynamically adapts to the number of generated colors and available screen space.

On desktop, the generated colors are displayed in a single horizontal row. Each color takes an equal amount of available space, regardless of whether the palette contains 3, 4, 5, 6, or 7 colors.

On mobile devices, the palette changes to a vertical layout so that each color remains easy to view and interact with.

## Contrast Checker

Color Studio includes a contrast checker for testing color combinations.

It provides:

- Foreground and background color selection
- Live color preview
- Contrast ratio calculation
- WCAG accessibility results
- Normal text contrast evaluation
- Large text contrast evaluation

This makes it useful when selecting readable color combinations for websites and applications.

## Responsive Design

The interface adapts to different screen sizes.

On desktop, generated colors are displayed in a horizontal layout with equal-width color sections.

On smaller screens, the palette changes to a vertical layout for better usability.

Other interface elements, including controls, buttons, cards, and contrast previews, also adapt to different viewport sizes.

## Accessibility

Color Studio includes several accessibility-focused features:

- WCAG contrast checking
- Visible keyboard focus states
- Semantic form controls
- Clear labels
- Responsive layouts
- Reduced-motion support
- Readable typography

The application also respects the user's `prefers-reduced-motion` preference and reduces transitions and animations when reduced motion is enabled.

## Getting Started

### Clone the Repository

```
git clone https://github.com/Ayman-Kz25/color-studio.git/color-studio.git
````

### Navigate to the Project

```
cd color-studio
```

### Run the Project

Since Color Studio is a frontend project, you can open `index.html` directly in your browser.

Alternatively, you can use a local development server if preferred.

For example:

```bash
npx serve .
```

Then open the local URL provided by the development server in your browser.

## Live Demo

You can access the live version of Color Studio here:

[Color Studio Live Demo](https://color-studio-chi.vercel.app/)

## License

This project is available for personal and educational use and is licensed under the **MIT License**.