# UR-Fashion | Premium Pakistani Fashion E-commerce

A medium-scale Angular fashion e-commerce storefront tailored for premium Pakistani fashion shopping.

## 🚀 Key Features

- **Clean Architecture**: Simplified folder structure for scalability.
- **Modern Angular**: Built with Angular 18+, Standalone Components, and Signals.
- **Signal-based State**: Data flow managed via Signals for optimal performance.
- **Design System**: Centralized SCSS architecture with design tokens and mixins.
- **SEO Optimized**: Dynamic meta tags, page titles, and semantic HTML.
- **Animations**: Smooth transitions using Motion One and Angular View Transitions.
- **Performance**: Lazy loading for all feature pages and OnPush change detection.

## 📁 Project Structure

```text
src/app/
├── core/              (global services, guards, interceptors)
├── shared/            (pipes, directives, utils, models)
├── components/        (reusable UI components: ProductCard, Navbar, etc.)
├── pages/             (route-level pages: Home, Shop, Product Detail, Cart)
├── services/          (ProductService, CartService)
├── data/              (Mock data and constants)
├── app.routes.ts      (Lazy-loaded routes)
└── app.config.ts      (App providers and configuration)
```

## 🛠 Tech Stack

- **Framework**: Angular 18+
- **Styling**: SCSS (Modular)
- **Icons**: Material Icons
- **Animations**: Motion One
- **State Management**: Angular Signals

## 🎨 Design System

- **Abstracts**: Variables, mixins, and functions for consistent styling.
- **Base**: Reset, typography, and global element styles.
- **Utilities**: Spacing, display, and layout helpers.

## 🔎 SEO & Performance

- **Dynamic Meta Tags**: Handled via `MetaService`.
- **Lazy Loading**: All routes are loaded on demand.
- **OnPush Strategy**: Reduced change detection cycles.
- **View Transitions**: Smooth page transitions.
```
