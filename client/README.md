# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# FeedSense Client (Frontend)

## Setup Instructions

1. **Install dependencies:**
   
	```bash
	cd client
	npm install
	```

2. **Start the development server:**
   
	```bash
	npm run dev
	```

3. **Build for production:**
   
	```bash
	npm run build
	```

4. **Preview production build:**
   
	```bash
	npm run preview
	```

5. **Environment variables:**
   
	- Create a `.env` file in the `client` directory if needed (see `.env.example` if available).

6. **Access the app:**
   
	- Open your browser at the URL shown in the terminal (usually `http://localhost:5173`).
