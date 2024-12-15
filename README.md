# GodHeranca Dashboard Frontend

## Project Description
"GodHeranca" is a Next.js-based web application designed to empower supermarkets to manage their inventory and streamline their online presence. Supermarkets can create categories, add products, and monitor their inventory efficiently.

---

## Features

1. **Supermarket Authentication**: Supermarkets can sign up, log in, and manage their accounts.
2. **Product and Category Management**: Supermarkets can create and organize products and categories.
3. **Inventory Management**: Supermarkets can view and manage their inventory seamlessly.
4. **Product Discounts and Offers**: Supermarkets can add discounts and promotional offers to products.

---

## Technologies Used

- React
- Redux
- TypeScript
- Axios
- Next.js
- MapBox

---

## Installation

### Prerequisites

Ensure you have the following installed:

- **Node.js** (version 20.16.0 or later)
- **npm** (version 10.8.1 or later)
- **Git** (for cloning the repository)

### Getting Started

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/walex4242/GodHerancaDashboardfrontend.git
   ```

2. **Navigate into the Project Directory:**

   ```bash
   cd GodHerancaDashboardfrontend
   ```

3. **Set Up Environment Variables:**

   Create a `.env.local` file in the project root and add the following keys:

   ```env
   NEXT_PUBLIC_GOOGLE_API_KEY=""
   NEXT_PUBLIC_MAPBOX_API_KEY=""
   NEXT_PUBLIC_API_URL='https://godherancabackend2-a7sse79m.b4a.run'
   ```

4. **Install Dependencies:**

   ```bash
   npm install
   ```

5. **Start the Development Server:**

   ```bash
   npm run dev
   ```

   The application will start at [http://localhost:3000](http://localhost:3000) (or another port if configured differently).

### Running in Production Mode

To build the application for production:

```bash
npm run build
```

This will generate an optimized production build in the `build` folder.

---

## Usage

- Supermarkets can **create accounts, sign in, and sign out** securely.
- Create and manage **products** and **categories** effectively.
- Add **discounts and offers** to products to attract customers.
- View and monitor your **inventory** to stay on top of stock levels.

---

## Contributing

Contributions are welcome! To contribute:

1. **Fork the Repository:**

   Click the "Fork" button on the repository page to create a copy under your account.

2. **Create a New Branch:**

   ```bash
   git checkout -b feature-branch
   ```

3. **Make Changes and Commit:**

   ```bash
   git commit -am 'Add new feature'
   ```

4. **Push to Your Branch:**

   ```bash
   git push origin feature-branch
   ```

5. **Submit a Pull Request:**

   Open a pull request on the original repository to merge your changes.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Acknowledgments

- **Name**: Olawale Olafisoye
- **Contact**: [walex.world20@gmail.com](mailto:walex.world20@gmail.com)

