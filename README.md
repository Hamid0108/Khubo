--- README.md (原始)
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/8d8951ee-0a61-4388-a653-8b5bf717e802

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

+++ README.md (修改后)
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Staybnb - Accommodation & Roommate Finder Platform

A modern, full-featured web application designed to help users find short-term accommodations, long-term rentals, and compatible roommates. Built with React, TypeScript, and Tailwind CSS, this platform combines the functionality of accommodation booking services with an intelligent roommate matching system.

## 🌟 Features

### For Travelers & Renters
- **Browse Listings**: Explore a wide variety of accommodations categorized by type (apartments, houses, condos, etc.)
- **Interactive Maps**: View property locations on an interactive map with MapTiler integration
- **Advanced Filtering**: Filter listings by price, date, amenities, and location
- **Detailed Property Views**: Access comprehensive property information including photo galleries, amenities, host details, and reviews
- **Secure Booking Flow**: Streamlined modal-based booking interface
- **Search History**: Track your recent searches for quick access

### For Roommate Seekers
- **Smart Matching**: Find compatible roommates based on university, budget, location preferences, and lifestyle tags
- **Detailed Profiles**: View potential roommates' bios, preferences, and compatibility factors
- **Direct Communication**: Integrated messaging system to connect with potential roommates or hosts

### For Hosts
- **Listing Management**: Create, edit, and manage your property listings through an intuitive dashboard
- **Profile Customization**: Showcase your hosting experience, work background, and property details
- **Review System**: Build trust through authentic guest reviews and ratings

### User Experience
- **Authentication**: Secure sign-up and login functionality via Supabase
- **Dark/Light Mode**: Toggle between themes for comfortable viewing in any environment
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop devices
- **Smooth Animations**: Polished UI transitions using Motion library with accessibility-conscious reduced motion support
- **Toast Notifications**: Real-time feedback for user actions

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- A Gemini API key (for AI features)
- A Supabase project (for authentication and database)
- A MapTiler API key (for maps functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd staybnb
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory with the following:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_MAPTILER_API_KEY=your_maptiler_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:3000`

## 📱 Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Home page with featured listings and categories |
| `/listing/:id` | Detailed view of a specific property |
| `/category/:categoryId` | Browse listings by category |
| `/maps` | Interactive map view of all listings |
| `/messages` | User messaging inbox |
| `/roommate` | Roommate finder and matching interface |
| `/profile` | User profile and settings |
| `/manage-listings` | Host dashboard for managing properties |

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint and TypeScript checks
- `npm run clean` - Remove build artifacts

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

For detailed technical documentation, see [TECHNICAL_README.md](./TECHNICAL_README.md).